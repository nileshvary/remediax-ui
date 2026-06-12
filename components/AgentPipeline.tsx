'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Radar, Brain, Wrench, FileText, CheckCircle2 } from 'lucide-react';

// ── Canvas ────────────────────────────────────────────────────────────────────
const VBW = 900;
const VBH = 380;

// ── Orchestrator hexagon — pointy-top, center (450,171), R=88 ────────────────
// Vertices (90°, 30°, 330°, 270°, 210°, 150°):
//   top(450,83)  TR(526,127)  BR(526,215)  bot(450,259)  BL(374,215)  TL(374,127)
const ORC = { cx: 450, cy: 171 };
const HEX_PTS             = '450,83  526,127 526,215 450,259 374,215 374,127'; // R=88
const HEX_PTS_OUTER       = '450,68  539,120 539,222 450,274 361,222 361,120'; // R=103
const HEX_PTS_OUTER_LARGE = '450,50  555,110 555,232 450,292 345,232 345,110'; // R=121

// ── Agent cards — w=140 h=65, symmetric ──────────────────────────────────────
// Left  cx=195  (right edge  x=265)
// Right cx=705  (left  edge  x=635)
const LEFT_NODES = [
  { id: 'a1', cx: 195, cy: 95,  x: 125, y: 63,  w: 140, h: 65, label: 'Scanner',    sub: 'Garak + PyRIT',    color: '#00D4FF', Icon: Radar  },
  { id: 'a2', cx: 195, cy: 247, x: 125, y: 215, w: 140, h: 65, label: 'Remediator', sub: 'LLM Guard + NeMo', color: '#F59E0B', Icon: Wrench },
];
const RIGHT_NODES = [
  { id: 'a3', cx: 705, cy: 95,  x: 635, y: 63,  w: 140, h: 65, label: 'Reporter', sub: 'Claude + Jinja2', color: '#FF2D55', Icon: FileText     },
  { id: 'a4', cx: 705, cy: 247, x: 635, y: 215, w: 140, h: 65, label: 'Verifier', sub: 'Promptfoo CI',   color: '#7C3AED', Icon: CheckCircle2 },
];

// ── Connection line paths — marker = arrowhead marker id ─────────────────────
// Left edge of hex = x=374.  Right edge = x=526.
// CVE line reversed: flows FROM CVE Watcher UP to Orchestrator
const LINES = [
  { id: 'll1', d: 'M 195,128 L 195,215',              color: '#00D4FF', marker: 'arrow-cyan'   }, // Scanner→Remediator
  { id: 'lh1', d: 'M 265,95  Q 320,95  374,145',      color: '#00D4FF', marker: 'arrow-cyan'   }, // Scanner→Orch
  { id: 'lh2', d: 'M 265,247 Q 320,247 374,197',      color: '#F59E0B', marker: 'arrow-orange' }, // Remediator→Orch
  { id: 'lh3', d: 'M 526,145 Q 580,95  635,95',       color: '#FF2D55', marker: 'arrow-red'    }, // Orch→Reporter
  { id: 'lh4', d: 'M 526,197 Q 580,247 635,247',      color: '#7C3AED', marker: 'arrow-purple' }, // Orch→Verifier
  { id: 'lr1', d: 'M 705,128 L 705,215',              color: '#FF2D55', marker: 'arrow-red'    }, // Reporter→Verifier
  { id: 'lc1', d: 'M 450,370 Q 450,315 450,259',      color: '#00FF88', marker: 'arrow-green'  }, // CVE→Orch (upward)
];

// ── Traveling dot streams ─────────────────────────────────────────────────────
const DOT_STREAMS = [
  { id: 'ds-scn-rem', d: 'M 195,128 L 195,215',              color: '#00D4FF', dur: 0.9, dots: 6 },
  { id: 'ds-scn-orc', d: 'M 265,95  Q 320,95  374,145',      color: '#00D4FF', dur: 1.3, dots: 9 },
  { id: 'ds-rem-orc', d: 'M 265,247 Q 320,247 374,197',      color: '#F59E0B', dur: 1.7, dots: 6 },
  { id: 'ds-orc-rep', d: 'M 526,145 Q 580,95  635,95',       color: '#FF2D55', dur: 1.5, dots: 7 },
  { id: 'ds-orc-ver', d: 'M 526,197 Q 580,247 635,247',      color: '#7C3AED', dur: 1.9, dots: 5 },
  { id: 'ds-orc-scn', d: 'M 374,145 Q 320,95  265,95',       color: '#00AAFF', dur: 2.4, dots: 4 },
  { id: 'ds-rep-orc', d: 'M 635,95  Q 580,95  526,145',      color: '#FF2D55', dur: 2.8, dots: 3 },
  { id: 'ds-rep-ver', d: 'M 705,128 L 705,215',              color: '#FF2D55', dur: 1.1, dots: 5 },
  { id: 'ds-cve-orc', d: 'M 450,370 Q 450,315 450,259',      color: '#00FF88', dur: 2.0, dots: 5 },
];

