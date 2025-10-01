"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, AlertTriangle, Cloud, Target, Mail, TrendingUp, Send, TestTube, CloudRain } from 'lucide-react';
import { WeatherMap } from './weather-map';

// Types for the Weather RAG system
interface WeatherEvent {
  id: string;
  eventType: string;
  severity: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  startTime: string;
  endTime: string | null;
  description: string | null;
  rainfall: number | null;
  windSpeed: number | null;
  temperature: number | null;
  humidity: number | null;
}

interface WeatherPerson {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  state: string;
  houseValue: number;
  hasInsurance: boolean;
}

interface WeatherTarget {
  person: WeatherPerson;
  weatherEvent: WeatherEvent;
  distance_km: number;
  risk_level: string;
}

interface WeatherTargetsResult {
  weatherEvent: {
    id: string;
    eventType: string;
    severity: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
  };
  summary: {
    totalTargets: number;
    criteria: any;
    riskDistribution: {
      high: number;
      medium: number;
      low: number;
    };
  };
  targets: WeatherTarget[];
}

interface WeatherEmailContent {
  subject: string;
  body: string;
}

interface WeatherCampaignEntry {
  timestamp: Date;
  target: string;
  subject: string;
  body: string;
  risk_level: string;
  weather_event_type: string;
}

interface WeatherResponse {
  region: {
    bbox: [number, number, number, number];
    polygon: any | null;
  };
  query: {
    days: number;
    eventTypes: string[];
    minSeverity: string;
    strictPolygon: boolean;
  };
  count: number;
  weatherEvents: WeatherEvent[];
}

