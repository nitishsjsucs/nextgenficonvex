"use client"

import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()

    return (
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
            dateOfBirth: {
              label: "Date of Birth",
              placeholder: "MM/DD/YYYY",
              description: "Enter your birth date in MM/DD/YYYY format (required)",
              required: true,
              type: "string",
              validate: async (value: string) => {
                const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (!m) return false;
                const mm = Number(m[1]);
                const dd = Number(m[2]);
                const yyyy = Number(m[3]);
                if (yyyy < 1900 || yyyy > 3000) return false;
                if (mm < 1 || mm > 12) return false;
                if (dd < 1 || dd > 31) return false;
                const d = new Date(Date.UTC(yyyy, mm - 1, dd));
                if (d.getUTCFullYear() !== yyyy || d.getUTCMonth() + 1 !== mm || d.getUTCDate() !== dd) return false;
                // Age >= 13
                const today = new Date();
                const thirteen = new Date(Date.UTC(today.getUTCFullYear() - 13, today.getUTCMonth(), today.getUTCDate()));
                return d <= thirteen;
              },
              instructions: "Format: 12/31/1990. Must be 13+ years old.",
            },
            ssn: {
              label: "Social Security Number",
              placeholder: "123-45-6789",
              description: "Used only for identity verification (optional)",
              required: true,
              type: "string",
              validate: async (value: string) => {
                if (!value) return true; // optional
                const digits = value.replace(/[^0-9]/g, "");
                return /^\d{9}$/.test(digits);
              },
              instructions: "Provide 9 digits. Dashes are optional.",
            },
          }}
          signUp={{
            fields: ["name", "phoneNumber", "dateOfBirth", "ssn"]
          }}
          Link={Link}
        >
          {children}
        </AuthUIProvider>
    )
}