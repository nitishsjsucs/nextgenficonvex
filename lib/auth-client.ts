import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://nextgenficonvex.vercel.app",
  plugins: [convexClient()],
});

export const { 
    signIn, 
    signUp, 
    signOut, 
    useSession,
    getSession,
    updateUser,
    changePassword,
    resetPassword,
    sendVerificationEmail 
} = authClient;