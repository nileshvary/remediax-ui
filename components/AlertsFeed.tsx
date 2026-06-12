'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, ChevronRight, Shield } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const SEV_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const SEV_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  CRITICAL: { color:'#FF2D55', bg:'rgba(255,45,85,0.08)',  border:'rgba(255,45,85,0.25)',  icon:AlertTriangle, label:'Critical' },
  HIGH:     { color:'#FF8C00', bg:'rgba(255,140,0,0.08)',  border:'rgba(255,140,0,0.25)',  icon:AlertTriangle, label:'High'     },
  MEDIUM:   { color:'#EAB308', bg:'rgba(234,179,8,0.06)',  border:'rgba(234,179,8,0.2)',   icon:AlertCircle,   label:'Medium'   },
  LOW:      { color:'#00D4FF', bg:'rgba(0,212,255,0.05)',  border:'rgba(0,212,255,0.15)',  icon:Shield,        label:'Low'      },
};

interface Alert { id: string; title: string; severity: string; category: string; source: string; }

function probeName(raw: string): string {
  return raw.split('.').pop()!.replace(/([A-Z])/g, ' $1').trim();
}

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'All'|'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/findings`)
      .then(r => r.json())
      .then(findings => {
        setAlerts(
          findings
            .sort((a: any, b: any) => (SEV_ORDER[a.severity?.toUpperCase()||'LOW']??3) - (SEV_ORDER[b.severity?.toUpperCase()||'LOW']??3))
            .map((f: any, i: number) => ({
              id: String(i),
              title: probeName(f.probe_name || 'Unknown Probe'),
              severity: (f.severity || 'LOW').toUpperCase(),
              category: f.owasp_llm_category || '—',
              source: f.source || 'scanner',
            }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? alerts : alerts.filter(a => a.severity === filter);
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  return (
    <div className="glass-card p-4 flex flex-col gap-3 h-full" style={{ animation: 'fade-in-up 0.5s ease-out 0.2s both' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} style={{ color: '#FF2D55' }} />
          <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Scan Findings</h3>
          {criticalCount > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: '#FF2D55', color: '#fff', fontSize: '10px', boxShadow: '0 0 8px rgba(255,45,85,0.5)', animation: 'counter-pulse 2s ease-in-out infinite' }}>
              {criticalCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(['All','CRITICAL','HIGH','MEDIUM','LOW'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="text-xs px-2 py-0.5 rounded transition-all"
              style={{ background: filter===f ? 'rgba(0,212,255,0.15)' : 'transparent', color: filter===f ? '#00D4FF' : 'rgba(148,163,184,0.5)', border: filter===f ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent', fontSize:'10px' }}>
              {f === 'All' ? 'All' : f[0] + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-2" style={{ maxHeight: 340 }}>
        {loading && <p className="text-xs text-center py-4" style={{ color: 'rgba(148,163,184,0.5)' }}>Loading findings…</p>}
        {!loading && filtered.length === 0 && <p className="text-xs text-center py-4" style={{ color: 'rgba(148,163,184,0.5)' }}>No findings. Run a scan to populate.</p>}
        <AnimatePresence mode="popLayout">
          {filtered.map((alert, i) => {
            const cfg = SEV_CONFIG[alert.severity] || SEV_CONFIG.LOW;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Icon = cfg.icon as any;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                whileHover={{ x: 2, transition: { duration: 0.12 } }}
                className="flex items-start gap-3 p-3 rounded-lg cursor-pointer group"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40`, animation: alert.severity==='CRITICAL' ? 'counter-pulse 2s ease-in-out infinite' : 'none' }}>
                  <Icon size={13} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: '#E2E8F0' }}>{alert.title}</p>
                    <ChevronRight size={12} style={{ color: 'rgba(148,163,184,0.3)', flexShrink: 0 }} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background:`${cfg.color}18`, color:cfg.color, fontSize:'10px' }}>{cfg.label}</span>
                    <span className="text-xs" style={{ color:'rgba(148,163,184,0.6)', fontSize:'10px' }}>{alert.category}</span>
                    <span className="text-xs ml-auto capitalize" style={{ color:'rgba(148,163,184,0.4)', fontSize:'10px' }}>{alert.source}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <button className="w-full py-2 text-xs font-medium rounded-lg transition-colors"
        style={{ background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.15)', color:'#00D4FF' }}>
        View All {alerts.length} Findings
      </button>
    </div>
  );
}
