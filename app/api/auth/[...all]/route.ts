import { nextJsHandler } from "@convex-dev/better-auth/nextjs";
import { NextRequest, NextResponse } from "next/server";

// Create a custom handler with extensive logging
const handler = nextJsHandler();

// Custom GET handler with logging
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  
  console.log("[Auth:GET] Request received", {
    timestamp: new Date().toISOString(),
    pathname,
    searchParams: Object.fromEntries(searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
    userAgent: request.headers.get('user-agent'),
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
  });

  try {
    const response = await handler.GET(request);
    
    console.log("[Auth:GET] Response sent", {
      timestamp: new Date().toISOString(),
      pathname,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
    return response;
  } catch (error) {
    console.error("[Auth:GET] Error occurred", {
      timestamp: new Date().toISOString(),
      pathname,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Custom POST handler with extensive logging
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  
  console.log("[Auth:POST] Request received", {
    timestamp: new Date().toISOString(),
    pathname,
    searchParams: Object.fromEntries(searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
    userAgent: request.headers.get('user-agent'),
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
    contentType: request.headers.get('content-type'),
  });

  try {
    // Try to read the request body for logging
    let body = null;
    try {
      const bodyText = await request.text();
      body = bodyText;
      
      // Try to parse as JSON for better logging
      try {
        const parsedBody = JSON.parse(bodyText);
        console.log("[Auth:POST] Request body (parsed)", {
          timestamp: new Date().toISOString(),
          pathname,
          body: parsedBody,
          bodyKeys: Object.keys(parsedBody),
        });
      } catch (parseError) {
        console.log("[Auth:POST] Request body (raw)", {
          timestamp: new Date().toISOString(),
          pathname,
          body: bodyText,
          bodyLength: bodyText.length,
        });
      }
    } catch (bodyError) {
      console.log("[Auth:POST] Could not read request body", {
        timestamp: new Date().toISOString(),
        pathname,
        bodyError: bodyError instanceof Error ? bodyError.message : String(bodyError),
      });
    }

    // Create a new request with the body for the handler
    const newRequest = new NextRequest(request.url, {
      method: request.method,
      headers: request.headers,
      body: body,
    });

    const response = await handler.POST(newRequest);
    
    // Try to read the response body for logging
    let responseBody = null;
    try {
      const responseText = await response.text();
      responseBody = responseText;
      
      // Try to parse as JSON for better logging
      try {
        const parsedResponse = JSON.parse(responseText);
        console.log("[Auth:POST] Response body (parsed)", {
          timestamp: new Date().toISOString(),
          pathname,
          status: response.status,
          statusText: response.statusText,
          response: parsedResponse,
        });
      } catch (parseError) {
        console.log("[Auth:POST] Response body (raw)", {
          timestamp: new Date().toISOString(),
          pathname,
          status: response.status,
          statusText: response.statusText,
          response: responseText,
          responseLength: responseText.length,
        });
      }
    } catch (responseBodyError) {
      console.log("[Auth:POST] Could not read response body", {
        timestamp: new Date().toISOString(),
        pathname,
        status: response.status,
        statusText: response.statusText,
        responseBodyError: responseBodyError instanceof Error ? responseBodyError.message : String(responseBodyError),
      });
    }
    
    console.log("[Auth:POST] Response sent", {
      timestamp: new Date().toISOString(),
      pathname,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
    // Create a new response with the body for the client
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error("[Auth:POST] Error occurred", {
      timestamp: new Date().toISOString(),
      pathname,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        pathname,
      },
      { status: 500 }
    );
  }
}