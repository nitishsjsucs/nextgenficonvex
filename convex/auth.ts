import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
    }),
  ],
});

// Query to get the current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    console.log("getCurrentUser called:", { 
      hasIdentity: !!identity, 
      identityEmail: identity?.email,
      identitySubject: identity?.subject,
      identityName: identity?.name,
      fullIdentity: identity,
      timestamp: new Date().toISOString() 
    });
    
    if (!identity) {
      return null;
    }

    // Use getAuthUserId to get the correct user ID
    const userId = await getAuthUserId(ctx);
    console.log("getAuthUserId result:", { userId });
    
    if (!userId) {
      console.log("No userId found, returning basic identity");
      return identity;
    }

    // Get the user document directly by ID
    const user = await ctx.db.get(userId);
    console.log("User lookup by ID:", { 
      userFound: !!user, 
      userEmail: user?.email,
      kycVerified: user?.kycVerified,
      emailVerificationTime: user?.emailVerificationTime 
    });
    
    if (user) {
      // Return enhanced identity with user data
      return {
        ...identity,
        email: user.email,
        name: user.name || identity.name,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        ssn: user.ssn,
        kycVerified: user.kycVerified,
        emailVerificationTime: user.emailVerificationTime,
      };
    }

    console.log("User not found by ID, returning basic identity");
    return identity;
  },
});

