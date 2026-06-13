'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from '../components/ErrorBoundary';
import { Calendar, RefreshCw } from 'lucide-react';

// Every component is lazy-loaded via dynamic().
// If any single module fails to load, only that panel shows an error — the page never goes blank.
const ParticleBackground  = dynamic(() => import('../components/ParticleBackground'),  { ssr: false, loading: () => null });
const Sidebar             = dynamic(() => import('../components/Sidebar'),             { ssr: false, loading: () => null });
const TopBar              = dynamic(() => import('../components/TopBar'),              { ssr: false, loading: () => null });
const KPICards            = dynamic(() => import('../components/KPICards'),            { ssr: false, loading: () => null });
const AgentPipeline       = dynamic(() => import('../components/AgentPipeline'),       { ssr: false, loading: () => null });
const AlertsFeed          = dynamic(() => import('../components/AlertsFeed'),          { ssr: false, loading: () => null });
const ThreatLandscape     = dynamic(() => import('../components/ThreatLandscape'),     { ssr: false, loading: () => null });
const AIInsights          = dynamic(() => import('../components/AIInsights'),          { ssr: false, loading: () => null });
const TopAttackedAssets   = dynamic(() => import('../components/TopAttackedAssets'),   { ssr: false, loading: () => null });
const TrafficOverview     = dynamic(() => import('../components/TrafficOverview'),     { ssr: false, loading: () => null });
const SecurityPostureTrend= dynamic(() => import('../components/SecurityPostureTrend'),{ ssr: false, loading: () => null });
const ConfigTab           = dynamic(() => import('../components/ConfigTab'),           { ssr: false, loading: () => null });

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="text-4xl">🚧</div>
      <h2 className="text-lg font-semibold" style={{ color: '#E2E8F0' }}>{label}</h2>
      <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>Coming next — being built step by step.</p>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const TAB_TITLES: Record<string, { heading: string; sub: string }> = {
    Dashboard:      { heading: 'AI Threat Intelligence Center', sub: 'Autonomous LLM security detection & real-time remediation (Human-in-the-loop)' },
    Scan:           { heading: 'Scan',          sub: 'Trigger Agent 1 — run Garak + PyRIT probes against your LLM target' },
    Guardrails:     { heading: 'Guardrails',    sub: 'Human-in-the-loop patch approval — review and apply remediation results' },
    Reports:        { heading: 'Reports',       sub: 'Agent 3 output — HTML security report + PDF download' },
    Benchmark:      { heading: 'Benchmark',     sub: 'Agent 4 verification — before/after improvement % and CI gate' },
    'CVE Watcher':  { heading: 'CVE Watcher',   sub: 'Agent 6 — live CVE feed from NVD API + MITRE ATLAS' },
    Pipeline:       { heading: 'Pipeline',      sub: 'Live 6-agent topology — Scanner → Remediator → Reporter → Verifier → Orchestrator → CVE Watcher' },
    Config:         { heading: 'Config',        sub: 'Set your scan target, API keys, and scanner settings' },
    Settings:       { heading: 'Settings',      sub: 'Application preferences' },
  };

  const title = TAB_TITLES[activeTab] ?? TAB_TITLES['Dashboard'];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0F1E', position: 'relative' }}>
      <ParticleBackground />

      {/* Sidebar — its own boundary so a sidebar crash never kills main content */}
      <ErrorBoundary label="Sidebar">
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </ErrorBoundary>

      {/* Right column — top-level boundary so even a catastrophic crash shows an error, never blank */}
      <ErrorBoundary label="Main Content">
        <div className="flex-1 flex flex-col overflow-hidden" style={{ position: 'relative', zIndex: 10 }}>
          <ErrorBoundary label="TopBar">
            <TopBar />
          </ErrorBoundary>

          <main className="flex-1 overflow-y-auto p-5 space-y-5" style={{ background: 'transparent' }}>
            {/* Title bar — pure static JSX, no boundary needed */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#E2E8F0' }}>{title.heading}</h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>{title.sub}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.7)' }}>
                  <Calendar size={12} />
                  <span>Last 24 hours</span>
                </div>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
                  <RefreshCw size={12} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Dashboard — each panel independently lazy-loaded + boundary-wrapped */}
            {activeTab === 'Dashboard' && (
              <>
                <ErrorBoundary label="KPI Cards"><KPICards /></ErrorBoundary>
                <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 320px' }}>
                  <ErrorBoundary label="Agent Pipeline"><AgentPipeline /></ErrorBoundary>
                  <ErrorBoundary label="Alerts Feed"><AlertsFeed /></ErrorBoundary>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <ErrorBoundary label="Threat Landscape"><ThreatLandscape /></ErrorBoundary>
                  <ErrorBoundary label="AI Insights"><AIInsights /></ErrorBoundary>
                  <ErrorBoundary label="Top Attack Vectors"><TopAttackedAssets /></ErrorBoundary>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <ErrorBoundary label="Probe Activity"><TrafficOverview /></ErrorBoundary>
                  <ErrorBoundary label="Security Posture Trend"><SecurityPostureTrend /></ErrorBoundary>
                </div>
              </>
            )}

            {activeTab === 'Pipeline'    && <ErrorBoundary label="Pipeline"><AgentPipeline /></ErrorBoundary>}
            {activeTab === 'Config'      && <ErrorBoundary label="Config"><ConfigTab /></ErrorBoundary>}
            {activeTab === 'Scan'        && <PlaceholderTab label="Scan" />}
            {activeTab === 'Guardrails'  && <PlaceholderTab label="Guardrails" />}
            {activeTab === 'Reports'     && <PlaceholderTab label="Reports" />}
            {activeTab === 'Benchmark'   && <PlaceholderTab label="Benchmark" />}
            {activeTab === 'CVE Watcher' && <PlaceholderTab label="CVE Watcher" />}
            {activeTab === 'Settings'    && <PlaceholderTab label="Settings" />}
          </main>
        </div>
      </ErrorBoundary>
    </div>
  );
}
