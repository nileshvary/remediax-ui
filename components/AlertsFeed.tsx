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

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  return (
    <div className="glass-card p-3 flex flex-col gap-2" style={{ animation: 'fade-in-up 0.5s ease-out 0.2s both' }}>

      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} style={{ color: '#FF2D55' }} />
        <h3 className="font-bold" style={{ color: '#E2E8F0', fontSize: 14 }}>Scan Findings</h3>
        {criticalCount > 0 && (
          <span className="font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#FF2D55', color: '#fff', fontSize: 11,
                     boxShadow: '0 0 8px rgba(255,45,85,0.5)',
                     animation: 'counter-pulse 2s ease-in-out infinite' }}>
            {criticalCount}
          </span>
        )}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-1.5" style={{ maxHeight: 280 }}>
        {loading && (
          <p className="text-xs text-center py-4" style={{ color: 'rgba(148,163,184,0.5)' }}>
            Loading findings…
          </p>
        )}
        {!loading && alerts.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'rgba(148,163,184,0.5)' }}>
            No findings. Run a scan to populate.
          </p>
        )}
        <AnimatePresence mode="popLayout">
          {alerts.map((alert, i) => {
            const cfg = SEV_CONFIG[alert.severity] || SEV_CONFIG.LOW;
            const Icon = cfg.icon as any;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                whileHover={{ x: 2, transition: { duration: 0.12 } }}
                className="flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer group"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                {/* Severity icon */}
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40`,
                           animation: alert.severity === 'CRITICAL' ? 'counter-pulse 2s ease-in-out infinite' : 'none' }}>
                  <Icon size={13} style={{ color: cfg.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold truncate" style={{ color: '#E2E8F0', fontSize: 13 }}>
                      {alert.title}
                    </p>
                    <ChevronRight size={12} style={{ color: 'rgba(148,163,184,0.3)', flexShrink: 0 }}
                      className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: `${cfg.color}18`, color: cfg.color, fontSize: 10 }}>
                      {cfg.label}
                    </span>
                    <span style={{ color: 'rgba(148,163,184,0.6)', fontSize: 10 }}>{alert.category}</span>
                    <span className="ml-auto capitalize" style={{ color: 'rgba(148,163,184,0.4)', fontSize: 10 }}>
                      {alert.source}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <button className="w-full py-2 font-medium rounded-lg transition-colors"
        style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
                 color: '#00D4FF', fontSize: 12 }}>
        View All {alerts.length} Findings
      </button>
    </div>
  );
}
