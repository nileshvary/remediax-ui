'use client';

import React from 'react';
import { Clock, Radar, Brain, Wrench, FileText, CheckCircle2 } from 'lucide-react';

// ─── SVG coordinate system (viewBox 0 0 780 292) ─────────────────────────────
const VBW = 780;
const VBH = 292;

// ─── Connection paths (SVG only — no text) ────────────────────────────────────
const CONNECTIONS = [
  { id: 'ap0', d: 'M144,148 C222,148 224,52 316,52',      color: '#06B6D4', dots: 3 },
  { id: 'ap1', d: 'M390,92 L390,107',                      color: '#7C3AED', dots: 2 },
  { id: 'ap2', d: 'M316,65 C213,95 213,242 325,242',       color: '#7C3AED', dots: 3 },
  { id: 'ap3', d: 'M468,148 L636,148',                     color: '#F59E0B', dots: 3 },
  { id: 'ap4', d: 'M455,242 C558,242 648,207 701,184',     color: '#3B82F6', dots: 3 },
  { id: 'ap5', d: 'M701,186 L701,292',                     color: '#22C55E', dots: 2 },
];

const ARROWS: [string, string][] = [
  ['312,46 316,52 312,58',   '#06B6D4'],
  ['384,103 390,107 396,103','#7C3AED'],
  ['319,246 325,242 331,246','#7C3AED'],
  ['632,142 636,148 632,154','#F59E0B'],
  ['697,188 701,184 697,180','#3B82F6'],
];

// ─── HTML card definitions ─────────────────────────────────────────────────────
// Positions as % of the container (derived from SVG nx/ny/nw/nh ÷ VBW/VBH)
const CARDS = [
  {
    id: 'a1',
    title: 'Agent 1', name: 'Scanner', tool: 'Garak + PyRIT',
    color: '#06B6D4', Icon: Radar,
    left: `${(18 / VBW) * 100}%`,  top: `${(116 / VBH) * 100}%`,
    width: `${(118 / VBW) * 100}%`, height: `${(64 / VBH) * 100}%`,
  },
  {
    id: 'a5',
    title: 'Agent 5', name: 'Orchestrator', tool: 'Claude API Brain',
    color: '#7C3AED', Icon: Brain,
    left: `${(322 / VBW) * 100}%`, top: `${(16 / VBH) * 100}%`,
    width: `${(136 / VBW) * 100}%`, height: `${(68 / VBH) * 100}%`,
  },
  {
    id: 'a2',
    title: 'Agent 2', name: 'Remediator', tool: 'LLM Guard + NeMo',
    color: '#F59E0B', Icon: Wrench,
    left: `${(318 / VBW) * 100}%`, top: `${(112 / VBH) * 100}%`,
    width: `${(144 / VBW) * 100}%`, height: `${(72 / VBH) * 100}%`,
  },
  {
    id: 'a3',
    title: 'Agent 3', name: 'Reporter', tool: 'Claude + Jinja2',
    color: '#3B82F6', Icon: FileText,
    left: `${(329 / VBW) * 100}%`, top: `${(208 / VBH) * 100}%`,
    width: `${(122 / VBW) * 100}%`, height: `${(64 / VBH) * 100}%`,
  },
  {
    id: 'a4',
    title: 'Agent 4', name: 'Verifier', tool: 'Promptfoo CI',
    color: '#22C55E', Icon: CheckCircle2,
    left: `${(640 / VBW) * 100}%`, top: `${(116 / VBH) * 100}%`,
    width: `${(118 / VBW) * 100}%`, height: `${(64 / VBH) * 100}%`,
  },
];

const LEGEND = [
  { color: '#06B6D4', label: 'Scanning' },
  { color: '#7C3AED', label: 'Orchestrating' },
  { color: '#F59E0B', label: 'Remediating' },
  { color: '#3B82F6', label: 'Reporting' },
  { color: '#22C55E', label: 'Verified' },
];

