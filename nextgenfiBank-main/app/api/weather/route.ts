import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface WeatherQuery {
  days: number;
  eventTypes: string[]; // ['rain', 'storm', 'flood', 'cyclone', 'heatwave']
  minSeverity?: string; // 'light', 'moderate', 'heavy', 'severe'
  minlatitude: number;
  maxlatitude: number;
  minlongitude: number;
  maxlongitude: number;
}

export interface WeatherData {
  id: string;
  eventType: string;
  severity: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  startTime: string;
  endTime: string | null;
  description: string | null;
  rainfall: number | null;
  windSpeed: number | null;
  temperature: number | null;
  humidity: number | null;
  source: string | null;
  sourceUrl: string | null;
}

export interface WeatherResponse {
  region: {
    bbox: [number, number, number, number];
    polygon: any | null;
  };
  query: {
    days: number;
    eventTypes: string[];
    minSeverity: string;
    strictPolygon: boolean;
  };
  count: number;
  weatherEvents: WeatherData[];
}

// Bangladesh weather API endpoint (using OpenWeatherMap or similar)
async function fetchBangladeshWeatherData(params: WeatherQuery): Promise<WeatherData[]> {
  const { days, eventTypes, minlatitude, maxlatitude, minlongitude, maxlongitude } = params;
  
  // For now, we'll create mock data for Bangladesh weather
  // In production, you would integrate with a real weather API like OpenWeatherMap, AccuWeather, etc.
  const mockWeatherEvents: WeatherData[] = [
    {
      id: 'bd_weather_001',
      eventType: 'rain',
      severity: 'heavy',
      location: 'Dhaka, Bangladesh',
      latitude: 23.8103,
      longitude: 90.4125,
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Heavy rainfall expected in Dhaka metropolitan area',
      rainfall: 85.5,
      windSpeed: 25.0,
      temperature: 28.5,
      humidity: 85.0,
      source: 'Bangladesh Meteorological Department',
      sourceUrl: 'http://www.bmd.gov.bd/'
    },
    {
      id: 'bd_weather_002',
      eventType: 'storm',
      severity: 'moderate',
      location: 'Chittagong, Bangladesh',
      latitude: 22.3569,
      longitude: 91.7832,
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: null,
      description: 'Moderate thunderstorm activity in Chittagong region',
      rainfall: 45.2,
      windSpeed: 40.0,
      temperature: 26.8,
      humidity: 78.0,
      source: 'Bangladesh Meteorological Department',
      sourceUrl: 'http://www.bmd.gov.bd/'
    },
    {
      id: 'bd_weather_003',
      eventType: 'flood',
      severity: 'severe',
      location: 'Sylhet, Bangladesh',
      latitude: 24.8949,
      longitude: 91.8687,
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Severe flooding due to monsoon rains in Sylhet division',
      rainfall: 150.0,
      windSpeed: 15.0,
      temperature: 27.2,
      humidity: 92.0,
      source: 'Flood Forecasting and Warning Centre',
      sourceUrl: 'http://www.ffwc.gov.bd/'
    },
    {
      id: 'bd_weather_004',
      eventType: 'cyclone',
      severity: 'severe',
      location: 'Cox\'s Bazar, Bangladesh',
      latitude: 21.4272,
      longitude: 92.0058,
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Severe cyclonic storm approaching from Bay of Bengal',
      rainfall: 200.0,
      windSpeed: 120.0,
      temperature: 25.0,
      humidity: 95.0,
      source: 'India Meteorological Department',
      sourceUrl: 'https://mausam.imd.gov.in/'
    }
  ];

  // Filter by region
  const filteredEvents = mockWeatherEvents.filter(event => {
    if (!event.latitude || !event.longitude) return false;
    return (
      event.latitude >= minlatitude &&
      event.latitude <= maxlatitude &&
      event.longitude >= minlongitude &&
      event.longitude <= maxlongitude
    );
  });

  // Filter by event types
  const typeFilteredEvents = filteredEvents.filter(event => 
    eventTypes.length === 0 || eventTypes.includes(event.eventType)
  );

  return typeFilteredEvents;
}

