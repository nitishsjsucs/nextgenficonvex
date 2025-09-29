import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[Debug:CheckUser] Check user request received", {
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries()),
  });

  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // This would need to be implemented with your Convex client
    // For now, just return the email being checked
    const debugInfo = {
      timestamp: new Date().toISOString(),
      email: email,
      message: "This endpoint would check if user exists in Convex database",
      note: "You need to implement the actual database query here using your Convex client",
    };

    console.log("[Debug:CheckUser] Debug info generated", debugInfo);

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error("[Debug:CheckUser] Error generating debug info", {
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
  console.log("[Debug:CheckUser] Check user POST request received", {
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries()),
  });

  try {
    // Try to read the request body
    let body = null;
    try {
      const bodyText = await request.text();
      body = bodyText;
      
      console.log("[Debug:CheckUser] Request body received", {
        timestamp: new Date().toISOString(),
        body: bodyText,
        bodyLength: bodyText.length,
      });
    } catch (bodyError) {
      console.log("[Debug:CheckUser] Could not read request body", {
        timestamp: new Date().toISOString(),
        bodyError: bodyError instanceof Error ? bodyError.message : String(bodyError),
      });
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: "POST",
      body: body,
      message: "This endpoint would check if user exists in Convex database",
      note: "You need to implement the actual database query here using your Convex client",
    };

    console.log("[Debug:CheckUser] Debug POST info generated", debugInfo);

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error("[Debug:CheckUser] Error generating debug POST info", {
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
