'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const data = [
  { name: 'Malware', value: 32, color: '#FF2D55' },
  { name: 'Phishing', value: 25, color: '#FF8C00' },
  { name: 'DDoS', value: 16, color: '#00D4FF' },
  { name: 'Exploits', value: 15, color: '#4DA6FF' },
  { name: 'Other', value: 12, color: '#8B5CF6' },
];

const RADIAN = Math.PI / 180;

function CustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name,
}: any) {
  if (percent < 0.08) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: 'rgba(8,13,28,0.95)',
        border: `1px solid ${entry.payload.color}40`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
      }}
    >
      <p className="font-semibold" style={{ color: entry.payload.color }}>{entry.name}</p>
      <p style={{ color: '#E2E8F0' }}>{entry.value}% ({Math.round(243 * entry.value / 100)} threats)</p>
    </div>
  );
}

export default function ThreatLandscape() {
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Threat Landscape</h3>
        <span className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>243 total</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div style={{ width: 140, height: 140, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={62}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={CustomLabel}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={0}
                    style={{
                      filter: `drop-shadow(0 0 6px ${entry.color}80)`,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                />
                <span className="text-xs" style={{ color: 'rgba(148,163,184,0.8)' }}>{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${item.value * 1.5}px`,
                    background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                    maxWidth: 60,
                  }}
                />
                <span className="text-xs font-semibold w-8 text-right" style={{ color: item.color }}>
                  {item.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex gap-3">
          <div>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>High Risk</p>
            <p className="text-sm font-bold" style={{ color: '#FF2D55' }}>78</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Medium</p>
            <p className="text-sm font-bold" style={{ color: '#FF8C00' }}>101</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Low</p>
            <p className="text-sm font-bold" style={{ color: '#00D4FF' }}>64</p>
          </div>
        </div>
        <button
          className="text-xs px-2.5 py-1.5 rounded-lg"
          style={{
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: '#00D4FF',
          }}
        >
          Full Report
        </button>
      </div>
    </div>
  );
}
