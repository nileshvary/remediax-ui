'use client';

import React from 'react';
import { Clock } from 'lucide-react';

// ─── SVG coordinate system ────────────────────────────────────────────────────
//
//   Diamond / cross layout  (viewBox 0 0 780 292):
//
//              ┌──────────────┐
//              │  A5 Orch.    │  ← top arm  (purple)
//              └──────────────┘
//             ↗       │
//   ┌──────┐   CYAN   │ PURPLE
//   │ A1   │          ↓
//   │Scan  │  ┌────────────────┐
//   └──────┘  │   A2 Remed.   │ ──ORANGE──▶ ┌──────┐
//    (left)   │  (main hub)   │             │  A4  │
//              └────────────────┘             │Verify│
//             ↖       │                      └──────┘
//    A5→A3 arc ↓ PURPLE                         ↑
//              ┌──────────────┐    BLUE          │
//              │  A3 Report.  │ ─────────────────┘
//              └──────────────┘
//                      │  GREEN (to CVE Watcher)
//                      ▼

const VBW = 780;
const VBH = 292;

// ─── Node definitions ─────────────────────────────────────────────────────────

interface NodeDef {
  id: string;
  nx: number; ny: number; nw: number; nh: number;
  cx: number; cy: number;
  color: string;
  title: string;
  sub: string;
  tool: string;
}

const NODES: NodeDef[] = [
  // Left arm — Agent 1 Scanner
  { id: 'a1', nx: 18, ny: 116, nw: 118, nh: 64, cx: 77, cy: 148, color: '#06B6D4', title: 'Agent 1', sub: 'Scanner', tool: 'Garak + PyRIT' },
  // Top arm — Agent 5 Orchestrator
  { id: 'a5', nx: 322, ny: 16, nw: 136, nh: 68, cx: 390, cy: 50, color: '#7C3AED', title: 'Agent 5', sub: 'Orchestrator', tool: 'Claude API Brain' },
  // Center hub — Agent 2 Remediator (slightly larger)
  { id: 'a2', nx: 318, ny: 112, nw: 144, nh: 72, cx: 390, cy: 148, color: '#F59E0B', title: 'Agent 2', sub: 'Remediator', tool: 'LLM Guard + NeMo' },
  // Bottom arm — Agent 3 Reporter
  { id: 'a3', nx: 329, ny: 208, nw: 122, nh: 64, cx: 390, cy: 240, color: '#3B82F6', title: 'Agent 3', sub: 'Reporter', tool: 'Claude + Jinja2' },
  // Right arm — Agent 4 Verifier
  { id: 'a4', nx: 640, ny: 116, nw: 118, nh: 64, cx: 699, cy: 148, color: '#22C55E', title: 'Agent 4', sub: 'Verifier', tool: 'Promptfoo CI' },
];

// ─── Connections ──────────────────────────────────────────────────────────────

interface ConnDef { id: string; d: string; color: string; dots: number }

const CONNECTIONS: ConnDef[] = [
  { id: 'ap0', d: 'M144,148 C222,148 224,52 316,52', color: '#06B6D4', dots: 3 },
  { id: 'ap1', d: 'M390,92 L390,107', color: '#7C3AED', dots: 2 },
  { id: 'ap2', d: 'M316,65 C213,95 213,242 325,242', color: '#7C3AED', dots: 3 },
  { id: 'ap3', d: 'M468,148 L636,148', color: '#F59E0B', dots: 3 },
  { id: 'ap4', d: 'M455,242 C558,242 648,207 701,184', color: '#3B82F6', dots: 3 },
  { id: 'ap5', d: 'M701,186 L701,292', color: '#22C55E', dots: 2 },
];

