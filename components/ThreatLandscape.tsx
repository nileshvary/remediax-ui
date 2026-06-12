'use client';

import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface FindingItem {
  owasp_llm_category?: string;
  owasp_agentic_categories?: string[];
  severity?: string;
}

interface OWASPEntry {
  name: string;
  color: string;
  icon: string;
}

interface ChartItem {
  name: string;
  code: string;
  value: number;
  color: string;
  count: number;
}

const RADIAN = Math.PI / 180;

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.07) return null;
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
      <p className="font-semibold" style={{ color: entry.payload.color }}>{entry.payload.code}</p>
      <p style={{ color: '#CBD5E1', marginTop: 2 }}>{entry.name}</p>
      <p style={{ color: '#E2E8F0', marginTop: 2 }}>
        {entry.value}% ({entry.payload.count} findings)
      </p>
    </div>
  );
}

export default function ThreatLandscape() {
  const [data, setData] = useState<ChartItem[]>([]);
  const [view, setView] = useState<'llm' | 'asi'>('llm');
  const [total, setTotal] = useState(0);
  const [severityCounts, setSeverityCounts] = useState({ high: 0, medium: 0, low: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [fRes, oRes] = await Promise.all([
          fetch(`${API}/api/findings`),
          fetch(`${API}/api/owasp`),
        ]);
        const findings: FindingItem[] = await fRes.json();
        const owasp: { llm: Record<string, OWASPEntry>; asi: Record<string, OWASPEntry> } = await oRes.json();

        setTotal(findings.length);

        // Severity counts
        const sev = { high: 0, medium: 0, low: 0 };
        for (const f of findings) {
          const s = (f.severity || '').toUpperCase();
          if (s === 'CRITICAL' || s === 'HIGH') sev.high++;
          else if (s === 'MEDIUM') sev.medium++;
          else sev.low++;
        }
        setSeverityCounts(sev);

        // LLM distribution
        const llmCounts: Record<string, number> = {};
        for (const f of findings) {
          const cat = f.owasp_llm_category;
          if (cat) llmCounts[cat] = (llmCounts[cat] || 0) + 1;
        }

        // ASI distribution
        const asiCounts: Record<string, number> = {};
        for (const f of findings) {
          for (const a of f.owasp_agentic_categories || []) {
            asiCounts[a] = (asiCounts[a] || 0) + 1;
          }
        }

        const toChartData = (counts: Record<string, number>, meta: Record<string, OWASPEntry>): ChartItem[] => {
          const totalCount = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
          return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([code, count]) => ({
              code,
              name: meta[code]?.name || code,
              color: meta[code]?.color || '#94A3B8',
              value: Math.round((count / totalCount) * 100),
              count,
            }));
        };

        const llmData = toChartData(llmCounts, owasp.llm);
        const asiData = toChartData(asiCounts, owasp.asi);

        setData(view === 'llm' ? llmData : asiData);

        // Store both for toggle
        (window as any).__rxLLM = llmData;
        (window as any).__rxASI = asiData;
      } catch {
        // API not running — show empty state
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleView(v: 'llm' | 'asi') {
    setView(v);
    setData(v === 'llm' ? (window as any).__rxLLM || [] : (window as any).__rxASI || []);
  }

  const displayData = data.length > 0 ? data : [];

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Threat Landscape</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs mr-1" style={{ color: 'rgba(148,163,184,0.5)' }}>{total} findings</span>
          {(['llm', 'asi'] as const).map((v) => (
            <button
              key={v}
              onClick={() => toggleView(v)}
              className="text-xs px-2 py-0.5 rounded transition-all"
              style={{
                background: view === v ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: view === v ? '#00D4FF' : 'rgba(148,163,184,0.5)',
                border: view === v ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                fontSize: '10px',
              }}
            >
              {v === 'llm' ? 'OWASP LLM' : 'ASI Agentic'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div style={{ width: 140, height: 140, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
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
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={0}
                    style={{ filter: `drop-shadow(0 0 6px ${entry.color}80)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend — top 5 */}
        <div className="flex-1 space-y-2">
          {displayData.slice(0, 5).map((item) => (
            <div key={item.code} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                />
                <span className="text-xs" style={{ color: 'rgba(148,163,184,0.8)' }}>
                  {item.code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${Math.min(item.value * 1.5, 60)}px`,
                    background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
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
            <p className="text-sm font-bold" style={{ color: '#FF2D55' }}>{severityCounts.high}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Medium</p>
            <p className="text-sm font-bold" style={{ color: '#FF8C00' }}>{severityCounts.medium}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Low</p>
            <p className="text-sm font-bold" style={{ color: '#00D4FF' }}>{severityCounts.low}</p>
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
