import { NextRequest, NextResponse } from 'next/server';
import { 
  getEarthquakeStats,
  getDemographicStats,
  getCampaignStats
} from '@/lib/scout-data-filters';

export interface RAGStats {
  earthquake_stats: {
    total_earthquakes: number;
    recent_earthquakes_7_days: number;
  };
  demographic_stats: {
    high_value_homes: number;
    uninsured_homes: number;
    uninsured_percentage: string;
  };
  campaign_stats: {
    total_campaigns: number;
    high: number;
    medium: number;
    low: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get all statistics in parallel
    const [earthquakeStats, demographicStats, campaignStats] = await Promise.all([
      getEarthquakeStats(),
      getDemographicStats(),
      getCampaignStats()
    ]);

    const result: RAGStats = {
      earthquake_stats: earthquakeStats,
      demographic_stats: demographicStats,
      campaign_stats: campaignStats
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('RAG stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