const LEGEND = [
  { color: '#0066FF', label: 'Orchestrating' },
  { color: '#00D4FF', label: 'Scanning' },
  { color: '#F59E0B', label: 'Remediating' },
  { color: '#FF2D55', label: 'Reporting' },
  { color: '#7C3AED', label: 'Verified' },
  { color: '#00FF88', label: 'CVE Watcher' },
];

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const DEFAULT_STATS = [
  { label: 'Threats Found', value: '—',      color: '#EF4444' },
  { label: 'Guardrails',    value: '—',      color: '#F59E0B' },
  { label: 'Reports',       value: '1',      color: '#3B82F6' },
  { label: 'CVEs Tracked',  value: '—',      color: '#22C55E' },
  { label: 'Status',        value: 'Active', color: '#0066FF' },
];

// ── Marching-ants durations / colors per agent ────────────────────────────────
const MARCH_DUR:   Record<string, number> = { a1: 3, a2: 2.5, a3: 3.5, a4: 3 };
const MARCH_COLOR: Record<string, string> = { a3: '#FF2D55' };

// ── Node card ─────────────────────────────────────────────────────────────────
type NodeDef = {
  id: string; cx: number; cy: number;
  x: number; y: number; w: number; h: number;
  label: string; sub: string; color: string;
  Icon: React.ElementType;
};

