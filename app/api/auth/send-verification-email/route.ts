import { NextRequest, NextResponse } from "next/server";
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
  console.log("Send verification email API called at:", new Date().toISOString());
  
  try {
    const { email, verificationUrl } = await request.json();
    
    console.log("Request data:", { 
      email, 
      verificationUrl: verificationUrl ? verificationUrl.substring(0, 50) + "..." : null,
      hasSendGridKey: !!process.env.SENDGRID_API_KEY 
    });

    if (!email || !verificationUrl) {
      console.log("Missing required fields:", { email: !!email, verificationUrl: !!verificationUrl });
      return NextResponse.json(
        { error: "Email and verification URL are required" },
        { status: 400 }
      );
    }

    // Extract name from email (before @) for personalization
    const name = email.split('@')[0];
    console.log("Extracted name from email:", name);

    const msg = {
      to: email,
      from: 'nextgenfi3@gmail.com', // Make sure this email is verified in SendGrid
      subject: 'Verify your email address - Nextgenfi',
      custom_args: {
        userId: email,
        campaignId: 'email-verification',
        emailType: 'verification',
      },
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Welcome to Nextgenfi</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Hello ${name}!
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Thank you for signing up! Please verify your email address to complete your account setup and access all features.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #000; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This verification link will expire in 24 hours for security reasons.
          </p>
          
          <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>What's next?</strong><br>
              After verifying your email, you'll be able to complete KYC verification and access your dashboard.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Nextgenfi - AI-first banking infrastructure<br>
            If you didn't create an account with us, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    if (process.env.SENDGRID_API_KEY) {
      console.log("Sending email via SendGrid...");
      const result = await sgMail.send(msg);
      console.log("Verification email sent successfully:", { 
        statusCode: result[0].statusCode,
        messageId: result[0].headers['x-message-id'],
        to: email 
      });
      
      return NextResponse.json({
        success: true,
        message: "Verification email sent successfully",
        messageId: result[0].headers['x-message-id'],
      });
    } else {
      // Development fallback
      console.log(`[DEV] Verification email for ${email}: ${verificationUrl}`);
      return NextResponse.json({
        success: true,
        message: "Verification email logged to console (development mode)",
        verificationUrl,
      });
    }

  } catch (error: any) {
    console.error('Verification email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send verification email', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
