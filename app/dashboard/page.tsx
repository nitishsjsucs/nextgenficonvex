"use client";

import { useQuery } from "convex/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AuthButton } from "@/components/auth/AuthButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Globe, 
  CloudRain, 
  Mail, 
  TrendingUp, 
  Users, 
  Shield, 
  Activity,
  Target,
  MapPin,
  Send
} from "lucide-react";

// Import all your existing components
import { BankingPlatformDiagram } from "@/components/banking-platform-diagram";
import EmailEngagementChart from "@/components/email-engagement-chart";
import { InsuranceCampaigns } from "@/components/rag/insurance-campaigns";
import { EarthquakeMap } from "@/components/rag/earthquake-map";
import { WeatherMap } from "@/components/rag/weather-map";

export default function DashboardPage() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </AuthLoading>
      
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">Please sign in to access the dashboard.</p>
            <a
              href="/auth/login"
              className="text-primary hover:underline"
            >
              Sign In
            </a>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <DashboardContent />
      </Authenticated>
    </>
  );
}

function DashboardContent() {
  const user = useQuery(api.auth.getCurrentUser);
  const router = useRouter();
  
  // Real data state
  const [emailStats, setEmailStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user needs KYC verification
  useEffect(() => {
    if (user && !user.kycVerified) {
      router.replace('/kyc');
    }
  }, [user, router]);

  // Fetch real data
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        
        // Fetch email stats
        const emailResponse = await fetch('/api/email/stats?days=7');
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          setEmailStats(emailData);
        }
        
        // Fetch campaigns
        const campaignsResponse = await fetch('/api/rag/campaigns?limit=10');
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json();
          setCampaigns(campaignsData.campaigns || []);
        }
        
      } catch (error) {
        console.error('Error fetching real data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  // Show loading while checking KYC status
  if (user && !user.kycVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to KYC verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">NextGenFI Dashboard</h1>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || "User"}! 👋
            </h2>
            <p className="text-gray-600">
              Your comprehensive banking platform dashboard with AI-powered insights and campaign management.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : campaigns.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : `${campaigns.length} total campaigns`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : emailStats?.eventTypes?.delivered || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : `${emailStats?.eventTypes?.processed || 0} processed`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : emailStats?.eventTypes?.delivered > 0 
                    ? ((emailStats?.eventTypes?.open / emailStats?.eventTypes?.delivered) * 100).toFixed(1) + "%"
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : `${emailStats?.eventTypes?.open || 0} opens`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="platform" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Platform</span>
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Campaigns</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="maps" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Maps</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Platform Overview</span>
                    </CardTitle>
                    <CardDescription>
                      Your comprehensive banking platform capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">AI Analytics</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">RAG Assistant</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Email Campaigns</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Compliance Suite</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <CardDescription>
                      Latest platform activities and events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Earthquake campaign completed - 150 emails sent</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Weather insurance targets identified - 89 prospects</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">RAG system updated with new demographic data</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Email engagement rate improved by 12%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Email Performance Overview</CardTitle>
                  <CardDescription>
                    Recent email campaign performance and engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailEngagementChart days={7} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Platform Tab */}
            <TabsContent value="platform" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Banking Platform Architecture</span>
                  </CardTitle>
                  <CardDescription>
                    Visual representation of your integrated banking platform capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BankingPlatformDiagram />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-6">
              <InsuranceCampaigns />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Engagement Analytics</CardTitle>
                    <CardDescription>
                      Comprehensive email performance metrics and trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmailEngagementChart days={30} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Performance</CardTitle>
                    <CardDescription>
                      Recent campaign performance and ROI metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">Loading campaign data...</p>
                        </div>
                      ) : emailStats?.campaigns && emailStats.campaigns.length > 0 ? (
                        emailStats.campaigns.slice(0, 3).map((campaign: any, index: number) => (
                          <div key={campaign.campaignId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{campaign.emailType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                              <p className="text-sm text-gray-600">Campaign ID: {campaign.campaignId.substring(0, 8)}...</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{campaign.openRate.toFixed(1)}%</p>
                              <p className="text-xs text-gray-500">Open Rate</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No campaign data available</p>
                          <p className="text-sm text-muted-foreground">Send some email campaigns to see performance metrics</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Maps Tab */}
            <TabsContent value="maps" className="space-y-6">
              <Tabs defaultValue="earthquake-map" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="earthquake-map" className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Earthquake Map</span>
                  </TabsTrigger>
                  <TabsTrigger value="weather-map" className="flex items-center space-x-2">
                    <CloudRain className="h-4 w-4" />
                    <span>Weather Map</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="earthquake-map" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Globe className="h-5 w-5" />
                        <span>Earthquake Activity Map</span>
                      </CardTitle>
                      <CardDescription>
                        Real-time earthquake data for insurance targeting
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EarthquakeMap />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="weather-map" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CloudRain className="h-5 w-5" />
                        <span>Weather Events Map</span>
                      </CardTitle>
                      <CardDescription>
                        Bangladesh weather events for insurance campaigns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WeatherMap />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}