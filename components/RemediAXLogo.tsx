'use client';

import React from 'react';

interface RemediAXLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function RemediAXLogo({ size = 'md', showText = true }: RemediAXLogoProps) {
  const dims = { sm: 40, md: 56, lg: 80 };
  const d = dims[size];

  const hexDots = [
    { cx: 50, cy: 8 },
    { cx: 92, cy: 28 },
    { cx: 92, cy: 72 },
    { cx: 50, cy: 92 },
    { cx: 8, cy: 72 },
    { cx: 8, cy: 28 },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: d, height: d }}>
        {/* Outer glow layer */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 animate-outer-glow"
          style={{ width: d, height: d }}
        >
          <defs>
            <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#4169E1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#outerGlow)" />
        </svg>

        {/* Main SVG */}
        <svg viewBox="0 0 100 100" style={{ width: d, height: d }}>
          <defs>
            {/* Infinity path gradient */}
            <linearGradient id="infinityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="35%" stopColor="#4169E1" />
              <stop offset="65%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#FF8C00" />
            </linearGradient>

            <linearGradient id="infinityGrad2" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.5" />
            </linearGradient>

            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00BFFF" />
              <stop offset="100%" stopColor="#4169E1" />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Infinity loop outer (background, dimmer) */}
          <path
            d="M50,50 C50,35 30,20 15,30 C0,40 0,60 15,70 C30,80 50,65 50,50 C50,35 70,20 85,30 C100,40 100,60 85,70 C70,80 50,65 50,50 Z"
            fill="none"
            stroke="url(#infinityGrad2)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.4"
            style={{
              strokeDasharray: '800',
              animation: 'infinity-flow 3s linear infinite reverse',
            }}
          />

          {/* Infinity loop inner (bright, flowing) */}
          <path
            d="M50,50 C50,35 30,20 15,30 C0,40 0,60 15,70 C30,80 50,65 50,50 C50,35 70,20 85,30 C100,40 100,60 85,70 C70,80 50,65 50,50 Z"
            fill="none"
            stroke="url(#infinityGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#neonGlow)"
            style={{
              strokeDasharray: '800',
              strokeDashoffset: '0',
              animation: 'infinity-flow 2.5s linear infinite',
            }}
          />

          {/* Concentric circles - pulsing */}
          <circle cx="50" cy="50" r="28" fill="none" stroke="#00D4FF" strokeWidth="0.8" opacity="0.6" className="animate-pulse-ring-1" />
          <circle cx="50" cy="50" r="21" fill="none" stroke="#4169E1" strokeWidth="0.6" opacity="0.5" className="animate-pulse-ring-2" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="#00D4FF" strokeWidth="0.5" opacity="0.4" className="animate-pulse-ring-3" />
          <circle cx="50" cy="50" r="7" fill="none" stroke="#00BFFF" strokeWidth="0.4" opacity="0.3" className="animate-pulse-ring-1" />

          {/* Crosshair lines */}
          <line x1="50" y1="22" x2="50" y2="78" stroke="#00D4FF" strokeWidth="0.4" opacity="0.25" />
          <line x1="22" y1="50" x2="78" y2="50" stroke="#00D4FF" strokeWidth="0.4" opacity="0.25" />

          {/* Inner hex outline */}
          <polygon
            points="50,22 72,34 72,66 50,78 28,66 28,34"
            fill="none"
            stroke="url(#hexGrad)"
            strokeWidth="1.2"
            opacity="0.7"
            filter="url(#glow)"
          />

          {/* Radar sweep group - rotates */}
          <g style={{ transformOrigin: '50px 50px', animation: 'radar-sweep 3s linear infinite' }}>
            <defs>
              <radialGradient id="sweepGrad" cx="0%" cy="50%" r="100%">
                <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Sweep wedge */}
            <path
              d="M50,50 L50,22 A28,28 0 0,1 72.5,61"
              fill="rgba(0,212,255,0.08)"
            />
            {/* Sweep line */}
            <line
              x1="50" y1="50"
              x2="50" y2="22"
              stroke="#00D4FF"
              strokeWidth="1.5"
              opacity="0.9"
              filter="url(#neonGlow)"
            />
          </g>

          {/* Center dot */}
          <circle cx="50" cy="50" r="2.5" fill="#00D4FF" opacity="0.9" filter="url(#neonGlow)" />

          {/* Hexagon corner dots - sequential blink */}
          {hexDots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r="3.5"
              fill="#00D4FF"
              opacity="0.8"
              filter="url(#glow)"
              style={{
                animation: `hex-dot-blink 2.4s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </svg>
      </div>

      {showText && (
        <span
          className="font-bold tracking-tight gradient-text-remediax"
          style={{
            fontSize: size === 'sm' ? '18px' : size === 'md' ? '24px' : '32px',
            letterSpacing: '-0.02em',
          }}
        >
          RemediAX
        </span>
      )}
    </div>
  );
}
