"use client";

import { motion } from "framer-motion";

export const BankingPlatformDiagram = () => {
  return (
    <div className="relative max-w-6xl mx-auto">
      <svg 
        className="w-full h-auto" 
        viewBox="0 0 1000 800" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bankGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="platformGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="featureGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#6B7280" />
          </marker>
        </defs>

        {/* Background */}
        <rect width="1000" height="800" fill="#F8FAFC" />

        {/* Legacy Bank System */}
        <motion.g
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <rect x="50" y="300" width="200" height="200" rx="10" fill="url(#bankGradient)" />
          <text x="150" y="340" textAnchor="middle" fill="white" fontSize="18" fontWeight="600">
            Legacy Bank
          </text>
          <text x="150" y="365" textAnchor="middle" fill="white" fontSize="14">
            Core System
          </text>
          
          {/* Legacy features */}
          <rect x="70" y="390" width="160" height="25" rx="5" fill="rgba(255,255,255,0.2)" />
          <text x="150" y="407" textAnchor="middle" fill="white" fontSize="11">
            Basic Banking Operations
          </text>
          
          <rect x="70" y="425" width="160" height="25" rx="5" fill="rgba(255,255,255,0.2)" />
          <text x="150" y="442" textAnchor="middle" fill="white" fontSize="11">
            Manual Processes
          </text>
          
          <rect x="70" y="460" width="160" height="25" rx="5" fill="rgba(255,255,255,0.2)" />
          <text x="150" y="477" textAnchor="middle" fill="white" fontSize="11">
            Limited Analytics
          </text>
        </motion.g>

        {/* API Connection */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <path d="M250 400 L350 400" stroke="#6B7280" strokeWidth="3" markerEnd="url(#arrow)" strokeDasharray="5,5" />
          <text x="300" y="390" textAnchor="middle" fill="#6B7280" fontSize="12" fontWeight="600">
            Secure API
          </text>
          <text x="300" y="420" textAnchor="middle" fill="#6B7280" fontSize="10">
            Integration
          </text>
        </motion.g>

        {/* Our Platform */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <rect x="380" y="200" width="240" height="400" rx="15" fill="url(#platformGradient)" />
          <text x="500" y="235" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">
            Banking Platform
          </text>
          <text x="500" y="255" textAnchor="middle" fill="white" fontSize="14">
            Plug & Play Backend
          </text>
          
          {/* Platform Features */}
          <g>
            {/* AI Analytics */}
            <rect x="400" y="280" width="200" height="50" rx="8" fill="rgba(255,255,255,0.15)" />
            <circle cx="420" cy="300" r="8" fill="#FCD34D" />
            <text x="440" y="300" fill="white" fontSize="13" fontWeight="600">AI Analytics</text>
            <text x="440" y="318" fill="white" fontSize="10">Real-time insights & predictions</text>
            
            {/* RAG Assistant */}
            <rect x="400" y="345" width="200" height="50" rx="8" fill="rgba(255,255,255,0.15)" />
            <circle cx="420" cy="365" r="8" fill="#34D399" />
            <text x="440" y="365" fill="white" fontSize="13" fontWeight="600">RAG AI Assistant</text>
            <text x="440" y="383" fill="white" fontSize="10">Intelligent customer support</text>
            
            {/* Communications */}
            <rect x="400" y="410" width="200" height="50" rx="8" fill="rgba(255,255,255,0.15)" />
            <circle cx="420" cy="430" r="8" fill="#F87171" />
            <text x="440" y="430" fill="white" fontSize="13" fontWeight="600">SMS & Voice</text>
            <text x="440" y="448" fill="white" fontSize="10">Automated communications</text>
            
            {/* Compliance */}
            <rect x="400" y="475" width="200" height="50" rx="8" fill="rgba(255,255,255,0.15)" />
            <circle cx="420" cy="495" r="8" fill="#A78BFA" />
            <text x="440" y="495" fill="white" fontSize="13" fontWeight="600">Compliance Suite</text>
            <text x="440" y="513" fill="white" fontSize="10">SOC 2 certified security</text>
            
            {/* Multi-tenant */}
            <rect x="400" y="540" width="200" height="40" rx="8" fill="rgba(255,255,255,0.15)" />
            <circle cx="420" cy="555" r="8" fill="#60A5FA" />
            <text x="440" y="555" fill="white" fontSize="13" fontWeight="600">Multi-Tenant</text>
            <text x="440" y="573" fill="white" fontSize="10">Secure data isolation</text>
          </g>
        </motion.g>

        {/* Enhanced Bank Output */}
        <motion.g
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <rect x="700" y="250" width="220" height="300" rx="10" fill="url(#featureGradient)" />
          <text x="810" y="285" textAnchor="middle" fill="white" fontSize="18" fontWeight="600">
            Enhanced Bank
          </text>
          <text x="810" y="305" textAnchor="middle" fill="white" fontSize="14">
            Modern Capabilities
          </text>
          
          {/* Enhanced features */}
          <rect x="720" y="330" width="180" height="30" rx="5" fill="rgba(255,255,255,0.2)" />
          <text x="810" y="350" textAnchor="middle" fill="white" fontSize="12">
            🤖 AI-Powered Insights
          </text>
          
          <rect x="720" y="370" width="180" height="30" rx="5" fill="rgba(255,255,255,0.2)" />
          <text x="810" y="390" textAnchor="middle" fill="white" fontSize="12">
            📱 Smart Communications
          </text>
          
          <rect x="720" y="410" width="180" height="30" rx="5" fill="rgba(255,255,255,0.2)" />
          <text x="810" y="430" textAnchor="middle" fill="white" fontSize="12">
            ⚡ Real-time Analytics
          </text>
          
          <rect x="720" y="450" width="180" height="30" rx="5" fill="rgba(255,255,255,0.2)" />
          <text x="810" y="470" textAnchor="middle" fill="white" fontSize="12">
            🛡️ Full Compliance
          </text>
          
          <rect x="720" y="490" width="180" height="30" rx="5" fill="rgba(255,255,255,0.2)" />
          <text x="810" y="510" textAnchor="middle" fill="white" fontSize="12">
            🚀 Faster Innovation
          </text>
        </motion.g>

        {/* Output Connection */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <path d="M620 400 L700 400" stroke="#6B7280" strokeWidth="3" markerEnd="url(#arrow)" />
          <text x="660" y="390" textAnchor="middle" fill="#6B7280" fontSize="12" fontWeight="600">
            Instant
          </text>
          <text x="660" y="420" textAnchor="middle" fill="#6B7280" fontSize="10">
            Upgrade
          </text>
        </motion.g>

        {/* Timeline */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <text x="500" y="680" textAnchor="middle" fill="#374151" fontSize="16" fontWeight="600">
            Deployment Timeline
          </text>
          
          {/* Timeline bar */}
          <rect x="300" y="700" width="400" height="4" rx="2" fill="#E5E7EB" />
          <rect x="300" y="700" width="100" height="4" rx="2" fill="#3B82F6" />
          
          <text x="300" y="725" textAnchor="start" fill="#374151" fontSize="12">
            Weeks not Years
          </text>
          <text x="700" y="725" textAnchor="end" fill="#374151" fontSize="12">
            Traditional Deployment
          </text>
          
          <circle cx="350" r="6" cy="702" fill="#3B82F6" />
          <text x="350" y="745" textAnchor="middle" fill="#3B82F6" fontSize="11" fontWeight="600">
            Our Platform: 2-4 weeks
          </text>
        </motion.g>

        {/* Performance Metrics */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.8 }}
        >
          <rect x="50" y="100" width="900" height="80" rx="10" fill="rgba(59, 130, 246, 0.05)" stroke="#3B82F6" strokeWidth="1" />
          
          <text x="500" y="125" textAnchor="middle" fill="#1E40AF" fontSize="16" fontWeight="700">
            Platform Impact Metrics
          </text>
          
          <g>
            <text x="150" y="150" textAnchor="middle" fill="#059669" fontSize="20" fontWeight="700">90%</text>
            <text x="150" y="165" textAnchor="middle" fill="#374151" fontSize="11">Faster Deployment</text>
            
            <text x="350" y="150" textAnchor="middle" fill="#059669" fontSize="20" fontWeight="700">75%</text>
            <text x="350" y="165" textAnchor="middle" fill="#374151" fontSize="11">Cost Reduction</text>
            
            <text x="550" y="150" textAnchor="middle" fill="#059669" fontSize="20" fontWeight="700">3x</text>
            <text x="550" y="165" textAnchor="middle" fill="#374151" fontSize="11">Customer Engagement</text>
            
            <text x="750" y="150" textAnchor="middle" fill="#059669" fontSize="20" fontWeight="700">100%</text>
            <text x="750" y="165" textAnchor="middle" fill="#374151" fontSize="11">Compliance Ready</text>
          </g>
        </motion.g>
      </svg>
    </div>
  );
};
