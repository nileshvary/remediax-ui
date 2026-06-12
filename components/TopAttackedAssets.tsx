'use client';

import React, { useEffect, useState } from 'react';
import { Server, Database, Globe, Mail, Cpu, ArrowRight } from 'lucide-react';

const assets = [
  { name: 'Web Server 01', type: 'Web Server', percent: 42, attacks: 102, icon: Globe, color: '#FF2D55' },
  { name: 'Database Server', type: 'Database', percent: 28, attacks: 68, icon: Database, color: '#FF8C00' },
  { name: 'API Gateway', type: 'API', percent: 18, attacks: 44, icon: Cpu, color: '#00D4FF' },
  { name: 'Mail Server', type: 'Email', percent: 12, attacks: 29, icon: Mail, color: '#4DA6FF' },
];

export default function TopAttackedAssets() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server size={14} style={{ color: '#00D4FF' }} />
          <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Top Attacked Assets</h3>
        </div>
        <span className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Last 24h</span>
      </div>

      <div className="space-y-3">
        {assets.map((asset, i) => {
          const Icon = asset.icon;
          return (
            <div
              key={asset.name}
              className="group cursor-pointer"
              style={{
                animation: `fade-in-up 0.5s ease-out ${i * 80}ms both`,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: `${asset.color}15`, border: `1px solid ${asset.color}30` }}
                  >
                    <Icon size={12} style={{ color: asset.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#E2E8F0' }}>{asset.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)', fontSize: '10px' }}>
                      {asset.type} • {asset.attacks} attacks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color: asset.color }}>
                    {asset.percent}%
                  </span>
                  <ArrowRight size={10} style={{ color: 'rgba(148,163,184,0.3)' }} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: loaded ? `${asset.percent}%` : '0%',
                    background: `linear-gradient(90deg, ${asset.color}80, ${asset.color})`,
                    boxShadow: `0 0 8px ${asset.color}60`,
                    transitionDelay: `${i * 100 + 200}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="pt-2 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>243 total attack vectors tracked</p>
        <button
          className="text-xs font-medium"
          style={{ color: '#00D4FF' }}
        >
          Manage Assets →
        </button>
      </div>
    </div>
  );
}
