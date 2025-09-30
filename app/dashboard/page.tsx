"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AuthButton } from "@/components/auth/AuthButton";

export default function DashboardPage() {
  const { isAuthenticated } = useAuthActions();
  const user = useQuery(api.auth.getCurrentUser);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please{" "}
            <a
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in
            </a>{" "}
            to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <AuthButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Welcome to your dashboard!
            </h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                User Information
              </h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {user?.name || "Not provided"}</p>
                <p><strong>Email:</strong> {user?.email || "Not provided"}</p>
                <p><strong>Phone:</strong> {user?.phoneNumber || "Not provided"}</p>
                <p><strong>KYC Verified:</strong> {user?.kycVerified ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}