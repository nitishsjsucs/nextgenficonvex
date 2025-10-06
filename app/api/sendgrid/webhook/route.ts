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
  console.log('🔗 [DEBUG] ===== SENDGRID WEBHOOK CALLED =====');
  console.log('🔗 [DEBUG] Timestamp:', new Date().toISOString());
  console.log('🔗 [DEBUG] Request headers:', Object.fromEntries(request.headers.entries()));
  console.log('🔗 [DEBUG] Request URL:', request.url);
  console.log('🔗 [DEBUG] Request method:', request.method);
  
  try {
    const rawBody = await request.text();
    console.log('🔗 [DEBUG] Raw request body length:', rawBody.length);
    console.log('🔗 [DEBUG] Raw request body preview:', rawBody.substring(0, 200) + '...');
    
    const events: SendGridEvent[] = JSON.parse(rawBody);
    console.log('🔗 [DEBUG] Parsed events count:', events.length);
    console.log('🔗 [DEBUG] Events type:', Array.isArray(events) ? 'array' : typeof events);

    if (!Array.isArray(events)) {
      console.log('❌ [ERROR] Expected array of events, got:', typeof events);
      return NextResponse.json(
        { error: 'Expected array of events' },
        { status: 400 }
      );
    }

    console.log(`📧 [DEBUG] Received ${events.length} SendGrid webhook events`);
    
    // Log first event details for debugging
    if (events.length > 0) {
      console.log('📧 [DEBUG] First event sample:', {
        email: events[0].email,
        event: events[0].event,
        timestamp: events[0].timestamp,
        sg_message_id: events[0].sg_message_id,
        unique_args: events[0].unique_args
      });
    }

    const processedEvents = [];
    const errors = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      console.log(`📧 [DEBUG] Processing event ${i + 1}/${events.length}:`, {
        email: event.email,
        event: event.event,
        timestamp: event.timestamp,
        sg_message_id: event.sg_message_id
      });
      
      try {
        // Validate event
        if (!event.email || !event.event || !event.timestamp) {
          console.log(`❌ [ERROR] Event ${i + 1} missing required fields:`, {
            email: !!event.email,
            event: !!event.event,
            timestamp: !!event.timestamp
          });
          errors.push({
            event,
            error: 'Missing required fields: email, event, or timestamp'
          });
          continue;
        }

        if (!VALID_EVENTS.includes(event.event)) {
          console.log(`⚠️ [WARNING] Unknown event type: ${event.event}`);
          continue;
        }

        // Extract campaign info from custom args
        const customArgs = event.unique_args || {};
        const campaignId = customArgs.campaignId;
        const userId = customArgs.userId;
        const emailType = customArgs.emailType || 'unknown';

        console.log(`📧 [DEBUG] Event ${i + 1} custom args:`, {
          campaignId,
          userId,
          emailType,
          earthquakeId: customArgs.earthquakeId,
          riskLevel: customArgs.riskLevel
        });

        // Store email event in Convex
        const emailEventId = `email_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`📧 [DEBUG] Creating email event in Convex:`, {
          campaignId: campaignId || 'unknown',
          personId: userId || 'unknown',
          eventType: event.event,
          timestamp: event.timestamp * 1000,
          metadata: {
            email: event.email,
            url: event.url,
            sgMessageId: event.sg_message_id,
          }
        });
        
        const emailEvent = await convex.mutation(api.campaigns.createEmailEvent, {
          campaignId: campaignId || 'unknown',
          personId: userId || 'unknown',
          eventType: event.event,
          timestamp: event.timestamp * 1000, // Convert Unix timestamp to milliseconds
          metadata: {
            email: event.email,
            url: event.url,
            sgMessageId: event.sg_message_id,
          },
        });

        console.log(`✅ [DEBUG] Email event created in Convex with ID: ${emailEvent}`);

        processedEvents.push({
          id: emailEvent,
          type: event.event,
          email: event.email,
          timestamp: new Date(event.timestamp * 1000),
          campaignId: campaignId,
          emailType: emailType
        });

        console.log(`✅ [DEBUG] Processed ${event.event} event for ${event.email} (Campaign: ${campaignId || 'N/A'})`);

      } catch (error) {
        console.error(`❌ [ERROR] Error processing event ${i + 1}:`, error);
        console.error(`❌ [ERROR] Error type:`, typeof error);
        console.error(`❌ [ERROR] Error message:`, error instanceof Error ? error.message : 'No message');
        console.error(`❌ [ERROR] Error stack:`, error instanceof Error ? error.stack : 'No stack');
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

    console.log('📊 [DEBUG] Event Summary:', eventTypes);
    console.log(`✅ [DEBUG] Successfully processed ${processedEvents.length}/${events.length} events`);

    if (errors.length > 0) {
      console.log(`❌ [DEBUG] ${errors.length} events failed to process`);
      console.log(`❌ [DEBUG] Error details:`, errors);
    }

    const response = {
      success: true,
      processed: processedEvents.length,
      failed: errors.length,
      eventTypes,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('🔗 [DEBUG] ===== SENDGRID WEBHOOK COMPLETED =====');
    console.log('🔗 [DEBUG] Response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 [ERROR] ===== SENDGRID WEBHOOK ERROR =====');
    console.error('💥 [ERROR] Error type:', typeof error);
    console.error('💥 [ERROR] Error constructor:', error?.constructor?.name);
    console.error('💥 [ERROR] Error message:', error instanceof Error ? error.message : 'No message');
    console.error('💥 [ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('💥 [ERROR] Full error object:', error);
    
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