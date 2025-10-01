# RAG System Integration

This directory contains the RAG (Retrieval-Augmented Generation) system that has been integrated into the bank backend dashboard.

## Files

- `local_mcp_client.py` - Python MCP client for communicating with earthquake marketing server
- `setup_database.py` - Database setup script for earthquake and demographic data
- `requirements.txt` - Python dependencies for the RAG system
- `earthquake_data.csv` - Sample earthquake data

## Integration

The RAG system has been integrated into the main dashboard as a new tab called "RAG System". The React component (`components/rag/rag-section.tsx`) provides all the functionality from the original Streamlit application:

### Features Included:

1. **Dashboard Tab** - Overview of earthquake statistics and recent activity
2. **Find Targets Tab** - Campaign parameter configuration and target finding
3. **Generate Emails Tab** - AI-powered email generation using Gemini API
4. **Campaign History Tab** - Track and manage generated campaigns

### Mock Data

Since this is a React/Next.js environment, the system uses mock data to simulate the MCP server responses. In a production environment, you would need to:

1. Set up the Python MCP server
2. Configure the database with real earthquake and demographic data
3. Integrate with the actual Gemini API

### UI Consistency

The RAG system UI has been designed to match the existing dashboard design system:
- Uses the same Card, Button, Input, and other UI components
- Follows the same color scheme and spacing
- Maintains consistent typography and layout patterns

## Usage

1. Navigate to the Dashboard
2. Click on the "RAG System" tab
3. Connect to MCP Server (simulated)
4. Configure Gemini API with your API key
5. Use the various tabs to explore earthquake data, find targets, and generate emails

## Future Enhancements

- Real MCP server integration
- Live earthquake data feeds
- Advanced targeting algorithms
- Email delivery integration
- Campaign analytics and reporting

