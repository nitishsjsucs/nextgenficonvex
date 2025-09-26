// Better Auth + Convex integration
// This file will be replaced by the proper component setup
// For now, we'll use a simple approach to get the build working

import { betterAuth } from "better-auth";
import { convexAdapter } from "@convex-dev/better-auth";

export const auth = betterAuth({
  database: convexAdapter({} as any, {} as any),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: true,
        input: true,
        returned: true,
      },
      dateOfBirth: {
        type: "string",
        required: true,
        input: true,
        returned: true,
      },
      ssn: {
        type: "string",
        required: true,
        input: true,
        returned: true,
      },
      kycVerified: {
        type: "boolean",
        required: false,
        input: true,
        returned: true,
      },
    },
  },
});

// Export the auth functions
// Note: Better Auth functions are accessed differently
// These exports are for backward compatibility
export const signIn = auth.api.signInEmail;
export const signOut = auth.api.signOut;
export const store = auth;
