'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, CheckCircle, AlertTriangle, AlertCircle, Shield, Zap, Target, Clock, RefreshCw } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface ScanStatus {
  running: boolean;
  phase: string;
  progress: number;
  findings_count: number;
  severity_counts: Record<string, number>;
  started_at: number | null;
  finished_at: number | null;
  error: string | null;
}

interface Config {
  target_url: string;
  scanners: string[];
  pyrit_max_turns: number;
}

const PHASE_LABELS: Record<string, string> = {
  idle:         'Ready to scan',
  initializing: 'Initializing scanners…',
  garak:        'Running Garak probes (OWASP LLM01–LLM10)…',
  pyrit:        'Running PyRIT multi-turn attacks…',
  vector:       'Running Vector Poisoner (ASI01–ASI10)…',
  running:      'Processing findings…',
  saving:       'Saving findings to artifacts/…',
  done:         'Scan complete',
  error:        'Scan failed',
};

const SEV_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  CRITICAL: { color: '#FF2D55', bg: 'rgba(255,45,85,0.08)',  border: 'rgba(255,45,85,0.25)' },
  HIGH:     { color: '#FF8C00', bg: 'rgba(255,140,0,0.08)',  border: 'rgba(255,140,0,0.25)' },
  MEDIUM:   { color: '#EAB308', bg: 'rgba(234,179,8,0.06)',  border: 'rgba(234,179,8,0.2)'  },
  LOW:      { color: '#00D4FF', bg: 'rgba(0,212,255,0.05)',  border: 'rgba(0,212,255,0.15)' },
};

const SCANNER_INFO = [
  { id: 'garak',  label: 'Garak',          color: '#06B6D4', desc: 'OWASP LLM01, LLM05 — offline red-teaming probes' },
  { id: 'pyrit',  label: 'PyRIT',           color: '#F97316', desc: 'LLM01–LLM10 — multi-turn crescendo attacks' },
  { id: 'vector', label: 'Vector Poisoner', color: '#8B5CF6', desc: 'ASI01–ASI10 — RAG & agentic poisoning' },
];

