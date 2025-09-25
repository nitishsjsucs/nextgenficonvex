import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface CampaignSaveRequest {
  personId?: string;
  earthquakeId: string;
  subject: string;
  body: string;
  riskLevel: string;
  distanceKm: number;
  targetInfo: {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    state: string;
    houseValue: number;
    hasInsurance: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CampaignSaveRequest = await request.json();
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save campaign to Convex database
    const campaign = await convex.mutation(api.campaigns.createCampaign, {
      id: campaignId,
      personId: body.personId,
      earthquakeId: body.earthquakeId,
      subject: body.subject,
      body: body.body,
      riskLevel: body.riskLevel,
      distanceKm: body.distanceKm,
    });

    return NextResponse.json({
      success: true,
      campaignId: campaign,
      message: 'Campaign saved successfully'
    });

  } catch (error) {
    console.error('Campaign save API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save campaign', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Get campaigns from Convex
    const campaigns = await convex.query(api.campaigns.getAllCampaigns, { limit });

    // Get additional details for each campaign
    const campaignsWithDetails = await Promise.all(
      campaigns.map(async (campaign) => {
        const earthquake = await convex.query(api.earthquakes.getEarthquakeById, {
          id: campaign.earthquakeId
        });
        
        let person = null;
        if (campaign.personId) {
          person = await convex.query(api.scoutData.getPersonById, {
            id: campaign.personId
          });
        }

        return {
          id: campaign.id,
          subject: campaign.subject,
          body: campaign.body,
          riskLevel: campaign.riskLevel,
          distanceKm: campaign.distanceKm,
          createdAt: campaign.createdAt,
          earthquake: earthquake ? {
            id: earthquake.id,
            magnitude: earthquake.magnitude,
            place: earthquake.place,
            time: earthquake.time
          } : null,
          person: person ? {
            firstName: person.firstName,
            lastName: person.lastName,
            city: person.city,
            state: person.state
          } : null
        };
      })
    );

    return NextResponse.json({
      campaigns: campaignsWithDetails,
      count: campaignsWithDetails.length
    });

  } catch (error) {
    console.error('Campaign fetch API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch campaigns', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}


