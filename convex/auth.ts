import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuth } from "better-auth";

const siteUrl = process.env.SITE_URL || "https://nextgenficonvex.vercel.app";

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false },
) => {
  console.log("[BetterAuth:createAuth] Starting auth configuration", {
    optionsOnly,
    siteUrl,
    hasSecret: !!process.env.BETTER_AUTH_SECRET,
    secretLength: process.env.BETTER_AUTH_SECRET?.length || 0,
    trustedOrigins: [
      process.env.SITE_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter(Boolean),
  });

  // Test the adapter
  const adapter = authComponent.adapter(ctx);
  console.log("[BetterAuth:createAuth] Adapter created:", {
    adapterType: typeof adapter,
    adapterKeys: Object.keys(adapter),
  });

  // Test if the adapter function works
  try {
    const testAdapter = adapter({});
    console.log("[BetterAuth:createAuth] Adapter function test:", {
      testAdapterType: typeof testAdapter,
      testAdapterKeys: Object.keys(testAdapter),
    });
  } catch (error) {
    console.error("[BetterAuth:createAuth] Adapter function test failed:", error);
  }

  return betterAuth({
    // Enable extensive logging for debugging
    logger: {
      disabled: false, // Enable logging for debugging
      level: "debug",
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    // Allow both local dev and production origins
    trustedOrigins: [
      process.env.SITE_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter(Boolean) as string[],
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    // Configure email/password with verification
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Disable email verification for now to test KYC flow
      minPasswordLength: 8,
      maxPasswordLength: 128,
      sendResetPassword: async ({ user, url, token }, request) => {
        console.log("[BetterAuth:sendResetPassword] Sending reset password email", {
          userEmail: user.email,
          userName: user.name,
          url,
          token,
        });
        // For now, just log - you can implement actual email sending later
        console.log("[BetterAuth:sendResetPassword] Reset password URL:", url);
      },
      onPasswordReset: async ({ user }, request) => {
        console.log("[BetterAuth:onPasswordReset] Password reset for", user?.email);
      },
      onSignUp: async (user: any, request: any) => {
        console.log("[BetterAuth:onSignUp] User signup attempt", {
          userId: user.id,
          email: user.email,
          name: user.name,
          userKeys: Object.keys(user),
          requestHeaders: request?.headers ? Object.fromEntries(request.headers.entries()) : null,
          requestUrl: request?.url,
          requestMethod: request?.method,
        });
        
        // Let Better Auth handle user creation automatically
        console.log("[BetterAuth:onSignUp] User signup completed, Better Auth will handle database creation");
        
        return user;
      },
      onSignIn: async (user: any, request: any) => {
        console.log("[BetterAuth:onSignIn] User signin attempt", {
          userId: user.id,
          email: user.email,
          name: user.name,
          userKeys: Object.keys(user),
          requestHeaders: request?.headers ? Object.fromEntries(request.headers.entries()) : null,
          requestUrl: request?.url,
          requestMethod: request?.method,
        });
        return user;
      },
    },
    // Email verification configuration
    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }, request) => {
        console.log("[BetterAuth:sendVerificationEmail] Sending verification email", {
          userEmail: user.email,
          userName: user.name,
          url,
          token,
        });
        // For now, just log the verification URL - you can implement actual email sending later
        console.log("[BetterAuth:sendVerificationEmail] Verification URL:", url);
        console.log("[BetterAuth:sendVerificationEmail] User can verify by visiting:", url);
      },
      autoSignInAfterVerification: true,
      sendOnSignUp: false, // Disable email verification for now
    },
    // Disable social providers for now since they're not configured
    // socialProviders: {
    //   google: {
    //     clientId: process.env.GOOGLE_CLIENT_ID || "",
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    //   },
    // },
    user: {
      deleteUser: {
        enabled: true
      },
      additionalFields: {
        phoneNumber: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        dateOfBirth: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        ssn: {
          type: "string",
          required: false,
          input: true,
          returned: true,
        },
        kycVerified: {
          type: "boolean",
          required: false,
          input: false,
          returned: true,
        },
      },
      onCreate: async (user: any, request: any) => {
        console.log("[BetterAuth:user.onCreate] User creation", {
          userId: user.id,
          email: user.email,
          name: user.name,
          userKeys: Object.keys(user),
          userValues: user,
          requestHeaders: request?.headers ? Object.fromEntries(request.headers.entries()) : null,
          requestUrl: request?.url,
          requestMethod: request?.method,
        });
        
        // The Better Auth Convex adapter should handle database insertion automatically
        console.log("[BetterAuth:user.onCreate] User creation completed, adapter should handle database insertion");
        
        return user;
      },
      onUpdate: async (oldUser: any, newUser: any, request: any) => {
        console.log("[BetterAuth:user.onUpdate] User update", {
          oldUserId: oldUser.id,
          newUserId: newUser.id,
          oldEmail: oldUser.email,
          newEmail: newUser.email,
          oldUserKeys: Object.keys(oldUser),
          newUserKeys: Object.keys(newUser),
          requestHeaders: request?.headers ? Object.fromEntries(request.headers.entries()) : null,
          requestUrl: request?.url,
          requestMethod: request?.method,
        });
        return newUser;
      },
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex(),
    ],
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});

// Debug function to check auth configuration
export const debugAuthConfig = query({
  args: {},
  handler: async (ctx) => {
    console.log("[BetterAuth:debugAuthConfig] Checking auth configuration");
    
    try {
      const authUser = await authComponent.getAuthUser(ctx);
      const identity = await ctx.auth.getUserIdentity();
      
      const config = {
        siteUrl,
        hasSecret: !!process.env.BETTER_AUTH_SECRET,
        secretLength: process.env.BETTER_AUTH_SECRET?.length || 0,
        trustedOrigins: [
          process.env.SITE_URL,
          "http://localhost:3000",
          "http://127.0.0.1:3000",
        ].filter(Boolean),
        hasAuthUser: !!authUser,
        hasIdentity: !!identity,
        authUserKeys: authUser ? Object.keys(authUser) : null,
        identityKeys: identity ? Object.keys(identity) : null,
        authUserEmail: authUser?.email,
        identitySubject: identity?.subject,
        timestamp: new Date().toISOString(),
      };
      
      console.log("[BetterAuth:debugAuthConfig] Configuration check result:", config);
      return config;
    } catch (error) {
      console.error("[BetterAuth:debugAuthConfig] Error checking configuration:", error);
      return {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      };
    }
  },
});

// Mutation to update user KYC status
export const updateUserKycStatus = mutation({
  args: { 
    userId: v.string(),
    kycVerified: v.boolean(),
    additionalData: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    console.log("[BetterAuth:updateUserKycStatus] Updating KYC status", {
      userId: args.userId,
      kycVerified: args.kycVerified,
      additionalData: args.additionalData,
    });

    try {
      // Find the user by ID
      const user = await ctx.db
        .query("user")
        .filter((q) => q.eq(q.field("email"), args.userId))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Update the user's KYC status
      await ctx.db.patch(user._id, {
        kycVerified: args.kycVerified,
        updatedAt: Date.now(),
        ...args.additionalData,
      });

      console.log("[BetterAuth:updateUserKycStatus] KYC status updated successfully");
      return { success: true, userId: args.userId, kycVerified: args.kycVerified };
    } catch (error) {
      console.error("[BetterAuth:updateUserKycStatus] Error updating KYC status:", error);
      throw error;
    }
  },
});

// Export the auth functions for backward compatibility
export const auth = createAuth;
export const signIn = authComponent;
export const signOut = authComponent;
export const store = authComponent;