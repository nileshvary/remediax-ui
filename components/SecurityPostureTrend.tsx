'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const data = [
  { day: 'Mon', score: 74, target: 80 },
  { day: 'Tue', score: 76, target: 80 },
  { day: 'Wed', score: 72, target: 80 },
  { day: 'Thu', score: 79, target: 80 },
  { day: 'Fri', score: 81, target: 80 },
  { day: 'Sat', score: 83, target: 80 },
  { day: 'Sun', score: 86, target: 80 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: 'rgba(8,13,28,0.95)',
        border: '1px solid rgba(0,212,255,0.2)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <p className="font-semibold mb-1" style={{ color: '#94A3B8' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}/100
        </p>
      ))}
    </div>
  );
}

export default function SecurityPostureTrend() {
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Security Posture Trend</h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>Weekly score progression</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: '#00FF87' }}>86</p>
          <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Current</p>
        </div>
      </div>

      <div style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF87" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00FF87" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="day"
              tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[60, 100]}
              tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={80}
              stroke="rgba(255,140,0,0.5)"
              strokeDasharray="4 4"
              label={{ value: 'Target', fill: '#FF8C00', fontSize: 9, position: 'right' }}
            />
            <Area
              type="monotone"
              dataKey="score"
              name="Score"
              stroke="#00FF87"
              strokeWidth={2}
              fill="url(#scoreGrad)"
              dot={{ fill: '#00FF87', r: 3, strokeWidth: 0 }}
              activeDot={{ fill: '#00FF87', r: 5, strokeWidth: 2, stroke: 'rgba(0,255,135,0.3)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#00FF87' }} />
          Security Score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#FF8C00' }} />
          Target (80)
        </span>
        <span style={{ color: '#00FF87' }}>+12pts this week</span>
      </div>
    </div>
  );
}
