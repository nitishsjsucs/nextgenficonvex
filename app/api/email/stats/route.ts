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
  console.log('📊 [DEBUG] ===== EMAIL STATS API CALLED =====');
  console.log('📊 [DEBUG] Timestamp:', new Date().toISOString());
  console.log('📊 [DEBUG] Request URL:', request.url);
  console.log('📊 [DEBUG] Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const campaignId = url.searchParams.get('campaignId');
    
    console.log('📊 [DEBUG] Query parameters:', {
      days,
      campaignId,
      daysParam: url.searchParams.get('days'),
      campaignIdParam: url.searchParams.get('campaignId')
    });
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    console.log(`📊 [DEBUG] Date range:`, {
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      days
    });
    
    console.log(`📊 [DEBUG] Fetching email stats for last ${days} days${campaignId ? ` (Campaign: ${campaignId})` : ''}`);

    // Get email stats from Convex
    console.log('📊 [DEBUG] Calling Convex getEmailStats query...');
    const stats = await convex.query(api.campaigns.getEmailStats, {
      campaignId: campaignId || undefined,
      startDate: startDate.getTime(),
      endDate: Date.now(),
    });
    
    console.log('📊 [DEBUG] Email stats from Convex:', stats);

    // Get all email events for detailed analysis
    console.log('📊 [DEBUG] Calling Convex getAllEmailEvents query...');
    const allEvents = await convex.query(api.campaigns.getAllEmailEvents, {
      startDate: startDate.getTime(),
      endDate: Date.now(),
    });
    
    console.log('📊 [DEBUG] All email events from Convex:', {
      count: allEvents.length,
      events: allEvents.map(e => ({
        id: e._id,
        campaignId: e.campaignId,
        personId: e.personId,
        eventType: e.eventType,
        timestamp: new Date(e.timestamp).toISOString(),
        metadata: e.metadata
      }))
    });

    // If no real email events exist, return empty stats
    if (allEvents.length === 0) {
      const response: EmailStatsResponse = {
        summary: {
          totalEvents: 0,
          uniqueEmails: 0,
          dateRange: {
            from: startDate.toISOString(),
            to: new Date().toISOString()
          }
        },
        eventTypes: {
          processed: 0,
          delivered: 0,
          open: 0,
          click: 0,
          bounce: 0,
          dropped: 0,
          spam_report: 0,
          unsubscribe: 0,
        },
        campaigns: [],
        dailyStats: []
      };

      console.log(`📊 No email events found for the last ${days} days`);
      return NextResponse.json(response);
    }
    
    // Calculate summary stats
    const uniqueEmails = new Set(allEvents.map(e => e.personId)).size;
    
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

    // Generate campaign stats
    const campaignStats = await getCampaignStats(allEvents, days);

    // Generate daily stats
    const dailyStats = await getDailyStats(allEvents, days);

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
      campaigns: campaignStats,
      dailyStats
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
// Define the email event type for Convex
type ConvexEmailEvent = {
  campaignId: string;
  personId: string;
  eventType: string;
  timestamp: number;
  metadata?: any;
};

async function getCampaignStats(events: ConvexEmailEvent[], days: number) {
  // Group events by campaign
  const campaignGroups = events.reduce<Record<string, ConvexEmailEvent[]>>((acc, event) => {
    const campaignId = event.campaignId || 'unknown';
    if (!acc[campaignId]) {
      acc[campaignId] = [];
    }
    acc[campaignId].push(event);
    return acc;
  }, {});

  const campaigns = [];

  for (const [campaignId, campaignEvents] of Object.entries(campaignGroups)) {
    const uniqueEmails = new Set(campaignEvents.map(e => e.personId));
    const eventTypes = campaignEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});

    const emailType = 'earthquake-insurance'; // Default type

    const processed = eventTypes.sent || 0;
    const delivered = eventTypes.delivered || 0;
    const opened = eventTypes.opened || 0;
    const clicked = eventTypes.clicked || 0;
    const bounced = eventTypes.bounced || 0;
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
      openRate: delivered > 0 ? (opened / delivered * 100) : 0,
      clickRate: delivered > 0 ? (clicked / delivered * 100) : 0,
      deliveryRate: processed > 0 ? (delivered / processed * 100) : 0,
    });
  }

  return campaigns.sort((a, b) => b.totalSent - a.totalSent);
}

async function getDailyStats(events: ConvexEmailEvent[], days: number) {
  const dailyStats = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp).toISOString().split('T')[0];
      return eventDate === dateStr;
    });

    const eventTypes = dayEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});

    dailyStats.push({
      date: dateStr,
      processed: eventTypes.sent || 0,
      delivered: eventTypes.delivered || 0,
      opened: eventTypes.opened || 0,
      clicked: eventTypes.clicked || 0,
      bounced: eventTypes.bounced || 0,
      dropped: eventTypes.dropped || 0,
    });
  }

  return dailyStats;
}
