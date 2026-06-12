'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Shield, Zap, Server, Database, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const trendData = [
  [60, 65, 72, 68, 74, 78, 82, 80, 86],
  [180, 195, 210, 220, 205, 230, 238, 241, 243],
  [1600, 1650, 1690, 1720, 1750, 1780, 1810, 1830, 1847],
  [1.8, 1.9, 2.0, 2.1, 2.15, 2.2, 2.3, 2.35, 2.4],
  [38, 40, 37, 35, 34, 36, 33, 34, 32],
];

const kpis = [
  {
    label: 'Security Posture',
    value: '86',
    unit: '/100',
    change: '+4.2%',
    up: true,
    icon: Shield,
    color: '#00D4FF',
    shadowColor: 'rgba(0, 212, 255, 0.2)',
  },
  {
    label: 'Threats Detected',
    value: '243',
    unit: '',
    change: '+18%',
    up: true,
    icon: Zap,
    color: '#FF8C00',
    shadowColor: 'rgba(255, 140, 0, 0.2)',
  },
  {
    label: 'Active Assets',
    value: '1,847',
    unit: '',
    change: '+12%',
    up: true,
    icon: Server,
    color: '#4DA6FF',
    shadowColor: 'rgba(77, 166, 255, 0.2)',
  },
  {
    label: 'Data Analyzed',
    value: '2.4',
    unit: 'TB',
    change: '+28%',
    up: true,
    icon: Database,
    color: '#00FF87',
    shadowColor: 'rgba(0, 255, 135, 0.2)',
  },
  {
    label: 'Incidents Responded',
    value: '32',
    unit: '',
    change: '-5%',
    up: false,
    icon: Activity,
    color: '#FF2D55',
    shadowColor: 'rgba(255, 45, 85, 0.2)',
  },
];

export default function KPICards() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="grid grid-cols-5 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        const data = trendData[i].map((v, j) => ({ v }));
        return (
          <div
            key={kpi.label}
            className="glass-card p-4 flex flex-col gap-3 transition-all duration-500 cursor-default group hover:scale-[1.02]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: `${i * 80}ms`,
              boxShadow: `0 0 20px ${kpi.shadowColor}`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                  {kpi.label}
                </p>
                <div className="flex items-end gap-1">
                  <span
                    className="text-2xl font-bold leading-none"
                    style={{ color: '#E2E8F0' }}
                  >
                    {kpi.value}
                  </span>
                  {kpi.unit && (
                    <span className="text-sm font-medium mb-0.5" style={{ color: kpi.color }}>
                      {kpi.unit}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{
                  background: `${kpi.color}18`,
                  border: `1px solid ${kpi.color}30`,
                }}
              >
                <Icon size={16} style={{ color: kpi.color }} />
              </div>
            </div>

            {/* Trend sparkline */}
            <div style={{ height: 36 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={kpi.color}
                    strokeWidth={1.5}
                    dot={false}
                    strokeOpacity={0.8}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Change badge */}
            <div className="flex items-center gap-1.5">
              {kpi.up ? (
                <TrendingUp size={12} style={{ color: kpi.up ? '#00FF87' : '#FF2D55' }} />
              ) : (
                <TrendingDown size={12} style={{ color: '#FF2D55' }} />
              )}
              <span
                className="text-xs font-semibold"
                style={{ color: kpi.up ? '#00FF87' : '#FF2D55' }}
              >
                {kpi.change}
              </span>
              <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.5)' }}>
                vs last week
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
