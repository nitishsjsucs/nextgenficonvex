
"use client";

import { useEffect, useState, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { useRouter } from 'next/navigation';
import { InsuranceCampaigns } from '@/components/rag/insurance-campaigns';
import EmailEngagementChart from '@/components/email-engagement-chart';

export default function DashboardPage() {
  const { data } = useSession();
  const router = useRouter();
  const [kycVerified, setKycVerified] = useState<boolean | null>(null);
  const kycFetched = useRef(false);
  const loading = typeof data === 'undefined' || kycVerified === null;
  const shouldRedirect = Boolean(data?.user && kycVerified === false);

  // Fetch KYC status from database
  useEffect(() => {
    if (data?.user?.id && !kycFetched.current) {
      kycFetched.current = true;
      fetch('/api/user/kyc-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      })
        .then(res => res.json())
        .then(result => {
          setKycVerified(result.kycVerified || false);
        })
        .catch(() => {
          setKycVerified(false);
        });
    }
  }, [data?.user?.id]);

  useEffect(() => {
    // If user is signed in but KYC is not verified, redirect to KYC page
    if (shouldRedirect) {
      router.replace('/kyc');
    }
  }, [shouldRedirect, router]);

  // Prevent flashing dashboard content before redirect or while loading
  if (loading || shouldRedirect) return null;

  const handleSignOut = async () => {
    router.push('/auth/sign-out');
  };

  return (
    <div>
      <RedirectToSignIn />
      <SignedIn>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">Welcome, {data?.user?.name}</p>
                <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
              </div>
            </div>
          </header>

          <main className="container mx-auto p-4 md:p-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rag">Insurance Campaigns</TabsTrigger>
                <TabsTrigger value="email-stats">Email Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$45,231.89</div>
                      <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src="/avatars/01.png" alt="Avatar" />
                            <AvatarFallback>OM</AvatarFallback>
                          </Avatar>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">Olivia Martin</p>
                            <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                          </div>
                          <div className="ml-auto font-medium">+$1,999.00</div>
                        </div>
                         <div className="flex items-center">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src="/avatars/02.png" alt="Avatar" />
                            <AvatarFallback>JL</AvatarFallback>
                          </Avatar>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">Jackson Lee</p>
                            <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
                          </div>
                          <div className="ml-auto font-medium">+39.00</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Your personal and contact details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm"><span className="font-semibold">Name:</span> {data?.user?.name}</p>
                      <p className="text-sm"><span className="font-semibold">Email:</span> {data?.user?.email}</p>
                      <p className="text-sm">
                        <span className="font-semibold">KYC Status:</span>{' '}
                        {kycVerified ? (
                          <span className="text-green-600 font-semibold">Verified</span>
                        ) : (
                          <span className="text-orange-600 font-semibold">Not verified</span>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="rag" className="mt-6">
                <InsuranceCampaigns />
              </TabsContent>
              
              <TabsContent value="email-stats" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Email Analytics</h2>
                    <p className="text-muted-foreground">
                      Track email engagement metrics including opens, clicks, deliveries, and bounces.
                    </p>
                  </div>
                  <EmailEngagementChart days={30} />
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </SignedIn>
    </div>
  );
}
