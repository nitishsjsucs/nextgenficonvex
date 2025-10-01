"""
Streamlit application for earthquake insurance marketing using MCP and Gemini API.
This app uses the local MCP server to get targeting data and Gemini to generate email ads.
"""

import streamlit as st
import json
import pandas as pd
import google.generativeai as genai
from datetime import datetime
import os
from typing import Dict, List, Any, Optional
import plotly.express as px
import plotly.graph_objects as go

# Import our local MCP client
from local_mcp_client import create_mcp_client, SimplifiedMCPClient

# Page configuration
st.set_page_config(
    page_title="Earthquake Insurance Marketing AI",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
    .target-card {
        background-color: #e8f4fd;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
        margin: 0.5rem 0;
    }
    .email-preview {
        background-color: #f8f9fa;
        color: #212529;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border: 1px solid #dee2e6;
        font-family: 'Courier New', monospace;
        white-space: pre-wrap;
        line-height: 1.5;
    }
    .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #c3e6cb;
    }
    .warning-message {
        background-color: #fff3cd;
        color: #856404;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #ffeaa7;
    }
</style>
""", unsafe_allow_html=True)

def initialize_session_state():
    """Initialize session state variables."""
    if 'mcp_client' not in st.session_state:
        st.session_state.mcp_client = None
    if 'gemini_configured' not in st.session_state:
        st.session_state.gemini_configured = False
    if 'current_targets' not in st.session_state:
        st.session_state.current_targets = None
    if 'generated_email' not in st.session_state:
        st.session_state.generated_email = None
    if 'campaign_history' not in st.session_state:
        st.session_state.campaign_history = []

def setup_gemini_api(api_key: str) -> bool:
    """Configure Gemini API."""
    try:
        genai.configure(api_key=api_key)
        # Test the API with a simple request using the current model name
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Test")
        st.session_state.gemini_configured = True
        return True
    except Exception as e:
        st.error(f"Failed to configure Gemini API: {e}")
        return False

def connect_mcp_server():
    """Connect to the MCP server."""
    try:
        with st.spinner("Connecting to MCP server..."):
            client = create_mcp_client()
            if client.start_server():
                st.session_state.mcp_client = client
                st.success("✅ Connected to MCP server successfully!")
                return True
            else:
                st.error("❌ Failed to connect to MCP server")
                return False
    except Exception as e:
        st.error(f"❌ MCP connection error: {e}")
        return False

def get_earthquake_stats() -> Optional[Dict]:
    """Get earthquake statistics from MCP server."""
    if not st.session_state.mcp_client:
        return None
    
    try:
        stats_json = st.session_state.mcp_client.read_resource("stats/overview")
        if stats_json:
            return json.loads(stats_json)
    except Exception as e:
        st.error(f"Failed to get earthquake stats: {e}")
    
    return None

def get_recent_earthquakes() -> Optional[List[Dict]]:
    """Get recent earthquakes from MCP server."""
    if not st.session_state.mcp_client:
        return None
    
    try:
        earthquakes_json = st.session_state.mcp_client.read_resource("earthquakes/recent?days=7&min_mag=3.0")
        if earthquakes_json:
            return json.loads(earthquakes_json)
    except Exception as e:
        st.error(f"Failed to get recent earthquakes: {e}")
    
    return None

def find_targets(min_magnitude: float, max_distance_km: float, min_house_value: float, require_uninsured: bool) -> Optional[Dict]:
    """Find targets using MCP server."""
    if not st.session_state.mcp_client:
        return None
    
    try:
        result_json = st.session_state.mcp_client.call_tool("find_targets", {
            "min_magnitude": min_magnitude,
            "max_distance_km": max_distance_km,
            "min_house_value": min_house_value,
            "require_uninsured": require_uninsured
        })
        
        if result_json:
            return json.loads(result_json)
    except Exception as e:
        st.error(f"Failed to find targets: {e}")
    
    return None

def generate_email_with_gemini(target_data: Dict, earthquake_data: Dict, campaign_context: str) -> Optional[Dict]:
    """Generate email content using Gemini API."""
    if not st.session_state.gemini_configured:
        st.error("Gemini API not configured")
        return None
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Prepare the prompt with target and earthquake data
        person = target_data["person"]
        earthquake = target_data["earthquake"]
        
        prompt = f"""
