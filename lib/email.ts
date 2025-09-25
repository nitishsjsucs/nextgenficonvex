import { createHash, randomBytes } from "crypto"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Simple token generation for email confirmation
export function generateConfirmationToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret"
  const timestamp = Date.now().toString()
  const random = randomBytes(16).toString("hex")
  const payload = `${email}:${timestamp}:${random}`

  return (
    createHash("sha256")
      .update(payload + secret)
      .digest("hex") +
    "." +
    Buffer.from(payload).toString("base64url")
  )
}

export function verifyConfirmationToken(token: string): { email: string; valid: boolean } {
  try {
    const [hash, payload] = token.split(".")
    const decodedPayload = Buffer.from(payload, "base64url").toString()
    const [email, timestamp, random] = decodedPayload.split(":")

    // Check if token is not older than 24 hours
    const tokenAge = Date.now() - Number.parseInt(timestamp)
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return { email: "", valid: false }
    }

    // Verify hash
    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret"
    const expectedHash = createHash("sha256")
      .update(decodedPayload + secret)
      .digest("hex")

    return { email, valid: hash === expectedHash }
  } catch {
    return { email: "", valid: false }
  }
}

export async function sendConfirmationEmail(email: string, token: string): Promise<boolean> {
  if (process.env.SENDGRID_API_KEY) {
    try {
      const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://nextgenfi.ai"}/api/waitlist/confirm?token=${token}`

      const msg = {
        to: email,
        from: "nextgenfi3@gmail.com", // Make sure this email is verified in SendGrid
        subject: "Confirm your Nextgenfi waitlist signup",
        custom_args: {
          userId: email,
          campaignId: 'waitlist-confirmation',
          emailType: 'waitlist',
        },
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Welcome to Nextgenfi</h1>
            
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Thank you for joining our waitlist! Please confirm your email address to complete your signup.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                Confirm Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${confirmUrl}" style="color: #000;">${confirmUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This link will expire in 24 hours.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Nextgenfi - AI-first banking infrastructure<br>
              If you didn't sign up for our waitlist, you can safely ignore this email.
            </p>
          </div>
        `,
      }

      const response = await sgMail.send(msg)
      console.log("Email sent successfully:", response[0].statusCode)
      return true
    } catch (error) {
      console.error("SendGrid error:", error)
      return false
    }
  } else {
    // Development: log to console
    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/waitlist/confirm?token=${token}`
    console.log(`Confirmation email for ${email}: ${confirmUrl}`)
    return true
  }
}
