import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

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
    
    // Query earthquakes
    const earthquakes = await prisma.earthquake.findMany({
      where: whereConditions,
      orderBy: [
        { time: 'desc' },
        { magnitude: 'desc' }
      ],
      take: Math.min(limit, 1000) // Cap at 1000
    });
    
    // Transform BigInt to number for JSON serialization
    const transformedEarthquakes = earthquakes.map(eq => ({
      id: eq.id,
      time: eq.time ? Number(eq.time) : null,
      latitude: eq.latitude,
      longitude: eq.longitude,
      mag: eq.magnitude,
      place: eq.place,
      depth_km: eq.depth,
      url: eq.url,
      createdAt: eq.createdAt,
      updatedAt: eq.updatedAt
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
    const { searchParams } = new URL(request.url);
    const olderThan = searchParams.get('older_than'); // ISO date string
    const confirm = searchParams.get('confirm') === 'true';
    
    if (!confirm) {
      return NextResponse.json(
        { error: 'Add ?confirm=true to confirm deletion' },
        { status: 400 }
      );
    }
    
    let whereCondition: any = {};
    
    if (olderThan) {
      const date = new Date(olderThan);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format for older_than parameter' },
          { status: 400 }
        );
      }
      whereCondition.createdAt = {
        lt: date
      };
    }
    
    // Delete earthquakes
    const result = await prisma.earthquake.deleteMany({
      where: whereCondition
    });
    
    return NextResponse.json({
      message: `Deleted ${result.count} earthquake records`,
      deletedCount: result.count
    });
    
  } catch (error) {
    console.error('Delete earthquakes API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete earthquake data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

