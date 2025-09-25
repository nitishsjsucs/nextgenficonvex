# Weather Insurance Campaign System

This guide covers the new weather-based insurance campaign functionality for targeting Bangladesh residents affected by weather events.

## Overview

The Weather Insurance Campaign System is designed to help insurance companies target potential customers in Bangladesh who may be affected by various weather events such as:

- 🌧️ **Rain** - Heavy rainfall and precipitation
- ⛈️ **Storms** - Thunderstorms and severe weather
- 🌊 **Floods** - Flooding due to monsoons or storms  
- 🌀 **Cyclones** - Tropical cyclones from Bay of Bengal
- ☀️ **Heatwaves** - Extreme temperature events

## Features

### 1. Weather Data Integration
- Real-time weather event tracking for Bangladesh
- Integration with Bangladesh Meteorological Department data
- Severity levels: Light, Moderate, Heavy, Severe
- Geographic coordinates for precise targeting

### 2. Interactive Weather Map
- **Zip Code Centering**: Enter a bank/branch zip code to center the map on that area
- Drawing tools for selecting geographic regions
- Visual weather event markers with severity indicators
- Bangladesh-specific geocoding and boundaries

### 3. Smart Targeting System
- Distance-based targeting from weather events
- House value filtering for qualified prospects
- Insurance status filtering (uninsured vs insured)
- Risk level calculation based on:
  - Proximity to weather event
  - Event severity and type
  - Property value
  - Historical data

### 4. AI-Powered Email Generation
- Weather-specific email templates
- Personalized content using Gemini AI
- Cultural appropriateness for Bangladesh market
- Event-specific messaging (flood vs storm vs cyclone)

### 5. Bulk Email Campaigns
- Batch processing with rate limiting
- SendGrid integration for reliable delivery
- Campaign tracking and analytics
- Email event monitoring

## How to Use

### Step 1: Access Weather Campaigns
1. Navigate to Dashboard → Insurance Campaigns
2. Select the "Weather Insurance (Bangladesh)" tab
3. The system will initialize and load the weather map

### Step 2: Find Weather Events
1. **Option A - Zip Code Centering**:
   - Enter a Bangladesh zip code (e.g., 1000 for Dhaka)
   - Click "Center Map" to focus on that area
   
2. **Option B - Manual Selection**:
   - Use drawing tools to select a region
   - Or search for a location using the search box

3. Configure weather parameters:
   - Forecast days (1-14)
   - Event types (rain, storm, flood, cyclone, heatwave)
   - Minimum severity level
   
4. Click "Fetch Weather" to load events

### Step 3: Select Weather Event
- Review the list of weather events found
- Click on an event to select it for targeting
- View event details including:
  - Event type and severity
  - Location and timing
  - Weather data (rainfall, wind speed, etc.)

### Step 4: Find Targets
1. Go to the "Targeting" tab
2. Configure targeting parameters:
   - **Max Distance**: How far from the weather event (km)
   - **Min House Value**: Minimum property value filter
   - **Target Uninsured**: Focus on uninsured prospects
   
3. Click "Find Weather Insurance Targets"
4. Review the found targets and their risk levels

### Step 5: Generate Emails
1. Go to the "Email Generation" tab
2. Customize the campaign context
3. Click "Generate Weather Insurance Email"
4. Review the AI-generated email content
5. Save to history or send to all targets

### Step 6: Campaign Management
- View campaign history in the "Campaign History" tab
- Track email performance and engagement
- Manage multiple campaigns simultaneously

## API Endpoints

### Weather Data
- `POST /api/weather` - Fetch Bangladesh weather events
- `POST /api/rag/weather-targets` - Find insurance targets for weather events

### Email Generation & Sending
- `POST /api/rag/generate-weather-email` - Generate personalized emails
- `POST /api/rag/weather-email/send` - Send bulk weather insurance emails

## Database Schema

### WeatherEvent Table
- Event type, severity, location
- Geographic coordinates
- Weather data (rainfall, wind speed, etc.)
- Start/end times and descriptions

### WeatherCampaign Table
- Links weather events to targeted individuals
- Campaign metadata and performance tracking
- Risk level and distance calculations

## Bangladesh Zip Code Support

Common Bangladesh zip codes supported for map centering:

| Zip Code | Location |
|----------|----------|
| 1000 | Dhaka (Capital) |
| 4000 | Chittagong |
| 3100 | Sylhet |
| 6000 | Rajshahi |
| 9000 | Barisal |
| 8000 | Rangpur |
| 4700 | Cox's Bazar |

## Risk Level Calculation

The system calculates risk levels based on multiple factors:

**High Risk (7+ points)**:
- Very close to weather event (≤10km) = 3 points
- Severe weather event = 3 points
- High-value property (≥$1M) = 2 points

**Medium Risk (4-6 points)**:
- Moderate distance/severity combination
- Medium-value properties

**Low Risk (≤3 points)**:
- Far from events or light severity
- Lower-value properties

## Weather Event Messaging

### Rain/Flood Events
- Focus on water damage protection
- Foundation and structural issues
- Property flooding coverage

### Storm Events  
- Emphasize roof and window damage
- Structural integrity protection
- Power outage coverage

### Cyclone Events
- Comprehensive property protection
- Evacuation and temporary housing
- Complete rebuilding coverage

### Heatwave Events
- HVAC system protection
- Cooling equipment coverage
- Heat-related property damage

## Best Practices

1. **Timing**: Target customers immediately after weather events are forecasted
2. **Personalization**: Use specific weather data in email content
3. **Cultural Sensitivity**: Ensure messaging is appropriate for Bangladesh market
4. **Follow-up**: Track email engagement and follow up with interested prospects
5. **Compliance**: Ensure all campaigns comply with local insurance regulations

## Troubleshooting

### Common Issues

**Map not loading**: Check internet connection and ensure Bangladesh coordinates are within bounds (20.5-26.5°N, 88-93°E)

**No weather events found**: Try expanding the search area or adjusting the time range

**Email generation fails**: Verify GEMINI_API_KEY is configured correctly

**Bulk emails not sending**: Check SENDGRID_API_KEY configuration and sender email verification

### Support

For technical support or feature requests, contact the development team or check the application logs for detailed error messages.
