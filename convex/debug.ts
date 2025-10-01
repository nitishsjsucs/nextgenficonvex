import { query } from "./_generated/server";

// Simple query to check if user and account tables exist and have data
export const checkTables = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Check if user table exists and has data
      const users = await ctx.db.query("users").collect();
      const accounts = await ctx.db.query("authAccounts").collect();
      const sessions = await ctx.db.query("authSessions").collect();
      const verifications = await ctx.db.query("authVerificationCodes").collect();

      return {
        success: true,
        tables: {
          users: {
            count: users.length,
            sample: users.slice(0, 2), // First 2 users
          },
          authAccounts: {
            count: accounts.length,
            sample: accounts.slice(0, 2), // First 2 accounts
          },
          authSessions: {
            count: sessions.length,
            sample: sessions.slice(0, 2), // First 2 sessions
          },
          authVerificationCodes: {
            count: verifications.length,
            sample: verifications.slice(0, 2), // First 2 verifications
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  },
});