// Send verification email action
export const sendVerificationEmail = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("sendVerificationEmail called with:", { email: args.email, timestamp: new Date().toISOString() });
    
    try {
      // Wait a moment to ensure the user session is settled after signup
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Find the user by email
      const user = await ctx.runQuery(api.auth.getCurrentUser);
      
      console.log("sendVerificationEmail - Current user check:", {
        hasUser: !!user,
        userEmail: user?.email,
        requestedEmail: args.email,
        userSubject: user?.subject,
        userIdentity: user?.tokenIdentifier
      });
      
      if (!user || user.email !== args.email) {
        console.log("User not found or email mismatch:", { 
          userFound: !!user, 
          userEmail: user?.email, 
          requestedEmail: args.email 
        });
        return { success: false, message: "User not found or email mismatch during verification" };
      }

      console.log("User lookup result:", { 
        userFound: !!user, 
        userEmail: user?.email, 
        emailVerificationTime: user?.emailVerificationTime 
      });

      // Check if already verified
      if (user.emailVerificationTime) {
        console.log("Email already verified for user:", args.email);
        return { success: false, message: "Email already verified" };
      }

      // Generate verification token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const verificationUrl = `${process.env.SITE_URL || 'https://nextgenficonvex.vercel.app'}/api/auth/verify-email?token=${token}`;
      
      console.log("Generated verification token and URL:", { 
        token: token.substring(0, 8) + "...", 
        verificationUrl,
        siteUrl: process.env.SITE_URL 
      });

      // Find the user's account to get the accountId
      const account = await ctx.runQuery(api.auth.getCurrentUser);
      
      // We need to find the account by looking up authAccounts
      // Since we can't query directly in an action, we'll use the user's subject
      const identity = await ctx.auth.getUserIdentity();
      if (!identity?.subject) {
        console.log("No identity subject found");
        return { success: false, message: "Account not found" };
      }
      
      // Extract userId from subject
      let accountUserId = identity.subject;
      if (identity.subject.includes('|')) {
        accountUserId = identity.subject.split('|')[0];
      }
      
      // For now, we'll use a placeholder accountId since we can't query in actions
      // The verification code will still work
      const accountId = "placeholder-account-id";

      console.log("Account lookup result:", { 
        accountFound: !!account, 
        accountId: accountId,
        providerAccountId: args.email 
      });

      // Store verification code
      const verificationCodeId = await ctx.runMutation(api.auth.storeVerificationCode, {
        code: token,
        email: args.email,
        expirationTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      });

      console.log("Verification code stored:", { 
        verificationCodeId, 
        expirationTime: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() 
      });

      // Send email via API
      try {
        const apiUrl = `${process.env.SITE_URL || 'https://nextgenficonvex.vercel.app'}/api/auth/send-verification-email`;
        console.log("Attempting to send email via API:", { apiUrl });
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: args.email,
            verificationUrl,
          }),
        });

        console.log("Email API response:", { 
          status: response.status, 
          statusText: response.statusText,
          ok: response.ok 
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Email API error response:", errorText);
          throw new Error(`Failed to send verification email: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log("Verification email sent successfully:", result);
        
        return { success: true, message: "Verification email sent successfully" };
      } catch (error) {
        console.error("Failed to send verification email:", error);
        // Fallback: log the URL for development
        console.log("Copy this URL to verify your email:", verificationUrl);
        return { success: true, message: "Verification email logged to console (development mode)" };
      }
    } catch (error) {
      console.error("Send verification email error:", error);
      return { success: false, message: "Failed to send verification email" };
    }
  },
});

// Store verification code mutation
export const storeVerificationCode = mutation({
  args: {
    code: v.string(),
    email: v.string(),
    expirationTime: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("Storing verification code:", { 
      code: args.code.substring(0, 8) + "...", 
      email: args.email,
      expirationTime: new Date(args.expirationTime).toISOString() 
    });

    // Get the current user ID to find the correct account
    const userId = await getAuthUserId(ctx);
    console.log("Current user ID for verification code:", userId);
    
    if (!userId) {
      console.log("No authenticated user found");
      throw new Error("User not authenticated");
    }

    // Find the account by userId (not by email to avoid conflicts)
    const account = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    console.log("Account lookup by userId:", { 
      accountFound: !!account, 
      accountId: account?._id,
      providerAccountId: account?.providerAccountId 
    });

    if (!account) {
      console.log("Account not found for userId:", userId);
      throw new Error("Account not found");
    }

    // Verify the email matches the account
    if (account.providerAccountId !== args.email) {
      console.log("Email mismatch:", { 
        accountEmail: account.providerAccountId, 
        requestedEmail: args.email 
      });
      throw new Error("Email does not match authenticated user");
    }

    // Store verification code
    const verificationCodeId = await ctx.db.insert("authVerificationCodes", {
      code: args.code,
      accountId: account._id,
      provider: "password",
      expirationTime: args.expirationTime,
      emailVerified: args.email, // Store email in emailVerified field
    });

    console.log("Verification code stored successfully:", verificationCodeId);
    return verificationCodeId;
  },
});

// Email verification mutation
export const verifyEmail = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("=== EMAIL VERIFICATION START ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Token provided:", args.token.substring(0, 12) + "...");
    console.log("Token length:", args.token.length);

    try {
      // Find the verification code in the database
      console.log("=== Searching for verification code ===");
      const verification = await ctx.db
        .query("authVerificationCodes")
        .filter((q) => q.eq(q.field("code"), args.token))
        .first();

      console.log("Verification code lookup result:", {
        found: !!verification,
        id: verification?._id,
        codePreview: verification?.code?.substring(0, 12) + "...",
        email: verification?.emailVerified,
        expirationTime: verification?.expirationTime,
        expirationDate: verification?.expirationTime ? new Date(verification.expirationTime).toISOString() : null,
        accountId: verification?.accountId
      });

      if (!verification) {
        console.error("ERROR: Verification code not found in database");
        console.log("Checking all verification codes in database:");
        const allCodes = await ctx.db.query("authVerificationCodes").collect();
        console.log("All verification codes:", allCodes.map(vc => ({
          id: vc._id,
          codePreview: vc.code?.substring(0, 12) + "...",
          email: vc.emailVerified,
          expirationTime: new Date(vc.expirationTime).toISOString(),
          accountId: vc.accountId
        })));
        
        console.log("Requested token vs stored tokens:");
        console.log("Requested:", args.token);
        allCodes.forEach((vc, index) => {
          console.log(`Stored ${index}:`, vc.code);
          console.log(`Match:`, vc.code === args.token);
        });
        
        return { success: false, message: "Invalid verification token - token not found in database" };
      }

      // Check if the token is expired
      console.log("=== Checking token expiration ===");
      const now = Date.now();
      const isExpired = now > verification.expirationTime;
      console.log("Token expiration check:", {
        currentTime: now,
        currentDate: new Date(now).toISOString(),
        expirationTime: verification.expirationTime,
        expirationDate: new Date(verification.expirationTime).toISOString(),
        isExpired: isExpired,
        hoursUntilExpiration: isExpired ? 0 : Math.round((verification.expirationTime - now) / (1000 * 60 * 60))
      });

      if (isExpired) {
        console.error("ERROR: Verification token has expired");
        await ctx.db.delete(verification._id); // Clean up expired token
        console.log("Expired token cleaned up from database");
        return { success: false, message: "Verification token has expired" };
      }

      // Find the user by email (stored in emailVerified field)
      console.log("=== Finding user by email ===");
      console.log("Looking for user with email:", verification.emailVerified);
      
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), verification.emailVerified))
        .first();

      console.log("User lookup result:", {
        found: !!user,
        id: user?._id,
        email: user?.email,
        name: user?.name,
        emailVerificationTime: user?.emailVerificationTime ? new Date(user.emailVerificationTime).toISOString() : null,
        alreadyVerified: !!user?.emailVerificationTime
      });

      if (!user) {
        console.error("ERROR: User not found for email:", verification.emailVerified);
        
        // Check what users exist
        console.log("Checking all users in database:");
        const allUsers = await ctx.db.query("users").collect();
        console.log("Available users:", allUsers.map(u => ({
          id: u._id,
          email: u.email,
          name: u.name,
          emailVerificationTime: u.emailVerificationTime ? new Date(u.emailVerificationTime).toISOString() : null
        })));
        
        return { success: false, message: "User not found for email: " + verification.emailVerified };
      }

      console.log("✅ User found, proceeding with verification");

      // Check if already verified
      if (user.emailVerificationTime) {
        console.log("WARNING: User email is already verified");
        await ctx.db.delete(verification._id); // Clean up used token
        console.log("Used token cleaned up from database");
        return { success: true, message: "Email was already verified" };
      }

      // Update user's email verification status
      console.log("=== Updating user verification status ===");
      await ctx.db.patch(user._id, {
        emailVerificationTime: now,
      });

      console.log("✅ User email verification status updated to:", new Date(now).toISOString());

      // Delete the verification code
      console.log("=== Cleaning up verification code ===");
      await ctx.db.delete(verification._id);
      
      console.log("✅ Verification code deleted");

      console.log("=== EMAIL VERIFICATION SUCCESSFUL ===");
      return { success: true, message: "Email verified successfully" };

    } catch (error) {
      console.error("=== EMAIL VERIFICATION ERROR ===");
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Unknown error type:", typeof error);
        console.error("Error value:", JSON.stringify(error));
      }
      return { success: false, message: "Email verification failed due to error" };
    } finally {
      console.log("=== EMAIL VERIFICATION END ===");
    }
  },
});

// Debug mutation to list verification codes
export const debugVerificationCodes = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      console.log("=== DEBUG: Listing all verification codes ===");
      
      const allCodes = await ctx.db.query("authVerificationCodes").collect();
      const now = Date.now();
      
      const codesWithStatus = allCodes.map(code => ({
        id: code._id,
        code: code.code,
        email: code.emailVerified,
        accountId: code.accountId,
        expirationTime: code.expirationTime,
        expirationDate: new Date(code.expirationTime).toISOString(),
        isExpired: now > code.expirationTime,
        hoursUntilExpiration: code.expirationTime > now ? Math.round((code.expirationTime - now) / (1000 * 60 * 60)) : 0
      }));
      
      console.log("All verification codes:", codesWithStatus);
      
      return {
        success: true,
        count: codesWithStatus.length,
        codes: codesWithStatus
      };
    } catch (error) {
      console.error("Debug verification codes error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
});

// Debug mutation to list all users
export const debugUsers = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      console.log("=== DEBUG: Listing all users ===");
      
      const allUsers = await ctx.db.query("users").collect();
      
      const usersWithStatus = allUsers.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        emailVerificationTime: user.emailVerificationTime ? new Date(user.emailVerificationTime).toISOString() : null,
        kycVerified: user.kycVerified,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth
      }));
      
      console.log("All users:", usersWithStatus);
      
      return {
        success: true,
        count: usersWithStatus.length,
        users: usersWithStatus
      };
    } catch (error) {
      console.error("Debug users error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
});
