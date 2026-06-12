'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface ProbeRow { category: string; probes: number; attacks: number; }

const FALLBACK: ProbeRow[] = [
  { category: 'LLM01', probes: 0, attacks: 0 },
  { category: 'LLM02', probes: 0, attacks: 0 },
  { category: 'LLM05', probes: 0, attacks: 0 },
  { category: 'LLM06', probes: 0, attacks: 0 },
  { category: 'LLM07', probes: 0, attacks: 0 },
  { category: 'LLM08', probes: 0, attacks: 0 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs"
      style={{ background: 'rgba(8,13,28,0.95)', border: '1px solid rgba(0,212,255,0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
      <p className="font-semibold mb-1" style={{ color: '#94A3B8' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function TrafficOverview() {
  const [data, setData] = useState<ProbeRow[]>(FALLBACK);

  useEffect(() => {
    fetch(`${API}/api/findings`)
      .then(r => r.json())
      .then((findings: any[]) => {
        if (!Array.isArray(findings) || findings.length === 0) return;
        const map: Record<string, { probes: number; attacks: number }> = {};
        for (const f of findings) {
          const cat = f.owasp_llm_category || 'Other';
          if (!map[cat]) map[cat] = { probes: 0, attacks: 0 };
          map[cat].probes += 1;
          if (f.is_successful_attack) map[cat].attacks += 1;
        }
        setData(
          Object.entries(map)
            .sort((a, b) => b[1].attacks - a[1].attacks)
            .slice(0, 8)
            .map(([category, v]) => ({ category, ...v }))
        );
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div className="glass-card p-4 flex flex-col gap-3"
      style={{ animation: 'fade-in-up 0.5s ease-out 0.15s both' }}
      whileHover={{ boxShadow: '0 0 0 1px rgba(0,212,255,0.2), 0 8px 32px rgba(0,212,255,0.07)', transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Probe Activity</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#00D4FF' }} />
            <span style={{ color: 'rgba(148,163,184,0.7)' }}>Probes Run</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#4DA6FF' }} />
            <span style={{ color: 'rgba(148,163,184,0.7)' }}>Attacks Found</span>
          </span>
        </div>
      </div>

      <div style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="probesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="attacksGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4DA6FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4DA6FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="category" tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="probes" name="Probes Run" stroke="#00D4FF" strokeWidth={1.5} fill="url(#probesGrad)" />
            <Area type="monotone" dataKey="attacks" name="Attacks Found" stroke="#4DA6FF" strokeWidth={1.5} fill="url(#attacksGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
