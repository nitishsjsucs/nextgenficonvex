import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// SendGrid webhook event types
interface SendGridEvent {
  email: string;
  timestamp: number;
  event: string;
  sg_message_id?: string;
  sg_event_id?: string;
  response?: string;
  attempt?: string;
  useragent?: string;
  ip?: string;
  url?: string;
  reason?: string;
  status?: string;
  type?: string;
  tls?: number;
  cert_err?: number;
  unique_args?: {
    userId?: string;
    campaignId?: string;
    earthquakeId?: string;
    weatherEventId?: string;
    riskLevel?: string;
    emailType?: string;
  };
}

// Valid SendGrid event types
const VALID_EVENTS = [
  'processed',    // Email received and ready to be delivered
  'delivered',    // Email was successfully delivered
  'open',         // Recipient opened the email
  'click',        // Recipient clicked on a link within the email
  'bounce',       // Email bounced
  'dropped',      // Email was dropped
  'spam_report',  // Recipient marked email as spam
  'unsubscribe',  // Recipient unsubscribed
  'group_unsubscribe', // Recipient unsubscribed from a group
  'group_resubscribe'  // Recipient resubscribed to a group
];

export async function POST(request: NextRequest) {
  try {
    const events: SendGridEvent[] = await request.json();

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Expected array of events' },
        { status: 400 }
      );
    }

    console.log(`📧 Received ${events.length} SendGrid webhook events`);

    const processedEvents = [];
    const errors = [];

    for (const event of events) {
      try {
        // Validate event
        if (!event.email || !event.event || !event.timestamp) {
          errors.push({
            event,
            error: 'Missing required fields: email, event, or timestamp'
          });
          continue;
        }

        if (!VALID_EVENTS.includes(event.event)) {
          console.log(`⚠️ Unknown event type: ${event.event}`);
          continue;
        }

        // Extract campaign info from custom args
        const customArgs = event.unique_args || {};
        const campaignId = customArgs.campaignId;
        const userId = customArgs.userId;
        const emailType = customArgs.emailType || 'unknown';

        // Store email event in Convex
        const emailEventId = `email_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const emailEvent = await convex.mutation(api.campaigns.createEmailEvent, {
          id: emailEventId,
          type: event.event,
          email: event.email,
          url: event.url || undefined,
          timestamp: event.timestamp * 1000, // Convert Unix timestamp to milliseconds
          sgMessageId: event.sg_message_id || undefined,
          userId: userId || undefined,
          campaignId: campaignId || undefined,
        });

        processedEvents.push({
          id: emailEvent,
          type: event.event,
          email: event.email,
          timestamp: new Date(event.timestamp * 1000),
          campaignId: campaignId,
          emailType: emailType
        });

        console.log(`✅ Processed ${event.event} event for ${event.email} (Campaign: ${campaignId || 'N/A'})`);

      } catch (error) {
        console.error(`❌ Error processing event:`, error);
        errors.push({
          event,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log summary
    const eventTypes = processedEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Event Summary:', eventTypes);
    console.log(`✅ Successfully processed ${processedEvents.length}/${events.length} events`);

    if (errors.length > 0) {
      console.log(`❌ ${errors.length} events failed to process`);
    }

    return NextResponse.json({
      success: true,
      processed: processedEvents.length,
      failed: errors.length,
      eventTypes,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('💥 SendGrid webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process webhook events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const challenge = url.searchParams.get('challenge');
  
  if (challenge) {
    // SendGrid webhook verification
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({
    message: 'SendGrid Email Events Webhook',
    status: 'active',
    supportedEvents: VALID_EVENTS,
    endpoint: '/api/sendgrid/webhook',
    instructions: [
      '1. Configure this URL in SendGrid: https://yourdomain.com/api/sendgrid/webhook',
      '2. Enable the following events: processed, delivered, open, click, bounce, dropped, spam_report, unsubscribe',
      '3. Include custom args in your email sends for campaign tracking',
      '4. Events will be automatically stored in the database'
    ]
  });
}