'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Radar, Brain, Wrench, FileText, CheckCircle2 } from 'lucide-react';

const VBW = 780;
const VBH = 340;

// ── Orchestrator hexagon — pointy-top, center (390,170) ──────────────────────
const ORC = { cx: 390, cy: 170 };
const HEX_PTS             = '390,108 444,139 444,201 390,232 336,201 336,139'; // R=62
const HEX_PTS_OUTER       = '390,96 456,132 456,208 390,244 324,208 324,132';  // R=74
const HEX_PTS_OUTER_LARGE = '390,80 468,125 468,215 390,260 312,215 312,125';  // R=90

// ── Agent nodes ───────────────────────────────────────────────────────────────
const LEFT_NODES = [
  { id: 'a1', cx: 90, cy: 125, x: 30, y: 97,  w: 120, h: 55, label: 'Scanner',    sub: 'Garak + PyRIT',    color: '#00D4FF', Icon: Radar  },
  { id: 'a2', cx: 90, cy: 225, x: 30, y: 197, w: 120, h: 55, label: 'Remediator', sub: 'LLM Guard + NeMo', color: '#F59E0B', Icon: Wrench },
];
const RIGHT_NODES = [
  { id: 'a3', cx: 685, cy: 125, x: 625, y: 97,  w: 120, h: 55, label: 'Reporter', sub: 'Claude + Jinja2', color: '#3B82F6', Icon: FileText     },
  { id: 'a4', cx: 685, cy: 225, x: 625, y: 197, w: 120, h: 55, label: 'Verifier', sub: 'Promptfoo CI',   color: '#00FF88', Icon: CheckCircle2 },
];

// ── Connection line paths ─────────────────────────────────────────────────────
const LINES = [
  { id: 'll1', d: 'M 90,152 L 90,197',               color: '#00D4FF' },
  { id: 'lh1', d: 'M 150,125 Q 250,125 334,162',     color: '#00D4FF' },
  { id: 'lh2', d: 'M 150,225 Q 250,225 334,178',     color: '#F59E0B' },
  { id: 'lh3', d: 'M 446,162 Q 550,125 625,125',     color: '#3B82F6' },
  { id: 'lh4', d: 'M 446,178 Q 550,225 625,225',     color: '#00FF88' },
  { id: 'lr1', d: 'M 685,152 L 685,197',             color: '#3B82F6' },
];

// ── Traveling dot streams ─────────────────────────────────────────────────────
const DOT_STREAMS = [
  { id: 'ds-scn-rem', d: 'M 90,152 L 90,197',           color: '#00D4FF', dur: 0.9, dots: 6  },
  { id: 'ds-scn-orc', d: 'M 150,125 Q 250,125 334,162', color: '#00D4FF', dur: 1.3, dots: 9  },
  { id: 'ds-rem-orc', d: 'M 150,225 Q 250,225 334,178', color: '#F59E0B', dur: 1.7, dots: 6  },
  { id: 'ds-orc-rep', d: 'M 446,162 Q 550,125 625,125', color: '#3B82F6', dur: 1.5, dots: 7  },
  { id: 'ds-orc-ver', d: 'M 446,178 Q 550,225 625,225', color: '#00FF88', dur: 1.9, dots: 5  },
  { id: 'ds-orc-scn', d: 'M 334,162 Q 250,125 150,125', color: '#00AAFF', dur: 2.4, dots: 4  },
  { id: 'ds-rep-orc', d: 'M 625,125 Q 550,125 446,162', color: '#6366F1', dur: 2.8, dots: 3  },
  { id: 'ds-rep-ver', d: 'M 685,152 L 685,197',         color: '#3B82F6', dur: 1.1, dots: 5  },
];

const LEGEND = [
  { color: '#0066FF', label: 'Orchestrating' },
  { color: '#00D4FF', label: 'Scanning' },
  { color: '#F59E0B', label: 'Remediating' },
  { color: '#3B82F6', label: 'Reporting' },
  { color: '#00FF88', label: 'Verified / CVE' },
];

const STATS = [
  { label: 'Threats Found', value: '6',      color: '#EF4444' },
  { label: 'Guardrails',    value: '10',     color: '#F59E0B' },
  { label: 'Reports',       value: '1',      color: '#3B82F6' },
  { label: 'Tests',         value: '680',    color: '#22C55E' },
  { label: 'Status',        value: 'Active', color: '#0066FF' },
];

