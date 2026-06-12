'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Radar, Brain, Wrench, FileText, CheckCircle2 } from 'lucide-react';

const VBW = 780;
const VBH = 340;

// ── Orchestrator hexagon (pointy-top, R=62, center 390,170) ──────────────────
// Vertices at angles 90°,30°,330°,270°,210°,150° from center
const ORC = { cx: 390, cy: 170, R: 62 };
const HEX_PTS = '390,108 444,139 444,201 390,232 336,201 336,139';
// Outer marching-ants hex (R=74) for the animated dotted border
const HEX_PTS_OUTER = '390,96 456,132 456,208 390,244 324,208 324,132';

// ── Peripheral nodes (2 left, 2 right — symmetric) ───────────────────────────
const LEFT_NODES = [
  { id: 'a1', cx: 90, cy: 125, x: 30, y: 97,  w: 120, h: 55, label: 'Scanner',    sub: 'Garak + PyRIT',    color: '#06B6D4', Icon: Radar  },
  { id: 'a2', cx: 90, cy: 225, x: 30, y: 197, w: 120, h: 55, label: 'Remediator', sub: 'LLM Guard + NeMo', color: '#F59E0B', Icon: Wrench },
];

const RIGHT_NODES = [
  { id: 'a3', cx: 685, cy: 125, x: 625, y: 97,  w: 120, h: 55, label: 'Reporter', sub: 'Claude + Jinja2', color: '#3B82F6', Icon: FileText     },
  { id: 'a4', cx: 685, cy: 225, x: 625, y: 197, w: 120, h: 55, label: 'Verifier', sub: 'Promptfoo CI',   color: '#22C55E', Icon: CheckCircle2 },
];

// ── Dotted arc lines ──────────────────────────────────────────────────────────
// All hub connections touch the precise edge of ORC circle
const LINES = [
  { id: 'll1', d: 'M 90,152 L 90,197',               color: '#06B6D4' }, // Scanner→Remediator
  { id: 'lh1', d: 'M 150,125 Q 250,125 334,162',     color: '#7C3AED' }, // Scanner→Orch
  { id: 'lh2', d: 'M 150,225 Q 250,225 334,178',     color: '#7C3AED' }, // Remediator→Orch
  { id: 'lh3', d: 'M 446,162 Q 550,125 625,125',     color: '#00D4FF' }, // Orch→Reporter
  { id: 'lh4', d: 'M 446,178 Q 550,225 625,225',     color: '#00D4FF' }, // Orch→Verifier
  { id: 'lr1', d: 'M 685,152 L 685,197',             color: '#3B82F6' }, // Reporter→Verifier
];

// ── Animated packet streams ───────────────────────────────────────────────────
const DOT_STREAMS = [
  // Left sequential (cyan, fast)
  { id: 'ds-scn-rem', d: 'M 90,152 L 90,197',           color: '#06B6D4', dur: 0.9, dots: 6 },
  // Inbound → Orchestrator (purple AI analytics)
  { id: 'ds-scn-orc', d: 'M 150,125 Q 250,125 334,162', color: '#7C3AED', dur: 1.3, dots: 9 },
  { id: 'ds-rem-orc', d: 'M 150,225 Q 250,225 334,178', color: '#A78BFA', dur: 1.7, dots: 6 },
  // Outbound from Orchestrator (electric blue)
  { id: 'ds-orc-rep', d: 'M 446,162 Q 550,125 625,125', color: '#00D4FF', dur: 1.5, dots: 7 },
  { id: 'ds-orc-ver', d: 'M 446,178 Q 550,225 625,225', color: '#00D4FF', dur: 1.9, dots: 5 },
  // Return flows (bidirectional — indigo, fewer)
  { id: 'ds-orc-scn', d: 'M 334,162 Q 250,125 150,125', color: '#6366F1', dur: 2.4, dots: 4 },
  { id: 'ds-rep-orc', d: 'M 625,125 Q 550,125 446,162', color: '#6366F1', dur: 2.8, dots: 3 },
  // Right sequential (blue)
  { id: 'ds-rep-ver', d: 'M 685,152 L 685,197',         color: '#3B82F6', dur: 1.1, dots: 5 },
];

