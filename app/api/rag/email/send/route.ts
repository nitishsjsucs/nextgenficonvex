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
  console.log(`📤 [DEBUG] ===== SENDING BATCH OF ${targets.length} EMAILS =====`);
  console.log(`📤 [DEBUG] Campaign ID: ${campaignId}`);
  console.log(`📤 [DEBUG] Subject: ${subject.substring(0, 50)}...`);
  
  const results = [];
  
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`📧 [DEBUG] Sending email ${i + 1}/${targets.length} to: ${target.person.email}`);
    
    try {
      const personalizedSubject = personalizeEmail(subject, target);
      const emailHTML = createEmailHTML(body, target);
      
      console.log(`📧 [DEBUG] Personalized subject: ${personalizedSubject.substring(0, 50)}...`);
      console.log(`📧 [DEBUG] Email HTML length: ${emailHTML.length}`);
      
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

      console.log(`📧 [DEBUG] SendGrid message prepared:`, {
        to: msg.to,
        from: msg.from,
        subject: msg.subject.substring(0, 50) + '...',
        custom_args: msg.custom_args,
        headers: Object.keys(msg.headers)
      });

      console.log(`📧 [DEBUG] Calling SendGrid API...`);
      const emailResult = await sgMail.send(msg);
      
      console.log(`📧 [DEBUG] SendGrid response received:`, {
        statusCode: emailResult[0]?.statusCode,
        messageId: emailResult[0]?.headers?.['x-message-id'],
        headers: Object.keys(emailResult[0]?.headers || {})
      });

      results.push({
        email: target.person.email,
        success: true,
        messageId: emailResult[0].headers['x-message-id'] || 'sent'
      });

      console.log(`✅ [DEBUG] Email sent successfully to ${target.person.email}`);

    } catch (error) {
      console.error(`❌ [ERROR] Failed to send email to ${target.person.email}:`, error);
      console.error(`❌ [ERROR] Error type:`, typeof error);
      console.error(`❌ [ERROR] Error message:`, error instanceof Error ? error.message : 'No message');
      console.error(`❌ [ERROR] Error stack:`, error instanceof Error ? error.stack : 'No stack');
      
      results.push({
        email: target.person.email,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  console.log(`📤 [DEBUG] Batch completed: ${results.filter(r => r.success).length}/${targets.length} successful`);
  console.log(`📤 [DEBUG] ===== BATCH EMAIL SENDING COMPLETED =====`);
  
  return results;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  console.log('🚀 [DEBUG] ===== EMAIL SEND API CALLED =====');
  console.log('🚀 [DEBUG] Timestamp:', new Date().toISOString());
  console.log('🚀 [DEBUG] Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const body: BulkEmailRequest = await request.json();
    
    console.log('📧 [DEBUG] Request body received');
    console.log('📧 [DEBUG] Body keys:', Object.keys(body));
    console.log('📧 [DEBUG] Campaign ID:', body.campaignId);
    console.log('📧 [DEBUG] Subject:', body.subject?.substring(0, 50) + '...');
    console.log('📧 [DEBUG] Body length:', body.body?.length);
    console.log('📧 [DEBUG] Targets count:', body.targets?.length);
    console.log('📧 [DEBUG] Batch size:', body.batchSize);
    console.log('📧 [DEBUG] Delay between batches:', body.delayBetweenBatches);
    
    if (body.targets && body.targets.length > 0) {
      console.log('📧 [DEBUG] First target sample:');
      console.log('📧 [DEBUG] - Person email:', body.targets[0].person?.email);
      console.log('📧 [DEBUG] - Person name:', body.targets[0].person?.firstName, body.targets[0].person?.lastName);
      console.log('📧 [DEBUG] - Earthquake ID:', body.targets[0].earthquake?.id);
      console.log('📧 [DEBUG] - Risk level:', body.targets[0].risk_level);
    }
    
    const { 
      subject, 
      body: emailBody, 
      targets, 
      campaignId,
      batchSize = 5,
      delayBetweenBatches = 3000
    } = body;

    if (!subject || !emailBody || !targets || !campaignId) {
      console.log('❌ [ERROR] Missing required fields');
      console.log('❌ [ERROR] - Subject:', !!subject);
      console.log('❌ [ERROR] - Email body:', !!emailBody);
      console.log('❌ [ERROR] - Targets:', !!targets);
      console.log('❌ [ERROR] - Campaign ID:', !!campaignId);
      return NextResponse.json(
        { error: 'Missing required fields: subject, body, targets, and campaignId are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(targets) || targets.length === 0) {
      console.log('❌ [ERROR] Invalid targets array');
      console.log('❌ [ERROR] - Is array:', Array.isArray(targets));
      console.log('❌ [ERROR] - Length:', targets?.length);
      return NextResponse.json(
        { error: 'Targets must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!process.env.SENDGRID_API_KEY) {
      console.log('❌ [ERROR] SENDGRID_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please set SENDGRID_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    console.log(`📧 [DEBUG] Starting bulk email campaign: ${campaignId} with ${targets.length} targets`);
    console.log('📧 [DEBUG] SendGrid API key configured:', !!process.env.SENDGRID_API_KEY);
    console.log('📧 [DEBUG] SendGrid API key length:', process.env.SENDGRID_API_KEY?.length);

    // Split targets into batches
    const batches = [];
    for (let i = 0; i < targets.length; i += batchSize) {
      batches.push(targets.slice(i, i + batchSize));
    }

    console.log(`📦 [DEBUG] Split into ${batches.length} batches of max ${batchSize} emails each`);

    // Send emails in batches with delays
    const allResults = [];
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📤 [DEBUG] Sending batch ${i + 1}/${batches.length} (${batch.length} emails)`);
      
      const batchResults = await sendBatchEmails(batch, subject, emailBody, campaignId);
      allResults.push(...batchResults);
      
      console.log(`📤 [DEBUG] Batch ${i + 1} completed:`, batchResults.map(r => ({ email: r.email, success: r.success })));
      
      // Add delay between batches (except for the last batch)
      if (i < batches.length - 1) {
        console.log(`⏳ [DEBUG] Waiting ${delayBetweenBatches}ms before next batch...`);
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

    console.log(`✅ [DEBUG] Campaign completed: ${emailsSent}/${targets.length} emails sent (${successRate} success rate)`);
    console.log(`✅ [DEBUG] Total time: ${totalTimeMs}ms`);
    console.log(`✅ [DEBUG] Average time per email: ${averageTimePerEmail}`);
    console.log(`✅ [DEBUG] Failed emails: ${emailsFailed}`);

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

    console.log('✅ [DEBUG] ===== EMAIL SEND API COMPLETED =====');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [ERROR] ===== EMAIL SEND API ERROR =====');
    console.error('❌ [ERROR] Error type:', typeof error);
    console.error('❌ [ERROR] Error constructor:', error?.constructor?.name);
    console.error('❌ [ERROR] Error message:', error instanceof Error ? error.message : 'No message');
    console.error('❌ [ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ [ERROR] Full error object:', error);
    
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