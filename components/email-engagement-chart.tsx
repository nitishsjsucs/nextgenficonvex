'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type DayStats = { 
  date: string; 
  clicked: number; 
  opened: number; 
  delivered: number; 
  bounced: number;
  processed: number;
};

type EmailStats = {
  dailyStats: DayStats[];
  summary: {
    totalEvents: number;
    uniqueEmails: number;
    dateRange: {
      from: string;
      to: string;
    };
  };
  eventTypes: {
    processed?: number;
    delivered?: number;
    open?: number;
    click?: number;
    bounce?: number;
    dropped?: number;
    spam_report?: number;
    unsubscribe?: number;
  };
  campaigns: Array<{
    campaignId: string;
    emailType: string;
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    dropped: number;
    openRate: number;
    clickRate: number;
    deliveryRate: number;
  }>;
};

interface EmailEngagementChartProps {
  campaignId?: string;
  days?: number;
}

export default function EmailEngagementChart({ 
  campaignId, 
  days = 30 
}: EmailEngagementChartProps) {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (campaignId) params.append('campaignId', campaignId);
        params.append('days', days.toString());
        
        const response = await fetch(`/api/email/stats?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        console.error('Error fetching email stats:', err);
        setError(err.message || 'Failed to load email statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [campaignId, days]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Email Engagement Statistics</CardTitle>
          <CardDescription>Loading email performance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Email Engagement Statistics</CardTitle>
          <CardDescription>Error loading email statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">⚠️ {error || 'Failed to load data'}</p>
              <p className="text-sm text-gray-500">
                Make sure your SendGrid webhook is configured and receiving events.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if there are no email events
  if (stats.summary.totalEvents === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Email Engagement Statistics</CardTitle>
          <CardDescription>No email campaigns found for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Data Yet</h3>
              <p className="text-gray-500 mb-4">
                Start sending email campaigns to see engagement analytics here.
              </p>
              <div className="text-sm text-gray-400">
                <p>• Send earthquake insurance campaigns</p>
                <p>• Send weather insurance campaigns</p>
                <p>• Track opens, clicks, and bounces</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { dailyStats = [], summary, eventTypes = {} } = stats;

  // Calculate rates with safe defaults
  const totalProcessed = Number(eventTypes?.processed) || 0;
  const totalDelivered = Number(eventTypes?.delivered) || 0;
  const totalOpens = Number(eventTypes?.open) || 0;
  const totalClicks = Number(eventTypes?.click) || 0;
  const totalBounces = Number(eventTypes?.bounce) || 0;

  const openRate = totalDelivered > 0 ? (totalOpens / totalDelivered * 100) : 0;
  const clickRate = totalDelivered > 0 ? (totalClicks / totalDelivered * 100) : 0;
  const bounceRate = totalProcessed > 0 ? (totalBounces / totalProcessed * 100) : 0;
  const deliveryRate = totalProcessed > 0 ? (totalDelivered / totalProcessed * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalProcessed || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {deliveryRate.toFixed(1)}% delivered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {(totalOpens || 0).toLocaleString()} opens
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {(totalClicks || 0).toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {(totalBounces || 0).toLocaleString()} bounces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Email Engagement Over Time</CardTitle>
          <CardDescription>
            {campaignId 
              ? `Campaign: ${campaignId} • Last ${days} days`
              : `All campaigns • Last ${days} days`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="line">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="delivered" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Delivered"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="opened" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Opens"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicked" 
                      stroke="#ffc658" 
                      strokeWidth={2}
                      name="Clicks"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bounced" 
                      stroke="#ff7300" 
                      strokeWidth={2}
                      name="Bounces"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="bar">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Legend />
                    <Bar dataKey="delivered" fill="#8884d8" name="Delivered" />
                    <Bar dataKey="opened" fill="#82ca9d" name="Opens" />
                    <Bar dataKey="clicked" fill="#ffc658" name="Clicks" />
                    <Bar dataKey="bounced" fill="#ff7300" name="Bounces" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

