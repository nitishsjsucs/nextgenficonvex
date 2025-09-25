"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, AlertTriangle, Globe, Target, Mail, TrendingUp, Send, TestTube, CloudRain } from 'lucide-react';
import { EarthquakeMap } from './earthquake-map';
import { WeatherRAGSection } from './weather-rag-section';

// Types for the RAG system
interface EarthquakeStats {
  earthquake_stats: {
    total_earthquakes: number;
    recent_earthquakes_7_days: number;
  };
  demographic_stats: {
    high_value_homes: number;
    uninsured_homes: number;
    uninsured_percentage: string;
  };
}

interface Earthquake {
  id: string;
  time: number | null;
  latitude: number | null;
  longitude: number | null;
  mag: number | null;
  place: string | null;
  depth_km: number | null;
  url: string | null;
}

interface Person {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  state: string;
  houseValue: number;
  hasInsurance: boolean;
}

interface Target {
  person: Person;
  earthquake: Earthquake;
  distance_km: number;
  risk_level: string;
}

interface TargetsResult {
  targets: Target[];
  summary: {
    total_targets: number;
    high_risk_targets: number;
    medium_risk_targets: number;
    low_risk_targets: number;
    criteria: any;
  };
}

interface EmailContent {
  subject: string;
  body: string;
}

interface CampaignEntry {
  timestamp: Date;
  target: string;
  subject: string;
  body: string;
  risk_level: string;
}

interface EarthquakeResponse {
  region: {
    bbox: [number, number, number, number];
    polygon: any | null;
  };
  query: {
    hours: number;
    minmag: number;
    strictPolygon: boolean;
  };
  count: number;
  earthquakes: Earthquake[];
}

