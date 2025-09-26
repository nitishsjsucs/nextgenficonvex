import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  try {
    console.log("[Debug:GET] Auth debug request received");
    
    // Get auth configuration from Convex
    const authConfig = await convex.query(api.auth.debugAuthConfig, {});
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      authConfig,
      requestInfo: {
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        userAgent: req.headers.get('user-agent'),
        origin: req.headers.get('origin'),
        referer: req.headers.get('referer'),
      },
      environment: {
        hasConvexUrl: !!process.env.NEXT_PUBLIC_CONVEX_URL,
        convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
        hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
        hasSiteUrl: !!process.env.SITE_URL,
        siteUrl: process.env.SITE_URL,
      }
    });
  } catch (error) {
    console.error("[Debug:GET] Error in auth debug:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[Debug:POST] Auth debug POST request received");
    
    const body = await req.json();
    console.log("[Debug:POST] Request body:", body);
    
    // Get auth configuration from Convex
    const authConfig = await convex.query(api.auth.debugAuthConfig, {});
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      authConfig,
      requestInfo: {
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        userAgent: req.headers.get('user-agent'),
        origin: req.headers.get('origin'),
        referer: req.headers.get('referer'),
        body,
      },
      environment: {
        hasConvexUrl: !!process.env.NEXT_PUBLIC_CONVEX_URL,
        convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
        hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
        hasSiteUrl: !!process.env.SITE_URL,
        siteUrl: process.env.SITE_URL,
      }
    });
  } catch (error) {
    console.error("[Debug:POST] Error in auth debug:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