function elapsed(started: number | null, finished: number | null): string {
  if (!started) return '';
  const end = finished ?? Date.now() / 1000;
  const secs = Math.round(end - started);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export default function ScanTab() {
  const [cfg, setCfg] = useState<Config>({ target_url: '', scanners: ['garak', 'pyrit', 'vector'], pyrit_max_turns: 5 });
  const [status, setStatus] = useState<ScanStatus>({
    running: false, phase: 'idle', progress: 0,
    findings_count: 0, severity_counts: {}, started_at: null, finished_at: null, error: null,
  });
  const [now, setNow] = useState(Date.now() / 1000);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load config on mount
  useEffect(() => {
    fetch(`${API}/api/config`).then(r => r.json()).then((d: Config) => setCfg(c => ({ ...c, ...d }))).catch(() => {});
    fetch(`${API}/api/scan/status`).then(r => r.json()).then((s: ScanStatus) => setStatus(s)).catch(() => {});
  }, []);

  // Clock tick for elapsed display
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(t);
  }, []);

  // Poll status while running
  useEffect(() => {
    if (status.running) {
      pollRef.current = setInterval(() => {
        fetch(`${API}/api/scan/status`).then(r => r.json()).then((s: ScanStatus) => setStatus(s)).catch(() => {});
      }, 2000);
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [status.running]);

  async function startScan() {
    try {
      const res = await fetch(`${API}/api/scan/start`, { method: 'POST' });
      if (!res.ok) { const d = await res.json(); setStatus(s => ({ ...s, phase: 'error', error: d.detail ?? 'Failed to start' })); return; }
      setStatus(s => ({ ...s, running: true, phase: 'initializing', progress: 0, error: null }));
    } catch { setStatus(s => ({ ...s, phase: 'error', error: 'API server not reachable' })); }
  }

  async function resetScan() {
    try {
      await fetch(`${API}/api/scan/reset`, { method: 'POST' });
      setStatus({ running: false, phase: 'idle', progress: 0, findings_count: 0, severity_counts: {}, started_at: null, finished_at: null, error: null });
    } catch { /* silent */ }
  }

  const isDone  = status.phase === 'done';
  const isError = status.phase === 'error';
  const isIdle  = status.phase === 'idle';
  const noTarget = !cfg.target_url?.trim();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full">
      <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)' }}>

        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Target + scanners */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Target size={14} style={{ color: '#00D4FF' }} />
              <h3 style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scan Target</h3>
            </div>

            {noTarget ? (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(255,140,0,0.06)', border: '1px solid rgba(255,140,0,0.2)' }}>
                <AlertCircle size={13} style={{ color: '#FF8C00', flexShrink: 0 }} />
                <p style={{ color: '#FF8C00', fontSize: 12 }}>No target URL set — go to <strong>Config</strong> tab and set a target first.</p>
              </div>
            ) : (
              <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)' }}>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11, marginBottom: 2 }}>Target URL</p>
                <p className="truncate" style={{ color: '#00D4FF', fontSize: 13, fontWeight: 500 }}>{cfg.target_url}</p>
              </div>
            )}

            <div>
              <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Active Scanners</p>
              <div className="flex flex-wrap gap-2">
                {SCANNER_INFO.filter(s => cfg.scanners?.includes(s.id)).map(s => (
                  <span key={s.id} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: `${s.color}12`, border: `1px solid ${s.color}30`, color: s.color }}>
                    {s.label}
                  </span>
                ))}
                {cfg.scanners?.length === 0 && <span style={{ color: 'rgba(148,163,184,0.3)', fontSize: 12 }}>None — set in Config</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11 }}>PyRIT max turns:</span>
              <span style={{ color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>{cfg.pyrit_max_turns}</span>
            </div>
          </div>

          {/* Progress card */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={14} style={{ color: '#8B5CF6' }} />
                <h3 style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scan Progress</h3>
              </div>
              {status.started_at && (
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11 }}>
                  <Clock size={11} />
                  <span>{elapsed(status.started_at, status.finished_at ?? (isDone ? status.finished_at : null))}</span>
                </div>
              )}
            </div>

            {/* Phase label */}
            <div className="flex items-center gap-2">
              {status.running && <RefreshCw size={13} style={{ color: '#00D4FF', animation: 'spin 1s linear infinite' }} />}
              {isDone  && <CheckCircle size={13} style={{ color: '#00FF87' }} />}
              {isError && <AlertTriangle size={13} style={{ color: '#FF2D55' }} />}
              <p style={{ color: isDone ? '#00FF87' : isError ? '#FF2D55' : '#E2E8F0', fontSize: 13 }}>
                {PHASE_LABELS[status.phase] ?? status.phase}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: isError ? '#FF2D55' : isDone ? '#00FF87' : 'linear-gradient(90deg,#00D4FF,#8B5CF6)' }}
                animate={{ width: `${status.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p style={{ color: 'rgba(148,163,184,0.4)', fontSize: 11 }}>{status.progress}% complete</p>

            {/* Error detail */}
            {isError && status.error && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,45,85,0.06)', border: '1px solid rgba(255,45,85,0.2)' }}>
                <p style={{ color: '#FF2D55', fontSize: 12 }}>{status.error}</p>
              </div>
            )}

            {/* Done summary inline */}
            {isDone && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.15)' }}>
                <p style={{ color: '#00FF87', fontSize: 13, fontWeight: 600 }}>{status.findings_count} findings detected</p>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11, marginTop: 2 }}>findings.json updated in artifacts/</p>
              </div>
            )}

            {/* Action button */}
            <div className="flex gap-2 pt-1">
              {(isIdle || isError) && (
                <button onClick={startScan} disabled={noTarget || status.running}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
                  style={{
                    background: noTarget ? 'rgba(255,255,255,0.04)' : 'rgba(0,212,255,0.12)',
                    border: `1px solid ${noTarget ? 'rgba(255,255,255,0.08)' : 'rgba(0,212,255,0.3)'}`,
                    color: noTarget ? 'rgba(148,163,184,0.3)' : '#00D4FF',
                    cursor: noTarget ? 'not-allowed' : 'pointer',
                  }}>
                  <Play size={14} />
                  Start Scan
                </button>
              )}
              {status.running && (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6', fontSize: 14 }}>
                  <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Scanning…
                </div>
              )}
              {isDone && (
                <button onClick={resetScan}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
                  <RotateCcw size={14} />
                  Run Again
                </button>
              )}
              {isError && (
                <button onClick={resetScan}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(255,45,85,0.06)', border: '1px solid rgba(255,45,85,0.2)', color: '#FF2D55' }}>
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>
          </div>

        </div>{/* end left column */}

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Findings summary */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: '#00D4FF' }} />
              <h3 style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Findings Summary</h3>
            </div>

            {!isDone ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Shield size={28} style={{ color: 'rgba(148,163,184,0.15)' }} />
                <p style={{ color: 'rgba(148,163,184,0.3)', fontSize: 12 }}>
                  {status.running ? 'Scan in progress…' : 'No results yet — start a scan'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p style={{ color: '#E2E8F0', fontSize: 24, fontWeight: 700 }}>{status.findings_count}</p>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11, marginBottom: 12 }}>total findings</p>
                {(['CRITICAL','HIGH','MEDIUM','LOW'] as const).map(sev => {
                  const count = status.severity_counts[sev] ?? 0;
                  if (!count) return null;
                  const cfg2 = SEV_CONFIG[sev];
                  return (
                    <div key={sev} className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: cfg2.bg, border: `1px solid ${cfg2.border}` }}>
                      <span style={{ color: cfg2.color, fontSize: 12, fontWeight: 500 }}>{sev}</span>
                      <span style={{ color: cfg2.color, fontSize: 14, fontWeight: 700 }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Scanner coverage */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} style={{ color: '#F59E0B' }} />
              <h3 style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scanner Coverage</h3>
            </div>
            {SCANNER_INFO.map(s => (
              <div key={s.id} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ color: s.color, fontSize: 12, fontWeight: 500 }}>{s.label}</p>
                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11, marginTop: 2 }}>{s.desc}</p>
              </div>
            ))}
          </div>

        </div>{/* end right column */}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
