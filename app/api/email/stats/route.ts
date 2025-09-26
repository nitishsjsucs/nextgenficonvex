import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface EmailStatsResponse {
  summary: {
    totalEvents: number;
    uniqueEmails: number;
    dateRange: {
      from: string;
      to: string;
    };
  };
  eventTypes: {
    processed: number;
    delivered: number;
    open: number;
    click: number;
    bounce: number;
    dropped: number;
    spam_report: number;
    unsubscribe: number;
  };
  campaigns: Array<{
    campaignId: string;
    emailType: string;
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    dropped: number;
    openRate: number;
    clickRate: number;
    deliveryRate: number;
  }>;
  dailyStats: Array<{
    date: string;
    processed: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    dropped: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const campaignId = url.searchParams.get('campaignId');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    console.log(`📊 Fetching email stats for last ${days} days${campaignId ? ` (Campaign: ${campaignId})` : ''}`);

    // Build where clause
    const whereClause: any = {
      timestamp: {
        gte: startDate
      }
    };

    if (campaignId) {
      whereClause.campaignId = campaignId;
    }

    // Get email stats from Convex
    const stats = await convex.query(api.campaigns.getEmailStats, {
      startDate: startDate.getTime(),
      endDate: Date.now(),
    });

    // Calculate summary stats
    const uniqueEmails = stats.total; // Use total as approximation
    
    // Use stats from Convex
    const eventTypes = {
      processed: stats.sent || 0,
      delivered: stats.delivered || 0,
      open: stats.opened || 0,
      click: stats.clicked || 0,
      bounce: stats.bounced || 0,
      dropped: 0, // Not tracked in current stats
      spam_report: 0, // Not tracked in current stats
      unsubscribe: stats.unsubscribed || 0,
    };

    const response: EmailStatsResponse = {
      summary: {
        totalEvents: stats.total,
        uniqueEmails,
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString()
        }
      },
      eventTypes,
      campaigns: [], // TODO: Implement campaign stats
      dailyStats: [] // TODO: Implement daily stats
    };

    console.log(`✅ Email stats retrieved: ${stats.total} events, ${uniqueEmails} unique emails`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching email stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email statistics' },
      { status: 500 }
    );
  }
}
// Define the email event type
type EmailEvent = {
  email: string;
  type: string;
  campaignId?: string | null;
  timestamp: Date;
};

async function getCampaignStats(events: EmailEvent[], days: number) {
  // Group events by campaign with proper typing
  const campaignGroups = events.reduce<Record<string, EmailEvent[]>>((acc, event) => {
    const campaignId = event.campaignId || 'unknown';
    if (!acc[campaignId]) {
      acc[campaignId] = [];
    }
    acc[campaignId].push(event);
    return acc;
  }, {});

  const campaigns = [];

  for (const [campaignId, campaignEvents] of Object.entries(campaignGroups)) {
    const uniqueEmails = new Set(campaignEvents.map(e => e.email));
    const eventTypes = campaignEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    // Determine email type from campaign events (default to unknown since emailType is not in our type)
    const emailType = 'unknown';

    const processed = eventTypes.processed || 0;
    const delivered = eventTypes.delivered || 0;
    const opened = eventTypes.open || 0;
    const clicked = eventTypes.click || 0;
    const bounced = eventTypes.bounce || 0;
    const dropped = eventTypes.dropped || 0;

    campaigns.push({
      campaignId,
      emailType,
      totalSent: processed,
      delivered,
      opened,
      clicked,
      bounced,
      dropped,
      openRate: processed > 0 ? (opened / processed * 100) : 0,
      clickRate: processed > 0 ? (clicked / processed * 100) : 0,
      deliveryRate: processed > 0 ? (delivered / processed * 100) : 0,
    });
  }

  return campaigns.sort((a, b) => b.totalSent - a.totalSent);
}

async function getDailyStats(events: EmailEvent[], days: number) {
  const dailyStats = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayEvents = events.filter(event => {
      const eventDate = event.timestamp.toISOString().split('T')[0];
      return eventDate === dateStr;
    });

    const eventTypes = dayEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    dailyStats.push({
      date: dateStr,
      processed: eventTypes.processed || 0,
      delivered: eventTypes.delivered || 0,
      opened: eventTypes.open || 0,
      clicked: eventTypes.click || 0,
      bounced: eventTypes.bounce || 0,
      dropped: eventTypes.dropped || 0,
    });
  }

  return dailyStats;
}