const LEGEND = [
  { color: '#7C3AED', label: 'Orchestrating' },
  { color: '#06B6D4', label: 'Scanning' },
  { color: '#F59E0B', label: 'Remediating' },
  { color: '#3B82F6', label: 'Reporting' },
  { color: '#22C55E', label: 'Verified / Nightly CVE' },
];

const STATS = [
  { label: 'Threats Found', value: '6',      color: '#EF4444' },
  { label: 'Guardrails',    value: '10',     color: '#F59E0B' },
  { label: 'Reports',       value: '1',      color: '#3B82F6' },
  { label: 'Tests',         value: '680',    color: '#22C55E' },
  { label: 'Status',        value: 'Active', color: '#7C3AED' },
];

// Hex perimeter ≈ 6 × 62 = 372 px — used for marching ants dasharray tuning

// ── Node card component ───────────────────────────────────────────────────────
type NodeDef = { id: string; cx: number; cy: number; x: number; y: number; w: number; h: number; label: string; sub: string; color: string; Icon: React.ElementType };

function NodeCard({ n, glow }: { n: NodeDef; glow: string }) {
  const Icon = n.Icon;
  return (
    <motion.g
      style={{ transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: 'center' }}
      whileHover={{ scale: 1.06 }}
      transition={{ duration: 0.15 }}
    >
      {/* Glow aura */}
      <rect x={n.x - 5} y={n.y - 5} width={n.w + 10} height={n.h + 10} rx={15}
        fill={n.color} fillOpacity="0.04"
        stroke={n.color} strokeWidth="1" strokeOpacity="0.08"
        filter={`url(#${glow})`} />
      {/* Marching ants */}
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10}
        fill="none" stroke={n.color} strokeWidth="0.5"
        strokeDasharray="5 3" strokeOpacity="0.28"
        style={{ animation: 'marching-ants 5.5s linear infinite' }} />
      {/* Glass card */}
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10}
        fill="#04050d" stroke={n.color} strokeWidth="1" strokeOpacity="0.6" />
      {/* Glass top highlight */}
      <rect x={n.x + 12} y={n.y + 1} width={n.w - 24} height={1} rx={1}
        fill="white" fillOpacity="0.05" />
      {/* Icon */}
      <foreignObject x={n.cx - 8} y={n.cy - 22} width={16} height={16}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:16, height:16 }}>
          <Icon size={13} style={{ color: n.color }} />
        </div>
      </foreignObject>
      {/* Label */}
      <text x={n.cx} y={n.cy - 2} textAnchor="middle" fill="#E2E8F0"
        fontSize="10" fontWeight="700" fontFamily="Inter, ui-sans-serif, sans-serif">
        {n.label}
      </text>
      {/* Sub */}
      <text x={n.cx} y={n.cy + 12} textAnchor="middle" fill={n.color}
        fontSize="7.5" fontFamily="Inter, ui-sans-serif, sans-serif" opacity="0.6">
        {n.sub}
      </text>
    </motion.g>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AgentPipeline() {
  const svgPad = `${((VBH / VBW) * 100).toFixed(2)}%`;
  const cvRef  = useRef<HTMLCanvasElement>(null);

  // Floating telemetry particles
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    cv.width  = cv.offsetWidth  || VBW;
    cv.height = cv.offsetHeight || VBH;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    type P = { x:number; y:number; vx:number; vy:number; r:number; op:number; dop:number; h:number };
    const pts: P[] = Array.from({ length: 170 }, () => ({
      x:   Math.random() * cv.width,
      y:   Math.random() * cv.height,
      vx:  (Math.random() - 0.5) * 0.2,
      vy:  (Math.random() - 0.5) * 0.2,
      r:   Math.random() * 1.1 + 0.25,
      op:  Math.random() * 0.28 + 0.04,
      dop: (Math.random() - 0.5) * 0.004,
      h:   Math.random() > 0.5 ? 256 : Math.random() > 0.5 ? 196 : 215,
    }));

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        p.op += p.dop;
        if (p.op > 0.35) p.dop = -Math.abs(p.dop);
        if (p.op < 0.03) p.dop =  Math.abs(p.dop);
        if (p.x < 0)         p.x = cv.width;
        if (p.x > cv.width)  p.x = 0;
        if (p.y < 0)         p.y = cv.height;
        if (p.y > cv.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.h},80%,68%,${p.op})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="flex flex-col"
      style={{
        background: '#07081a',
        border: '1px solid rgba(99,102,241,0.18)',
        borderRadius: 12,
        overflow: 'hidden',
        animation: 'fade-in-up 0.5s ease-out 0.15s both',
        boxShadow: '0 0 60px rgba(99,102,241,0.06), 0 0 120px rgba(99,102,241,0.03)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block"
              style={{ background: '#22C55E', animation: 'blink 2s ease-in-out infinite' }} />
            <span style={{ color: '#F1F5F9', fontSize: 16, fontWeight: 700 }}>RemediAX Agent Pipeline</span>
          </div>
          <p className="mt-0.5 ml-3.5" style={{ color: 'rgba(148,163,184,0.4)', fontSize: 11 }}>
            Real-time AI security orchestration topology
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end pt-0.5">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5" style={{ color: 'rgba(148,163,184,0.45)', fontSize: 11 }}>
              <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Topology Canvas */}
      <div className="relative w-full" style={{ paddingBottom: svgPad, background: '#04050f' }}>

        {/* Floating particle layer */}
        <canvas ref={cvRef} className="absolute inset-0 w-full h-full"
          style={{ display:'block', pointerEvents:'none', opacity: 0.65 }} />

        {/* SVG topology */}
        <svg viewBox={`0 0 ${VBW} ${VBH}`} className="absolute inset-0 w-full h-full"
          style={{ display:'block', overflow:'visible' }}>
          <defs>
            {/* Line glow */}
            <filter id="lg" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" result="b" />
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Orchestrator bloom filter — stdDeviation 10 = soft glow, not muddy */}
            <filter id="ng-orc" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="10" result="b" />
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Tight inner border glow — crisper bloom on the hex edge */}
            <filter id="ng-orc-edge" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Node glow filters */}
            {['ng-cyan','ng-orange','ng-blue','ng-green'].map(id => (
              <filter key={id} id={id} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            ))}
            {/* Dot path defs */}
            {DOT_STREAMS.map(ds => (
              <path key={`def-${ds.id}`} id={ds.id} d={ds.d} />
            ))}
          </defs>

          {/* Connection lines: glow layer + crisp layer */}
          {LINES.map(l => (
            <React.Fragment key={l.id}>
              <path d={l.d} fill="none" stroke={l.color}
                strokeWidth="3" strokeOpacity="0.1" strokeDasharray="5 4"
                filter="url(#lg)" />
              <path d={l.d} fill="none" stroke={l.color}
                strokeWidth="0.7" strokeOpacity="0.4" strokeDasharray="5 4" />
            </React.Fragment>
          ))}

          {/* Animated packet dots */}
          {DOT_STREAMS.flatMap(ds =>
            Array.from({ length: ds.dots }, (_, k) => (
              <circle key={`dot-${ds.id}-${k}`} r="1.8" fill={ds.color} fillOpacity="0.9">
                <animateMotion
                  dur={`${ds.dur}s`}
                  begin={`${(-(k * ds.dur / ds.dots)).toFixed(3)}s`}
                  repeatCount="indefinite"
                >
                  <mpath href={`#${ds.id}`} />
                </animateMotion>
              </circle>
            ))
          )}

          {/* Left nodes */}
          {LEFT_NODES.map(n => (
            <NodeCard key={n.id} n={n}
              glow={n.color === '#06B6D4' ? 'ng-cyan' : 'ng-orange'} />
          ))}

          {/* Right nodes */}
          {RIGHT_NODES.map(n => (
            <NodeCard key={n.id} n={n}
              glow={n.color === '#3B82F6' ? 'ng-blue' : 'ng-green'} />
          ))}

          {/* ── ORCHESTRATOR — Palo Alto Data Center style hexagon ── */}
          <motion.g
            style={{ transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: 'center' }}
            animate={{ scale: [1, 1.035, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Layer 1: outer ghost hexagon halo — visible but soft (opacity 0.15–0.20) */}
            <polygon points={HEX_PTS_OUTER}
              fill="none"
              stroke="#7C3AED" strokeWidth="8" strokeOpacity="0.20"
              filter="url(#ng-orc)" />

            {/* Layer 2: outer ghost hex crisp line — faint outer ring */}
            <polygon points={HEX_PTS_OUTER}
              fill="none"
              stroke="#9F7AEA" strokeWidth="0.6" strokeOpacity="0.18" />

            {/* Layer 3: main hex border bloom — thick blurred purple, creates the Palo Alto glow ring */}
            <polygon points={HEX_PTS}
              fill="none"
              stroke="#7C3AED" strokeWidth="6" strokeOpacity="0.55"
              filter="url(#ng-orc-edge)" />

            {/* Layer 4: main hex fill — near-black, almost no gradient */}
            <polygon points={HEX_PTS}
              fill="#060412" stroke="none" />

            {/* Layer 5: crisp solid border on top — the bright Palo Alto edge line */}
            <polygon points={HEX_PTS}
              fill="none"
              stroke="#A78BFA" strokeWidth="1.5" strokeOpacity="0.95" />

            {/* Layer 6: breathing inner purple glow fill */}
            <motion.polygon points={HEX_PTS}
              fill="#7C3AED"
              stroke="none"
              animate={{ fillOpacity: [0.03, 0.09, 0.03] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Brain icon — centered, glowing purple */}
            <foreignObject x={ORC.cx - 11} y={ORC.cy - 24} width={22} height={22}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:22, height:22 }}>
                <Brain size={19} style={{ color: '#C4B5FD', filter: 'drop-shadow(0 0 5px rgba(124,58,237,0.95))' }} />
              </div>
            </foreignObject>

            {/* Label — white bold */}
            <text x={ORC.cx} y={ORC.cy + 15} textAnchor="middle"
              fill="#F1F5F9" fontSize="10" fontWeight="700"
              fontFamily="Inter, ui-sans-serif, sans-serif" letterSpacing="0.04em">
              Orchestrator
            </text>

            {/* Sub-label — purple */}
            <text x={ORC.cx} y={ORC.cy + 27} textAnchor="middle"
              fill="#7C3AED" fontSize="7.5"
              fontFamily="Inter, ui-sans-serif, sans-serif" opacity="0.90">
              Claude API Brain
            </text>
          </motion.g>
        </svg>
      </div>

      {/* CVE Watcher Banner */}
      <div className="relative flex-shrink-0"
        style={{ background: '#050810', borderTop: '1px solid rgba(34,197,94,0.1)' }}>
        <div className="flex items-start gap-4 px-5 pt-4 pb-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
            <Clock size={16} style={{ color: '#22C55E' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 700 }}>Agent 6 — CVE Watcher</p>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11, marginTop: 2 }}>Auto-Update Engine · Runs nightly</p>
              </div>
              <div className="text-right flex-shrink-0" style={{ color: 'rgba(71,85,105,0.6)', fontSize: 10.5, lineHeight: 1.7 }}>
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

      {/* Stats Bar */}
      <div className="grid grid-cols-5 flex-shrink-0" style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
        {STATS.map((s, i) => (
          <div key={s.label}
            className="flex flex-col items-center justify-center py-3"
            style={{ borderRight: i < STATS.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.color }} />
              <span style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 700 }}>{s.value}</span>
            </div>
            <span style={{ color: 'rgba(148,163,184,0.4)', fontSize: 10 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