export function WeatherRAGSection() {
  // State management
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Campaign parameters
  const [maxDistance, setMaxDistance] = useState(50);
  const [minHouseValue, setMinHouseValue] = useState(100000);
  const [requireUninsured, setRequireUninsured] = useState(true);
  const [campaignContext, setCampaignContext] = useState(
    "Weather insurance campaign targeting Bangladesh residents affected by monsoon season and extreme weather events. Focus on property protection against floods, storms, and cyclones."
  );

  // Weather and targeting data
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [selectedWeatherEventId, setSelectedWeatherEventId] = useState<string | null>(null);
  const [currentTargets, setCurrentTargets] = useState<WeatherTargetsResult | null>(null);
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);

  // Email generation and sending
  const [generatedEmail, setGeneratedEmail] = useState<{
    target: WeatherTarget;
    content: WeatherEmailContent;
    generated_at: Date;
  } | null>(null);
  const [campaignHistory, setCampaignHistory] = useState<WeatherCampaignEntry[]>([]);

  // Bulk email state
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [emailResults, setEmailResults] = useState<any>(null);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("nitsancs@gmail.com");

  useEffect(() => {
    // Initialize the component
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleWeatherSelection = (data: WeatherResponse) => {
    setWeatherData(data);
    // Auto-select the first weather event if available
    if (data.weatherEvents.length > 0) {
      setSelectedWeatherEventId(data.weatherEvents[0].id);
    }
    setError(null);
  };

  const findTargets = async () => {
    if (isInitializing) {
      setError('Please wait for initialization to complete');
      return;
    }

    if (!selectedWeatherEventId) {
      setError('Please select a weather event first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/rag/weather-targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weatherEventId: selectedWeatherEventId,
          maxDistance,
          minHouseValue,
          requireUninsured,
          limit: 50
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const targetsResult = await response.json();
      setCurrentTargets(targetsResult);
      setSelectedTargetIndex(0); // Reset to first target
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
      const response = await fetch('/api/rag/generate-weather-email', {
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
      
      const generatedEmail: WeatherEmailContent = {
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

    const entry: WeatherCampaignEntry = {
      timestamp: new Date(),
      target: `${generatedEmail.target.person.firstName} ${generatedEmail.target.person.lastName} (${generatedEmail.target.person.email})`,
      subject: generatedEmail.content.subject,
      body: generatedEmail.content.body,
      risk_level: generatedEmail.target.risk_level,
      weather_event_type: generatedEmail.target.weatherEvent.eventType
    };

    setCampaignHistory(prev => [entry, ...prev]);
    setGeneratedEmail(null);
  };

  const sendTestEmail = async () => {
    if (!generatedEmail) return;

    setIsSendingTestEmail(true);
    try {
      const response = await fetch('/api/rag/weather-email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: generatedEmail.content.subject,
          body: generatedEmail.content.body,
          targetData: generatedEmail.target,
          testEmail: testEmailAddress
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      const result = await response.json();
      setEmailResults(result);
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const sendBulkEmails = async () => {
    if (!currentTargets || !generatedEmail) {
      setError('Please generate an email first');
      return;
    }

    setIsSendingBulk(true);
    setEmailResults(null);
    
    try {
      const campaignId = `weather_campaign_${Date.now()}`;
      
      const response = await fetch('/api/rag/weather-email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: generatedEmail.content.subject,
          body: generatedEmail.content.body,
          targets: currentTargets.targets,
          campaignId,
          batchSize: 5,
          delayBetweenBatches: 3000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const results = await response.json();
      setEmailResults(results);
      setError(null);

      // Save successful campaign to history
      if (results.summary.sent > 0) {
        const entry: WeatherCampaignEntry = {
          timestamp: new Date(),
          target: `Bulk campaign: ${results.summary.sent} emails sent`,
          subject: generatedEmail.content.subject,
          body: generatedEmail.content.body,
          risk_level: 'mixed',
          weather_event_type: generatedEmail.target.weatherEvent.eventType
        };
        setCampaignHistory(prev => [entry, ...prev]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send bulk emails';
      setError(errorMessage);
      console.error('Bulk email error:', err);
    } finally {
      setIsSendingBulk(false);
    }
  };

  const getWeatherIcon = (eventType: string) => {
    switch (eventType) {
      case 'rain': return '🌧️';
      case 'storm': return '⛈️';
      case 'flood': return '🌊';
      case 'cyclone': return '🌀';
      case 'heatwave': return '☀️';
      default: return '🌦️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800';
      case 'heavy': return 'bg-orange-100 text-orange-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'light': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Initializing Weather Insurance RAG System...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CloudRain className="h-6 w-6" />
            <span>Weather Insurance Campaign System</span>
          </CardTitle>
          <CardDescription>
            Target Bangladesh residents affected by weather events for insurance campaigns
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="weather-map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weather-map">Weather Map</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="email-gen">Email Generation</TabsTrigger>
          <TabsTrigger value="campaign-history">Campaign History</TabsTrigger>
        </TabsList>

        {/* Weather Map Tab */}
        <TabsContent value="weather-map" className="space-y-4">
          <WeatherMap 
            onWeatherSelection={handleWeatherSelection}
            className="w-full"
          />
          
          {weatherData && (
            <Card>
              <CardHeader>
                <CardTitle>Weather Events Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {weatherData.weatherEvents.map((event, index) => (
                    <div 
                      key={event.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedWeatherEventId === event.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedWeatherEventId(event.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getWeatherIcon(event.eventType)}</span>
                          <div>
                            <div className="font-medium">
                              {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} in {event.location}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(event.startTime).toLocaleDateString()} - 
                              {event.endTime ? new Date(event.endTime).toLocaleDateString() : 'Ongoing'}
                            </div>
                          </div>
                        </div>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                      )}
                      <div className="flex space-x-4 text-xs text-gray-500 mt-2">
                        {event.rainfall && <span>Rainfall: {event.rainfall}mm</span>}
                        {event.windSpeed && <span>Wind: {event.windSpeed} km/h</span>}
                        {event.temperature && <span>Temp: {event.temperature}°C</span>}
                        {event.humidity && <span>Humidity: {event.humidity}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Targeting Tab */}
        <TabsContent value="targeting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Target Parameters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Distance (km)</label>
                  <Input
                    type="number"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    min={1}
                    max={200}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Min House Value ($)</label>
                  <Input
                    type="number"
                    value={minHouseValue}
                    onChange={(e) => setMinHouseValue(Number(e.target.value))}
                    min={50000}
                    step={10000}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="requireUninsured"
                    checked={requireUninsured}
                    onChange={(e) => setRequireUninsured(e.target.checked)}
                  />
                  <label htmlFor="requireUninsured" className="text-sm">
                    Target uninsured only
                  </label>
                </div>
              </div>
              
              <Button 
                onClick={findTargets} 
                disabled={isLoading || !selectedWeatherEventId}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Targets...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Find Weather Insurance Targets
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {currentTargets && (
            <Card>
              <CardHeader>
                <CardTitle>Found Targets</CardTitle>
                <CardDescription>
                  {currentTargets.summary.totalTargets} targets found for {currentTargets.weatherEvent.eventType} in {currentTargets.weatherEvent.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Badge variant="outline">High Risk: {currentTargets.summary.riskDistribution.high}</Badge>
                  <Badge variant="outline">Medium Risk: {currentTargets.summary.riskDistribution.medium}</Badge>
                  <Badge variant="outline">Low Risk: {currentTargets.summary.riskDistribution.low}</Badge>
                </div>

                {currentTargets.targets.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Selected Target:</span>
                      <select
                        value={selectedTargetIndex}
                        onChange={(e) => setSelectedTargetIndex(Number(e.target.value))}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        {currentTargets.targets.map((target, index) => (
                          <option key={index} value={index}>
                            {target.person.firstName} {target.person.lastName} - {target.person.city}, {target.person.state}
                          </option>
                        ))}
                      </select>
                    </div>

                    {currentTargets.targets[selectedTargetIndex] && (
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div><strong>Name:</strong> {currentTargets.targets[selectedTargetIndex].person.firstName} {currentTargets.targets[selectedTargetIndex].person.lastName}</div>
                          <div><strong>Email:</strong> {currentTargets.targets[selectedTargetIndex].person.email}</div>
                          <div><strong>Location:</strong> {currentTargets.targets[selectedTargetIndex].person.city}, {currentTargets.targets[selectedTargetIndex].person.state}</div>
                          <div><strong>House Value:</strong> ${(currentTargets.targets[selectedTargetIndex].person.houseValue || 0).toLocaleString()}</div>
                          <div><strong>Distance:</strong> {currentTargets.targets[selectedTargetIndex].distance_km} km</div>
                          <div><strong>Risk Level:</strong> 
                            <Badge className={`ml-1 ${
                              currentTargets.targets[selectedTargetIndex].risk_level === 'high' ? 'bg-red-100 text-red-800' :
                              currentTargets.targets[selectedTargetIndex].risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {currentTargets.targets[selectedTargetIndex].risk_level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Email Generation Tab */}
        <TabsContent value="email-gen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Generation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Campaign Context</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                  rows={3}
                  value={campaignContext}
                  onChange={(e) => setCampaignContext(e.target.value)}
                  placeholder="Describe the campaign context and goals..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Test Email Address</label>
                <Input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="Enter email for testing"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Note: With SendGrid account, make sure your from email is verified in SendGrid
                </p>
              </div>

              <Button 
                onClick={generateEmail} 
                disabled={isLoading || !currentTargets}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Email...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Generate Weather Insurance Email
                  </>
                )}
              </Button>

              {generatedEmail && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generated Email</CardTitle>
                    <CardDescription>
                      For {generatedEmail.target.person.firstName} {generatedEmail.target.person.lastName} - 
                      {generatedEmail.target.weatherEvent.eventType} ({generatedEmail.target.risk_level} risk)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Subject:</label>
                      <div className="p-2 bg-gray-50 rounded mt-1">
                        {generatedEmail.content.subject}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Body:</label>
                      <div 
                        className="mt-1 p-3 bg-gray-50 rounded border whitespace-pre-wrap text-sm"
                        dangerouslySetInnerHTML={{
                          __html: generatedEmail.content.body
                            .replace(/\\n/g, '\n')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        }}
                      />
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
                        disabled={isSendingBulk || !currentTargets || currentTargets.targets.length === 0}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        {isSendingBulk ? (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign History Tab */}
        <TabsContent value="campaign-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Campaign History</span>
              </CardTitle>
              <CardDescription>
                View your weather insurance campaign history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No campaigns generated yet</p>
              ) : (
                <div className="space-y-4">
                  {campaignHistory.map((entry, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getWeatherIcon(entry.weather_event_type)}</span>
                            <div>
                              <div className="font-medium">{entry.target}</div>
                              <div className="text-sm text-gray-500">
                                {entry.timestamp.toLocaleString()} • 
                                <Badge className={`ml-1 ${
                                  entry.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                                  entry.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  entry.risk_level === 'mixed' ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {entry.risk_level}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <strong>Subject:</strong> {entry.subject}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {entry.body.substring(0, 150)}...
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
