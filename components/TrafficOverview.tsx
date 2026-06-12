'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const hours = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'];

const data = [
  { time: '00:00', inbound: 4.2, outbound: 6.1 },
  { time: '02:00', inbound: 3.1, outbound: 4.8 },
  { time: '04:00', inbound: 2.4, outbound: 3.9 },
  { time: '06:00', inbound: 5.8, outbound: 7.2 },
  { time: '08:00', inbound: 9.4, outbound: 11.8 },
  { time: '10:00', inbound: 11.2, outbound: 14.3 },
  { time: '12:00', inbound: 10.8, outbound: 13.1 },
  { time: '14:00', inbound: 12.4, outbound: 15.6 },
  { time: '16:00', inbound: 13.1, outbound: 16.2 },
  { time: '18:00', inbound: 11.6, outbound: 14.8 },
  { time: '20:00', inbound: 9.2, outbound: 12.1 },
  { time: '22:00', inbound: 8.4, outbound: 12.7 },
  { time: '24:00', inbound: 7.1, outbound: 10.9 },
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
          {p.name}: {p.value} Gbps
        </p>
      ))}
    </div>
  );
}

export default function TrafficOverview() {
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Traffic Overview (24h)</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#00D4FF' }} />
            <span style={{ color: 'rgba(148,163,184,0.7)' }}>Inbound</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#4DA6FF' }} />
            <span style={{ color: 'rgba(148,163,184,0.7)' }}>Outbound</span>
          </span>
        </div>
      </div>

      <div style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4DA6FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4DA6FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}G`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="inbound"
              name="Inbound"
              stroke="#00D4FF"
              strokeWidth={1.5}
              fill="url(#inboundGrad)"
            />
            <Area
              type="monotone"
              dataKey="outbound"
              name="Outbound"
              stroke="#4DA6FF"
              strokeWidth={1.5}
              fill="url(#outboundGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
