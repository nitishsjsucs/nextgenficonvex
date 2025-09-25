import { NextRequest, NextResponse } from 'next/server';

export interface EmailGenerationRequest {
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
  context: string;
}

export interface EmailGenerationResponse {
  subject: string;
  body: string;
  generated_at: string;
}

async function generateEmailWithGemini(request: EmailGenerationRequest): Promise<EmailGenerationResponse> {
  const { target, context } = request;
  const { person, earthquake, distance_km, risk_level } = target;
  
  // Get Gemini API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }

  // Construct the prompt for Gemini
  const prompt = `You are an insurance marketing professional writing a personalized email about earthquake insurance. Use the following information to create a compelling, professional, and personalized email:

RECIPIENT INFORMATION:
- Name: ${person.firstName} ${person.lastName}
- Location: ${person.city}, ${person.state}
- Home Value: $${(person.houseValue || 0).toLocaleString()}
- Current Insurance Status: ${person.hasInsurance ? 'Has insurance' : 'No earthquake insurance'}

EARTHQUAKE INFORMATION:
- Magnitude: ${earthquake.mag || 'Unknown'}
- Location: ${earthquake.place || 'Unknown location'}
- Distance from recipient: ${distance_km} km
- Risk Level: ${risk_level}
- Date: ${earthquake.time ? new Date(earthquake.time).toLocaleDateString() : 'Recent'}

CAMPAIGN CONTEXT:
${context}

REQUIREMENTS:
1. Create a compelling subject line (max 60 characters)
2. Write a personalized email body that:
   - Addresses the recipient by first name
   - References the specific earthquake and its proximity
   - Mentions their home value appropriately
   - Explains earthquake insurance importance
   - Includes a clear call-to-action
   - Is professional but conversational
   - Is 200-400 words long
   - Includes unsubscribe information

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
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response from Gemini
    let emailContent;
    try {
      // Clean the response (remove markdown code blocks if present)
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      emailContent = JSON.parse(cleanedText);
    } catch (parseError) {
      // Fallback: extract subject and body manually if JSON parsing fails
      console.warn('Failed to parse JSON from Gemini, using fallback extraction');
      emailContent = {
        subject: `Earthquake Insurance Information for ${person.city} Residents`,
        body: generatedText
      };
    }

    return {
      subject: emailContent.subject || `Important: Earthquake Insurance for ${person.firstName}`,
      body: emailContent.body || generatedText,
      generated_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailGenerationRequest = await request.json();
    
    if (!body.target) {
      return NextResponse.json(
        { error: 'Target information is required' },
        { status: 400 }
      );
    }

    const result = await generateEmailWithGemini(body);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Email generation API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate email', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to generate emails',
    example: {
      target: {
        person: {
          firstName: "John",
          lastName: "Smith",
          city: "Los Angeles",
          state: "CA",
          houseValue: 750000,
          hasInsurance: false
        },
        earthquake: {
          mag: 5.2,
          place: "10km NW of Los Angeles",
          time: Date.now()
        },
        distance_km: 15,
        risk_level: "high"
      },
      context: "Earthquake insurance campaign context"
    }
  });
}


