'use client';

import React, { useEffect, useState } from 'react';
import { Search, Play, Bell, ChevronDown, Shield } from 'lucide-react';
import RemediAXLogo from './RemediAXLogo';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

type ProtectedStatus = 'protected' | 'unprotected' | 'unknown';

export default function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [status, setStatus] = useState<ProtectedStatus>('unknown');

  useEffect(() => {
    fetch(`${API}/api/guardrails`)
      .then(r => r.json())
      .then((g: any) => {
        const count = (g.input_guardrails?.length || 0) + (g.output_guardrails?.length || 0);
        setStatus(count > 0 ? 'protected' : 'unprotected');
      })
      .catch(() => setStatus('unknown'));
  }, []);

  const statusConfig = {
    protected:   { color: '#00FF87', bg: 'rgba(0,255,135,0.08)',  border: 'rgba(0,255,135,0.2)',  label: 'Protected'   },
    unprotected: { color: '#FF8C00', bg: 'rgba(255,140,0,0.08)',  border: 'rgba(255,140,0,0.2)',  label: 'Unprotected' },
    unknown:     { color: 'rgba(148,163,184,0.6)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', label: 'Unknown' },
  };
  const s = statusConfig[status];

  return (
    <header
      className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
      style={{
        background: 'rgba(8, 13, 28, 0.9)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        height: '60px',
      }}
    >
      {/* Logo */}
      <div className="flex-shrink-0">
        <RemediAXLogo size="sm" showText={true} />
      </div>

      {/* Search */}
      <div
        className="flex-1 max-w-xl flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
        style={{
          background: searchFocused ? 'rgba(0, 212, 255, 0.06)' : 'rgba(255,255,255,0.04)',
          border: searchFocused ? '1px solid rgba(0, 212, 255, 0.4)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: searchFocused ? '0 0 15px rgba(0, 212, 255, 0.1)' : 'none',
        }}
      >
        <Search size={14} style={{ color: 'rgba(148, 163, 184, 0.6)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search findings, probes, guardrails..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'rgba(226, 232, 240, 0.9)', caretColor: '#00D4FF' }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(148, 163, 184, 0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '10px',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Run Scan */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
          style={{ background: 'rgba(0, 212, 255, 0.08)', border: '1px solid rgba(0, 212, 255, 0.2)', color: '#00D4FF' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 212, 255, 0.15)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 212, 255, 0.08)'; }}
        >
          <Play size={14} />
          <span>Run Scan</span>
        </button>

        {/* Protected status — live from /api/guardrails */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: s.bg, border: `1px solid ${s.border}` }}
        >
          <Shield size={13} style={{ color: s.color }} />
          <span className="text-xs font-medium" style={{ color: s.color }}>{s.label}</span>
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg transition-colors" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: '#FF2D55', boxShadow: '0 0 6px #FF2D55' }} />
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #4169E1, #00D4FF)', boxShadow: '0 0 12px rgba(0, 212, 255, 0.4)' }}
          >
            A
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold" style={{ color: '#E2E8F0' }}>Admin</div>
            <div className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>Super Admin</div>
          </div>
          <ChevronDown size={12} style={{ color: 'rgba(148, 163, 184, 0.5)' }} />
        </button>
      </div>
    </header>
  );
}
