import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json({ error: 'testEmail is required' }, { status: 400 });
    }

    const msg = {
      to: testEmail,
      from: 'nextgenfi3@gmail.com',
      subject: 'Test Email - Click & Open Tracking',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Test Email for Click & Open Tracking</h1>
          
          <p>This is a test email to verify that click and open tracking works properly.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://nextgenficonvex.vercel.app/dashboard" 
               style="background: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Visit Dashboard (Click to Test)
            </a>
          </div>
          
          <p>You can also visit our <a href="https://nextgenficonvex.vercel.app" style="color: #007bff;">homepage</a> or check out our <a href="https://nextgenficonvex.vercel.app/kyc" style="color: #007bff;">KYC verification</a>.</p>
          
          <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
            <p><strong>Testing Instructions:</strong></p>
            <ol>
              <li>Open this email (should trigger "open" event)</li>
              <li>Click any of the links above (should trigger "click" events)</li>
              <li>Check your webhook logs and dashboard analytics</li>
            </ol>
          </div>
        </div>
      `,
      custom_args: {
        userId: 'test-user',
        campaignId: 'click-open-test',
        emailType: 'tracking-test',
      },
    };

    const result = await sgMail.send(msg);
    
    return NextResponse.json({ 
      success: true, 
      messageId: result[0].headers['x-message-id'],
      message: 'Test email sent successfully. Check your inbox and click the links to test tracking.'
    });

  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with { "testEmail": "your@email.com" } to send a test email for click/open tracking'
  });
}



