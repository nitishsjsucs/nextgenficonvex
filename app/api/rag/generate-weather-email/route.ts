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
  console.log('🤖 [DEBUG] ===== GEMINI WEATHER EMAIL GENERATION START =====');
  
  const { target, context } = request;
  console.log('🤖 [DEBUG] Extracted target and context from request');
  
  const { person, weatherEvent, distance_km, risk_level } = target;
  console.log('🤖 [DEBUG] Destructured target properties');
  
  console.log('🤖 [DEBUG] Target person keys:', Object.keys(person || {}));
  console.log('🤖 [DEBUG] Target person firstName:', person?.firstName);
  console.log('🤖 [DEBUG] Target person lastName:', person?.lastName);
  console.log('🤖 [DEBUG] Target person city:', person?.city);
  console.log('🤖 [DEBUG] Target person state:', person?.state);
  console.log('🤖 [DEBUG] Target person houseValue:', person?.houseValue);
  console.log('🤖 [DEBUG] Target person hasInsurance:', person?.hasInsurance);
  
  console.log('🤖 [DEBUG] WeatherEvent keys:', Object.keys(weatherEvent || {}));
  console.log('🤖 [DEBUG] WeatherEvent id:', weatherEvent?.id);
  console.log('🤖 [DEBUG] WeatherEvent eventType:', weatherEvent?.eventType);
  console.log('🤖 [DEBUG] WeatherEvent severity:', weatherEvent?.severity);
  console.log('🤖 [DEBUG] WeatherEvent location:', weatherEvent?.location);
  console.log('🤖 [DEBUG] WeatherEvent startTime:', weatherEvent?.startTime);
  
  console.log('🤖 [DEBUG] Distance:', distance_km, 'Risk:', risk_level);
  console.log('🤖 [DEBUG] Context:', context);
  
  // Get Gemini API key from environment variables
  console.log('🔑 [DEBUG] Checking for GEMINI_API_KEY...');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('❌ [ERROR] GEMINI_API_KEY not configured');
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  
  console.log('✅ [DEBUG] GEMINI_API_KEY is configured (length:', apiKey.length, ')');

  // Construct the prompt for Gemini
  console.log('📝 [DEBUG] Constructing prompt for Gemini...');
  
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

  console.log('📝 [DEBUG] Prompt constructed successfully');
  console.log('📝 [DEBUG] Prompt length:', prompt.length);
  console.log('📝 [DEBUG] Prompt preview (first 200 chars):', prompt.substring(0, 200) + '...');

  try {
    console.log('🌐 [DEBUG] Making request to Gemini API');
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    console.log('🌐 [DEBUG] API URL:', apiUrl.replace(apiKey, 'HIDDEN_KEY'));
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
      ]
    };
    
    console.log('🌐 [DEBUG] Request body constructed');
    console.log('🌐 [DEBUG] Request body size:', JSON.stringify(requestBody).length);
    console.log('🌐 [DEBUG] Contents count:', requestBody.contents.length);
    console.log('🌐 [DEBUG] Parts count:', requestBody.contents[0]?.parts?.length);
    console.log('🌐 [DEBUG] Text length:', requestBody.contents[0]?.parts?.[0]?.text?.length);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 [DEBUG] Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ [ERROR] Gemini API error response:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    console.log('📡 [DEBUG] Gemini API response received');
    
    // Debug: Log the response structure
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || data.candidates.length === 0) {
      console.log('❌ [ERROR] No candidates in Gemini response');
      console.log('❌ [ERROR] Response structure:', JSON.stringify(data, null, 2));
      throw new Error('No content generated by Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('📝 [DEBUG] Generated text received from Gemini');
    console.log('📝 [DEBUG] Generated text length:', generatedText?.length);
    console.log('📝 [DEBUG] Generated text preview:', generatedText?.substring(0, 200) + '...');
    
    // Parse the JSON response
    console.log('📝 [DEBUG] Attempting to parse JSON response...');
    let emailContent;
    try {
      emailContent = JSON.parse(generatedText);
      console.log('✅ [DEBUG] JSON parsing successful');
      console.log('✅ [DEBUG] Parsed subject:', emailContent.subject?.substring(0, 50) + '...');
      console.log('✅ [DEBUG] Parsed body length:', emailContent.body?.length);
    } catch (parseError) {
      console.log('⚠️ [WARNING] JSON parsing failed, attempting manual extraction');
      console.log('⚠️ [WARNING] Parse error:', parseError);
      
      // If JSON parsing fails, try to extract content manually
      const subjectMatch = generatedText.match(/"subject":\s*"([^"]+)"/);
      const bodyMatch = generatedText.match(/"body":\s*"([^"]+)"/);
      
      console.log('🔍 [DEBUG] Subject match:', subjectMatch);
      console.log('🔍 [DEBUG] Body match:', bodyMatch);
      
      if (subjectMatch && bodyMatch) {
        emailContent = {
          subject: subjectMatch[1],
          body: bodyMatch[1]
        };
        console.log('✅ [DEBUG] Manual extraction successful');
      } else {
        console.log('❌ [ERROR] Manual extraction failed');
        throw new Error('Failed to parse generated email content');
      }
    }

    if (!emailContent.subject || !emailContent.body) {
      console.log('❌ [ERROR] Generated content missing subject or body');
      console.log('❌ [ERROR] Subject exists:', !!emailContent.subject);
      console.log('❌ [ERROR] Body exists:', !!emailContent.body);
      throw new Error('Generated content missing subject or body');
    }

    console.log('✅ [DEBUG] Email content validation passed');
    
    const result = {
      subject: emailContent.subject,
      body: emailContent.body,
      generated_at: new Date().toISOString()
    };
    
    console.log('✅ [DEBUG] Returning successful result');
    return result;

  } catch (error) {
    console.error('❌ [ERROR] Gemini API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 [DEBUG] ===== WEATHER EMAIL GENERATION API CALLED =====');
  
  try {
    console.log('📧 [DEBUG] Weather email generation API called');
    console.log('📧 [DEBUG] Request headers:', Object.fromEntries(request.headers.entries()));
    
    const body: WeatherEmailGenerationRequest = await request.json();
    console.log('📧 [DEBUG] Request body received');
    console.log('📧 [DEBUG] Body keys:', Object.keys(body));
    console.log('📧 [DEBUG] Target exists:', !!body.target);
    console.log('📧 [DEBUG] Context exists:', !!body.context);
    
    if (body.target) {
      console.log('📧 [DEBUG] Target person keys:', Object.keys(body.target.person || {}));
      console.log('📧 [DEBUG] Target weatherEvent keys:', Object.keys(body.target.weatherEvent || {}));
      console.log('📧 [DEBUG] Target person firstName:', body.target.person?.firstName);
      console.log('📧 [DEBUG] Target weatherEvent eventType:', body.target.weatherEvent?.eventType);
      console.log('📧 [DEBUG] Target distance_km:', body.target.distance_km);
      console.log('📧 [DEBUG] Target risk_level:', body.target.risk_level);
    }
    
    if (!body.target) {
      console.log('❌ [ERROR] Missing target information');
      return NextResponse.json(
        { error: 'Target information is required' },
        { status: 400 }
      );
    }

    console.log('📧 [DEBUG] Starting weather email generation with Gemini');
    const result = await generateWeatherEmailWithGemini(body);
    console.log('✅ [DEBUG] Weather email generation successful');
    console.log('✅ [DEBUG] Generated subject:', result.subject?.substring(0, 50) + '...');
    console.log('✅ [DEBUG] Generated body length:', result.body?.length);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ [ERROR] ===== WEATHER EMAIL GENERATION API ERROR =====');
    console.error('❌ [ERROR] Error type:', typeof error);
    console.error('❌ [ERROR] Error constructor:', error?.constructor?.name);
    console.error('❌ [ERROR] Error message:', error instanceof Error ? error.message : 'No message');
    console.error('❌ [ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ [ERROR] Full error object:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate weather email', 
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name || 'Unknown',
        timestamp: new Date().toISOString()
      },
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
