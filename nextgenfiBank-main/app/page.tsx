"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BankingPlatformDiagram } from '@/components/banking-platform-diagram';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const App = () => {
  const CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );

  const BrainIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
      <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
      <path d="M6 18a4 4 0 0 1-1.967-.516"/>
      <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  );

  const MessageSquareIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-8 7.5s-8-2.5-8-7.5c0-1 0-3 0-5 0-1.3 1.6-3 8-3s8 1.7 8 3c0 2 0 4 0 5"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );

  const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
      <polyline points="16,7 22,7 22,13"/>
    </svg>
  );

  const ZapIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
    </svg>
  );

  const BuildingIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/>
      <path d="M16 6h.01"/>
      <path d="M12 6h.01"/>
      <path d="M12 10h.01"/>
      <path d="M12 14h.01"/>
      <path d="M16 10h.01"/>
      <path d="M16 14h.01"/>
      <path d="M8 10h.01"/>
      <path d="M8 14h.01"/>
    </svg>
  );

  const stats = [
    { label: "Deployment Time", value: "2-4 weeks", description: "vs 12+ months traditional" },
    { label: "Cost Reduction", value: "75%", description: "compared to in-house build" },
    { label: "Compliance Ready", value: "SOC 2", description: "certified security" },
    { label: "API Integration", value: "<24hrs", description: "rapid connection" }
  ];

  const router = useRouter();

  // Enhanced Framer Motion variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15
      }
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15
      }
    },
  };

  return (
    <div className="min-h-screen bg-white font-[Inter] text-gray-900 antialiased overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100"
      >
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <motion.div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-black to-gray-700 rounded-xl flex items-center justify-center text-white">
              <BuildingIcon />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900">BankingOS</span>
              <span className="text-xs text-gray-500">Plug & Play Backend</span>
            </div>
          </motion.div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">Demo</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <Button onClick={() => router.push('/auth/sign-in')} variant="outline" className="mr-2">Login</Button>
            <Button onClick={() => router.push('/demo')} className="bg-black hover:bg-gray-800">
              Request Demo
            </Button>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
  <section className="relative min-h-screen flex items-center justify-center pt-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-20 h-20 bg-gray-200 rounded-full opacity-30"
          />
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute top-40 right-20 w-32 h-32 bg-gray-200 rounded-full opacity-30"
          />
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 6 }}
            className="absolute bottom-40 left-20 w-24 h-24 bg-green-100 rounded-full opacity-30"
          />
        </div>

        <motion.div
          className="container mx-auto px-6 text-center relative z-10"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.div variants={item} className="mb-6">
            <Badge variant="secondary" className="px-4 py-2 bg-gray-200 text-gray-800 border-0">
              <ZapIcon className="w-4 h-4 mr-2" />
              Plug & Play Banking Platform
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-8" 
            variants={item}
          >
            Banking Innovation{' '}
            <span className="text-black">Simplified</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed" 
            variants={item}
          >
            Deploy AI analytics, intelligent communications, and enterprise-grade compliance in <span className="font-semibold text-gray-900">weeks, not years</span>. The complete backend platform for modern banking.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16" variants={item}>
            <Button
              size="lg"
              onClick={() => router.push('/demo')}
              className="px-8 py-4 bg-black hover:bg-gray-800 text-white text-lg font-semibold shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              Request Live Demo
              <TrendingUpIcon className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105"
            >
              View Documentation
            </Button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            variants={container}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={item} className="text-center">
                <div className="text-3xl font-bold text-black mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-900 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <motion.div
          className="container mx-auto px-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          <motion.div className="text-center mb-16" variants={item}>
            <Badge variant="outline" className="mb-4 border-gray-300 text-gray-700">Core Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything Banks Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive suite of modern banking capabilities designed for rapid deployment and enterprise scalability.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div variants={slideInLeft}>
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <BrainIcon className="text-gray-800" />
                  </div>
                  <CardTitle className="text-xl">AI Analytics & Insights</CardTitle>
                  <CardDescription>
                    Advanced analytics dashboards powered by AI to unlock data-driven strategy and improve portfolio performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      Risk pattern detection
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      Customer segmentation
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      Predictive analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquareIcon className="text-gray-800" />
                  </div>
                  <CardTitle className="text-xl">RAG AI Assistant</CardTitle>
                  <CardDescription>
                    Intelligent assistant using your bank's proprietary knowledge for context-rich, personalized responses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      24/7 customer support
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      Staff assistance
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      Policy-aware responses
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={slideInRight}>
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <ZapIcon className="text-gray-800" />
                  </div>
                  <CardTitle className="text-xl">SMS & Voice Agents</CardTitle>
                  <CardDescription>
                    Automated communication system for customer outreach, alerts, and interactive voice response.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      Payment reminders
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      Fraud alerts
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      Interactive calls
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={slideInLeft}>
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <ShieldCheckIcon className="text-gray-800" />
                  </div>
                  <CardTitle className="text-xl">Enterprise Compliance</CardTitle>
                  <CardDescription>
                    SOC 2 certified platform with comprehensive audit trails and regulatory compliance built-in.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      SOC 2 certification
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      Audit dashboard
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-2 w-4 h-4" />
                      Data encryption
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <BuildingIcon className="text-gray-800" />
                  </div>
                  <CardTitle className="text-xl">Multi-Tenant Architecture</CardTitle>
                  <CardDescription>
                    Secure, scalable infrastructure with complete data isolation between bank tenants.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                      Data isolation
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                      Quick onboarding
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                      Enterprise security
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={slideInRight}>
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUpIcon className="text-gray-800" />
                  </div>
                  <CardTitle className="text-xl">Unified Dashboard</CardTitle>
                  <CardDescription>
                    Single source of truth with custom reporting, system health monitoring, and KPI visualization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                      Real-time metrics
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                      Custom reports
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                      ROI tracking
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Platform Overview */}
      <section id="demo" className="py-20 bg-white">
        <motion.div
          className="container mx-auto px-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          <motion.div className="text-center mb-16" variants={item}>
            <Badge variant="outline" className="mb-4 border-gray-300 text-gray-700">Platform Architecture</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              From Legacy to Leading Edge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your bank's capabilities with our comprehensive platform that plugs seamlessly into your existing infrastructure.
            </p>
          </motion.div>
          
          <motion.div variants={item}>
            <BankingPlatformDiagram />
          </motion.div>
        </motion.div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20 bg-white">
        <motion.div
          className="container mx-auto px-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          <motion.div className="text-center mb-16" variants={item}>
            <Badge variant="outline" className="mb-4 border-gray-300 text-gray-700">Development Roadmap</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Phased Deployment Strategy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From MVP to enterprise-grade platform, our roadmap ensures rapid value delivery with minimal risk.
            </p>
          </motion.div>

          <Tabs defaultValue="v0" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="v0">MVP (v0)</TabsTrigger>
              <TabsTrigger value="v1">Beta (v1)</TabsTrigger>
              <TabsTrigger value="v2">Full Launch (v2)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="v0" className="mt-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Pilot/MVP Phase</CardTitle>
                    <Badge variant="secondary">3-4 Months</Badge>
                  </div>
                  <CardDescription className="text-lg">
                    Core foundation with essential features for pilot deployment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Key Features:</h4>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Multi-tenant infrastructure
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Basic AI analytics dashboard
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          SMS notification service
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Compliance logging
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Basic admin interface
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          User management
                        </li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Goals:</h4>
                      <p className="text-sm text-gray-600">
                        Deploy with pilot client, validate integration capabilities, and gather feedback on core functionality.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="v1" className="mt-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Beta Launch</CardTitle>
                    <Badge variant="secondary">6-9 Months</Badge>
                  </div>
                  <CardDescription className="text-lg">
                    Feature-complete platform with advanced capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Enhanced Features:</h4>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Full RAG AI assistant
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Voice calling agents
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Third-party integrations
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Role-based access control
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          SOC 2 Type I compliance
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Enhanced UX/UI
                        </li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Target:</h4>
                      <p className="text-sm text-gray-600">
                        Onboard 3-5 beta banks, validate multi-tenant scaling, and demonstrate platform versatility across different bank types.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="v2" className="mt-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">General Availability</CardTitle>
                    <Badge variant="secondary">12-15 Months</Badge>
                  </div>
                  <CardDescription className="text-lg">
                    Production-ready platform for enterprise deployment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Enterprise Features:</h4>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Enterprise scalability
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          SOC 2 Type II certified
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Advanced AI capabilities
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          API marketplace
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Disaster recovery
                        </li>
                        <li className="flex items-center">
                          <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                          Multi-region support
                        </li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Market Ready:</h4>
                      <p className="text-sm text-gray-600">
                        Full commercial launch with comprehensive documentation, partner ecosystem, and proven track record with reference clients.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* Competitive Advantage Section */}
      <section className="py-20 bg-gray-50">
        <motion.div
          className="container mx-auto px-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          <motion.div className="text-center mb-16" variants={item}>
            <Badge variant="outline" className="mb-4 border-gray-300 text-gray-700">Competitive Edge</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Banks Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our unique combination of speed, security, and comprehensive features sets us apart in the banking technology landscape.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div variants={slideInLeft}>
              <Card className="h-full border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-black">All-in-One Solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Unlike piecemal solutions that require multiple vendor integrations, our unified platform provides AI, communications, and compliance under one roof.
                  </p>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Traditional approach:</div>
                    <div className="text-sm text-gray-500">• Multiple vendors</div>
                    <div className="text-sm text-gray-500">• Complex integrations</div>
                    <div className="text-sm text-gray-500">• Higher costs</div>
                    <div className="text-sm text-gray-500 mt-3">Our approach:</div>
                    <div className="text-sm text-gray-800">• Single integration</div>
                    <div className="text-sm text-gray-800">• Unified data flow</div>
                    <div className="text-sm text-gray-800">• Cost-effective</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="h-full border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-black">Rapid Deployment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Traditional core banking upgrades take months or years. Our platform deploys in weeks with minimal IT burden.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Traditional Systems</span>
                        <span className="text-gray-600">12-24 months</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>BankingOS Platform</span>
                        <span className="text-gray-800">2-4 weeks</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={slideInRight}>
              <Card className="h-full border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-black">Compliance-First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Built with banking regulations in mind from day one. SOC 2 certification and FFIEC compliance out-of-the-box.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                      SOC 2 Type II
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                      FFIEC Guidelines
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                      Data Encryption
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 w-4 h-4" />
                      Audit Trails
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <motion.div
          className="container mx-auto px-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          <motion.div className="text-center mb-16" variants={item}>
            <Badge variant="outline" className="mb-4 border-gray-300 text-gray-700">Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Flexible Pricing for Every Bank
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Scale with confidence. Our pricing grows with your success, not your infrastructure costs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div variants={slideInLeft}>
              <Card className="h-full border-2 border-gray-200 hover:border-black transition-colors">
                <CardHeader className="text-center pb-8">
                  <Badge variant="secondary" className="w-fit mx-auto mb-4 bg-gray-200 text-gray-800">Pilot</Badge>
                  <CardTitle className="text-2xl">MVP Package</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">$15k</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <CardDescription className="mt-2">Perfect for pilot deployments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      Basic AI analytics dashboard
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      SMS notifications
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      Compliance logging
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      Basic admin interface
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      Up to 10,000 transactions/month
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      Email support
                    </li>
                  </ul>
                  <Button className="w-full mt-8" variant="outline">
                    Start Pilot
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="h-full border-2 border-black shadow-lg relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-black text-white">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-8 pt-8">
                  <Badge variant="default" className="w-fit mx-auto mb-4 bg-black">Professional</Badge>
                  <CardTitle className="text-2xl">Full Platform</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">$45k</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <CardDescription className="mt-2">Complete banking modernization</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      Full AI analytics & insights
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      RAG AI assistant
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      SMS & voice agents
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      Enterprise compliance
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      Third-party integrations
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-gray-700 mr-3 w-4 h-4" />
                      Up to 100,000 transactions/month
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-3 w-4 h-4" />
                      Priority support & training
                    </li>
                  </ul>
                  <Button className="w-full mt-8 bg-black hover:bg-gray-800">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={slideInRight}>
              <Card className="h-full border-2 border-gray-200 hover:border-black transition-colors">
                <CardHeader className="text-center pb-8">
                  <Badge variant="secondary" className="w-fit mx-auto mb-4 bg-gray-200 text-gray-800">Enterprise</Badge>
                  <CardTitle className="text-2xl">Custom Solution</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  </div>
                  <CardDescription className="mt-2">Tailored for large institutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-3 w-4 h-4" />
                      Everything in Professional
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-3 w-4 h-4" />
                      Custom AI model training
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-3 w-4 h-4" />
                      White-label solutions
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-3 w-4 h-4" />
                      Dedicated infrastructure
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-3 w-4 h-4" />
                      Unlimited transactions
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-3 w-4 h-4" />
                      24/7 dedicated support
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="text-green-500 mr-3 w-4 h-4" />
                      SLA guarantees
                    </li>
                  </ul>
                  <Button className="w-full mt-8" variant="outline">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div className="text-center mt-12" variants={item}>
            <p className="text-gray-600 mb-4">
              All plans include SOC 2 compliance, data encryption, and API access
            </p>
            <Badge variant="outline" className="text-gray-800 border-gray-300">
              <CheckIcon className="w-3 h-3 mr-1 text-gray-700" />
              30-day money-back guarantee
            </Badge>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
  <section className="py-20 bg-gradient-to-r from-gray-900 via-black to-black text-white">
        <motion.div
          className="container mx-auto px-6 text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={container}
        >
          <motion.h2 className="text-4xl md:text-5xl font-bold mb-6" variants={item}>
            Ready to Transform Your Bank?
          </motion.h2>
          <motion.p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-gray-300" variants={item}>
            Join the next generation of banking technology. Deploy AI-powered capabilities in weeks, not years.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={item}>
            <Button
              size="lg"
              onClick={() => router.push('/demo')}
              className="px-8 py-4 bg-white text-black hover:bg-gray-100 text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-105"
            >
              Schedule Live Demo
              <TrendingUpIcon className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 bg-transparent border-2 border-white/40 text-white hover:bg-white/10 text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              Download White Paper
            </Button>
          </motion.div>
          <motion.p className="text-sm text-gray-400 mt-8" variants={item}>
            Trusted by innovative banks across the United States • SOC 2 Certified • FFIEC Compliant
          </motion.p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <motion.div
          className="container mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-black to-gray-700 rounded-xl flex items-center justify-center text-white">
                  <BuildingIcon />
                </div>
                <div>
                  <span className="font-bold text-xl">BankingOS</span>
                  <div className="text-xs text-gray-400">Plug & Play Backend</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming banking technology with AI-powered platforms designed for rapid deployment and enterprise scalability.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">SOC 2 Report</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="bg-gray-800 mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} BankingOS. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Badge variant="outline" className="border-gray-600 text-gray-300">SOC 2 Certified</Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">FFIEC Compliant</Badge>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  );
};

export default App;
