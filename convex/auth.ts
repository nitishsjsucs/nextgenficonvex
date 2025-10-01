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
      // Find the user by email
      const user = await ctx.runQuery(api.auth.getCurrentUser);
      
      if (!user || user.email !== args.email) {
        console.log("User not found or email mismatch:", { 
          userFound: !!user, 
          userEmail: user?.email, 
          requestedEmail: args.email 
        });
        return { success: false, message: "User not found" };
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

    // Find the account by email
    const account = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("providerAccountId"), args.email))
      .first();

    if (!account) {
      console.log("Account not found for email:", args.email);
      throw new Error("Account not found");
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
    try {
      // Find the verification code in the database
      const verification = await ctx.db
        .query("authVerificationCodes")
        .filter((q) => q.eq(q.field("code"), args.token))
        .first();

      if (!verification) {
        return { success: false, message: "Invalid verification token" };
      }

      // Check if the token is expired
      const now = Date.now();
      if (now > verification.expirationTime) {
        return { success: false, message: "Verification token has expired" };
      }

      // Find the user by email (stored in emailVerified field)
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), verification.emailVerified))
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