const STATS = [
  { label: 'Threats Found', value: '6',      color: '#EF4444' },
  { label: 'Guardrails',    value: '10',     color: '#F59E0B' },
  { label: 'Reports',       value: '1',      color: '#3B82F6' },
  { label: 'Tests',         value: '680',    color: '#22C55E' },
  { label: 'Status',        value: 'Active', color: '#7C3AED' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgentPipeline() {
  const svgPad = `${((VBH / VBW) * 100).toFixed(2)}%`;
  const a4xPct = `${((701 / VBW) * 100).toFixed(2)}%`;

  return (
    <div className="flex flex-col"
      style={{ background: '#0D1117', border: '1px solid #1e293b', borderRadius: 10, overflow: 'hidden' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #1e293b' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block"
              style={{ background: '#22C55E', animation: 'blink 2s ease-in-out infinite' }} />
            <span style={{ color: '#F1F5F9', fontSize: 16, fontWeight: 700 }}>
              RemediAX Agent Pipeline
            </span>
          </div>
          <p className="mt-0.5 ml-3.5" style={{ color: '#475569', fontSize: 11 }}>
            Real-time AI security remediation flow
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end pt-0.5">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5" style={{ color: '#475569', fontSize: 11 }}>
              <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Pipeline canvas (SVG lines + HTML cards) ──────────────────────── */}
      <div className="relative w-full" style={{ paddingBottom: svgPad, background: '#0D1117' }}>

        {/* SVG layer — connection lines + animated dots only, no text */}
        <svg viewBox={`0 0 ${VBW} ${VBH}`}
          className="absolute inset-0 w-full h-full"
          style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            {CONNECTIONS.map((c) => <path key={`def-${c.id}`} id={c.id} d={c.d} />)}
            <pattern id="ap-dot" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.65" fill="#1e293b" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect width={VBW} height={VBH} fill="url(#ap-dot)" />

          {/* Stage dividers */}
          {[144, 312, 468, 636].map((x) => (
            <line key={x} x1={x} y1="6" x2={x} y2={VBH - 6}
              stroke="#1e293b" strokeWidth="1" strokeDasharray="3,7" strokeOpacity="0.8" />
          ))}

          {/* Connection dashes */}
          {CONNECTIONS.map((c) => (
            <path key={`line-${c.id}`} d={c.d} fill="none" stroke={c.color}
              strokeWidth="1" strokeDasharray="5,4" strokeOpacity="0.38" />
          ))}

          {/* Animated dots */}
          {CONNECTIONS.flatMap((c) =>
            Array.from({ length: c.dots }, (_, k) => {
              const begin = `${(-(k * 2 / c.dots)).toFixed(3)}s`;
              return (
                <circle key={`dot-${c.id}-${k}`} r="2" fill={c.color} fillOpacity="0.92">
                  <animateMotion dur="2s" begin={begin} repeatCount="indefinite">
                    <mpath href={`#${c.id}`} />
                  </animateMotion>
                </circle>
              );
            })
          )}

          {/* Arrowheads */}
          {ARROWS.map(([pts, col], i) => (
            <polyline key={i} points={pts} fill="none" stroke={col}
              strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.75" />
          ))}
        </svg>

        {/* HTML card layer — fixed CSS fonts, no SVG scaling */}
        {CARDS.map((c) => {
          const Icon = c.Icon;
          const isHub = c.id === 'a2';
          return (
            <div
              key={c.id}
              className="absolute flex flex-col items-center justify-center gap-0.5"
              style={{
                left: c.left, top: c.top, width: c.width, height: c.height,
                background: '#0f1523',
                border: `${isHub ? 1.4 : 0.9}px solid ${c.color}`,
                borderOpacity: isHub ? 0.9 : 0.55,
                borderRadius: 8,
                boxShadow: `0 0 0 1px ${c.color}${isHub ? '55' : '30'}, inset 0 0 12px ${c.color}08`,
              }}
            >
              <Icon size={12} style={{ color: c.color, opacity: 0.9, flexShrink: 0 }} />
              <span style={{
                color: '#94A3B8', fontSize: 9, fontWeight: 500, letterSpacing: '0.03em',
                lineHeight: 1, fontFamily: 'Inter, ui-sans-serif, sans-serif',
              }}>
                {c.title}
              </span>
              <span style={{
                color: '#F1F5F9', fontSize: 10, fontWeight: 700,
                lineHeight: 1, fontFamily: 'Inter, ui-sans-serif, sans-serif',
              }}>
                {c.name}
              </span>
              <span style={{
                color: c.color, fontSize: 8, opacity: 0.85,
                lineHeight: 1, fontFamily: 'Inter, ui-sans-serif, sans-serif',
                background: `${c.color}18`,
                border: `0.5px solid ${c.color}40`,
                borderRadius: 3,
                padding: '1px 5px',
                marginTop: 1,
              }}>
                {c.tool}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── CVE Watcher panel ──────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0" style={{ background: '#0D1424', borderTop: '1px solid #334155' }}>
        <div className="absolute top-0 w-px"
          style={{ left: a4xPct, height: 12, background: 'repeating-linear-gradient(to bottom,#22C55E 0 3px,transparent 3px 6px)', opacity: 0.55 }} />
        <div className="flex items-start gap-4 px-5 pt-4 pb-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Clock size={16} style={{ color: '#22C55E' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 700 }}>Agent 6 — CVE Watcher</p>
                <p style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>Auto-Update Engine · Runs nightly</p>
              </div>
              <div className="text-right flex-shrink-0" style={{ color: '#334155', fontSize: 10.5, lineHeight: 1.7 }}>
                NVD API · MITRE ATLAS<br />OWASP · Garak probes
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-5 pb-3">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#22C55E' }} />
          <span style={{ color: '#22C55E', fontSize: 11, fontWeight: 500 }}>RemediAX never becomes outdated</span>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 flex-shrink-0" style={{ borderTop: '1px solid #1e293b' }}>
        {STATS.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center justify-center py-3"
            style={{ borderRight: i < STATS.length - 1 ? '1px solid #1e293b' : 'none' }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.color }} />
              <span style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 700 }}>{s.value}</span>
            </div>
            <span style={{ color: '#475569', fontSize: 10 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
