import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Configure password provider with custom fields
      additionalFields: {
        phoneNumber: {
          type: "string",
          required: false,
        },
        kycVerified: {
          type: "boolean",
          required: false,
        },
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