async function storeWeatherEventsInDatabase(weatherEvents: WeatherData[]): Promise<void> {
  if (weatherEvents.length === 0) return;

  try {
    // Use upsert to handle duplicates (weather events with same ID)
    const upsertPromises = weatherEvents.map(event => 
      prisma.weatherEvent.upsert({
        where: { id: event.id },
        update: {
          eventType: event.eventType,
          severity: event.severity,
          location: event.location,
          latitude: event.latitude,
          longitude: event.longitude,
          startTime: new Date(event.startTime),
          endTime: event.endTime ? new Date(event.endTime) : null,
          description: event.description,
          rainfall: event.rainfall,
          windSpeed: event.windSpeed,
          temperature: event.temperature,
          humidity: event.humidity,
          source: event.source,
          sourceUrl: event.sourceUrl,
          updatedAt: new Date()
        },
        create: {
          id: event.id,
          eventType: event.eventType,
          severity: event.severity,
          location: event.location,
          latitude: event.latitude,
          longitude: event.longitude,
          startTime: new Date(event.startTime),
          endTime: event.endTime ? new Date(event.endTime) : null,
          description: event.description,
          rainfall: event.rainfall,
          windSpeed: event.windSpeed,
          temperature: event.temperature,
          humidity: event.humidity,
          source: event.source,
          sourceUrl: event.sourceUrl
        }
      })
    );

    await Promise.all(upsertPromises);
    console.log(`🌦️ Stored/updated ${weatherEvents.length} weather events in database`);
  } catch (error) {
    console.error('Failed to store weather events in database:', error);
    // Don't throw error - we still want to return the API response even if DB storage fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      days = 7, 
      eventTypes = ['rain', 'storm', 'flood'], 
      minSeverity = 'light',
      bbox, 
      polygon = null,
      strictPolygon = false 
    } = body;

    if (!bbox || bbox.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid bbox. Expected [minLng, minLat, maxLng, maxLat]' },
        { status: 400 }
      );
    }

    const [minlongitude, minlatitude, maxlongitude, maxlatitude] = bbox;

    // Validate Bangladesh coordinates (approximately)
    if (minlatitude < 20.5 || maxlatitude > 26.5 || minlongitude < 88 || maxlongitude > 93) {
      return NextResponse.json(
        { error: 'Coordinates must be within Bangladesh region (20.5-26.5°N, 88-93°E)' },
        { status: 400 }
      );
    }

    const queryParams: WeatherQuery = {
      days,
      eventTypes,
      minSeverity,
      minlatitude,
      maxlatitude,
      minlongitude,
      maxlongitude
    };

    console.log('Fetching Bangladesh weather data:', queryParams);

    const weatherEvents = await fetchBangladeshWeatherData(queryParams);

    // Store weather events in database (async, don't block response)
    if (weatherEvents.length > 0) {
      storeWeatherEventsInDatabase(weatherEvents).catch(error => {
        console.error('Background weather storage failed:', error);
      });
    }

    const result: WeatherResponse = {
      region: {
        bbox: [minlongitude, minlatitude, maxlongitude, maxlatitude],
        polygon
      },
      query: {
        days,
        eventTypes,
        minSeverity,
        strictPolygon
      },
      count: weatherEvents.length,
      weatherEvents
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method with bbox, days, and eventTypes parameters',
    example: {
      bbox: [88, 20.5, 93, 26.5], // Bangladesh bounds
      days: 7,
      eventTypes: ['rain', 'storm', 'flood'],
      minSeverity: 'moderate',
      polygon: null,
      strictPolygon: false
    },
    supportedEventTypes: ['rain', 'storm', 'flood', 'cyclone', 'heatwave'],
    supportedSeverities: ['light', 'moderate', 'heavy', 'severe']
  });
}
