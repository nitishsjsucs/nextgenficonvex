import { NextRequest, NextResponse } from 'next/server';

export interface WeatherEmailGenerationRequest {
  target: {
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
  };
  context: string;
}

export interface WeatherEmailGenerationResponse {
  subject: string;
  body: string;
  generated_at: string;
}

async function generateWeatherEmailWithGemini(request: WeatherEmailGenerationRequest): Promise<WeatherEmailGenerationResponse> {
  const { target, context } = request;
  const { person, weatherEvent, distance_km, risk_level } = target;
  
  // Get Gemini API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }

  // Construct the prompt for Gemini
  const prompt = `You are an insurance marketing professional writing a personalized email about weather insurance for Bangladesh residents. Use the following information to create a compelling, professional, and personalized email:

RECIPIENT INFORMATION:
- Name: ${person.firstName} ${person.lastName}
- Location: ${person.city}, ${person.state}
- Home Value: $${(person.houseValue || 0).toLocaleString()}
- Current Insurance Status: ${person.hasInsurance ? 'Has general insurance' : 'No weather insurance coverage'}

WEATHER EVENT INFORMATION:
- Event Type: ${weatherEvent.eventType.charAt(0).toUpperCase() + weatherEvent.eventType.slice(1)}
- Severity: ${weatherEvent.severity.charAt(0).toUpperCase() + weatherEvent.severity.slice(1)}
- Location: ${weatherEvent.location}
- Distance from recipient: ${distance_km} km
- Risk Level: ${risk_level}
- Start Time: ${new Date(weatherEvent.startTime).toLocaleDateString()}
- End Time: ${weatherEvent.endTime ? new Date(weatherEvent.endTime).toLocaleDateString() : 'Ongoing'}
- Description: ${weatherEvent.description || 'Weather event in progress'}
${weatherEvent.rainfall ? `- Expected Rainfall: ${weatherEvent.rainfall}mm` : ''}
${weatherEvent.windSpeed ? `- Wind Speed: ${weatherEvent.windSpeed} km/h` : ''}
${weatherEvent.temperature ? `- Temperature: ${weatherEvent.temperature}°C` : ''}
${weatherEvent.humidity ? `- Humidity: ${weatherEvent.humidity}%` : ''}

CAMPAIGN CONTEXT:
${context}

REQUIREMENTS:
1. Create a compelling subject line (max 60 characters)
2. Write a personalized email body that:
   - Addresses the recipient by first name
   - References the specific weather event and its proximity
   - Mentions their home value appropriately
   - Explains weather insurance importance for Bangladesh residents
   - Highlights specific risks based on weather event type (flooding, storm damage, etc.)
   - Includes a clear call-to-action
   - Is professional but conversational
   - Is culturally appropriate for Bangladesh
   - Is 200-400 words long
   - Includes unsubscribe information

WEATHER EVENT SPECIFIC MESSAGING:
- For rain/flood: Focus on water damage, foundation issues, property flooding
- For storms: Emphasize roof damage, window breakage, structural damage
- For cyclones: Highlight comprehensive property protection, evacuation coverage
- For heatwaves: Discuss HVAC damage, cooling system failures

FORMAT YOUR RESPONSE AS JSON:
{
  "subject": "Your subject line here",
  "body": "Your email body here"
}

Only return the JSON, no other text.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No content generated by Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    let emailContent;
    try {
      emailContent = JSON.parse(generatedText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract content manually
      const subjectMatch = generatedText.match(/"subject":\s*"([^"]+)"/);
      const bodyMatch = generatedText.match(/"body":\s*"([^"]+)"/);
      
      if (subjectMatch && bodyMatch) {
        emailContent = {
          subject: subjectMatch[1],
          body: bodyMatch[1]
        };
      } else {
        throw new Error('Failed to parse generated email content');
      }
    }

    if (!emailContent.subject || !emailContent.body) {
      throw new Error('Generated content missing subject or body');
    }

    return {
      subject: emailContent.subject,
      body: emailContent.body,
      generated_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WeatherEmailGenerationRequest = await request.json();

    if (!body.target || !body.context) {
      return NextResponse.json(
        { error: 'Missing required fields: target and context are required' },
        { status: 400 }
      );
    }

    console.log(`📧 Generating weather email for ${body.target.person.firstName} ${body.target.person.lastName}`);
    console.log(`🌦️ Weather event: ${body.target.weatherEvent.eventType} (${body.target.weatherEvent.severity}) in ${body.target.weatherEvent.location}`);

    const emailResult = await generateWeatherEmailWithGemini(body);

    console.log(`✅ Generated weather email with subject: "${emailResult.subject}"`);

    return NextResponse.json(emailResult);

  } catch (error) {
    console.error('Weather email generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate weather email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to generate weather insurance emails',
    example: {
      target: {
        person: {
          firstName: "Ahmad",
          lastName: "Rahman",
          email: "ahmad.rahman@example.com",
          city: "Dhaka",
          state: "Bangladesh",
          houseValue: 500000,
          hasInsurance: false
        },
        weatherEvent: {
          id: "bd_weather_001",
          eventType: "flood",
          severity: "severe",
          location: "Dhaka, Bangladesh",
          latitude: 23.8103,
          longitude: 90.4125,
          startTime: "2025-09-19T00:00:00Z",
          endTime: "2025-09-21T00:00:00Z",
          description: "Severe flooding expected in Dhaka metropolitan area",
          rainfall: 150.0,
          windSpeed: 25.0,
          temperature: 28.5,
          humidity: 85.0
        },
        distance_km: 5.2,
        risk_level: "high"
      },
      context: "Weather insurance campaign for Bangladesh residents affected by monsoon season"
    }
  });
}
