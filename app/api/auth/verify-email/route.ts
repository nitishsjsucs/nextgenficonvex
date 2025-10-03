import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET(req: NextRequest) {
  console.log("=== EMAIL VERIFICATION API START ===");
  console.log("API Route called at:", new Date().toISOString());
  
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    
    console.log("URL:", req.url);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    console.log("Token extracted:", token ? token.substring(0, 12) + "..." : "null");
    console.log("Token length:", token?.length || 0);

    if (!token) {
      console.error("ERROR: No token provided in URL");
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    console.log("Calling Convex verifyEmail mutation with token...");
    
    // Call the email verification mutation in Convex
    const result = await fetchMutation(
      api.auth.verifyEmail,
      { token }
    );

    console.log("Convex mutation result:", {
      success: result.success,
      message: result.message
    });

    if (result.success) {
      console.log("✅ Verification successful, redirecting to KYC page");
      // Redirect to KYC page after successful verification
      return NextResponse.redirect(new URL("/kyc?verified=true", req.url));
    } else {
      console.error("❌ Verification failed:", result.message);
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

  } catch (error) {
    console.error("=== EMAIL VERIFICATION API ERROR ===");
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error type:", typeof error);
      console.error("Error value:", JSON.stringify(error));
    }
    return NextResponse.json(
      { error: "Email verification failed" },
      { status: 500 }
    );
  } finally {
    console.log("=== EMAIL VERIFICATION API END ===");
  }
}
