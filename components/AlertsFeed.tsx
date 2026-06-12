'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, ChevronRight, Filter } from 'lucide-react';

const initialAlerts = [
  { id: 1, title: 'Malicious IP Detected', severity: 'High', time: '2m ago', src: '192.168.1.45', type: 'Threat Detection' },
  { id: 2, title: 'Brute Force Attack', severity: 'Medium', time: '5m ago', src: '10.0.0.23', type: 'Authentication' },
  { id: 3, title: 'Unusual Data Transfer', severity: 'Medium', time: '10m ago', src: '172.16.0.8', type: 'Data Exfil' },
  { id: 4, title: 'Possible DDoS Activity', severity: 'High', time: '15m ago', src: 'Multiple', type: 'Availability' },
  { id: 5, title: 'Vulnerability Exploit', severity: 'High', time: '18m ago', src: '203.0.113.7', type: 'Exploit' },
  { id: 6, title: 'Suspicious Login Attempt', severity: 'Medium', time: '22m ago', src: '198.51.100.3', type: 'Authentication' },
  { id: 7, title: 'Port Scan Detected', severity: 'Low', time: '30m ago', src: '10.0.1.100', type: 'Recon' },
];

const SEV_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  High: { color: '#FF2D55', bg: 'rgba(255,45,85,0.1)', border: 'rgba(255,45,85,0.3)', icon: AlertTriangle },
  Medium: { color: '#FF8C00', bg: 'rgba(255,140,0,0.1)', border: 'rgba(255,140,0,0.3)', icon: AlertCircle },
  Low: { color: '#00D4FF', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)', icon: AlertCircle },
};

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const filtered = filter === 'All' ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className="glass-card p-4 flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} style={{ color: '#FF2D55' }} />
          <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Recent Alerts</h3>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: '#FF2D55', color: '#fff', fontSize: '10px', boxShadow: '0 0 8px rgba(255,45,85,0.5)' }}
          >
            {alerts.filter(a => a.severity === 'High').length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(['All', 'High', 'Medium', 'Low'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-2 py-0.5 rounded transition-all"
              style={{
                background: filter === f ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: filter === f ? '#00D4FF' : 'rgba(148,163,184,0.5)',
                border: filter === f ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                fontSize: '10px',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-2" style={{ maxHeight: 340 }}>
        {filtered.map((alert, i) => {
          const cfg = SEV_CONFIG[alert.severity];
          const Icon = cfg.icon;
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                animation: `alert-slide 0.4s ease-out ${i * 60}ms both`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = cfg.bg.replace('0.1', '0.18');
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = cfg.bg;
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}
              >
                <Icon size={13} style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium truncate" style={{ color: '#E2E8F0' }}>
                    {alert.title}
                  </p>
                  <ChevronRight size={12} style={{ color: 'rgba(148,163,184,0.3)', flexShrink: 0 }} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: `${cfg.color}18`, color: cfg.color, fontSize: '10px' }}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(148,163,184,0.5)', fontSize: '10px' }}>
                    {alert.type}
                  </span>
                  <span className="text-xs ml-auto" style={{ color: 'rgba(148,163,184,0.4)', fontSize: '10px' }}>
                    {alert.time}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)', fontSize: '10px' }}>
                  Source: {alert.src}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <button
        className="w-full py-2 text-xs font-medium rounded-lg transition-colors"
        style={{
          background: 'rgba(0,212,255,0.06)',
          border: '1px solid rgba(0,212,255,0.15)',
          color: '#00D4FF',
        }}
      >
        View All Alerts
      </button>
    </div>
  );
}
