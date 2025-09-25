import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { calculateDistance, calculateRiskLevel } from '@/lib/scout-data-filters';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface TargetsRequest {
  earthquakeId: string;
  maxDistance?: number;
  minHouseValue?: number;
  requireUninsured?: boolean;
  requireHomeowner?: boolean;
  excludeDoNotCall?: boolean;
  limit?: number;
}

export interface Target {
  person: {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    state: string;
    houseValue: number;
    hasInsurance: boolean;
  };
  earthquake: {
    id: string;
    time: number | null;
    latitude: number | null;
    longitude: number | null;
    mag: number | null;
    place: string | null;
    depth_km: number | null;
    url: string | null;
  };
  distance_km: number;
  risk_level: string;
}

export interface TargetsResponse {
  targets: Target[];
  summary: {
    total_targets: number;
    high_risk_targets: number;
    medium_risk_targets: number;
    low_risk_targets: number;
    criteria: {
      earthquakeId: string;
      maxDistance: number;
      minHouseValue: number;
      requireUninsured: boolean;
      requireHomeowner: boolean;
      excludeDoNotCall: boolean;
      limit: number;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: TargetsRequest = await request.json();
    
    const {
      earthquakeId,
      maxDistance = 100,
      minHouseValue = 100000,
      requireUninsured = true,
      requireHomeowner = false, // Changed to false since we don't have scout data
      excludeDoNotCall = false, // Changed to false since we don't have scout data
      limit = 50
    } = body;

    if (!earthquakeId) {
      return NextResponse.json(
        { error: 'earthquakeId is required' },
        { status: 400 }
      );
    }

    // Get the earthquake data from Convex
    const earthquake = await convex.query(api.earthquakes.getEarthquakeById, {
      id: earthquakeId
    });

    // If earthquake not found in database, provide helpful error message
    if (!earthquake) {
      return NextResponse.json(
        { error: 'Earthquake not found in database. Please select an earthquake region from the map first to ensure the earthquake data is available.' },
        { status: 404 }
      );
    }

    if (!earthquake.latitude || !earthquake.longitude) {
      return NextResponse.json(
        { error: 'Earthquake location data is incomplete' },
        { status: 400 }
      );
    }

    // Get people in the area from Convex
    const people = await convex.query(api.scoutData.getPersonsByLocation, {
      minLat: earthquake.latitude - (maxDistance / 111),
      maxLat: earthquake.latitude + (maxDistance / 111),
      minLng: earthquake.longitude - (maxDistance / 111),
      maxLng: earthquake.longitude + (maxDistance / 111),
      limit: limit * 2
    });

    // Filter people based on criteria
    const filteredPeople = people.filter(person => {
      if (person.houseValue < minHouseValue) return false;
      if (requireUninsured && person.hasInsurance) return false;
      return true;
    });

    // Filter and transform results
    const targets: Target[] = [];
    
    for (const person of filteredPeople) {
      // Skip scout data filters since we don't have scout data for generated customers
      
      // Calculate actual distance
      const distance = calculateDistance(
        earthquake.latitude,
        earthquake.longitude,
        person.latitude,
        person.longitude
      );
      
      if (distance <= maxDistance) {
        const riskLevel = calculateRiskLevel(
          distance,
          earthquake.magnitude || 0,
          person.houseValue
        );
        
        const target: Target = {
          person: {
            firstName: person.firstName,
            lastName: person.lastName,
            email: person.email,
            city: person.city,
            state: person.state,
            houseValue: person.houseValue,
            hasInsurance: person.hasInsurance
          },
          earthquake: {
            id: earthquake.id,
            time: earthquake.time ? Number(earthquake.time) : null,
            latitude: earthquake.latitude,
            longitude: earthquake.longitude,
            mag: earthquake.magnitude,
            place: earthquake.place,
            depth_km: earthquake.depth,
            url: earthquake.url
          },
          distance_km: Math.round(distance * 10) / 10, // Round to 1 decimal
          risk_level: riskLevel
        };
        
        targets.push(target);
      }
      
      if (targets.length >= limit) break;
    }

    // Sort by distance and house value (prioritize closer, higher value homes)
    targets.sort((a, b) => {
      // Primary sort: distance (closer first)
      if (Math.abs(a.distance_km - b.distance_km) > 5) {
        return a.distance_km - b.distance_km;
      }
      
      // Secondary sort: house value (higher first)
      return b.person.houseValue - a.person.houseValue;
    });

    // Calculate summary statistics
    const riskCounts = targets.reduce(
      (acc, target) => {
        acc[target.risk_level as keyof typeof acc]++;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    const response: TargetsResponse = {
      targets,
      summary: {
        total_targets: targets.length,
        high_risk_targets: riskCounts.high,
        medium_risk_targets: riskCounts.medium,
        low_risk_targets: riskCounts.low,
        criteria: {
          earthquakeId,
          maxDistance,
          minHouseValue,
          requireUninsured,
          requireHomeowner,
          excludeDoNotCall,
          limit
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Targets API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to find targets', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to find campaign targets',
    example: {
      earthquakeId: "earthquake-id",
      maxDistance: 100,
      minHouseValue: 100000,
      requireUninsured: true,
      requireHomeowner: false,
      excludeDoNotCall: false,
      limit: 50
    }
  });
}
