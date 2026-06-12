'use client';

import React, { useEffect, useState } from 'react';
import { Brain, ArrowRight, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

const insights = [
  {
    id: 1,
    region: 'APAC',
    message: 'We detected abnormal traffic patterns from APAC region. Consider blocking suspicious IP ranges 203.0.113.0/24 and 198.51.100.0/24.',
    confidence: 94,
    action: 'View Investigation',
    severity: 'high',
  },
  {
    id: 2,
    region: 'US-EAST',
    message: 'Lateral movement detected across internal subnets. Potential ransomware precursor activity identified on 3 endpoints.',
    confidence: 87,
    action: 'Investigate Now',
    severity: 'critical',
  },
  {
    id: 3,
    region: 'EU-WEST',
    message: 'Credential stuffing campaign detected. 1,240 failed login attempts from rotating proxy IPs targeting admin portals.',
    confidence: 91,
    action: 'View Report',
    severity: 'medium',
  },
];

function BrainGraphic() {
  return (
    <div className="relative w-16 h-16 flex-shrink-0 animate-brain-pulse">
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </radialGradient>
          <filter id="brainFilter">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx="32" cy="32" r="30" fill="url(#brainGlow)" />

        {/* Brain outline - simplified */}
        <g transform="translate(10, 12)" filter="url(#brainFilter)">
          {/* Left hemisphere */}
          <path
            d="M22,8 C14,6 6,10 5,18 C4,24 7,28 10,30 C8,32 7,36 9,39 C11,42 15,42 18,40 L22,40 L22,8 Z"
            fill="none"
            stroke="#A78BFA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Right hemisphere */}
          <path
            d="M22,8 C30,6 38,10 39,18 C40,24 37,28 34,30 C36,32 37,36 35,39 C33,42 29,42 26,40 L22,40 L22,8 Z"
            fill="none"
            stroke="#A78BFA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Center line */}
          <line x1="22" y1="8" x2="22" y2="40" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3,2" />

          {/* Neural connections */}
          <path d="M10,20 Q16,18 22,22 Q28,26 34,22" fill="none" stroke="#C4B5FD" strokeWidth="0.8" opacity="0.6" />
          <path d="M8,26 Q15,24 22,28 Q29,30 36,26" fill="none" stroke="#C4B5FD" strokeWidth="0.8" opacity="0.5" />
          <path d="M10,32 Q16,30 22,34 Q28,36 34,32" fill="none" stroke="#C4B5FD" strokeWidth="0.8" opacity="0.4" />

          {/* Neural nodes */}
          {[
            [10, 20], [22, 22], [34, 22],
            [8, 26], [22, 28], [36, 26],
            [10, 32], [22, 34], [34, 32],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x} cy={y} r="1.5"
              fill="#A78BFA"
              style={{ animation: `blink ${1 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </g>
      </svg>
      {/* Orbiting particle */}
      <div
        className="absolute inset-0"
        style={{ animation: 'rotate-slow 4s linear infinite' }}
      >
        <div
          className="absolute w-2 h-2 rounded-full"
          style={{
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#A78BFA',
            boxShadow: '0 0 8px #A78BFA',
          }}
        />
      </div>
    </div>
  );
}

export default function AIInsights() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % insights.length), 6000);
    return () => clearInterval(t);
  }, []);

  const insight = insights[current];

  return (
    <div className="glass-card p-4 flex flex-col gap-3 h-full" style={{
      background: 'rgba(13, 8, 35, 0.75)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: '#A78BFA' }} />
          <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>AI Insights</h3>
        </div>
        <div
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }}
        >
          Live Analysis
        </div>
      </div>

      {/* Brain + Content */}
      <div className="flex items-start gap-4">
        <BrainGraphic />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={12} style={{ color: insight.severity === 'critical' ? '#FF2D55' : insight.severity === 'high' ? '#FF8C00' : '#00D4FF' }} />
            <span className="text-xs font-semibold" style={{ color: 'rgba(148,163,184,0.7)' }}>
              Region: {insight.region}
            </span>
            <span
              className="text-xs font-semibold ml-auto px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(139,92,246,0.15)',
                color: '#A78BFA',
                fontSize: '10px',
              }}
            >
              {insight.confidence}% confidence
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(226, 232, 240, 0.85)' }}>
            {insight.message}
          </p>
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>AI Confidence Score</span>
          <span className="text-xs font-bold" style={{ color: '#A78BFA' }}>{insight.confidence}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${insight.confidence}%`,
              background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
              boxShadow: '0 0 8px rgba(167,139,250,0.5)',
            }}
          />
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all"
              style={{
                width: i === current ? '16px' : '6px',
                height: '6px',
                background: i === current ? '#A78BFA' : 'rgba(167,139,250,0.3)',
              }}
            />
          ))}
        </div>
        <button
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#A78BFA',
          }}
        >
          {insight.action}
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}