export function RAGSection() {
  // State management
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Campaign parameters
  const [minMagnitude, setMinMagnitude] = useState(3.5);
  const [maxDistance, setMaxDistance] = useState(100);
  const [minHomeValue, setMinHomeValue] = useState(500000);
  const [requireUninsured, setRequireUninsured] = useState(true);
  const [testEmailAddress, setTestEmailAddress] = useState("nitsancs@gmail.com");
  const [campaignContext, setCampaignContext] = useState(
    "We're reaching out to homeowners in areas affected by recent earthquake activity to help them understand their earthquake insurance options."
  );
  
  // Data state
  const [earthquakeStats, setEarthquakeStats] = useState<EarthquakeStats | null>(null);
  const [recentEarthquakes, setRecentEarthquakes] = useState<Earthquake[]>([]);
  const [selectedEarthquakeData, setSelectedEarthquakeData] = useState<EarthquakeResponse | null>(null);
  const [currentTargets, setCurrentTargets] = useState<TargetsResult | null>(null);
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);
  const [generatedEmail, setGeneratedEmail] = useState<{target: Target, content: EmailContent, generated_at: Date} | null>(null);
  const [campaignHistory, setCampaignHistory] = useState<CampaignEntry[]>([]);
  
  // Email functionality state
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [isSendingBulkEmail, setIsSendingBulkEmail] = useState(false);
  const [emailResults, setEmailResults] = useState<any>(null);

  // Initialize the RAG system on component mount
  const initializeRAGSystem = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      // Test database connection by fetching stats
      const response = await fetch('/api/rag/stats');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Database connection failed: ${response.status} - ${errorText}`);
      }
      
      const stats = await response.json();
      setEarthquakeStats(stats);
      setError(null);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('RAG system initialization failed:', err);
      setError(`Failed to initialize RAG system: ${errorMessage}`);
    } finally {
      setIsInitializing(false);
    }
  };


  const findTargets = async () => {
    if (isInitializing) {
      setError('RAG system is still initializing, please wait');
      return;
    }

    if (!selectedEarthquakeData || !selectedEarthquakeData.earthquakes.length) {
      setError('Please select an earthquake region first using the map above');
      return;
    }

    setIsLoading(true);
    try {
      // Use the most recent/significant earthquake from the selected region
      const targetEarthquake = selectedEarthquakeData.earthquakes
        .filter(eq => eq.mag && eq.mag >= minMagnitude)
        .sort((a, b) => (b.mag || 0) - (a.mag || 0))[0];

      if (!targetEarthquake) {
        setError(`No earthquakes found with magnitude >= ${minMagnitude} in selected region`);
        return;
      }

      // Call the real RAG targets API
      const response = await fetch('/api/rag/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          earthquakeId: targetEarthquake.id,
          maxDistance: maxDistance,
          minHouseValue: minHomeValue,
          requireUninsured: requireUninsured,
          requireHomeowner: true,
          excludeDoNotCall: true,
          limit: 50
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const targetsResult = await response.json();
      
      // Transform API response to match expected format
      const transformedResult: TargetsResult = {
        targets: targetsResult.targets,
        summary: {
          total_targets: targetsResult.summary.total_targets,
          high_risk_targets: targetsResult.summary.high_risk_targets,
          medium_risk_targets: targetsResult.summary.medium_risk_targets,
          low_risk_targets: targetsResult.summary.low_risk_targets,
          criteria: targetsResult.summary.criteria
        }
      };

      setCurrentTargets(transformedResult);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find targets';
      setError(errorMessage);
      console.error('Target finding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmail = async () => {
    if (isInitializing || !currentTargets) {
      setError('Please wait for initialization to complete and find targets first');
      return;
    }

    const selectedTarget = currentTargets.targets[selectedTargetIndex];
    if (!selectedTarget) return;

    setIsLoading(true);
    try {
      // Call the real Gemini API for email generation
      const response = await fetch('/api/rag/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: selectedTarget,
          context: campaignContext
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const emailResult = await response.json();
      
      const generatedEmail: EmailContent = {
        subject: emailResult.subject,
        body: emailResult.body
      };

      setGeneratedEmail({
        target: selectedTarget,
        content: generatedEmail,
        generated_at: new Date()
      });
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate email';
      setError(errorMessage);
      console.error('Email generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToHistory = async () => {
    if (!generatedEmail) return;

    try {
      // Save to database via API
      const response = await fetch('/api/rag/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          earthquakeId: generatedEmail.target.earthquake.id,
          subject: generatedEmail.content.subject,
          body: generatedEmail.content.body,
          riskLevel: generatedEmail.target.risk_level,
          distanceKm: generatedEmail.target.distance_km,
          targetInfo: {
            firstName: generatedEmail.target.person.firstName,
            lastName: generatedEmail.target.person.lastName,
            email: generatedEmail.target.person.email,
            city: generatedEmail.target.person.city,
            state: generatedEmail.target.person.state,
            houseValue: generatedEmail.target.person.houseValue,
            hasInsurance: generatedEmail.target.person.hasInsurance
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save campaign');
      }

      // Also add to local state for immediate UI update
      const campaignEntry: CampaignEntry = {
        timestamp: new Date(),
        target: `${generatedEmail.target.person.firstName} ${generatedEmail.target.person.lastName}`,
        subject: generatedEmail.content.subject,
        body: generatedEmail.content.body,
        risk_level: generatedEmail.target.risk_level
      };

      setCampaignHistory(prev => [...prev, campaignEntry]);
      setError(null);
      
      // Show success message briefly
      const originalError = error;
      setError('Campaign saved successfully!');
      setTimeout(() => setError(originalError), 3000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save campaign';
      setError(errorMessage);
      console.error('Campaign save error:', err);
    }
  };

  // Load campaign history from database
  const loadCampaignHistory = async () => {
    try {
      const response = await fetch('/api/rag/campaigns?limit=20');
      if (response.ok) {
        const data = await response.json();
        const campaigns = data.campaigns.map((campaign: any) => ({
          timestamp: new Date(campaign.createdAt),
          target: campaign.person ? 
            `${campaign.person.firstName} ${campaign.person.lastName}` : 
            'Unknown Target',
          subject: campaign.subject,
          body: campaign.body,
          risk_level: campaign.riskLevel
        }));
        setCampaignHistory(campaigns);
      }
    } catch (err) {
      console.error('Failed to load campaign history:', err);
    }
  };

  // Send test email functionality
  const sendTestEmail = async () => {
    if (!generatedEmail) {
      console.error('❌ No generated email available');
      setError('Please generate an email first before sending a test.');
      return;
    }

    console.log('📧 Sending test email...', {
      subject: generatedEmail.content.subject,
      hasTarget: !!generatedEmail.target
    });

    setIsSendingTestEmail(true);
    try {
      const response = await fetch('/api/rag/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: generatedEmail.content.subject,
          body: generatedEmail.content.body,
          targetData: generatedEmail.target,
          testEmail: testEmailAddress
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      setEmailResults(result);
      
      console.log('📧 Test email result:', result);
      
      if (result.warning) {
        setError(`⚠️ ${result.warning}`);
      } else if (result.emailSent) {
        setError(`✅ Test email sent successfully! Message ID: ${result.messageId}`);
      } else {
        setError(`✅ Test email sent successfully to ${result.testEmail}!`);
      }
      
      // Clear message after 8 seconds
      setTimeout(() => {
        setError(null);
      }, 8000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test email';
      setError(errorMessage);
      console.error('Test email error:', err);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Send bulk emails to all targets
  const sendBulkEmails = async () => {
    if (!generatedEmail || !currentTargets) return;

    setIsSendingBulkEmail(true);
    try {
      const response = await fetch('/api/rag/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: generatedEmail.content.subject,
          body: generatedEmail.content.body,
          targets: currentTargets.targets,
          campaignId: `campaign-${Date.now()}`,
          batchSize: 5, // Conservative batch size
          delayBetweenBatches: 3000 // 3 second delay between batches
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      setEmailResults(result);
      setError(`✅ Bulk email campaign completed! ${result.summary.emailsSent}/${result.summary.totalTargets} emails sent successfully.`);
      
      // Clear success message after 10 seconds
      setTimeout(() => {
        if (error?.includes('✅')) setError(null);
      }, 10000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send bulk emails';
      setError(errorMessage);
      console.error('Bulk email error:', err);
    } finally {
      setIsSendingBulkEmail(false);
    }
  };

  // Initialize RAG system when component mounts
  React.useEffect(() => {
    initializeRAGSystem();
  }, []);

  // Load campaign history after initialization
  React.useEffect(() => {
    if (!isInitializing) {
      loadCampaignHistory();
    }
  }, [isInitializing]);

  // Handle earthquake selection from map
  const handleEarthquakeSelection = (data: EarthquakeResponse) => {
    setSelectedEarthquakeData(data);
    setRecentEarthquakes(data.earthquakes);
    
    // Update earthquake stats based on real data, keep existing demographic stats
    setEarthquakeStats(prevStats => ({
      earthquake_stats: {
        total_earthquakes: data.count,
        recent_earthquakes_7_days: data.earthquakes.filter(eq => {
          if (!eq.time) return false;
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          return eq.time > sevenDaysAgo;
        }).length
      },
      demographic_stats: prevStats?.demographic_stats || {
        high_value_homes: 0,
        uninsured_homes: 0,
        uninsured_percentage: "0.0"
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Globe className="h-8 w-8 text-blue-600" />
          Earthquake Insurance Marketing AI
        </h1>
      </div>

      {/* Initialization Status */}
      {isInitializing && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg">Initializing RAG System...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      {!isInitializing && (
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="targets">Find Targets</TabsTrigger>
            <TabsTrigger value="emails">Generate Emails</TabsTrigger>
            <TabsTrigger value="history">Campaign History</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Earthquake & Demographics Dashboard
              </h2>
              
              {earthquakeStats && (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Earthquakes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{earthquakeStats.earthquake_stats.total_earthquakes}</div>
                      <p className="text-xs text-muted-foreground">In database</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Recent (7 days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{earthquakeStats.earthquake_stats.recent_earthquakes_7_days}</div>
                      <p className="text-xs text-muted-foreground">Last week</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">High-Value Homes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{earthquakeStats.demographic_stats.high_value_homes.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Homes valued greater than $500k</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Uninsured Homes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{earthquakeStats.demographic_stats.uninsured_homes.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">{earthquakeStats.demographic_stats.uninsured_percentage}% uninsured</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Earthquake Map */}
              <EarthquakeMap 
                onEarthquakeSelection={handleEarthquakeSelection}
                className="mt-6"
              />

              {recentEarthquakes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Region Earthquakes ({recentEarthquakes.length})</CardTitle>
                    {selectedEarthquakeData && (
                      <CardDescription>
                        Last {selectedEarthquakeData.query.hours} hours • Min magnitude {selectedEarthquakeData.query.minmag}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {recentEarthquakes.map((eq, index) => (
                        <div key={eq.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{eq.place || 'Unknown location'}</p>
                            <p className="text-sm text-muted-foreground">
                              {eq.time ? new Date(eq.time).toLocaleDateString() : 'Unknown time'} - 
                              Magnitude {eq.mag?.toFixed(1) || 'Unknown'} - 
                              Depth {eq.depth_km?.toFixed(1) || 'Unknown'} km
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={(eq.mag || 0) >= 5 ? "destructive" : (eq.mag || 0) >= 4 ? "default" : "secondary"}>
                              M{eq.mag?.toFixed(1) || '?'}
                            </Badge>
                            {eq.url && (
                              <a 
                                href={eq.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                USGS
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="targets" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Find Campaign Targets
                </h2>
                <Button 
                  onClick={findTargets} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finding...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      Find Targets
                    </>
                  )}
                </Button>
              </div>

              {/* Campaign Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Parameters</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Minimum Earthquake Magnitude</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={minMagnitude.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setMinMagnitude(0);
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue)) {
                            setMinMagnitude(numValue);
                          }
                        }
                      }}
                      placeholder="3.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Maximum Distance (km)</label>
                    <Input
                      type="number"
                      value={maxDistance.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setMaxDistance(0);
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue)) {
                            setMaxDistance(numValue);
                          }
                        }
                      }}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Minimum Home Value</label>
                    <Input
                      type="number"
                      value={minHomeValue.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setMinHomeValue(0);
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue)) {
                            setMinHomeValue(numValue);
                          }
                        }
                      }}
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Test Email Address</label>
                    <Input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="Enter email for testing"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Note: With SendGrid account, make sure your from email is verified in SendGrid
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="uninsured"
                      checked={requireUninsured}
                      onChange={(e) => setRequireUninsured(e.target.checked)}
                    />
                    <label htmlFor="uninsured" className="text-sm font-medium">Only target uninsured homes</label>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {currentTargets && (
                <Card>
                  <CardHeader>
                    <CardTitle>Target Results ({currentTargets.summary.total_targets} found)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{currentTargets.summary.high_risk_targets}</div>
                        <div className="text-sm text-red-600">High Risk</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{currentTargets.summary.medium_risk_targets}</div>
                        <div className="text-sm text-yellow-600">Medium Risk</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{currentTargets.summary.low_risk_targets}</div>
                        <div className="text-sm text-green-600">Low Risk</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentTargets.targets.map((target, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{target.person.firstName} {target.person.lastName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {target.person.city}, {target.person.state} • ${(target.person.houseValue || 0).toLocaleString()} • {target.distance_km}km away
                              </p>
                            </div>
                            <Badge variant={target.risk_level === 'high' ? 'destructive' : target.risk_level === 'medium' ? 'default' : 'secondary'}>
                              {target.risk_level} risk
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="emails" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Generate Email Campaign
              </h2>

              {!currentTargets ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Please find targets first in the 'Find Targets' tab.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {/* Target Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Target</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <select
                        value={selectedTargetIndex}
                        onChange={(e) => setSelectedTargetIndex(parseInt(e.target.value))}
                        className="w-full p-2 border rounded-md"
                      >
                        {currentTargets.targets.map((target, index) => (
                          <option key={index} value={index}>
                            {target.person.firstName} {target.person.lastName} - {target.person.city} ({target.risk_level} risk)
                          </option>
                        ))}
                      </select>

                          <Button 
                            onClick={generateEmail} 
                            disabled={isLoading || isInitializing}
                            className="w-full"
                          >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Email...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Generate Email
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Campaign Context */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Context</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        value={campaignContext}
                        onChange={(e) => setCampaignContext(e.target.value)}
                        className="w-full p-3 border rounded-md h-24 resize-none"
                        placeholder="Provide context for the email generation"
                      />
                    </CardContent>
                  </Card>

                  {/* Generated Email */}
                  {generatedEmail && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Generated Email</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Subject:</label>
                          <div className="mt-1 p-2 bg-gray-50 rounded border">
                            {generatedEmail.content.subject}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Body:</label>
                          <div className="mt-1 p-3 bg-gray-50 rounded border whitespace-pre-wrap text-sm">
                            {generatedEmail.content.body}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button onClick={generateEmail} variant="outline">
                            Regenerate
                          </Button>
                          <Button onClick={saveToHistory}>
                            Save Campaign
                          </Button>
                          <Button 
                            onClick={sendTestEmail} 
                            disabled={isSendingTestEmail}
                            variant="secondary"
                            className="flex items-center gap-2"
                          >
                            {isSendingTestEmail ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending Test...
                              </>
                            ) : (
                              <>
                                <TestTube className="h-4 w-4" />
                                Send Test Email
                              </>
                            )}
                          </Button>
                          <Button 
                            onClick={sendBulkEmails} 
                            disabled={isSendingBulkEmail || !currentTargets || currentTargets.targets.length === 0}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            {isSendingBulkEmail ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending to {currentTargets?.targets.length || 0} targets...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                Send to All Targets ({currentTargets?.targets.length || 0})
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Email Results */}
                  {emailResults && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Campaign Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {emailResults.summary ? (
                          // Bulk email results
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{emailResults.summary.totalTargets}</div>
                                <div className="text-sm text-blue-600">Total Targets</div>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{emailResults.summary.emailsSent}</div>
                                <div className="text-sm text-green-600">Emails Sent</div>
                              </div>
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{emailResults.summary.emailsFailed}</div>
                                <div className="text-sm text-red-600">Failed</div>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{emailResults.summary.successRate}</div>
                                <div className="text-sm text-purple-600">Success Rate</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              Campaign ID: {emailResults.campaignId} • 
                              Total Time: {(emailResults.summary.totalTimeMs / 1000).toFixed(1)}s • 
                              Avg per email: {emailResults.summary.averageTimePerEmail}
                            </div>
                          </div>
                        ) : (
                          // Test email results
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium">Test email sent successfully!</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <strong>Recipient:</strong> {emailResults.testEmail}
                            </div>
                            <div className="text-sm text-gray-600">
                              <strong>Subject:</strong> {emailResults.previewData?.subject}
                            </div>
                            {emailResults.previewData?.targetInfo && (
                              <div className="text-sm text-gray-600">
                                <strong>Target Preview:</strong> {emailResults.previewData.targetInfo.name} in {emailResults.previewData.targetInfo.location}
                              </div>
                            )}
                          </div>
                        )}
                        <Button 
                          onClick={() => setEmailResults(null)} 
                          variant="outline" 
                          size="sm"
                        >
                          Clear Results
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Campaign History</h2>

              {campaignHistory.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No campaigns generated yet. Generate some emails in the 'Generate Emails' tab!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {campaignHistory.map((campaign, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Campaign {index + 1}: {campaign.target}</CardTitle>
                          <Badge variant={campaign.risk_level === 'high' ? 'destructive' : campaign.risk_level === 'medium' ? 'default' : 'secondary'}>
                            {campaign.risk_level} risk
                          </Badge>
                        </div>
                        <CardDescription>
                          {campaign.timestamp.toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <strong>Subject:</strong> {campaign.subject}
                        </div>
                        <Separator />
                        <div className="text-sm whitespace-pre-wrap">
                          {campaign.body}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    onClick={() => setCampaignHistory([])} 
                    variant="destructive" 
                    className="w-full"
                  >
                    Clear History
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
