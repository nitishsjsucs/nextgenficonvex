"use client"

import { ConvexClientProvider } from "@/lib/convex"
import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()

    return (
        <ConvexClientProvider>
            <AuthUIProvider
          authClient={authClient}
          navigate={router.push}
          replace={router.replace}
          onSessionChange={() => router.refresh()}
          additionalFields={{
            name: {
              label: "Full Name",
              placeholder: "First Last",
              description: "As it appears on your ID",
              required: true,
              type: "string",
              validate: async (value: string) => {
                const v = value.trim();
                if (v.length < 2) return false;
                // Require at least first and last name
                return v.split(/\s+/).length >= 2;
              },
            },
            phoneNumber: {
              label: "Phone Number",
              placeholder: "555-123-4567",
              description: "Your mobile number (10–15 digits)",
              required: true,
              type: "string",
              validate: async (value: string) => {
                const digits = value.replace(/[^0-9]/g, "");
                return digits.length >= 10 && digits.length <= 15;
              },
              instructions: "You can include country code. Formatting characters are allowed.",
            },
          }}
          signUp={{
            fields: ["name", "phoneNumber"]
          }}
          Link={Link}
        >
          {children}
        </AuthUIProvider>
        </ConvexClientProvider>
    )
}