import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { calculateDistance } from '@/lib/scout-data-filters';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface WeatherTarget {
  person: {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    state: string;
    houseValue: number;
    hasInsurance: boolean;
  };
  weatherEvent: {
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
  };
  distance_km: number;
  risk_level: string; // "high", "medium", "low"
}

export interface WeatherTargetsRequest {
  weatherEventId: string;
  maxDistance?: number;      // km from weather event
  minHouseValue?: number;    // minimum house value
  maxHouseValue?: number;    // maximum house value
  requireUninsured?: boolean; // only target uninsured
  requireHomeowner?: boolean; // only target homeowners
  excludeDoNotCall?: boolean; // exclude DNC list
  minAge?: number;           // minimum age
  maxAge?: number;           // maximum age
  hasChildren?: boolean;     // has children
  limit?: number;            // max results
  eventTypes?: string[];     // filter by event types
  minSeverity?: string;      // minimum severity level
}

export interface WeatherTargetsResponse {
  weatherEvent: {
    id: string;
    eventType: string;
    severity: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
  };
  summary: {
    totalTargets: number;
    criteria: any;
    riskDistribution: {
      high: number;
      medium: number;
      low: number;
    };
  };
  targets: WeatherTarget[];
}

function calculateWeatherRiskLevel(
  distance: number, 
  severity: string, 
  eventType: string,
  houseValue: number
): string {
  let riskScore = 0;

  // Distance factor (closer = higher risk)
  if (distance <= 10) riskScore += 3;
  else if (distance <= 25) riskScore += 2;
  else if (distance <= 50) riskScore += 1;

  // Severity factor
  switch (severity) {
    case 'severe': riskScore += 3; break;
    case 'heavy': riskScore += 2; break;
    case 'moderate': riskScore += 1; break;
    default: riskScore += 0;
  }

  // Event type factor
  switch (eventType) {
    case 'cyclone':
    case 'flood': riskScore += 3; break;
    case 'storm': riskScore += 2; break;
    case 'rain': riskScore += 1; break;
    default: riskScore += 0;
  }

  // House value factor (higher value = higher risk)
  if (houseValue >= 1000000) riskScore += 2;
  else if (houseValue >= 500000) riskScore += 1;

  // Determine risk level
  if (riskScore >= 7) return 'high';
  if (riskScore >= 4) return 'medium';
  return 'low';
}

