# People Generation Script

This script generates realistic people data with demographics for the Earthquake Insurance RAG targeting system. It creates both Person records and Scout Data enrichment records in Convex.

## Features

- **Realistic Demographics**: Generates people with realistic age, income, wealth, education, and property data
- **Geographic Distribution**: Weighted distribution across US cities with earthquake risk
- **Insurance Targeting**: Optimized for earthquake insurance campaigns (40% uninsured)
- **Batch Processing**: Efficient batch processing to avoid API timeouts
- **Progress Tracking**: Real-time progress updates and error reporting

## Usage

### Basic Usage
```bash
# Generate 5000 people (default)
npm run generate-people

# Generate specific number of people
npm run generate-people 1000
npm run generate-people 10000
```

### Direct Execution
```bash
# Using npx tsx
npx tsx scripts/generate-people.ts 2000

# Using node (JavaScript version)
node scripts/generate-people.js 2000
```

## Geographic Distribution

The script uses weighted distribution across major US cities with earthquake risk:

### High Risk Areas (Higher Weight)
- **California**: Los Angeles, San Francisco, San Diego, San Jose, Oakland, Sacramento
- **Pacific Northwest**: Seattle, Portland
- **Alaska**: Anchorage, Fairbanks, Juneau

### Moderate Risk Areas
- **New Madrid Seismic Zone**: Memphis, St. Louis, Little Rock, Nashville
- **Texas**: Houston, Dallas, San Antonio, Austin (fracking-induced earthquakes)
- **Mountain West**: Denver, Salt Lake City, Phoenix, Las Vegas

### Lower Risk Areas (Lower Weight)
- **Eastern US**: New York, Boston, Philadelphia, Washington DC
- **Central US**: Chicago, Detroit, Indianapolis
- **Hawaii**: Honolulu, Hilo

## Generated Data

### Person Records
- **Basic Info**: First name, last name, email, phone
- **Location**: City, state, latitude, longitude (with city variation)
- **Property**: House value ($200k-$800k range)
- **Insurance**: Earthquake insurance status (60% uninsured for targeting)

### Scout Data Enrichment
- **Demographics**: Age (25-75, weighted toward middle age), income, wealth, education
- **Property Details**: Year built, square footage, bedrooms, bathrooms, amenities
- **Behavioral Data**: Credit card usage, charity donations, do-not-call status
- **Interest Indices**: Insurance interest (3-9), health interest, home/living interest
- **Family**: Marital status, children, veteran status

## Data Quality Features

### Realistic Distributions
- **Age**: Weighted toward 35-54 (typical homeowners)
- **Income**: Middle-to-upper income ($50k-$150k+)
- **Education**: College-educated majority
- **Property Values**: Realistic ranges based on location

### Targeting Optimization
- **Insurance Status**: 40% have earthquake insurance (good for targeting uninsured)
- **Homeownership**: 70% homeowners
- **High-Value Properties**: Focus on properties $200k+ for meaningful insurance coverage

## Performance

- **Batch Size**: 50 people per batch to avoid timeouts
- **Rate Limiting**: 100ms delay between batches
- **Progress Tracking**: Real-time updates every batch
- **Error Handling**: Continues processing even if individual records fail

## Examples

### Generate 1000 People
```bash
npm run generate-people 1000
```

Output:
```
🌱 Generating 1000 people with demographics...
📍 Using 65 US locations with earthquake risk
📊 Progress: 50/1000 (5%) - Processed: 50, Errors: 0
📊 Progress: 100/1000 (10%) - Processed: 100, Errors: 0
...
✅ Generation complete!
📊 Total processed: 1000
❌ Total errors: 0
🎯 Ready for earthquake insurance RAG targeting!
```

### Sample Location Distribution
```
📈 Sample locations used:
   Los Angeles: 45 people
   San Francisco: 36 people
   Seattle: 24 people
   San Diego: 30 people
   Portland: 18 people
   ...
```

## Integration with RAG System

The generated people integrate seamlessly with the existing RAG targeting system:

1. **Target Finding**: Use `/api/rag/targets` to find people near earthquake events
2. **Email Generation**: Generate personalized earthquake insurance emails
3. **Campaign Management**: Track email campaigns and engagement
4. **Analytics**: Monitor campaign performance and conversion rates

## Troubleshooting

### Common Issues

1. **Convex Connection Error**
   - Ensure `NEXT_PUBLIC_CONVEX_URL` is set in environment
   - Check Convex deployment status

2. **Rate Limiting**
   - Script includes built-in delays
   - Reduce batch size if needed

3. **Memory Issues**
   - Process in smaller chunks (1000-2000 people at a time)
   - Monitor system resources

### Error Handling
- Individual record failures don't stop the process
- Detailed error logging for debugging
- Progress tracking shows success/error counts

## Customization

### Adding New Locations
Edit the `usLocations` array in the script to add new cities with earthquake risk.

### Adjusting Demographics
Modify the generation functions to change:
- Age distributions
- Income ranges
- Insurance coverage rates
- Property value ranges

### Changing Batch Size
Adjust the `batchSize` variable for different performance characteristics.

## Data Privacy

This script generates synthetic data for development and testing purposes only. All data is fictional and should not be used with real personal information.
