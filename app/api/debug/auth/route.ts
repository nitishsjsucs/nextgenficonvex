import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[Debug:Auth] Debug request received", {
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries()),
  });

  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        SITE_URL: process.env.SITE_URL,
        CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "***SET***" : "NOT_SET",
        BETTER_AUTH_SECRET_LENGTH: process.env.BETTER_AUTH_SECRET?.length || 0,
      },
      request: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      },
      betterAuth: {
        hasSecret: !!process.env.BETTER_AUTH_SECRET,
        secretLength: process.env.BETTER_AUTH_SECRET?.length || 0,
        trustedOrigins: [
          process.env.SITE_URL,
          "http://localhost:3000",
          "http://127.0.0.1:3000",
        ].filter(Boolean),
      },
    };

    console.log("[Debug:Auth] Debug info generated", debugInfo);

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error("[Debug:Auth] Error generating debug info", {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to generate debug info",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("[Debug:Auth] Debug POST request received", {
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries()),
  });

  try {
    // Try to read the request body
    let body = null;
    try {
      const bodyText = await request.text();
      body = bodyText;
      
      console.log("[Debug:Auth] Request body received", {
        timestamp: new Date().toISOString(),
        body: bodyText,
        bodyLength: bodyText.length,
      });
    } catch (bodyError) {
      console.log("[Debug:Auth] Could not read request body", {
        timestamp: new Date().toISOString(),
        bodyError: bodyError instanceof Error ? bodyError.message : String(bodyError),
      });
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: "POST",
      body: body,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        SITE_URL: process.env.SITE_URL,
        CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "***SET***" : "NOT_SET",
        BETTER_AUTH_SECRET_LENGTH: process.env.BETTER_AUTH_SECRET?.length || 0,
      },
      request: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      },
    };

    console.log("[Debug:Auth] Debug POST info generated", debugInfo);

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error("[Debug:Auth] Error generating debug POST info", {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to generate debug POST info",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}