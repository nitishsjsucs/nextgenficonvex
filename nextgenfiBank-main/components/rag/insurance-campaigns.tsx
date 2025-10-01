"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, CloudRain } from 'lucide-react';
import { RAGSection } from './rag-section';
import { WeatherRAGSection } from './weather-rag-section';

export function InsuranceCampaigns() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-6 w-6" />
            <span>Insurance Campaign RAG System</span>
          </CardTitle>
          <CardDescription>
            Find insurance prospects using real-time data and demographic targeting
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Campaign Type Tabs */}
      <Tabs defaultValue="earthquake" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earthquake" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Earthquake Insurance</span>
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center space-x-2">
            <CloudRain className="h-4 w-4" />
            <span>Weather Insurance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earthquake" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Earthquake Insurance Campaign</span>
              </CardTitle>
              <CardDescription>
                Target homeowners affected by recent earthquake activity for insurance campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RAGSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="mt-6">
          <WeatherRAGSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
