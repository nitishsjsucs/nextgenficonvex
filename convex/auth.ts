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
  return betterAuth({
    // disable logging when createAuth is called just to generate options.
    // this is not required, but there's a lot of noise in logs without it.
    logger: {
      disabled: optionsOnly,
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

// Export the auth functions for backward compatibility
export const auth = createAuth;
export const signIn = authComponent;
export const signOut = authComponent;
export const store = authComponent;
