'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Zap, Bug, ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const ROW_COLORS = ['#FF2D55', '#FF8C00', '#00D4FF', '#4DA6FF'];
const ROW_ICONS = [AlertTriangle, Shield, Zap, Bug];

interface Vector {
  code: string;
  name: string;
  count: number;
  percent: number;
}

export default function TopAttackedAssets() {
  const [vectors, setVectors] = useState<Vector[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/findings`).then(r => r.json()),
      fetch(`${API}/api/owasp`).then(r => r.json()),
    ])
      .then(([findings, owasp]: [any[], any]) => {
        if (!Array.isArray(findings) || findings.length === 0) return;

        // Group by owasp_llm_category
        const counts: Record<string, number> = {};
        for (const f of findings) {
          const cat = f.owasp_llm_category;
          if (cat) counts[cat] = (counts[cat] || 0) + 1;
        }

        // Build name lookup from /api/owasp
        const nameMap: Record<string, string> = {};
        if (Array.isArray(owasp)) {
          for (const item of owasp) {
            if (item.code && item.name) nameMap[item.code] = item.name;
          }
        } else if (owasp && typeof owasp === 'object') {
          for (const [code, meta] of Object.entries(owasp)) {
            const m = meta as any;
            if (m?.name) nameMap[code] = m.name;
          }
        }

        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);

        const total = findings.length;
        setTotal(total);
        setVectors(sorted.map(([code, count]) => ({
          code,
          name: nameMap[code] || code,
          count,
          percent: Math.round((count / total) * 100),
        })));
        setTimeout(() => setLoaded(true), 300);
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div className="glass-card p-4 flex flex-col gap-3"
      style={{ animation: 'fade-in-up 0.5s ease-out 0.3s both' }}
      whileHover={{ boxShadow: '0 0 0 1px rgba(0,212,255,0.2), 0 8px 32px rgba(0,212,255,0.08)', transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: '#00D4FF' }} />
          <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Top Attack Vectors</h3>
        </div>
        <span className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>This Scan</span>
      </div>

      <div className="space-y-3">
        {vectors.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'rgba(148,163,184,0.4)' }}>
            Run a scan to see attack vectors.
          </p>
        ) : (
          vectors.map((v, i) => {
            const Icon = ROW_ICONS[i] || Shield;
            const color = ROW_COLORS[i] || '#4DA6FF';
            return (
              <div key={v.code} className="group cursor-pointer"
                style={{ animation: `fade-in-up 0.5s ease-out ${i * 80}ms both` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon size={12} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#E2E8F0' }}>{v.code}</p>
                      <p className="text-xs truncate max-w-[120px]" style={{ color: 'rgba(148,163,184,0.5)', fontSize: '10px' }}>
                        {v.name} • {v.count} findings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold" style={{ color }}>{v.percent}%</span>
                    <ArrowRight size={10} style={{ color: 'rgba(148,163,184,0.3)' }}
                      className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: loaded ? `${v.percent}%` : '0%',
                      background: `linear-gradient(90deg, ${color}80, ${color})`,
                      boxShadow: `0 0 8px ${color}60`,
                      transitionDelay: `${i * 100 + 200}ms`,
                    }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
          {total > 0 ? `${total} total attack vectors found` : 'No scan data yet'}
        </p>
        <button className="text-xs font-medium" style={{ color: '#00D4FF' }}>
          View Full Report →
        </button>
      </div>
    </motion.div>
  );
}
