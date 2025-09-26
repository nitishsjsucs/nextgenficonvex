import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const limit = parseInt(searchParams.get('limit') || '100');
    const minMag = parseFloat(searchParams.get('minmag') || '0');
    const hours = parseInt(searchParams.get('hours') || '168'); // Default 7 days
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '0'); // km
    
    // Build where conditions
    const whereConditions: any = {
      magnitude: {
        gte: minMag
      }
    };
    
    // Filter by time if specified
    if (hours > 0) {
      const timeThreshold = Date.now() - (hours * 60 * 60 * 1000);
      whereConditions.time = {
        gte: BigInt(timeThreshold)
      };
    }
    
    // Filter by location if specified
    if (radius > 0 && lat !== 0 && lng !== 0) {
      // Rough conversion: 1 degree ≈ 111km
      const latRange = radius / 111;
      const lngRange = radius / 111;
      
      whereConditions.latitude = {
        gte: lat - latRange,
        lte: lat + latRange
      };
      whereConditions.longitude = {
        gte: lng - lngRange,
        lte: lng + lngRange
      };
    }
    
    // Get earthquakes from Convex
    const earthquakes = await convex.query(api.earthquakes.getAllEarthquakes, {
      limit: Math.min(limit, 1000)
    });
    
    // Apply filters manually since Convex doesn't support complex queries
    let filteredEarthquakes = earthquakes;
    
    // Filter by magnitude
    if (minMag > 0) {
      filteredEarthquakes = filteredEarthquakes.filter(eq => 
        eq.magnitude && eq.magnitude >= minMag
      );
    }
    
    // Filter by time
    if (hours > 0) {
      const timeThreshold = Date.now() - (hours * 60 * 60 * 1000);
      filteredEarthquakes = filteredEarthquakes.filter(eq => 
        eq.time && eq.time >= timeThreshold
      );
    }
    
    // Filter by location
    if (radius > 0 && lat !== 0 && lng !== 0) {
      const latRange = radius / 111;
      const lngRange = radius / 111;
      
      filteredEarthquakes = filteredEarthquakes.filter(eq => 
        eq.latitude && eq.longitude &&
        eq.latitude >= lat - latRange && eq.latitude <= lat + latRange &&
        eq.longitude >= lng - lngRange && eq.longitude <= lng + lngRange
      );
    }
    
    // Sort by time and magnitude
    filteredEarthquakes.sort((a, b) => {
      if (a.time && b.time) {
        const timeDiff = b.time - a.time;
        if (timeDiff !== 0) return timeDiff;
      }
      return (b.magnitude || 0) - (a.magnitude || 0);
    });
    
    // Transform for JSON serialization
    const transformedEarthquakes = filteredEarthquakes.map(eq => ({
      id: eq.id,
      time: eq.time,
      latitude: eq.latitude,
      longitude: eq.longitude,
      mag: eq.magnitude,
      place: eq.place,
      depth_km: eq.depth,
      url: eq.url,
      createdAt: eq._creationTime,
      updatedAt: eq._creationTime
    }));
    
    return NextResponse.json({
      count: transformedEarthquakes.length,
      earthquakes: transformedEarthquakes,
      query: {
        limit,
        minMag,
        hours,
        location: radius > 0 ? { lat, lng, radius } : null
      }
    });
    
  } catch (error) {
    console.error('Stored earthquakes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stored earthquake data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Note: Convex doesn't support bulk delete operations like Prisma
    // This would need to be implemented as a Convex mutation
    return NextResponse.json(
      { error: 'Delete operation not yet implemented for Convex migration' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Delete earthquakes API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete earthquake data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

