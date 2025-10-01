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

export interface WeatherTestEmailRequest {
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
    weatherEvent: {
      id: string;
      eventType: string;
      severity: string;
      location: string;
      latitude: number | null;
      longitude: number | null;
      startTime: string | Date;
      endTime: string | Date | null;
      description: string | null;
      rainfall: number | null;
      windSpeed: number | null;
      temperature: number | null;
      humidity: number | null;
    };
    distance_km: number;
    risk_level: string;
  };
  testEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WeatherTestEmailRequest = await request.json();
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
      .replace(/\{distance_km\}/g, targetData.distance_km.toString())
      .replace(/\{weather_event_type\}/g, targetData.weatherEvent.eventType)
      .replace(/\{weather_severity\}/g, targetData.weatherEvent.severity)
      .replace(/\{weather_location\}/g, targetData.weatherEvent.location)
      .replace(/\\n/g, '\n')  // Convert \n to actual line breaks
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Convert **bold** to <strong>
      .replace(/\*(.*?)\*/g, '<em>$1</em>');  // Convert *italic* to <em>

    // Create HTML email content
    const testEmailBody = `
      <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; margin-bottom: 20px; border-radius: 8px;">
        <h3 style="color: #92400e; margin: 0 0 8px 0;">🧪 EMAIL PREVIEW</h3>
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          This is a preview of your weather insurance campaign email. 
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
          <li>Distance from Weather Event: ${targetData.distance_km} km</li>
          <li>Weather Event: ${targetData.weatherEvent.eventType} (${targetData.weatherEvent.severity}) - ${targetData.weatherEvent.location}</li>
        </ul>
      </div>
    `;

    // Send email using SendGrid API
    try {
      console.log('📧 Attempting to send weather email to:', testEmail);
      console.log('📧 Using SendGrid API key:', process.env.SENDGRID_API_KEY ? 'Present' : 'Missing');
      
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY not configured');
      }

      console.log('📧 Sending weather email with SendGrid...');
      const msg = {
        to: testEmail,
        from: 'nextgenfi3@gmail.com', // Make sure this email is verified in SendGrid
        subject: `[TEST] ${personalizedSubject}`,
        html: testEmailBody,
        custom_args: {
          userId: 'test-user',
          campaignId: `weather-test-${Date.now()}`,
          emailType: 'weather-insurance-test',
        },
      };

      const emailResult = await sgMail.send(msg);
      console.log('📧 SendGrid response status:', emailResult[0].statusCode);

      if (emailResult[0].statusCode !== 202) {
        throw new Error(`Email delivery failed with status: ${emailResult[0].statusCode}`);
      }

      console.log('✅ Weather email sent successfully via SendGrid');

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
            weatherEvent: `${targetData.weatherEvent.eventType} (${targetData.weatherEvent.severity}) - ${targetData.weatherEvent.location}`
          }
        },
        messageId: emailResult[0].headers['x-message-id'] || 'sent-via-sendgrid',
        emailSent: true
      };

      return NextResponse.json(response);

    } catch (emailError) {
      console.log('⚠️ Weather email send failed, providing preview instead:', emailError);
      
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
            weatherEvent: `${targetData.weatherEvent.eventType} (${targetData.weatherEvent.severity}) - ${targetData.weatherEvent.location}`
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

      console.log('📧 Weather email preview generated as fallback for:', testEmail);
      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('Weather test email API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate weather email preview', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to generate weather email previews',
    note: 'This API generates weather email previews. To send actual emails, configure SENDGRID_API_KEY.',
    example: {
      subject: "Important: Weather Insurance Information for {firstName}",
      body: "Dear {firstName}, we noticed recent weather activity near your {city} home...",
      targetData: {
        person: {
          firstName: "Ahmad",
          lastName: "Rahman", 
          email: "ahmad@example.com",
          city: "Dhaka",
          state: "Bangladesh",
          houseValue: 500000,
          hasInsurance: false
        },
        weatherEvent: {
          id: "weather-id",
          eventType: "flood",
          severity: "severe",
          location: "Dhaka District"
        },
        distance_km: 15,
        risk_level: "high"
      },
      testEmail: "test@example.com"
    }
  });
}