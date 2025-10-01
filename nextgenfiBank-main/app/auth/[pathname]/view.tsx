"use client"

import { AuthCard } from "@daveyplate/better-auth-ui"

export function AuthView({ pathname }: { pathname: string }) {
    return (
        <main className="min-h-screen flex items-center justify-center p-4 md:p-6">
            <div className="w-full max-w-md">
                <AuthCard pathname={pathname} redirectTo="/kyc" />
            </div>
        </main>
    )
}