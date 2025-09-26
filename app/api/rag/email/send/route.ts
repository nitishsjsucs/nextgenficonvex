import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface BulkEmailRequest {
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
    earthquake: {
      id: string;
      time: number | null;
      latitude: number | null;
      longitude: number | null;
      mag: number | null;
      place: string | null;
      depth_km: number | null;
      url: string | null;
    };
    distance_km: number;
    risk_level: string;
  }>;
  campaignId: string;
  batchSize?: number;
  delayBetweenBatches?: number;
}

export interface BulkEmailResponse {
  success: boolean;
  campaignId: string;
  summary: {
    totalTargets: number;
    emailsSent: number;
    emailsFailed: number;
    successRate: string;
    totalTimeMs: number;
    averageTimePerEmail: string;
  };
  results: Array<{
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

function personalizeEmail(template: string, target: any): string {
  return template
    .replace(/\{firstName\}/g, target.person.firstName)
    .replace(/\{lastName\}/g, target.person.lastName)
    .replace(/\{city\}/g, target.person.city)
    .replace(/\{state\}/g, target.person.state)
    .replace(/\{houseValue\}/g, (target.person.houseValue || 0).toLocaleString())
    .replace(/\{distance\}/g, target.distance_km.toString())
    .replace(/\{magnitude\}/g, target.earthquake.mag?.toString() || 'Unknown')
    .replace(/\{earthquakePlace\}/g, target.earthquake.place || 'Unknown location');
}

function createEmailHTML(body: string, target: any): string {
  const personalizedBody = personalizeEmail(body, target);
  
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      ${personalizedBody.replace(/\n/g, '<br>')}
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>This email was sent as part of an earthquake insurance awareness campaign.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://nextgenficonvex.vercel.app/insurance-quote" 
             style="background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 500; display: inline-block;">
            Get Your Quote Now
          </a>
        </div>
        <p>If you no longer wish to receive these emails, please <a href="https://nextgenficonvex.vercel.app/unsubscribe" style="color: #666;">unsubscribe here</a>.</p>
      </div>
    </div>
  `;
}

async function sendBatchEmails(
  targets: any[],
  subject: string,
  body: string,
  campaignId: string
): Promise<Array<{ email: string; success: boolean; messageId?: string; error?: string }>> {
  const results = [];
  
  for (const target of targets) {
    try {
      const personalizedSubject = personalizeEmail(subject, target);
      const emailHTML = createEmailHTML(body, target);
      
      const msg = {
        to: target.person.email,
        from: 'Earthquake Insurance AI <nextgenfi3@gmail.com>', // Make sure this email is verified in SendGrid
        subject: personalizedSubject,
        html: emailHTML,
        custom_args: {
          userId: target.person.email,
          campaignId: campaignId,
          earthquakeId: target.earthquake.id,
          riskLevel: target.risk_level,
          emailType: 'earthquake-insurance-campaign',
        },
        headers: {
          'X-Campaign-ID': campaignId,
          'X-Target-ID': target.person.email,
          'X-Earthquake-ID': target.earthquake.id,
          'X-Risk-Level': target.risk_level
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
    const body: BulkEmailRequest = await request.json();
    
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

    console.log(`📧 Starting bulk email campaign: ${campaignId} with ${targets.length} targets`);

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
      
      const batchResults = await sendBatchEmails(batch, subject, emailBody, campaignId);
      allResults.push(...batchResults);
      
      // Add delay between batches (except for the last batch)
      if (i < batches.length - 1) {
        console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    const endTime = Date.now();
    const totalTimeMs = endTime - startTime;
    
    // Calculate summary statistics
    const emailsSent = allResults.filter(r => r.success).length;
    const emailsFailed = allResults.filter(r => !r.success).length;
    const successRate = ((emailsSent / targets.length) * 100).toFixed(1) + '%';
    const averageTimePerEmail = (totalTimeMs / targets.length).toFixed(0) + 'ms';

    console.log(`✅ Campaign completed: ${emailsSent}/${targets.length} emails sent (${successRate} success rate)`);

    const response: BulkEmailResponse = {
      success: true,
      campaignId,
      summary: {
        totalTargets: targets.length,
        emailsSent,
        emailsFailed,
        successRate,
        totalTimeMs,
        averageTimePerEmail
      },
      results: allResults
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Bulk email API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send bulk emails', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to send bulk emails',
    example: {
      subject: "Important: Earthquake Insurance Information for {city} Residents",
      body: "Dear {firstName}, we noticed recent earthquake activity near your {city} home...",
      targets: [
        {
          person: {
            firstName: "John",
            lastName: "Smith",
            email: "john@example.com",
            city: "Los Angeles",
            state: "CA",
            houseValue: 750000,
            hasInsurance: false
          },
          earthquake: {
            id: "earthquake-id",
            mag: 5.2,
            place: "10km NW of Los Angeles"
          },
          distance_km: 15,
          risk_level: "high"
        }
      ],
      campaignId: "campaign-123456789",
      batchSize: 5,
      delayBetweenBatches: 3000
    }
  });
}