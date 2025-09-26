import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("[Debug:Signup] Signup debug request received");
    
    const body = await req.json();
    console.log("[Debug:Signup] Request body:", body);
    
    // Log all request details
    const requestInfo = {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      userAgent: req.headers.get('user-agent'),
      origin: req.headers.get('origin'),
      referer: req.headers.get('referer'),
      contentType: req.headers.get('content-type'),
      body,
    };
    
    console.log("[Debug:Signup] Full request info:", requestInfo);
    
    // Validate the request body
    const validation = {
      hasEmail: !!body.email,
      hasPassword: !!body.password,
      hasName: !!body.name,
      emailValid: body.email && typeof body.email === 'string' && body.email.includes('@'),
      passwordValid: body.password && typeof body.password === 'string' && body.password.length >= 8,
      nameValid: body.name && typeof body.name === 'string' && body.name.length > 0,
    };
    
    console.log("[Debug:Signup] Validation results:", validation);
    
    // Try to forward the request to the actual Better Auth endpoint
    try {
      const authResponse = await fetch(`${process.env.SITE_URL || 'https://nextgenficonvex.vercel.app'}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(req.headers.entries()),
        },
        body: JSON.stringify(body),
      });
      
      const authResult = await authResponse.text();
      console.log("[Debug:Signup] Auth response status:", authResponse.status);
      console.log("[Debug:Signup] Auth response body:", authResult);
      
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        requestInfo,
        validation,
        authResponse: {
          status: authResponse.status,
          statusText: authResponse.statusText,
          headers: Object.fromEntries(authResponse.headers.entries()),
          body: authResult,
        },
        environment: {
          siteUrl: process.env.SITE_URL,
          hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
        }
      });
    } catch (authError) {
      console.error("[Debug:Signup] Error calling auth endpoint:", authError);
      return NextResponse.json({
        success: false,
        timestamp: new Date().toISOString(),
        requestInfo,
        validation,
        authError: {
          message: authError instanceof Error ? authError.message : String(authError),
          stack: authError instanceof Error ? authError.stack : undefined,
        },
        environment: {
          siteUrl: process.env.SITE_URL,
          hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[Debug:Signup] Error in signup debug:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
