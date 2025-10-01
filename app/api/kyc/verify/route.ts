import { NextRequest, NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  try {
    // Get the authentication token
    const token = await convexAuthNextjsToken();
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    // Call the KYC verification mutation in Convex
    const result = await fetchMutation(
      api.kyc.verifyIdentity,
      { fileUrl },
      { token }
    );

    return NextResponse.json({
      success: true,
      message: "KYC verification completed successfully",
      result
    });

  } catch (error) {
    console.error("KYC verification error:", error);
    return NextResponse.json(
      { error: "KYC verification failed" },
      { status: 500 }
    );
  }
}
