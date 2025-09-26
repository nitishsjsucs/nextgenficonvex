import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
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
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
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
          input: false,
          returned: true,
        },
        dateOfBirth: {
          type: "string",
          required: false,
          input: false,
          returned: true,
        },
        ssn: {
          type: "string",
          required: false,
          input: false,
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

// Export the auth functions for backward compatibility
export const auth = createAuth;
export const signIn = authComponent;
export const signOut = authComponent;
export const store = authComponent;
