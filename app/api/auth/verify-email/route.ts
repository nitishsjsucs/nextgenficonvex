import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Call the email verification mutation in Convex
    const result = await fetchMutation(
      api.auth.verifyEmail,
      { token }
    );

    if (result.success) {
      // Redirect to KYC page after successful verification
      return NextResponse.redirect(new URL("/kyc?verified=true", req.url));
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Email verification failed" },
      { status: 500 }
    );
  }
}
