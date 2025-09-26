import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface EarthquakeQuery {
  hours: number;
  minmag: number;
  minlatitude: number;
  maxlatitude: number;
  minlongitude: number;
  maxlongitude: number;
}

export interface EarthquakeData {
  id: string;
  mag: number | null;
  time: number | null;
  place: string | null;
  depth_km: number | null;
  longitude: number | null;
  latitude: number | null;
  url: string | null;
}

export interface EarthquakeResponse {
  region: {
    bbox: [number, number, number, number];
    polygon: any | null;
  };
  query: {
    hours: number;
    minmag: number;
    strictPolygon: boolean;
  };
  count: number;
  earthquakes: EarthquakeData[];
}

function buildUSGSURL(params: EarthquakeQuery): string {
  const start = new Date(Date.now() - params.hours * 3600 * 1000).toISOString();
  
  const urlParams = new URLSearchParams({
    format: 'geojson',
    starttime: start,
    orderby: 'time',
    minlatitude: params.minlatitude.toString(),
    maxlatitude: params.maxlatitude.toString(),
    minlongitude: params.minlongitude.toString(),
    maxlongitude: params.maxlongitude.toString()
  });

  if (params.minmag && params.minmag > 0) {
    urlParams.set('minmagnitude', params.minmag.toString());
  }

  return `https://earthquake.usgs.gov/fdsnws/event/1/query?${urlParams.toString()}`;
}

async function storeEarthquakesInDatabase(earthquakes: EarthquakeData[]): Promise<void> {
  if (earthquakes.length === 0) return;

  try {
    // Use upsert to handle duplicates (earthquakes with same ID)
    const upsertPromises = earthquakes.map(eq =>
      convex.mutation(api.earthquakes.upsertEarthquake, {
        id: eq.id,
        time: eq.time || undefined,
        latitude: eq.latitude || undefined,
        longitude: eq.longitude || undefined,
        magnitude: eq.mag || undefined,
        place: eq.place || undefined,
        depth: eq.depth_km || undefined,
        url: eq.url || undefined,
      })
    );

    await Promise.all(upsertPromises);
    console.log(`💾 Stored/updated ${earthquakes.length} earthquakes in database`);
  } catch (error) {
    console.error('Failed to store earthquakes in database:', error);
    // Don't throw error - we still want to return the API response even if DB storage fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      hours = 24, 
      minmag = 0, 
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

    const queryParams: EarthquakeQuery = {
      hours,
      minmag,
      minlatitude,
      maxlatitude,
      minlongitude,
      maxlongitude
    };

    const usgsUrl = buildUSGSURL(queryParams);
    console.log('Fetching from USGS:', usgsUrl);

    const response = await fetch(usgsUrl);
    
    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let features = data.features || [];

    // If polygon filtering is requested and we have a polygon
    if (strictPolygon && polygon && polygon.coordinates) {
      // Note: In a full implementation, you'd use @turf/boolean-point-in-polygon here
      // For now, we'll keep all features within the bbox
      console.log('Polygon filtering requested but simplified to bbox for now');
    }

    // Transform USGS data to our format
    const earthquakes: EarthquakeData[] = features.map((feature: any) => ({
      id: feature.id,
      mag: feature.properties?.mag ?? null,
      time: feature.properties?.time ?? null,
      place: feature.properties?.place ?? null,
      depth_km: feature.geometry?.coordinates?.[2] ?? null,
      longitude: feature.geometry?.coordinates?.[0] ?? null,
      latitude: feature.geometry?.coordinates?.[1] ?? null,
      url: feature.properties?.url ?? null
    }));

    // Store earthquakes in database (async, don't block response)
    if (earthquakes.length > 0) {
      storeEarthquakesInDatabase(earthquakes).catch(error => {
        console.error('Background earthquake storage failed:', error);
      });
    }

    const result: EarthquakeResponse = {
      region: {
        bbox: [minlongitude, minlatitude, maxlongitude, maxlatitude],
        polygon
      },
      query: {
        hours,
        minmag,
        strictPolygon
      },
      count: earthquakes.length,
      earthquakes
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Earthquake API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method with bbox, hours, and minmag parameters',
    example: {
      bbox: [-125, 32, -114, 42], // California-ish
      hours: 24,
      minmag: 2.0,
      polygon: null,
      strictPolygon: false
    }
  });
}