You are a professional insurance marketing specialist. Create a helpful, compliant email for earthquake insurance outreach.

CONTEXT:
- A magnitude {earthquake['magnitude']} earthquake occurred in {earthquake['place']} 
- The recipient lives {target_data['distance_km']} km from the epicenter in {person['city']}, {person['state']}
- Their home is valued at ${person['house_value']:,.0f}
- Insurance status: {'Uninsured' if not person['has_insurance'] else 'May need earthquake coverage'}
- Risk level: {target_data['risk_level']}

CAMPAIGN CONTEXT:
{campaign_context}

REQUIREMENTS:
1. Be helpful and informative, not alarmist or pushy
2. Personalize with their name: {person['first_name']}
3. Reference the specific earthquake and distance
4. Mention their home value respectfully
5. Focus on protection and peace of mind
6. Include clear call-to-action
7. Must include compliance elements (we'll add these)

Generate BOTH:
1. EMAIL SUBJECT (one line, clear and relevant)
2. EMAIL BODY (professional, helpful tone, 150-250 words)

Format your response as JSON:
{{
    "subject": "Your subject line here",
    "body": "Your email body here"
}}
"""
        
        response = model.generate_content(prompt)
        
        # Try to parse the JSON response
        try:
            # Extract JSON from response
            response_text = response.text.strip()
            
            # Handle cases where the response might have markdown formatting
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            
            email_content = json.loads(response_text)
            
            # Add compliance elements
            compliance_footer = f"""

Best regards,
Insurance Protection Team
123 Insurance Street, Your City, State 12345

To schedule a consultation: Reply to this email
To unsubscribe: Reply with "UNSUBSCRIBE"

This email was sent because you own property in an area affected by recent seismic activity."""

            email_content["body"] += compliance_footer
            
            return email_content
            
        except json.JSONDecodeError:
            # If JSON parsing fails, create a structured response
            response_text = response.text.strip()
            lines = response_text.split('\n')
            
            subject = "Earthquake Coverage Information"
            body = response_text
            
            # Try to extract subject if it's clearly marked
            for line in lines:
                if line.lower().startswith('subject:'):
                    subject = line.split(':', 1)[1].strip()
                    break
            
            return {
                "subject": subject,
                "body": body + f"""

Best regards,
Insurance Protection Team
123 Insurance Street, Your City, State 12345

To schedule a consultation: Reply to this email
To unsubscribe: Reply with "UNSUBSCRIBE" """
            }
        
    except Exception as e:
        st.error(f"Failed to generate email with Gemini: {e}")
        return None

def main():
    """Main Streamlit application."""
    initialize_session_state()
    
    # Header
    st.markdown('<h1 class="main-header">🌍 Earthquake Insurance Marketing AI</h1>', unsafe_allow_html=True)
    st.markdown("**Powered by MCP + Gemini API** | Intelligent targeting and email generation for earthquake insurance campaigns")
    
    # Sidebar for configuration
    with st.sidebar:
        st.header("⚙️ Configuration")
        
        # Gemini API Configuration
        st.subheader("🤖 Gemini API")
        gemini_api_key = st.text_input(
            "Gemini API Key", 
            type="password",
            help="Enter your Google Gemini API key"
        )
        
        if gemini_api_key and not st.session_state.gemini_configured:
            if st.button("Configure Gemini API"):
                setup_gemini_api(gemini_api_key)
        
        if st.session_state.gemini_configured:
            st.success("✅ Gemini API configured")
        
        # MCP Server Connection
        st.subheader("🔌 MCP Server")
        if not st.session_state.mcp_client:
            if st.button("Connect to MCP Server"):
                connect_mcp_server()
        else:
            st.success("✅ MCP server connected")
            if st.button("Disconnect"):
                if hasattr(st.session_state.mcp_client, 'stop_server'):
                    st.session_state.mcp_client.stop_server()
                st.session_state.mcp_client = None
                st.rerun()
        
        # Campaign Parameters
        st.subheader("🎯 Campaign Parameters")
        min_magnitude = st.slider("Minimum Earthquake Magnitude", 0.0, 6.0, 3.5, 0.1)
        max_distance = st.slider("Maximum Distance (km)", 25, 800, 100, 5)
        min_home_value = st.selectbox(
            "Minimum Home Value",
            [100000,300000, 500000, 750000, 1000000],
            index=1,
            format_func=lambda x: f"${x:,}"
        )
        require_uninsured = st.checkbox("Only target uninsured homes", value=True)
        
        campaign_context = st.text_area(
            "Campaign Context",
            value="We're reaching out to homeowners in areas affected by recent earthquake activity to help them understand their earthquake insurance options.",
            help="Provide context for the email generation"
        )
    
    # Main content area
    if not st.session_state.mcp_client:
        st.warning("⚠️ Please connect to the MCP server to continue.")
        st.info("The MCP server provides access to earthquake data and targeting capabilities.")
        return
    
    if not st.session_state.gemini_configured:
        st.warning("⚠️ Please configure the Gemini API to generate email content.")
        st.info("Gemini API will be used to create personalized, compliant email campaigns.")
        return
    
    # Create tabs for different sections
    tab1, tab2, tab3, tab4 = st.tabs(["📊 Dashboard", "🎯 Find Targets", "📧 Generate Emails", "📈 Campaign History"])
    
    with tab1:
        st.header("📊 Earthquake & Demographics Dashboard")
        
        # Get and display statistics
        stats = get_earthquake_stats()
        if stats:
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric(
                    "Total Earthquakes",
                    stats["earthquake_stats"]["total_earthquakes"],
                    help="Total earthquakes in database"
                )
            
            with col2:
                st.metric(
                    "Recent (7 days)",
                    stats["earthquake_stats"]["recent_earthquakes_7_days"],
                    help="Earthquakes in the last 7 days"
                )
            
            with col3:
                st.metric(
                    "High-Value Homes",
                    f"{stats['demographic_stats']['high_value_homes']:,}",
                    help="Homes valued > $500k"
                )
            
            with col4:
                st.metric(
                    "Uninsured Homes",
                    f"{stats['demographic_stats']['uninsured_homes']:,}",
                    delta=f"{stats['demographic_stats']['uninsured_percentage']}%",
                    help="Homes without earthquake insurance"
                )
            
            # Recent earthquakes map/chart
            recent_earthquakes = get_recent_earthquakes()
            if recent_earthquakes:
                st.subheader("🗺️ Recent Earthquake Activity")
                
                # Create DataFrame for plotting
                eq_df = pd.DataFrame(recent_earthquakes)
                
                if not eq_df.empty:
                    # Map of earthquakes
                    fig_map = px.scatter_mapbox(
                        eq_df,
                        lat="latitude",
                        lon="longitude",
                        size="magnitude",
                        color="magnitude",
                        hover_name="place",
                        hover_data=["magnitude", "time"],
                        color_continuous_scale="Reds",
                        size_max=20,
                        zoom=5,
                        mapbox_style="open-street-map",
                        title="Recent Earthquakes (Last 7 Days)"
                    )
                    fig_map.update_layout(height=400)
                    st.plotly_chart(fig_map, use_container_width=True)
                    
                    # Magnitude distribution
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        fig_hist = px.histogram(
                            eq_df,
                            x="magnitude",
                            nbins=20,
                            title="Magnitude Distribution",
                            labels={"magnitude": "Magnitude", "count": "Count"}
                        )
                        st.plotly_chart(fig_hist, use_container_width=True)
                    
                    with col2:
                        # Timeline
                        eq_df['date'] = pd.to_datetime(eq_df['time']).dt.date
                        daily_counts = eq_df.groupby('date').size().reset_index(name='count')
                        
                        fig_timeline = px.line(
                            daily_counts,
                            x="date",
                            y="count",
                            title="Daily Earthquake Count",
                            labels={"date": "Date", "count": "Earthquakes"}
                        )
                        st.plotly_chart(fig_timeline, use_container_width=True)
    
    with tab2:
        st.header("🎯 Find Campaign Targets")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            if st.button("🔍 Find Targets", type="primary"):
                with st.spinner("Finding targets..."):
                    targets_result = find_targets(
                        min_magnitude=min_magnitude,
                        max_distance_km=max_distance,
                        min_house_value=min_home_value,
                        require_uninsured=require_uninsured
                    )
                    
                    if targets_result:
                        st.session_state.current_targets = targets_result
                        st.success(f"✅ Found {targets_result['summary']['total_targets']} potential targets!")
                    else:
                        st.error("❌ Failed to find targets")
        
        with col2:
            if st.session_state.current_targets:
                summary = st.session_state.current_targets["summary"]
                st.metric("Total Targets", summary["total_targets"])
                st.metric("High Risk", summary["high_risk_targets"])
                st.metric("Medium Risk", summary["medium_risk_targets"])
                st.metric("Low Risk", summary["low_risk_targets"])
        
        # Display targets
        if st.session_state.current_targets:
            targets = st.session_state.current_targets["targets"]
            
            if targets:
                st.subheader(f"📋 Target List ({len(targets)} people)")
                
                # Create DataFrame for display
                target_data = []
                for target in targets:
                    person = target["person"]
                    earthquake = target["earthquake"]
                    target_data.append({
                        "Name": f"{person['first_name']} {person['last_name']}",
                        "City": f"{person['city']}, {person['state']}",
                        "Home Value": f"${person['house_value']:,.0f}",
                        "Distance (km)": target["distance_km"],
                        "Risk Level": target["risk_level"].title(),
                        "Earthquake": f"M{earthquake['magnitude']} - {earthquake['place']}",
                        "Insurance": "No" if not person['has_insurance'] else "Yes"
                    })
                
                df = pd.DataFrame(target_data)
                st.dataframe(df, use_container_width=True)
                
                # Risk level distribution
                risk_counts = pd.Series([t["risk_level"] for t in targets]).value_counts()
                fig_risk = px.pie(
                    values=risk_counts.values,
                    names=risk_counts.index,
                    title="Risk Level Distribution",
                    color_discrete_map={"high": "#ff4444", "medium": "#ffaa00", "low": "#44ff44"}
                )
                st.plotly_chart(fig_risk, use_container_width=True)
            else:
                st.info("No targets found with the current criteria. Try adjusting the parameters.")
    
    with tab3:
        st.header("📧 Generate Email Campaign")
        
        if not st.session_state.current_targets or not st.session_state.current_targets["targets"]:
            st.warning("⚠️ Please find targets first in the 'Find Targets' tab.")
            return
        
        targets = st.session_state.current_targets["targets"]
        
        # Select target for email generation
        col1, col2 = st.columns([2, 1])
        
        with col1:
            target_options = [
                f"{t['person']['first_name']} {t['person']['last_name']} - {t['person']['city']} ({t['risk_level']} risk)"
                for t in targets
            ]
            
            selected_idx = st.selectbox(
                "Select target for email generation:",
                range(len(target_options)),
                format_func=lambda x: target_options[x]
            )
            
            selected_target = targets[selected_idx]
        
        with col2:
            if st.button("🤖 Generate Email", type="primary"):
                with st.spinner("Generating personalized email with Gemini..."):
                    email_content = generate_email_with_gemini(
                        selected_target,
                        selected_target["earthquake"],
                        campaign_context
                    )
                    
                    if email_content:
                        st.session_state.generated_email = {
                            "target": selected_target,
                            "content": email_content,
                            "generated_at": datetime.now()
                        }
                        st.success("✅ Email generated successfully!")
        
        # Display target details
        if selected_target:
            st.subheader("👤 Target Details")
            person = selected_target["person"]
            earthquake = selected_target["earthquake"]
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown(f"""
                **Personal Info:**
                - Name: {person['first_name']} {person['last_name']}
                - Location: {person['city']}, {person['state']}
                - Email: {person['email']}
                """)
            
            with col2:
                st.markdown(f"""
                **Property Info:**
                - Home Value: ${person['house_value']:,.0f}
                - Insurance: {'No' if not person['has_insurance'] else 'Yes'}
                - Risk Level: {selected_target['risk_level'].title()}
                """)
            
            with col3:
                st.markdown(f"""
                **Earthquake Info:**
                - Magnitude: {earthquake['magnitude']}
                - Location: {earthquake['place']}
                - Distance: {selected_target['distance_km']} km
                """)
        
        # Display generated email
        if st.session_state.generated_email:
            st.subheader("📧 Generated Email")
            
            email_data = st.session_state.generated_email
            content = email_data["content"]
            
            # Subject
            st.markdown("**Subject:**")
            st.code(content["subject"], language="text")
            
            # Body
            st.markdown("**Body:**")
            # Use st.text_area for better visibility and formatting
            st.text_area(
                "Email Body Content",
                value=content["body"],
                height=300,
                disabled=True,
                label_visibility="collapsed"
            )
            
            # Actions
            col1, col2, col3 = st.columns(3)
            
            with col1:
                if st.button("🔄 Regenerate"):
                    with st.spinner("Regenerating email..."):
                        new_email = generate_email_with_gemini(
                            selected_target,
                            selected_target["earthquake"],
                            campaign_context
                        )
                        if new_email:
                            st.session_state.generated_email["content"] = new_email
                            st.rerun()
            
            with col2:
                if st.button("💾 Save to History"):
                    campaign_entry = {
                        "timestamp": datetime.now(),
                        "target": email_data["target"]["person"]["first_name"] + " " + email_data["target"]["person"]["last_name"],
                        "subject": content["subject"],
                        "body": content["body"],
                        "risk_level": email_data["target"]["risk_level"]
                    }
                    st.session_state.campaign_history.append(campaign_entry)
                    st.success("✅ Saved to campaign history!")
            
            with col3:
                # Download as text file
                email_text = f"Subject: {content['subject']}\n\n{content['body']}"
                st.download_button(
                    "📥 Download Email",
                    email_text,
                    file_name=f"email_{person['first_name']}_{person['last_name']}.txt",
                    mime="text/plain"
                )
    
    with tab4:
        st.header("📈 Campaign History")
        
        if st.session_state.campaign_history:
            st.subheader(f"📋 Generated Campaigns ({len(st.session_state.campaign_history)})")
            
            for i, campaign in enumerate(reversed(st.session_state.campaign_history)):
                with st.expander(f"Campaign {len(st.session_state.campaign_history) - i}: {campaign['target']} - {campaign['timestamp'].strftime('%Y-%m-%d %H:%M')}"):
                    st.markdown(f"**Target:** {campaign['target']}")
                    st.markdown(f"**Risk Level:** {campaign['risk_level'].title()}")
                    st.markdown(f"**Subject:** {campaign['subject']}")
                    st.markdown("**Body:**")
                    st.text(campaign['body'])
            
            # Clear history button
            if st.button("🗑️ Clear History"):
                st.session_state.campaign_history = []
                st.rerun()
        else:
            st.info("No campaigns generated yet. Generate some emails in the 'Generate Emails' tab!")
    
    # Footer
    st.markdown("---")
    st.markdown("**🌍 Earthquake Insurance Marketing AI** | Built with Streamlit, MCP, and Gemini API")

if __name__ == "__main__":
    main()
