import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

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
    
    // Save campaign to database
    const campaign = await prisma.campaign.create({
      data: {
        earthquakeId: body.earthquakeId,
        subject: body.subject,
        body: body.body,
        riskLevel: body.riskLevel,
        distanceKm: body.distanceKm,
        // Note: personId can be null if we don't have a direct person record match
        personId: body.personId || null
      }
    });

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
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
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get campaigns with earthquake and person data
    const campaigns = await prisma.campaign.findMany({
      include: {
        earthquake: {
          select: {
            id: true,
            magnitude: true,
            place: true,
            time: true
          }
        },
        person: {
          select: {
            firstName: true,
            lastName: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Transform for JSON serialization
    const transformedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      subject: campaign.subject,
      body: campaign.body,
      riskLevel: campaign.riskLevel,
      distanceKm: campaign.distanceKm,
      createdAt: campaign.createdAt,
      earthquake: campaign.earthquake ? {
        ...campaign.earthquake,
        time: campaign.earthquake.time ? Number(campaign.earthquake.time) : null
      } : null,
      person: campaign.person
    }));

    return NextResponse.json({
      campaigns: transformedCampaigns,
      count: transformedCampaigns.length
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


