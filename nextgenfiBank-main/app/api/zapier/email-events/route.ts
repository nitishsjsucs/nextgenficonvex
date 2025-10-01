import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Handle both JSON and form-encoded data from Zapier
    let eventData: any;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      eventData = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      eventData = Object.fromEntries(formData);
    } else {
      // Try JSON first, fallback to text
      try {
        eventData = await req.json();
      } catch {
        const text = await req.text();
        console.log('📧 Raw request body:', text);
        // Try to parse as JSON if it looks like JSON
        if (text.startsWith('{') || text.startsWith('[')) {
          eventData = JSON.parse(text);
        } else {
          // Parse as query string
          eventData = Object.fromEntries(new URLSearchParams(text));
        }
      }
    }
    
    console.log('📧 Received email event from Zapier:', eventData);
    console.log('📧 Content-Type:', contentType);
    console.log('📧 Event data keys:', Object.keys(eventData));
    console.log('📧 Event data values:', Object.values(eventData));

    // Zapier will send us clean, structured data
    const {
      type,           // 'click', 'open', 'delivered', 'bounce', etc.
      email,          // recipient email
      timestamp,      // ISO timestamp
      url,            // clicked URL (for click events)
      campaignId,     // campaign identifier
      userId,         // user identifier
      sgMessageId,    // SendGrid message ID
      eventId         // unique event ID from Zapier
    } = eventData;

    console.log('📧 Extracted fields:', { type, email, timestamp, url, campaignId, userId, sgMessageId });

    // Validate required fields
    if (!type || !email || !timestamp) {
      console.log('❌ Missing required fields - Available data:', eventData);
      return NextResponse.json(
        { 
          error: 'Missing required fields: type, email, timestamp',
          receivedData: eventData,
          availableKeys: Object.keys(eventData)
        },
        { status: 400 }
      );
    }

    try {
      // Convert timestamp (handle both Unix timestamp and ISO string)
      let eventTimestamp: Date;
      if (typeof timestamp === 'string' && timestamp.includes('T')) {
        // ISO string format
        eventTimestamp = new Date(timestamp);
      } else {
        // Unix timestamp (seconds)
        eventTimestamp = new Date(parseInt(timestamp) * 1000);
      }

      // Store the event in database
      const emailEvent = await prisma.emailEvent.create({
        data: {
          type,
          email,
          url: url || null,
          timestamp: eventTimestamp,
          sgMessageId: sgMessageId || null,
          userId: userId || null,
          campaignId: campaignId || null,
        },
      });

      console.log(`✅ Stored ${type} event for ${email}:`, emailEvent.id);

      return NextResponse.json({ 
        success: true,
        eventId: emailEvent.id,
        message: `Successfully processed ${type} event`
      });

    } catch (dbError: any) {
      console.warn('⚠️ Database connection failed, logging event locally:', dbError.message);
      
      // Fallback: Log the event (in production, you might want to queue this)
      const mockEventId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`📝 Mock stored ${type} event for ${email} with ID: ${mockEventId}`);
      
      return NextResponse.json({ 
        success: true,
        eventId: mockEventId,
        message: `Successfully processed ${type} event (logged locally due to DB connection issue)`,
        warning: 'Database connection failed - event logged locally'
      });
    }

  } catch (error: any) {
    console.error('❌ Zapier email event error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process email event',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Zapier Email Events Endpoint',
    description: 'POST email event data from Zapier to store in database',
    expectedFields: {
      type: 'string (required) - click, open, delivered, bounce, etc.',
      email: 'string (required) - recipient email address',
      timestamp: 'string (required) - ISO timestamp',
      url: 'string (optional) - clicked URL for click events',
      campaignId: 'string (optional) - campaign identifier',
      userId: 'string (optional) - user identifier',
      sgMessageId: 'string (optional) - SendGrid message ID',
      eventId: 'string (optional) - unique event ID from Zapier'
    },
    example: {
      type: 'click',
      email: 'user@example.com',
      timestamp: '2024-01-15T10:30:00Z',
      url: 'https://nextgenfibank.vercel.app/dashboard',
      campaignId: 'earthquake-campaign-2024',
      userId: 'user-123',
      sgMessageId: 'abc123def456',
      eventId: 'zapier-event-789'
    }
  });
}
