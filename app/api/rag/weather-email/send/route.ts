import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface WeatherBulkEmailRequest {
  subject: string;
  body: string;
  targets: Array<{
    person: {
      firstName: string;
      lastName: string;
      email: string;
      city: string;
      state: string;
      houseValue: number;
      hasInsurance: boolean;
    };
    weatherEvent: {
      id: string;
      eventType: string;
      severity: string;
      location: string;
      latitude: number | null;
      longitude: number | null;
      startTime: string;
      endTime: string | null;
      description: string | null;
      rainfall: number | null;
      windSpeed: number | null;
      temperature: number | null;
      humidity: number | null;
    };
    distance_km: number;
    risk_level: string;
  }>;
  campaignId: string;
  batchSize?: number;
  delayBetweenBatches?: number;
}

export interface WeatherBulkEmailResponse {
  success: boolean;
  campaignId: string;
  totalTargets: number;
  results: Array<{
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  summary: {
    sent: number;
    failed: number;
    processingTimeMs: number;
  };
}

function personalizeWeatherEmail(template: string, target: any): string {
  return template
    .replace(/\{first_name\}/g, target.person.firstName)
    .replace(/\{last_name\}/g, target.person.lastName)
    .replace(/\{full_name\}/g, `${target.person.firstName} ${target.person.lastName}`)
    .replace(/\{city\}/g, target.person.city)
    .replace(/\{state\}/g, target.person.state)
    .replace(/\{house_value\}/g, (target.person.houseValue || 0).toLocaleString())
    .replace(/\{weather_event_type\}/g, target.weatherEvent.eventType)
    .replace(/\{weather_severity\}/g, target.weatherEvent.severity)
    .replace(/\{weather_location\}/g, target.weatherEvent.location)
    .replace(/\{distance_km\}/g, target.distance_km.toString())
    .replace(/\{risk_level\}/g, target.risk_level)
    .replace(/\{rainfall\}/g, target.weatherEvent.rainfall ? `${target.weatherEvent.rainfall}mm` : 'N/A')
    .replace(/\{wind_speed\}/g, target.weatherEvent.windSpeed ? `${target.weatherEvent.windSpeed} km/h` : 'N/A')
    .replace(/\{temperature\}/g, target.weatherEvent.temperature ? `${target.weatherEvent.temperature}°C` : 'N/A')
    .replace(/\{humidity\}/g, target.weatherEvent.humidity ? `${target.weatherEvent.humidity}%` : 'N/A');
}

function createWeatherEmailHTML(body: string, target: any): string {
  const personalizedBody = personalizeWeatherEmail(body, target);
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Insurance Information</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2c5aa0; margin-top: 0;">Weather Insurance Information</h2>
        <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8;">
            ${personalizedBody.split('\n').map(paragraph => paragraph.trim() ? `<p style="margin: 10px 0;">${paragraph}</p>` : '').join('')}
        </div>
    </div>
    
    <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; font-size: 12px; color: #6c757d;">
        <p><strong>Weather Event Details:</strong></p>
        <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Event: ${target.weatherEvent.eventType.charAt(0).toUpperCase() + target.weatherEvent.eventType.slice(1)} (${target.weatherEvent.severity})</li>
            <li>Location: ${target.weatherEvent.location}</li>
            <li>Distance from you: ${target.distance_km} km</li>
            <li>Risk Level: ${target.risk_level.charAt(0).toUpperCase() + target.risk_level.slice(1)}</li>
            ${target.weatherEvent.rainfall ? `<li>Expected Rainfall: ${target.weatherEvent.rainfall}mm</li>` : ''}
            ${target.weatherEvent.windSpeed ? `<li>Wind Speed: ${target.weatherEvent.windSpeed} km/h</li>` : ''}
        </ul>
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 10px 0;">
        <p style="margin: 5px 0;">This email was sent because you live in an area that may be affected by weather events. If you no longer wish to receive these updates, <a href="#" style="color: #6c757d;">unsubscribe here</a>.</p>
    </div>
</body>
</html>
`;
}

async function sendWeatherBatchEmails(
  targets: any[],
  subject: string,
  body: string,
  campaignId: string
): Promise<Array<{ email: string; success: boolean; messageId?: string; error?: string }>> {
  const results = [];
  
  for (const target of targets) {
    try {
      const personalizedSubject = personalizeWeatherEmail(subject, target);
      const emailHTML = createWeatherEmailHTML(body, target);
      
      const msg = {
        to: target.person.email,
        from: 'Weather Insurance AI <nextgenfi3@gmail.com>', // Make sure this email is verified in SendGrid
        subject: personalizedSubject,
        html: emailHTML,
        custom_args: {
          userId: target.person.email,
          campaignId: campaignId,
          weatherEventId: target.weatherEvent.id,
          riskLevel: target.risk_level,
          emailType: 'weather-insurance-campaign',
        },
        headers: {
          'X-Campaign-ID': campaignId,
          'X-Target-ID': target.person.email,
          'X-Weather-Event-ID': target.weatherEvent.id,
          'X-Risk-Level': target.risk_level,
          'X-Weather-Event-Type': target.weatherEvent.eventType
        }
      };

      const emailResult = await sgMail.send(msg);

      results.push({
        email: target.person.email,
        success: true,
        messageId: emailResult[0].headers['x-message-id'] || 'sent'
      });

    } catch (error) {
      results.push({
        email: target.person.email,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: WeatherBulkEmailRequest = await request.json();
    
    const { 
      subject, 
      body: emailBody, 
      targets, 
      campaignId,
      batchSize = 5,
      delayBetweenBatches = 3000
    } = body;

    if (!subject || !emailBody || !targets || !campaignId) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, body, targets, and campaignId are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(targets) || targets.length === 0) {
      return NextResponse.json(
        { error: 'Targets must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set SENDGRID_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    console.log(`📧 Starting bulk weather email campaign: ${campaignId} with ${targets.length} targets`);

    // Split targets into batches
    const batches = [];
    for (let i = 0; i < targets.length; i += batchSize) {
      batches.push(targets.slice(i, i + batchSize));
    }

    console.log(`📦 Split into ${batches.length} batches of max ${batchSize} emails each`);

    // Send emails in batches with delays
    const allResults = [];
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📤 Sending batch ${i + 1}/${batches.length} (${batch.length} emails)`);
      
