'use client';

import React from 'react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import KPICards from '../components/KPICards';
import AgentPipeline from '../components/AgentPipeline';
import AlertsFeed from '../components/AlertsFeed';
import ThreatLandscape from '../components/ThreatLandscape';
import AIInsights from '../components/AIInsights';
import TopAttackedAssets from '../components/TopAttackedAssets';
import TrafficOverview from '../components/TrafficOverview';
import SecurityPostureTrend from '../components/SecurityPostureTrend';
import { Calendar, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0A0F1E' }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar />

        {/* Scrollable content */}
        <main
          className="flex-1 overflow-y-auto p-5 space-y-5"
          style={{ background: '#0A0F1E' }}
        >
          {/* Page title bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#E2E8F0' }}>
                Security Operations Center
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>
                Real-time threat monitoring &amp; AI-powered analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(148,163,184,0.7)',
                }}
              >
                <Calendar size={12} />
                <span>Last 24 hours</span>
              </div>
              <button
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.2)',
                  color: '#00D4FF',
                }}
              >
                <RefreshCw size={12} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* KPI Cards row */}
          <KPICards />

          {/* Middle row: Network + Alerts */}
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 320px' }}>
            <AgentPipeline />
            <AlertsFeed />
          </div>

          {/* Bottom row: Threat Landscape + AI Insights + Top Attacked Assets */}
          <div className="grid grid-cols-3 gap-5">
            <ThreatLandscape />
            <AIInsights />
            <TopAttackedAssets />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-5">
            <TrafficOverview />
            <SecurityPostureTrend />
          </div>
        </main>
      </div>
    </div>
  );
}
