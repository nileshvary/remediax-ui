'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Shield, Zap, Server, Database, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface ScoreResponse {
  score: number; label: string; color: string;
  finding_count: number; critical: number; high: number; medium: number; low: number;
}

interface KpiState {
  label: string; value: string; numericValue: number; unit: string;
  change: string; up: boolean; icon: React.ElementType;
  color: string; shadowColor: string; trend: { v: number }[];
}

const DEFAULT_KPIS: KpiState[] = [
  { label: 'Security Posture',  value: '—', numericValue: 0,  unit: '/100', change: '—',            up: true,  icon: Shield,    color: '#00D4FF', shadowColor: 'rgba(0,212,255,0.18)',   trend: Array.from({length:9},(_,i)=>({v:50+i*4})) },
  { label: 'Threats Detected',  value: '—', numericValue: 0,  unit: '',     change: '—',            up: false, icon: Zap,       color: '#FF8C00', shadowColor: 'rgba(255,140,0,0.18)',   trend: Array.from({length:9},(_,i)=>({v:10+i*3})) },
  { label: 'OWASP Categories',  value: '20',numericValue: 20, unit: '',     change: 'LLM + ASI',    up: true,  icon: Server,    color: '#4DA6FF', shadowColor: 'rgba(77,166,255,0.18)',  trend: Array.from({length:9},(_,i)=>({v:10+i*1.5})) },
  { label: 'Critical Findings', value: '—', numericValue: 0,  unit: '',     change: '—',            up: false, icon: Database,  color: '#EF4444', shadowColor: 'rgba(239,68,68,0.18)',   trend: Array.from({length:9},(_,i)=>({v:5+i*2})) },
  { label: 'Guardrails Active', value: '—', numericValue: 0,  unit: '',     change: 'Auto-generated',up: true, icon: Activity,  color: '#00FF87', shadowColor: 'rgba(0,255,135,0.18)',  trend: Array.from({length:9},(_,i)=>({v:2+i*0.5})) },
];

// ─── Animated counter (pure React, no framer-motion utility) ──────────────────
function Counter({ target, suffix }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);
  const start = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setDisplay(0); return; }
    start.current = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const t = Math.min((now - start.current) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(ease * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return (
    <span className="text-2xl font-bold leading-none tabular-nums" style={{ color: '#E2E8F0' }}>
      {target === 0 ? '—' : display}{suffix}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function KPICards() {
  const [kpis, setKpis] = useState<KpiState[]>(DEFAULT_KPIS);

  useEffect(() => {
    async function load() {
      try {
        const [scoreRes, guardrailRes] = await Promise.all([
          fetch(`${API}/api/score`),
          fetch(`${API}/api/guardrails`),
        ]);
        const score: ScoreResponse = await scoreRes.json();
        const guardrails = await guardrailRes.json();
        const guardrailCount = (guardrails.input_guardrails?.length || 0) + (guardrails.output_guardrails?.length || 0);

        setKpis(prev => {
          const next = [...prev];
          next[0] = { ...next[0], value: String(Math.round(score.score)), numericValue: Math.round(score.score), change: score.label, up: score.score >= 50, trend: Array.from({length:9},(_,i)=>({v:Math.max(0,score.score-(8-i)*3)})) };
          next[1] = { ...next[1], value: String(score.finding_count), numericValue: score.finding_count, change: `${score.critical} critical`, up: false, trend: Array.from({length:9},(_,i)=>({v:Math.max(0,score.finding_count-(8-i)*3)})) };
          next[2] = { ...next[2], value: '20', numericValue: 20, change: 'LLM + ASI' };
          next[3] = { ...next[3], value: String(score.critical+score.high), numericValue: score.critical+score.high, change: `${score.critical} crit / ${score.high} high`, up: false };
          next[4] = { ...next[4], value: String(guardrailCount), numericValue: guardrailCount, change: 'Auto-generated', up: guardrailCount > 0 };
          return next;
        });
      } catch { /* API not running */ }
    }
    load();
  }, []);

  return (
    <div className="grid grid-cols-5 gap-4">
      {kpis.map((kpi, i) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Icon = kpi.icon as any;
        return (
          <motion.div
            key={kpi.label}
            className="glass-card p-4 flex flex-col gap-3 cursor-default"
            style={{
              boxShadow: `0 0 16px ${kpi.shadowColor}`,
              animation: `fade-in-up 0.5s ease-out ${i * 90}ms both`,
            }}
            whileHover={{
              y: -4,
              boxShadow: `0 8px 32px ${kpi.shadowColor}, 0 0 0 1px ${kpi.color}40`,
              transition: { duration: 0.2 },
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(148,163,184,0.7)' }}>
                  {kpi.label}
                </p>
                <div className="flex items-end gap-1">
                  <Counter target={kpi.numericValue} />
                  {kpi.unit && kpi.numericValue > 0 && (
                    <span className="text-sm font-medium mb-0.5" style={{ color: kpi.color }}>{kpi.unit}</span>
                  )}
                </div>
              </div>
              <motion.div
                className="p-2 rounded-lg"
                style={{ background: `${kpi.color}18`, border: `1px solid ${kpi.color}30` }}
                whileHover={{ scale: 1.18, rotate: 6, transition: { type: 'spring', stiffness: 350 } }}
              >
                <Icon size={16} style={{ color: kpi.color }} />
              </motion.div>
            </div>

            <div style={{ height: 36 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpi.trend}>
                  <Line type="monotone" dataKey="v" stroke={kpi.color} strokeWidth={1.5} dot={false} strokeOpacity={0.8} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-1.5">
              {kpi.up
                ? <TrendingUp size={12} style={{ color: '#00FF87' }} />
                : <TrendingDown size={12} style={{ color: '#FF2D55' }} />}
              <span className="text-xs font-semibold truncate" style={{ color: kpi.up ? '#00FF87' : '#FF2D55' }}>
                {kpi.change}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
