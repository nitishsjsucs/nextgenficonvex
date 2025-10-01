import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Interface for the SendGrid email params
interface SendGridEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from: string;
}

export interface TestEmailRequest {
  subject: string;
  body: string;
  targetData: {
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
  };
  testEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TestEmailRequest = await request.json();
    const { subject, body: emailBody, targetData, testEmail } = body;

    if (!subject || !emailBody || !targetData || !testEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, body, targetData, and testEmail are required' },
        { status: 400 }
      );
    }

    // Personalize the email with actual target data
    const personalizedSubject = subject
      .replace(/\{firstName\}/g, targetData.person.firstName)
      .replace(/\{lastName\}/g, targetData.person.lastName)
      .replace(/\{city\}/g, targetData.person.city)
      .replace(/\{state\}/g, targetData.person.state);

    const personalizedBody = emailBody
      .replace(/\{firstName\}/g, targetData.person.firstName)
      .replace(/\{lastName\}/g, targetData.person.lastName)
      .replace(/\{city\}/g, targetData.person.city)
      .replace(/\{state\}/g, targetData.person.state)
      .replace(/\{houseValue\}/g, (targetData.person.houseValue || 0).toLocaleString())
      .replace(/\{distance\}/g, targetData.distance_km.toString())
      .replace(/\{magnitude\}/g, targetData.earthquake.mag?.toString() || 'Unknown')
      .replace(/\{earthquakePlace\}/g, targetData.earthquake.place || 'Unknown location');

    // Create HTML email content
    const testEmailBody = `
      <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; margin-bottom: 20px; border-radius: 8px;">
        <h3 style="color: #92400e; margin: 0 0 8px 0;">🧪 EMAIL PREVIEW</h3>
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          This is a preview of your earthquake insurance campaign email. 
          Target: ${targetData.person.firstName} ${targetData.person.lastName} in ${targetData.person.city}, ${targetData.person.state}
        </p>
      </div>
      
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        ${personalizedBody.replace(/\n/g, '<br>')}
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p><strong>Campaign Details:</strong></p>
        <ul>
          <li>Target: ${targetData.person.firstName} ${targetData.person.lastName}</li>
          <li>Location: ${targetData.person.city}, ${targetData.person.state}</li>
          <li>House Value: $${(targetData.person.houseValue || 0).toLocaleString()}</li>
          <li>Risk Level: ${targetData.risk_level}</li>
          <li>Distance from Earthquake: ${targetData.distance_km} km</li>
          <li>Earthquake: M${targetData.earthquake.mag} - ${targetData.earthquake.place}</li>
        </ul>
      </div>
    `;

    // Send email using SendGrid API
    try {
      console.log('📧 Attempting to send email to:', testEmail);
      console.log('📧 Using SendGrid API key:', process.env.SENDGRID_API_KEY ? 'Present' : 'Missing');
      
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY not configured');
      }

      console.log('📧 Sending with SendGrid...');
      const msg = {
        to: testEmail,
        from: 'nextgenfi3@gmail.com', // Make sure this email is verified in SendGrid
        subject: `[TEST] ${personalizedSubject}`,
        html: testEmailBody,
        custom_args: {
          userId: 'test-user',
          campaignId: `test-${Date.now()}`,
          emailType: 'earthquake-insurance-test',
        },
      };

      const emailResult = await sgMail.send(msg);
      console.log('📧 SendGrid response status:', emailResult[0].statusCode);

      if (emailResult[0].statusCode !== 202) {
        throw new Error(`Email delivery failed with status: ${emailResult[0].statusCode}`);
      }

      console.log('✅ Email sent successfully via SendGrid');

      const response = {
        success: true,
        testEmail,
        previewData: {
          subject: personalizedSubject,
          targetInfo: {
            name: `${targetData.person.firstName} ${targetData.person.lastName}`,
            location: `${targetData.person.city}, ${targetData.person.state}`,
            houseValue: `$${(targetData.person.houseValue || 0).toLocaleString()}`,
            riskLevel: targetData.risk_level,
            distance: `${targetData.distance_km} km`,
            earthquake: `M${targetData.earthquake.mag} - ${targetData.earthquake.place}`
          }
        },
        messageId: emailResult[0].headers['x-message-id'] || 'sent-via-sendgrid',
        emailSent: true
      };

      return NextResponse.json(response);

    } catch (emailError) {
      console.log('⚠️ Email send failed, providing preview instead:', emailError);
      
      // Fallback to preview mode
      const response = {
        success: true,
        testEmail,
        previewData: {
          subject: personalizedSubject,
          targetInfo: {
            name: `${targetData.person.firstName} ${targetData.person.lastName}`,
            location: `${targetData.person.city}, ${targetData.person.state}`,
            houseValue: `$${(targetData.person.houseValue || 0).toLocaleString()}`,
            riskLevel: targetData.risk_level,
            distance: `${targetData.distance_km} km`,
            earthquake: `M${targetData.earthquake.mag} - ${targetData.earthquake.place}`
          }
        },
        messageId: 'preview-mode-email-failed',
        warning: `Email sending failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}. Showing preview instead.`,
        emailPreview: {
          to: testEmail,
          subject: personalizedSubject,
          html: testEmailBody,
          plainText: personalizedBody
        }
      };

      console.log('📧 Email preview generated as fallback for:', testEmail);
      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate email preview', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to generate email previews',
    note: 'This API generates email previews. To send actual emails, configure SENDGRID_API_KEY.',
    example: {
      subject: "Important: Earthquake Insurance Information for {firstName}",
      body: "Dear {firstName}, we noticed recent earthquake activity near your {city} home...",
      targetData: {
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
      },
      testEmail: "test@example.com"
    }
  });
}