// Arrowheads at endpoints
const ARROWS: [string, string][] = [
  ['312,46 316,52 312,58', '#06B6D4'],
  ['384,103 390,107 396,103', '#7C3AED'],
  ['319,246 325,242 331,246', '#7C3AED'],
  ['632,142 636,148 632,154', '#F59E0B'],
  ['697,188 701,184 697,180', '#3B82F6'],
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconScanner({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round">
      <path d={`M${cx - 8},${cy + 2} A8,8 0 0 1 ${cx + 8},${cy + 2}`} />
      <path d={`M${cx - 5},${cy + 2} A5,5 0 0 1 ${cx + 5},${cy + 2}`} />
      <path d={`M${cx - 2.5},${cy + 2} A2.5,2.5 0 0 1 ${cx + 2.5},${cy + 2}`} />
      <line x1={cx} y1={cy + 2} x2={cx + 5.5} y2={cy - 3.5} />
      <circle cx={cx} cy={cy + 2} r="1" fill={color} stroke="none" />
    </g>
  );
}

function IconOrchestrator({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const r = 8;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return (
    <g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round">
      <polygon points={pts} />
      <line x1={cx - 4.5} y1={cy - 2.5} x2={cx + 4.5} y2={cy + 2.5} />
      <line x1={cx - 4.5} y1={cy + 2.5} x2={cx + 4.5} y2={cy - 2.5} />
      <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} strokeOpacity="0.4" />
      <circle cx={cx} cy={cy} r="1.5" fill={color} stroke="none" />
    </g>
  );
}

function IconRemediator({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={cx - 2} cy={cy - 4} r="3.8" />
      <line x1={cx + 1} y1={cy - 1} x2={cx + 6} y2={cy + 5} />
      <line x1={cx + 4} y1={cy + 4} x2={cx + 7.5} y2={cy + 7} />
    </g>
  );
}

function IconReporter({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round">
      <rect x={cx - 6} y={cy - 8} width="12" height="16" rx="1.5" />
      <line x1={cx - 3.5} y1={cy - 3} x2={cx + 3.5} y2={cy - 3} />
      <line x1={cx - 3.5} y1={cy} x2={cx + 3.5} y2={cy} />
      <line x1={cx - 3.5} y1={cy + 3} x2={cx + 1} y2={cy + 3} />
    </g>
  );
}

function IconVerifier({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={cx} cy={cy} r="7.5" />
      <polyline points={`${cx - 4},${cy} ${cx - 1},${cy + 3.5} ${cx + 4.5},${cy - 3.5}`} />
    </g>
  );
}

// ─── Node card ────────────────────────────────────────────────────────────────

function NodeCard({ n }: { n: NodeDef }) {
  const isHub = n.id === 'a2';
  const isLg = n.id === 'a5' || isHub;
  const iconCY = n.ny + 16;
  const titleY  = n.ny + 31;
  const subY    = n.ny + 42;
  const badgeY  = n.ny + n.nh - 9;

  return (
    <g>
      {/* Card fill */}
      <rect x={n.nx} y={n.ny} width={n.nw} height={n.nh} rx="8" fill="#0f1523" />
      <rect x={n.nx} y={n.ny} width={n.nw} height={n.nh} rx="8" fill={n.color} fillOpacity="0.05" />
      {/* Border */}
      <rect x={n.nx} y={n.ny} width={n.nw} height={n.nh} rx="8" fill="none" stroke={n.color}
        strokeWidth={isHub ? 1.4 : isLg ? 1.2 : 0.9}
        strokeOpacity={isHub ? 0.9 : isLg ? 0.75 : 0.55} />
      {/* Icon */}
      {n.id === 'a1' && <IconScanner cx={n.cx} cy={iconCY} color={n.color} />}
      {n.id === 'a5' && <IconOrchestrator cx={n.cx} cy={iconCY} color={n.color} />}
      {n.id === 'a2' && <IconRemediator cx={n.cx} cy={iconCY} color={n.color} />}
      {n.id === 'a3' && <IconReporter cx={n.cx} cy={iconCY} color={n.color} />}
      {n.id === 'a4' && <IconVerifier cx={n.cx} cy={iconCY} color={n.color} />}
      {/* Title — e.g. "Agent 1" */}
      <text x={n.cx} y={titleY} textAnchor="middle" dominantBaseline="middle"
        fill="#CBD5E1" fontSize={isHub ? 9 : 8.5} fontWeight="600"
        fontFamily="Inter, ui-sans-serif, sans-serif" letterSpacing="0.3">
        {n.title}
      </text>
      {/* Subtitle — e.g. "Scanner" */}
      <text x={n.cx} y={subY} textAnchor="middle" dominantBaseline="middle"
        fill="#F1F5F9" fontSize={isHub ? 10.5 : 9.5} fontWeight="700"
        fontFamily="Inter, ui-sans-serif, sans-serif">
        {n.sub}
      </text>
      {/* Tool badge */}
      {n.tool && (
        <g>
          <rect x={n.nx + 7} y={badgeY - 6} width={n.nw - 14} height="12" rx="3"
            fill={n.color} fillOpacity="0.1" stroke={n.color} strokeWidth="0.4" strokeOpacity="0.35" />
          <text x={n.cx} y={badgeY} textAnchor="middle" dominantBaseline="middle"
            fill={n.color} fontSize="6.5" fillOpacity="0.95"
            fontFamily="Inter, ui-sans-serif, sans-serif" letterSpacing="0.2">
            {n.tool}
          </text>
        </g>
      )}
    </g>
  );
}

// ─── Static UI data ───────────────────────────────────────────────────────────

const LEGEND = [
  { color: '#06B6D4', label: 'Scanning' },
  { color: '#7C3AED', label: 'Orchestrating' },
  { color: '#F59E0B', label: 'Remediating' },
  { color: '#3B82F6', label: 'Reporting' },
  { color: '#22C55E', label: 'Verified' },
];

const STATS = [
  { label: 'Threats Found', value: '6', color: '#EF4444' },
  { label: 'Guardrails', value: '10', color: '#F59E0B' },
  { label: 'Reports', value: '1', color: '#3B82F6' },
  { label: 'Tests', value: '680', color: '#22C55E' },
  { label: 'Status', value: 'Active', color: '#7C3AED' },
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

      {/* ── SVG pipeline ─────────────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ paddingBottom: svgPad, background: '#0D1117' }}>
        <svg viewBox={`0 0 ${VBW} ${VBH}`} className="absolute inset-0 w-full h-full"
          style={{ display: 'block', overflow: 'visible' }}>

          <defs>
            {/* Path definitions for animateMotion */}
            {CONNECTIONS.map((c) => (<path key={`def-${c.id}`} id={c.id} d={c.d} />))}
            {/* Dot-grid background pattern */}
            <pattern id="ap-dot" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.65" fill="#1e293b" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect width={VBW} height={VBH} fill="url(#ap-dot)" />

          {/* Subtle vertical stage markers */}
          {[144, 312, 468, 636].map((x) => (
            <line key={x} x1={x} y1="6" x2={x} y2={VBH - 6}
              stroke="#1e293b" strokeWidth="1" strokeDasharray="3,7" strokeOpacity="0.8" />
          ))}

          {/* ── Connection dashed lines ── */}
          {CONNECTIONS.map((c) => (
            <path key={`line-${c.id}`} d={c.d} fill="none" stroke={c.color}
              strokeWidth="1" strokeDasharray="5,4" strokeOpacity="0.38" />
          ))}

          {/* ── Animated dots ── */}
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

          {/* ── Arrowheads ── */}
          {ARROWS.map(([pts, col], i) => (
            <polyline key={i} points={pts} fill="none" stroke={col} strokeWidth="1.1"
              strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.75" />
          ))}

          {/* ── Node cards ── */}
          {NODES.map((n) => <NodeCard key={n.id} n={n} />)}
        </svg>
      </div>

      {/* ── CVE Watcher panel ──────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0" style={{ background: '#0D1424', borderTop: '1px solid #334155' }}>
        {/* Dashed connector from A4 */}
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
