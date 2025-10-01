import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Configure password provider with custom profile fields
      profile(params, ctx) {
        const profile: any = {
          email: params.email as string,
          name: params.name as string,
        };
        
        // Add optional fields only if they exist
        if (params.phoneNumber) {
          profile.phoneNumber = params.phoneNumber as string;
        }
        if (params.dateOfBirth) {
          profile.dateOfBirth = params.dateOfBirth as string;
        }
        if (params.ssn) {
          profile.ssn = params.ssn as string;
        }
        
        return profile;
      },
      // Enable email verification
      sendVerificationEmail: async ({ email, token, url }) => {
        console.log("Sending verification email to:", email);
        console.log("Verification URL:", url);
        
        try {
          // Use the existing SendGrid implementation
          const response = await fetch(`${process.env.SITE_URL || 'https://nextgenficonvex.vercel.app'}/api/auth/send-verification-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              verificationUrl: url,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to send verification email: ${response.statusText}`);
          }

          const result = await response.json();
          console.log("Verification email sent successfully:", result);
        } catch (error) {
          console.error("Failed to send verification email:", error);
          // Fallback: log the URL for development
          console.log("Copy this URL to verify your email:", url);
        }
      },
    }),
  ],
});

// Query to get the current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});

// Email verification mutation
export const verifyEmail = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Find the verification code in the database
      const verification = await ctx.db
        .query("authVerificationCodes")
        .filter((q) => q.eq(q.field("code"), args.token))
        .first();

      if (!verification) {
        return { success: false, message: "Invalid verification token" };
      }

      // Check if the token is expired (24 hours)
      const now = Date.now();
      const tokenAge = now - verification.createdAt;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (tokenAge > maxAge) {
        return { success: false, message: "Verification token has expired" };
      }

      // Find the user by email
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), verification.email))
        .first();

      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Update user's email verification status
      await ctx.db.patch(user._id, {
        emailVerificationTime: now,
      });

      // Delete the verification code
      await ctx.db.delete(verification._id);

      return { success: true, message: "Email verified successfully" };
    } catch (error) {
      console.error("Email verification error:", error);
      return { success: false, message: "Email verification failed" };
    }
  },
});
