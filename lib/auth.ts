import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import type { BetterAuthOptions } from "better-auth"
import { prisma } from "./prisma"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const authOptions: BetterAuthOptions = {
  baseURL: process.env.BETTER_AUTH_URL || "https://nextgenfibank.vercel.app",
  trustedOrigins: [
    "http://localhost:3000",
    "https://nextgenfibank.vercel.app"
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
  }, 
  emailVerification: {
    sendVerificationEmail: async(data, request) => {
      const { user, url, token } = data
      
      // Create a simple HTML email template
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Verify your email address</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Hi ${user.name || 'there'},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Please click the button below to verify your email address and complete your account setup.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" 
               style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${url}" style="color: #000;">${url}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Nextgenfi - AI-first banking infrastructure<br>
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `
      
      const msg = {
        to: user.email,
        from: "nextgenfi3@gmail.com", // Make sure this email is verified in SendGrid
        subject: "Verify your email address",
        html: emailHtml,
        custom_args: {
          userId: user.id,
          campaignId: 'email-verification',
          emailType: 'verification',
        },
      }
      
      await sgMail.send(msg)
    },
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    }, 
  }, 
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
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
    },
  },
}

export const auth = betterAuth(authOptions)