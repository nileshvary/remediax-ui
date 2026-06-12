'use client';

import React, { useState } from 'react';
import RemediAXLogo from './RemediAXLogo';
import {
  LayoutDashboard,
  Network,
  Brain,
  AlertTriangle,
  Server,
  ShieldAlert,
  BarChart3,
  Zap,
  Settings,
  Bot,
  Globe,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { icon: Globe, label: 'Overview', active: false },
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Network, label: 'Network Monitor', active: false },
  { icon: ShieldAlert, label: 'Threat Intelligence', active: false },
  { icon: Brain, label: 'AI Insights', active: false },
  { icon: AlertTriangle, label: 'Alerts', active: false, badge: 12 },
  { icon: Server, label: 'Assets', active: false },
  { icon: TrendingUp, label: 'Vulnerabilities', active: false },
  { icon: BarChart3, label: 'Reports', active: false },
  { icon: Zap, label: 'Automation', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');

  return (
    <aside
      className="flex flex-col"
      style={{
        width: '220px',
        minWidth: '220px',
        height: '100vh',
        background: 'rgba(8, 13, 28, 0.95)',
        borderRight: '1px solid rgba(0, 212, 255, 0.1)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo area */}
      <div className="px-4 py-5 border-b" style={{ borderColor: 'rgba(0, 212, 255, 0.1)' }}>
        <RemediAXLogo size="sm" showText={true} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.label;
            return (
              <li key={item.label}>
                <button
                  onClick={() => setActiveItem(item.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative"
                  style={{
                    background: isActive
                      ? 'rgba(0, 212, 255, 0.12)'
                      : 'transparent',
                    color: isActive ? '#00D4FF' : 'rgba(148, 163, 184, 0.8)',
                    borderLeft: isActive ? '2px solid #00D4FF' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 212, 255, 0.05)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148, 163, 184, 0.8)';
                    }
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: isActive ? '#00D4FF' : 'inherit', flexShrink: 0 }}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: '#FF2D55',
                        color: '#fff',
                        fontSize: '10px',
                        minWidth: '20px',
                        textAlign: 'center',
                        boxShadow: '0 0 8px rgba(255, 45, 85, 0.6)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-l"
                      style={{ background: '#00D4FF', boxShadow: '0 0 8px #00D4FF' }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* AI Security Assistant panel */}
      <div
        className="mx-3 mb-4 rounded-xl p-3"
        style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <Bot size={16} style={{ color: '#A78BFA' }} />
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{
                background: '#00FF87',
                boxShadow: '0 0 6px #00FF87',
                animation: 'blink 1.5s ease-in-out infinite',
              }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: '#A78BFA' }}>
            AI Security Assistant
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
          Monitoring active threats. 3 new anomalies detected.
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#00FF87',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }}
          />
          <span className="text-xs" style={{ color: '#00FF87' }}>Online</span>
        </div>
      </div>
    </aside>
  );
}