// ── Node card ─────────────────────────────────────────────────────────────────
type NodeDef = {
  id: string; cx: number; cy: number;
  x: number; y: number; w: number; h: number;
  label: string; sub: string; color: string;
  Icon: React.ElementType;
};

const MARCH_DUR: Record<string, number> = {
  a1: 3,
  a2: 2.5,
  a3: 3.5,
  a4: 3,
};

// Reporter gets purple marching ants to match Palo Alto style
const MARCH_COLOR: Record<string, string> = {
  a3: '#A78BFA',
};

function NodeCard({ n, glowId }: { n: NodeDef; glowId: string }) {
  const Icon = n.Icon;
  const marchDur  = MARCH_DUR[n.id]  ?? 3;
  const marchColor = MARCH_COLOR[n.id] ?? n.color;
  return (
    <motion.g
      style={{ transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: 'center' }}
      whileHover={{ scale: 1.06 }}
      transition={{ duration: 0.15 }}
    >
      {/* Solid glow aura behind card */}
      <rect x={n.x - 4} y={n.y - 4} width={n.w + 8} height={n.h + 8} rx={13}
        fill={n.color} fillOpacity="0.06"
        stroke={n.color} strokeWidth="1" strokeOpacity="0.0"
        filter={`url(#${glowId})`} />
      {/* Glass card — no static border, animated dotted border handles it */}
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10}
        fill="#04050d"
        stroke="none" />
      {/* Top highlight */}
      <rect x={n.x + 12} y={n.y + 1} width={n.w - 24} height={1} rx={1}
        fill="white" fillOpacity="0.06" />
      {/* Inner glow wash via filter */}
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10}
        fill={n.color} fillOpacity="0.04"
        stroke="none"
        filter={`url(#${glowId})`} />
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
        fontSize="7.5" fontFamily="Inter, ui-sans-serif, sans-serif" opacity="0.65">
        {n.sub}
      </text>
      {/* Marching ants — travels clockwise continuously */}
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10}
        fill="none"
        stroke={marchColor}
        strokeWidth="1"
        strokeDasharray="6 4"
        strokeOpacity="0.85"
        style={{ animation: `marching-ants ${marchDur}s linear infinite` }} />
    </motion.g>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AgentPipeline() {
  const svgPad = `${((VBH / VBW) * 100).toFixed(2)}%`;
  const cvRef  = useRef<HTMLCanvasElement>(null);

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
      h:   Math.random() > 0.5 ? 210 : Math.random() > 0.5 ? 196 : 230,
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
        ctx.fillStyle = `hsla(${p.h},90%,68%,${p.op})`;
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
        border: '1px solid rgba(0,102,255,0.18)',
        borderRadius: 12,
        overflow: 'hidden',
        animation: 'fade-in-up 0.5s ease-out 0.15s both',
        boxShadow: '0 0 60px rgba(0,102,255,0.06), 0 0 120px rgba(0,102,255,0.03)',
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,102,255,0.12)' }}>
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
            <span key={l.label} className="flex items-center gap-1.5"
              style={{ color: 'rgba(148,163,184,0.45)', fontSize: 11 }}>
              <span className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Topology canvas ── */}
      <div className="relative w-full" style={{ paddingBottom: svgPad, background: '#04050f' }}>

        {/* Particle layer */}
        <canvas ref={cvRef} className="absolute inset-0 w-full h-full"
          style={{ display:'block', pointerEvents:'none', opacity: 0.60 }} />

        {/* SVG topology */}
        <svg viewBox={`0 0 ${VBW} ${VBH}`} className="absolute inset-0 w-full h-full"
          style={{ display:'block', overflow:'visible' }}>
          <defs>
            {/* ── Orchestrator filters ── */}
            {/* Tight edge bloom — crisps the border */}
            <filter id="hex-glow-tight" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur1"/>
              <feMerge><feMergeNode in="blur1"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* hexGlow — doubled blur node for stronger halo at same spread */}
            <filter id="hexGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* Wide bloom halo — stdDev 15 */}
            <filter id="hex-glow-wide" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" result="blur2"/>
              <feMerge><feMergeNode in="blur2"/></feMerge>
            </filter>
            {/* Atmospheric outer mist — stdDev 35 per spec */}
            <filter id="hex-glow-atmo" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="35"/>
            </filter>

            {/* ── Connection line filters ── */}
            <filter id="line-atmo" x="-30%" y="-300%" width="160%" height="700%">
              <feGaussianBlur stdDeviation="8"/>
            </filter>
            <filter id="line-bloom" x="-20%" y="-150%" width="140%" height="400%">
              <feGaussianBlur stdDeviation="4"/>
            </filter>

            {/* ── Node card glow filters ── */}
            <filter id="ng-cyan"   x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5"/>
            </filter>
            <filter id="ng-orange" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5"/>
            </filter>
            <filter id="ng-blue"   x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5"/>
            </filter>
            <filter id="ng-green"  x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5"/>
            </filter>

            {/* ── Path defs for animateMotion ── */}
            {DOT_STREAMS.map(ds => (
              <path key={`def-${ds.id}`} id={ds.id} d={ds.d} />
            ))}
          </defs>

          {/* ── Radial gradient behind Orchestrator ── */}
          <radialGradient id="orc-bg-grad" cx="50%" cy="50%" r="50%"
            gradientUnits="userSpaceOnUse"
            x1="0" y1="0" x2="0" y2="0"
            cx2="390" cy2="170" r2="180">
          </radialGradient>
          {/* SVG radial gradient ellipse as rect fill */}
          <defs>
            <radialGradient id="orc-atmo-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#002244" stopOpacity="0.10"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="orc-fill-grad" cx="50%" cy="40%" r="60%">
              <stop offset="0%"   stopColor="#001133" stopOpacity="0.90"/>
              <stop offset="100%" stopColor="#000D1A" stopOpacity="1"/>
            </radialGradient>
          </defs>
          <ellipse cx="390" cy="170" rx="200" ry="160"
            fill="url(#orc-atmo-grad)" />

          {/* ── Fiber-optic connection lines (3 layers each) ── */}
          {LINES.map(l => (
            <React.Fragment key={l.id}>
              {/* Path 1 — atmospheric glow, strokeWidth 16 */}
              <path d={l.d} fill="none" stroke={l.color}
                strokeWidth="16" opacity="0.08"
                filter="url(#line-atmo)" />
              {/* Path 2 — bloom layer, strokeWidth 6 */}
              <path d={l.d} fill="none" stroke={l.color}
                strokeWidth="6" opacity="0.20"
                filter="url(#line-bloom)" />
              {/* Path 3 — core bright line, solid */}
              <path d={l.d} fill="none" stroke={l.color}
                strokeWidth="1.5" opacity="0.90" />
            </React.Fragment>
          ))}

          {/* ── Traveling dots (white with color aura) ── */}
          {DOT_STREAMS.flatMap(ds =>
            Array.from({ length: ds.dots }, (_, k) => (
              <circle key={`dot-${ds.id}-${k}`} r="2" fill="white" fillOpacity="0.92">
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

          {/* ── Agent nodes ── */}
          {LEFT_NODES.map(n => (
            <NodeCard key={n.id} n={n}
              glowId={n.color === '#00D4FF' ? 'ng-cyan' : 'ng-orange'} />
          ))}
          {RIGHT_NODES.map(n => (
            <NodeCard key={n.id} n={n}
              glowId={n.color === '#3B82F6' ? 'ng-blue' : 'ng-green'} />
          ))}

          {/* ── ORCHESTRATOR — electric blue hexagon, 3-layer glow ── */}
          <motion.g
            style={{
              transformBox: 'fill-box' as React.CSSProperties['transformBox'],
              transformOrigin: 'center',
            }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Layer 1 — atmospheric halo (furthest back), stdDev 35 */}
            <polygon points={HEX_PTS_OUTER_LARGE}
              fill="none"
              stroke="#0066FF"
              strokeWidth="40"
              opacity="0.06"
              filter="url(#hex-glow-atmo)" />

            {/* Layer 2 — wide bloom, opacity 0.45 per spec */}
            <polygon points={HEX_PTS_OUTER}
              fill="none"
              stroke="#00AAFF"
              strokeWidth="8"
              opacity="0.45"
              filter="url(#hex-glow-wide)" />

            {/* Back: interior fill — render first so glow layers sit on top */}
            <polygon points={HEX_PTS}
              fill="#000D1A"
              stroke="none" />

            {/* Polygon 1 — fat glow (emits light outward) */}
            <polygon points={HEX_PTS}
              fill="none"
              stroke="#0044BB"
              strokeWidth="20"
              opacity="0.18"
              filter="url(#hexGlow)" />

            {/* Polygon 2 — medium bloom */}
            <polygon points={HEX_PTS}
              fill="none"
              stroke="#0066DD"
              strokeWidth="8"
              opacity="0.45"
              filter="url(#hexGlow)" />

            {/* Polygon 3 — sharp bright edge (no blur) */}
            <polygon points={HEX_PTS}
              fill="none"
              stroke="#1A8FFF"
              strokeWidth="2"
              opacity="1" />


            {/* Purple traveling dotted border — outside blue border, active scan ring */}
            <polygon points={HEX_PTS_OUTER}
              fill="none"
              stroke="#7C3AED"
              strokeWidth="3"
              strokeDasharray="6 8"
              strokeOpacity="0.80"
              style={{ animation: 'hex-march-cw 4s linear infinite' }} />

            {/* Glass top-edge highlights */}
            <line x1="390" y1="108" x2="444" y2="139"
              stroke="white" strokeWidth="0.7" strokeOpacity="0.08"/>
            <line x1="336" y1="139" x2="390" y2="108"
              stroke="white" strokeWidth="0.7" strokeOpacity="0.08"/>

            {/* Breathing inner blue wash */}
            <motion.polygon points={HEX_PTS}
              fill="#0066FF"
              stroke="none"
              animate={{ fillOpacity: [0.04, 0.11, 0.04] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Brain icon — electric blue glow */}
            <foreignObject x={ORC.cx - 11} y={ORC.cy - 24} width={22} height={22}>
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                width:22, height:22,
              }}>
                <Brain size={19} style={{
                  color: '#4499FF',
                  filter: 'drop-shadow(0 0 6px rgba(0,100,220,0.95))',
                }} />
              </div>
            </foreignObject>

            {/* Label — white bold */}
            <text x={ORC.cx} y={ORC.cy + 15} textAnchor="middle"
              fill="#F1F5F9" fontSize="10" fontWeight="700"
              fontFamily="Inter, ui-sans-serif, sans-serif" letterSpacing="0.04em">
              Orchestrator
            </text>

            {/* Sub-label — electric blue */}
            <text x={ORC.cx} y={ORC.cy + 27} textAnchor="middle"
              fill="#1A8FFF" fontSize="7.5"
              fontFamily="Inter, ui-sans-serif, sans-serif" opacity="0.90">
              Claude API Brain
            </text>
          </motion.g>
        </svg>
      </div>

      {/* ── CVE Watcher Banner ── */}
      <div className="relative flex-shrink-0"
        style={{ background: '#050810', borderTop: '1px solid rgba(34,197,94,0.1)' }}>
        {/* Marching ants border — full banner perimeter, 4s (nightly rhythm) */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'hidden' }}>
          <rect x="1" y="1" width="99%" height="97%"
            fill="none"
            stroke="#00FF88"
            strokeWidth="1"
            strokeDasharray="6 4"
            strokeOpacity="0.45"
            style={{ animation: 'marching-ants 4s linear infinite' }} />
        </svg>
        <div className="flex items-start gap-4 px-5 pt-4 pb-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
            <Clock size={16} style={{ color: '#22C55E' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 700 }}>Agent 6 — CVE Watcher</p>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11, marginTop: 2 }}>
                  Auto-Update Engine · Runs nightly
                </p>
              </div>
              <div className="text-right flex-shrink-0"
                style={{ color: 'rgba(71,85,105,0.6)', fontSize: 10.5, lineHeight: 1.7 }}>
                NVD API · MITRE ATLAS<br />OWASP · Garak probes
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-5 pb-3">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#22C55E' }} />
          <span style={{ color: '#22C55E', fontSize: 11, fontWeight: 500 }}>
            RemediAX never becomes outdated
          </span>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-5 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(0,102,255,0.08)' }}>
        {STATS.map((s, i) => (
          <div key={s.label}
            className="flex flex-col items-center justify-center py-3"
            style={{ borderRight: i < STATS.length - 1 ? '1px solid rgba(0,102,255,0.08)' : 'none' }}>
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