function NodeCard({ n, glowId }: { n: NodeDef; glowId: string }) {
  const Icon      = n.Icon;
  const marchDur  = MARCH_DUR[n.id]   ?? 3;
  const marchClr  = MARCH_COLOR[n.id] ?? n.color;
  return (
    <motion.g
      style={{ transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: 'center' }}
      whileHover={{ scale: 1.06 }}
      transition={{ duration: 0.15 }}
    >
      {/* Glow aura */}
      <rect x={n.x - 4} y={n.y - 4} width={n.w + 8} height={n.h + 8} rx={13}
        fill={n.color} fillOpacity="0.06" stroke="none" filter={`url(#${glowId})`} />
      {/* Glass card */}
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10}
        fill="#04050d" stroke="none" />
      {/* Top sheen */}
      <rect x={n.x + 12} y={n.y + 1} width={n.w - 24} height={1} rx={1}
        fill="white" fillOpacity="0.06" />
      {/* Color wash */}
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10}
        fill={n.color} fillOpacity="0.04" stroke="none" filter={`url(#${glowId})`} />
      {/* Icon — top zone: card top + 8px padding, 16×16 */}
      <foreignObject x={n.cx - 8} y={n.y + 8} width={16} height={16}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:16, height:16 }}>
          <Icon size={13} style={{ color: n.color }} />
        </div>
      </foreignObject>
      {/* Label — middle zone */}
      <text x={n.cx} y={n.y + 34} textAnchor="middle" fill="#E2E8F0"
        fontSize="13" fontWeight="700" fontFamily="Inter, ui-sans-serif, sans-serif">
        {n.label}
      </text>
      {/* Sub — bottom zone */}
      <text x={n.cx} y={n.y + 51} textAnchor="middle" fill={n.color}
        fontSize="10" fontFamily="Inter, ui-sans-serif, sans-serif" opacity="0.70">
        {n.sub}
      </text>
      {/* Marching ants */}
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10}
        fill="none" stroke={marchClr} strokeWidth="1"
        strokeDasharray="6 4" strokeOpacity="0.85"
        style={{ animation: `marching-ants ${marchDur}s linear infinite` }} />
    </motion.g>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AgentPipeline() {
  const svgPad = `${((VBH / 700) * 100).toFixed(2)}%`;
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [cveCount, setCveCount] = useState<string>('—');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/score`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/guardrails`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/cve`).then(r => r.json()).catch(() => null),
    ]).then(([score, guardrails, cve]) => {
      const threats = score?.finding_count ?? null;
      const guards = guardrails
        ? (guardrails.input_guardrails?.length || 0) + (guardrails.output_guardrails?.length || 0)
        : null;
      const cves = cve?.total ?? cve?.count ?? (Array.isArray(cve) ? cve.length : null);
      setCveCount(cves !== null ? String(cves) : '—');
      setStats(prev => prev.map(s => {
        if (s.label === 'Threats Found') return { ...s, value: threats !== null ? String(threats) : '—' };
        if (s.label === 'Guardrails')    return { ...s, value: guards  !== null ? String(guards)  : '—' };
        if (s.label === 'CVEs Tracked')  return { ...s, value: cves    !== null ? String(cves)    : '—' };
        return s;
      }));
    });
  }, []);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    cv.width  = cv.offsetWidth  || VBW;
    cv.height = cv.offsetHeight || VBH;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    type P = { x:number; y:number; vx:number; vy:number; r:number; op:number; dop:number; h:number };
    const pts: P[] = Array.from({ length: 160 }, () => ({
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
    <div className="flex flex-col" style={{
      background: '#07081a',
      border: '1px solid rgba(0,102,255,0.18)',
      borderRadius: 12,
      overflow: 'hidden',
      animation: 'fade-in-up 0.5s ease-out 0.15s both',
      boxShadow: '0 0 60px rgba(0,102,255,0.06)',
    }}>

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
              <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Topology canvas ── */}
      <div className="relative w-full" style={{ paddingBottom: svgPad, background: '#04050f' }}>

        <canvas ref={cvRef} className="absolute inset-0 w-full h-full"
          style={{ display:'block', pointerEvents:'none', opacity: 0.60 }} />

        <svg viewBox="100 0 700 380" width="100%" height="100%"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
          style={{ display:'block', overflow:'visible' }}>
          <defs>
            {/* hexGlow — doubled blur for strong border emission */}
            <filter id="hexGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="hex-glow-wide" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" result="b"/>
              <feMerge><feMergeNode in="b"/></feMerge>
            </filter>
            <filter id="hex-glow-atmo" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="35"/>
            </filter>
            <filter id="line-atmo" x="-30%" y="-300%" width="160%" height="700%">
              <feGaussianBlur stdDeviation="8"/>
            </filter>
            <filter id="line-bloom" x="-20%" y="-150%" width="140%" height="400%">
              <feGaussianBlur stdDeviation="4"/>
            </filter>
            <filter id="ng-cyan"   x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
            <filter id="ng-orange" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
            <filter id="ng-blue"   x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
            <filter id="ng-green"  x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
            {/* Arrowhead markers */}
            {[
              { id: 'arrow-cyan',   color: '#00D4FF' },
              { id: 'arrow-orange', color: '#F59E0B' },
              { id: 'arrow-blue',   color: '#3B82F6' },
              { id: 'arrow-green',  color: '#00FF88' },
              { id: 'arrow-red',    color: '#FF2D55' },
              { id: 'arrow-purple', color: '#7C3AED' },
            ].map(m => (
              <marker key={m.id} id={m.id} markerWidth="7" markerHeight="7"
                refX="5" refY="3.5" orient="auto">
                <polygon points="0 0, 7 3.5, 0 7" fill={m.color} opacity="0.9" />
              </marker>
            ))}
            {/* Gradients */}
            <radialGradient id="orc-atmo-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#002244" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="purple-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#BE185D"/>
              <stop offset="25%"  stopColor="#3B0764"/>
              <stop offset="50%"  stopColor="#1E3A8A"/>
              <stop offset="75%"  stopColor="#3B0764"/>
              <stop offset="100%" stopColor="#BE185D"/>
            </linearGradient>
            {/* Neural paths — inbound (hex vertices → center) */}
            <path id="ni-1" d="M 450,83  L 450,171"/>
            <path id="ni-2" d="M 526,127 L 450,171"/>
            <path id="ni-3" d="M 526,215 L 450,171"/>
            <path id="ni-4" d="M 450,259 L 450,171"/>
            <path id="ni-5" d="M 374,215 L 450,171"/>
            <path id="ni-6" d="M 374,127 L 450,171"/>
            {/* Neural paths — outbound (center → mid-edges) */}
            <path id="no-1" d="M 450,171 L 488,127"/>
            <path id="no-2" d="M 450,171 L 488,215"/>
            <path id="no-3" d="M 450,171 L 412,215"/>
            <path id="no-4" d="M 450,171 L 412,127"/>
            {/* Dot stream paths */}
            {DOT_STREAMS.map(ds => (
              <path key={`def-${ds.id}`} id={ds.id} d={ds.d} />
            ))}
          </defs>

          {/* Atmospheric glow behind orchestrator */}
          <ellipse cx="450" cy="171" rx="220" ry="175" fill="url(#orc-atmo-grad)" />

          {/* ── Fiber-optic lines: 3 layers ── */}
          {LINES.map(l => (
            <React.Fragment key={l.id}>
              <path d={l.d} fill="none" stroke={l.color} strokeWidth="16" opacity="0.08" filter="url(#line-atmo)" />
              <path d={l.d} fill="none" stroke={l.color} strokeWidth="6"  opacity="0.20" filter="url(#line-bloom)" />
              <path d={l.d} fill="none" stroke={l.color} strokeWidth="1.5" opacity="0.90" markerEnd={`url(#${l.marker})`} />
            </React.Fragment>
          ))}

          {/* ── Traveling dots ── */}
          {DOT_STREAMS.flatMap(ds =>
            Array.from({ length: ds.dots }, (_, k) => (
              <circle key={`dot-${ds.id}-${k}`} r="2" fill="white" fillOpacity="0.92">
                <animateMotion
                  dur={`${ds.dur}s`}
                  begin={`${(-(k * ds.dur / ds.dots)).toFixed(3)}s`}
                  repeatCount="indefinite"
                ><mpath href={`#${ds.id}`} /></animateMotion>
              </circle>
            ))
          )}

          {/* ── Agent cards ── */}
          {LEFT_NODES.map(n => (
            <NodeCard key={n.id} n={n} glowId={n.color === '#00D4FF' ? 'ng-cyan' : 'ng-orange'} />
          ))}
          {RIGHT_NODES.map(n => (
            <NodeCard key={n.id} n={n} glowId={n.color === '#3B82F6' ? 'ng-blue' : 'ng-green'} />
          ))}

          {/* ── ORCHESTRATOR ── */}
          <motion.g
            style={{ transformBox: 'fill-box' as React.CSSProperties['transformBox'], transformOrigin: 'center' }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Atmospheric halo */}
            <polygon points={HEX_PTS_OUTER_LARGE}
              fill="none" stroke="#0066FF" strokeWidth="40" opacity="0.06"
              filter="url(#hex-glow-atmo)" />
            {/* Wide bloom */}
            <polygon points={HEX_PTS_OUTER}
              fill="none" stroke="#00AAFF" strokeWidth="8" opacity="0.45"
              filter="url(#hex-glow-wide)" />
            {/* Interior fill */}
            <polygon points={HEX_PTS} fill="#000D1A" stroke="none" />
            {/* Fat glow */}
            <polygon points={HEX_PTS}
              fill="none" stroke="#0044BB" strokeWidth="20" opacity="0.18"
              filter="url(#hexGlow)" />
            {/* Medium bloom */}
            <polygon points={HEX_PTS}
              fill="none" stroke="#0066DD" strokeWidth="8" opacity="0.45"
              filter="url(#hexGlow)" />
            {/* Sharp bright edge */}
            <polygon points={HEX_PTS}
              fill="none" stroke="#1A8FFF" strokeWidth="2" opacity="1" />
            {/* Purple-pink-blue dotted ring */}
            <polygon points={HEX_PTS}
              fill="none" stroke="url(#purple-blue-grad)" strokeWidth="2.5"
              strokeDasharray="6 8" strokeOpacity="0.80"
              style={{ animation: 'hex-march-cw 4s linear infinite' }} />
            {/* Glass top highlights */}
            <line x1="450" y1="83"  x2="526" y2="127" stroke="white" strokeWidth="0.7" strokeOpacity="0.08"/>
            <line x1="374" y1="127" x2="450" y2="83"  stroke="white" strokeWidth="0.7" strokeOpacity="0.08"/>
            {/* Breathing inner blue wash */}
            <motion.polygon points={HEX_PTS} fill="#0066FF" stroke="none"
              animate={{ fillOpacity: [0.04, 0.11, 0.04] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />

            {/* ── AI brain interior ── */}
            {/* Concentric expanding pulse rings */}
            {([0, 0.83, 1.66] as number[]).map((delay, i) => (
              <motion.circle key={`pulse-${i}`}
                cx={ORC.cx} cy={ORC.cy}
                fill="none" stroke="#0066FF" strokeWidth="0.7"
                animate={{ r: [6, 72, 6], opacity: [0.55, 0, 0.55] }}
                transition={{ duration: 2.5, delay, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
            {/* Inbound neural events — 4 dots × 6 paths */}
            {(['ni-1','ni-2','ni-3','ni-4','ni-5','ni-6'] as const).flatMap((id, si) =>
              [0,1,2,3].map(k => (
                <circle key={`${id}-${k}`} r="1.4" fill="#00AAFF" fillOpacity="0.9">
                  <animateMotion dur={`${0.55 + si * 0.08}s`}
                    begin={`${-(k * (0.55 + si * 0.08) / 4).toFixed(3)}s`}
                    repeatCount="indefinite">
                    <mpath href={`#${id}`}/>
                  </animateMotion>
                </circle>
              ))
            )}
            {/* Outbound commands — 3 dots × 4 paths */}
            {(['no-1','no-2','no-3','no-4'] as const).flatMap((id, si) =>
              [0,1,2].map(k => (
                <circle key={`${id}-${k}`} r="1.2" fill="#00FF88" fillOpacity="0.85">
                  <animateMotion dur={`${0.5 + si * 0.06}s`}
                    begin={`${-(k * (0.5 + si * 0.06) / 3).toFixed(3)}s`}
                    repeatCount="indefinite">
                    <mpath href={`#${id}`}/>
                  </animateMotion>
                </circle>
              ))
            )}

            {/* Brain icon */}
            <foreignObject x={ORC.cx - 20} y={ORC.cy - 38} width={40} height={40}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:40, height:40 }}>
                <Brain size={34} style={{
                  color: '#60C8FF',
                  filter: [
                    'drop-shadow(0 0 4px rgba(0,170,255,1))',
                    'drop-shadow(0 0 12px rgba(0,100,220,0.9))',
                    'drop-shadow(0 0 24px rgba(0,60,180,0.7))',
                  ].join(' '),
                }} />
              </div>
            </foreignObject>
            <text x={ORC.cx} y={ORC.cy + 22} textAnchor="middle"
              fill="#F1F5F9" fontSize="13" fontWeight="700"
              fontFamily="Inter, ui-sans-serif, sans-serif" letterSpacing="0.04em">
              Orchestrator
            </text>
            <text x={ORC.cx} y={ORC.cy + 36} textAnchor="middle"
              fill="#1A8FFF" fontSize="9.5"
              fontFamily="Inter, ui-sans-serif, sans-serif" opacity="0.90">
              Claude API Brain
            </text>
          </motion.g>
        </svg>
      </div>

      {/* ── CVE Watcher Banner ── */}
      <div className="relative flex-shrink-0"
        style={{ background: '#050810', borderTop: '1px solid rgba(0,255,136,0.18)', marginTop: '-10px' }}>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'hidden' }}>
          <rect x="1" y="1" width="99%" height="97%"
            fill="none" stroke="#00FF88" strokeWidth="2"
            strokeDasharray="6 4" strokeOpacity="0.65"
            style={{ animation: 'marching-ants 4s linear infinite' }} />
        </svg>
        <div className="flex items-start gap-4 px-5 pt-5 pb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.25)' }}>
            <Clock size={18} style={{ color: '#00FF88' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 700 }}>CVE Watcher</p>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11, marginTop: 2 }}>
                  Auto-Update Engine · Runs nightly
                </p>
              </div>
              <div className="text-right flex-shrink-0"
                style={{ color: 'rgba(71,85,105,0.6)', fontSize: 10.5, lineHeight: 1.7 }}>
                NVD API · MITRE ATLAS<br />
                <span style={{ color: '#00FF88' }}>{cveCount} CVEs tracked</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-5 pb-4">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#00FF88', boxShadow: '0 0 6px #00FF88' }} />
          <span style={{ color: '#00FF88', fontSize: 13, fontWeight: 600, letterSpacing: '0.03em', animation: 'neon-green-pulse 2s ease-in-out infinite' }}>
            RemediAX never becomes outdated
          </span>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-5 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(0,102,255,0.08)' }}>
        {stats.map((s, i) => (
          <div key={s.label}
            className="flex flex-col items-center justify-center py-3"
            style={{ borderRight: i < stats.length - 1 ? '1px solid rgba(0,102,255,0.08)' : 'none' }}>
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