      const batchResults = await sendWeatherBatchEmails(batch, subject, emailBody, campaignId);
      allResults.push(...batchResults);
      
      // Add delay between batches (except for the last batch)
      if (i < batches.length - 1) {
        console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    const endTime = Date.now();
    const processingTimeMs = endTime - startTime;

    // Calculate summary
    const sentCount = allResults.filter(r => r.success).length;
    const failedCount = allResults.filter(r => !r.success).length;

    const response: WeatherBulkEmailResponse = {
      success: true,
      campaignId,
      totalTargets: targets.length,
      results: allResults,
      summary: {
        sent: sentCount,
        failed: failedCount,
        processingTimeMs
      }
    };

    console.log(`✅ Weather email campaign completed: ${sentCount} sent, ${failedCount} failed in ${processingTimeMs}ms`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Weather bulk email error:', error);
    return NextResponse.json(
      { error: 'Failed to send weather emails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to send bulk weather insurance emails',
    example: {
      subject: 'Protect Your Home from {weather_event_type} - {first_name}',
      body: 'Dear {first_name},\n\nA {weather_severity} {weather_event_type} is approaching {weather_location}, just {distance_km}km from your home in {city}.\n\nYour property valued at ${house_value} may be at {risk_level} risk...',
      targets: [], // Array of weather targets
      campaignId: 'weather_campaign_001',
      batchSize: 5,
      delayBetweenBatches: 3000
    },
    availableVariables: [
      '{first_name}', '{last_name}', '{full_name}', '{city}', '{state}',
      '{house_value}', '{weather_event_type}', '{weather_severity}', 
      '{weather_location}', '{distance_km}', '{risk_level}', 
      '{rainfall}', '{wind_speed}', '{temperature}', '{humidity}'
    ]
  });
}