export async function POST(request: NextRequest) {
  try {
    const body: WeatherTargetsRequest = await request.json();
    
    const {
      weatherEventId,
      maxDistance = 100,
      minHouseValue = 100000,
      maxHouseValue = 5000000,
      requireUninsured = true,
      requireHomeowner = true,
      excludeDoNotCall = true,
      limit = 100
    } = body;

    if (!weatherEventId) {
      return NextResponse.json(
        { error: 'weatherEventId is required' },
        { status: 400 }
      );
    }

    // Get the weather event
    const weatherEvent = await prisma.weatherEvent.findUnique({
      where: { id: weatherEventId }
    });

    if (!weatherEvent) {
      return NextResponse.json(
        { error: 'Weather event not found' },
        { status: 404 }
      );
    }

    if (!weatherEvent.latitude || !weatherEvent.longitude) {
      return NextResponse.json(
        { error: 'Weather event location coordinates are required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Finding weather insurance targets for ${weatherEvent.eventType} in ${weatherEvent.location}`);

    // Build where conditions for Person model
    const whereConditions: any = {
      latitude: {
        gte: weatherEvent.latitude - (maxDistance / 111), // Rough conversion: 1 degree ≈ 111km
        lte: weatherEvent.latitude + (maxDistance / 111)
      },
      longitude: {
        gte: weatherEvent.longitude - (maxDistance / 111),
        lte: weatherEvent.longitude + (maxDistance / 111)
      },
      houseValue: {
        gte: minHouseValue,
        lte: maxHouseValue
      }
    };

    if (requireUninsured) {
      whereConditions.hasInsurance = false;
    }

    // Get people in the area from Convex
    const people = await convex.query(api.scoutData.getPersonsByLocation, {
      minLat: weatherEvent.latitude - (maxDistance / 111),
      maxLat: weatherEvent.latitude + (maxDistance / 111),
      minLng: weatherEvent.longitude - (maxDistance / 111),
      maxLng: weatherEvent.longitude + (maxDistance / 111),
      limit: limit * 2
    });

    console.log(`📊 Found ${people.length} potential targets in database`);

    // Filter people based on criteria
    const filteredPeople = people.filter(person => {
      if (person.houseValue < minHouseValue || person.houseValue > maxHouseValue) return false;
      if (requireUninsured && person.hasInsurance) return false;
      return true;
    });

    // Convert and apply additional filters
    const targets: WeatherTarget[] = [];
    
    for (const person of filteredPeople) {
      const distance = calculateDistance(
        weatherEvent.latitude!,
        weatherEvent.longitude!,
        person.latitude,
        person.longitude
      );

      // Apply distance filter
      if (distance > maxDistance) continue;

      // Apply homeowner filter using ScoutData if available
      if (requireHomeowner && person.scoutData) {
        const homeownerCode = person.scoutData.homeownercd;
        if (homeownerCode !== 'H') continue; // H = Homeowner
      }

      // Apply DNC filter using ScoutData if available
      if (excludeDoNotCall && person.scoutData) {
        const dncFlag = person.scoutData.dnc;
        if (dncFlag === 'Y') continue; // Y = Do Not Call
      }

      const riskLevel = calculateWeatherRiskLevel(
        distance, 
        weatherEvent.severity, 
        weatherEvent.eventType,
        person.houseValue
      );

      const target: WeatherTarget = {
        person: {
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
          city: person.city,
          state: person.state,
          houseValue: person.houseValue,
          hasInsurance: person.hasInsurance
        },
        weatherEvent: {
          id: weatherEvent.id,
          eventType: weatherEvent.eventType,
          severity: weatherEvent.severity,
          location: weatherEvent.location,
          latitude: weatherEvent.latitude,
          longitude: weatherEvent.longitude,
          startTime: weatherEvent.startTime.toISOString(),
          endTime: weatherEvent.endTime?.toISOString() || null,
          description: weatherEvent.description,
          rainfall: weatherEvent.rainfall,
          windSpeed: weatherEvent.windSpeed,
          temperature: weatherEvent.temperature,
          humidity: weatherEvent.humidity
        },
        distance_km: Math.round(distance * 10) / 10,
        risk_level: riskLevel
      };

      targets.push(target);
    }

    // Sort by risk level and distance
    targets.sort((a, b) => {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      const riskDiff = (riskOrder[b.risk_level as keyof typeof riskOrder] || 0) - 
                      (riskOrder[a.risk_level as keyof typeof riskOrder] || 0);
      if (riskDiff !== 0) return riskDiff;
      return a.distance_km - b.distance_km;
    });

    // Limit results
    const finalTargets = targets.slice(0, limit);

    // Calculate risk distribution
    const riskDistribution = {
      high: finalTargets.filter(t => t.risk_level === 'high').length,
      medium: finalTargets.filter(t => t.risk_level === 'medium').length,
      low: finalTargets.filter(t => t.risk_level === 'low').length
    };

    const response: WeatherTargetsResponse = {
      weatherEvent: {
        id: weatherEvent.id,
        eventType: weatherEvent.eventType,
        severity: weatherEvent.severity,
        location: weatherEvent.location,
        latitude: weatherEvent.latitude,
        longitude: weatherEvent.longitude
      },
      summary: {
        totalTargets: finalTargets.length,
        criteria: {
          maxDistance,
          minHouseValue,
          maxHouseValue,
          requireUninsured,
          requireHomeowner,
          excludeDoNotCall,
          limit
        },
        riskDistribution
      },
      targets: finalTargets
    };

    console.log(`✅ Found ${finalTargets.length} weather insurance targets`);
    console.log(`📈 Risk distribution: High: ${riskDistribution.high}, Medium: ${riskDistribution.medium}, Low: ${riskDistribution.low}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Weather targets API error:', error);
    return NextResponse.json(
      { error: 'Failed to find weather targets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to find weather insurance targets',
    example: {
      weatherEventId: 'bd_weather_001',
      maxDistance: 50,
      minHouseValue: 100000,
      maxHouseValue: 2000000,
      requireUninsured: true,
      requireHomeowner: true,
      excludeDoNotCall: true,
      limit: 50
    }
  });
}
