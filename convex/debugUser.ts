import { query } from "./_generated/server";
import { v } from "convex/values";

// Debug function to check if a user exists in the database
export const checkUserExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    console.log("[Debug:checkUserExists] Checking if user exists", {
      email: args.email,
      timestamp: new Date().toISOString(),
    });

    try {
      // Check in the user table
      const user = await ctx.db
        .query("user")
        .withIndex("email", (q) => q.eq("email", args.email))
        .first();

      // Check in the account table for any accounts with this email
      const accounts = await ctx.db
        .query("account")
        .collect();

      // Check in the session table for any active sessions
      const sessions = await ctx.db
        .query("session")
        .collect();

      // Check in the verification table
      const verifications = await ctx.db
        .query("verification")
        .withIndex("identifier", (q) => q.eq("identifier", args.email))
        .collect();

      const result = {
        timestamp: new Date().toISOString(),
        email: args.email,
        userExists: !!user,
        user: user,
        totalAccounts: accounts.length,
        totalSessions: sessions.length,
        totalVerifications: verifications.length,
        verifications: verifications,
        allUsers: await ctx.db.query("user").collect(),
        allAccounts: accounts,
        allSessions: sessions,
      };

      console.log("[Debug:checkUserExists] Check result:", result);
      return result;
    } catch (error) {
      console.error("[Debug:checkUserExists] Error checking user:", error);
      return {
        timestamp: new Date().toISOString(),
        email: args.email,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  },
});

// Debug function to get all users
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    console.log("[Debug:getAllUsers] Getting all users", {
      timestamp: new Date().toISOString(),
    });

    try {
      const users = await ctx.db.query("user").collect();
      const accounts = await ctx.db.query("account").collect();
      const sessions = await ctx.db.query("session").collect();
      const verifications = await ctx.db.query("verification").collect();

      const result = {
        timestamp: new Date().toISOString(),
        totalUsers: users.length,
        totalAccounts: accounts.length,
        totalSessions: sessions.length,
        totalVerifications: verifications.length,
        users: users,
        accounts: accounts,
        sessions: sessions,
        verifications: verifications,
      };

      console.log("[Debug:getAllUsers] All data result:", result);
      return result;
    } catch (error) {
      console.error("[Debug:getAllUsers] Error getting all users:", error);
      return {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  },
});

// Debug function to clear all auth data (use with caution!)
export const clearAllAuthData = query({
  args: {},
  handler: async (ctx) => {
    console.log("[Debug:clearAllAuthData] Clearing all auth data", {
      timestamp: new Date().toISOString(),
    });

    try {
      // Get all records first
      const users = await ctx.db.query("user").collect();
      const accounts = await ctx.db.query("account").collect();
      const sessions = await ctx.db.query("session").collect();
      const verifications = await ctx.db.query("verification").collect();

      const result = {
        timestamp: new Date().toISOString(),
        beforeClear: {
          totalUsers: users.length,
          totalAccounts: accounts.length,
          totalSessions: sessions.length,
          totalVerifications: verifications.length,
        },
        message: "This is a read-only function. To actually clear data, you need to implement a mutation.",
        note: "Create a mutation version of this function to actually delete the records.",
      };

      console.log("[Debug:clearAllAuthData] Clear result:", result);
      return result;
    } catch (error) {
      console.error("[Debug:clearAllAuthData] Error clearing auth data:", error);
      return {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  },
});
