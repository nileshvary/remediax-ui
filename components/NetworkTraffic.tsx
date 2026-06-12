'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Activity, Wifi, ArrowDown, ArrowUp } from 'lucide-react';

interface Particle {
  id: number;
  pathIndex: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

const NODE_POSITIONS = {
  internet: { x: 80, y: 120 },
  server1: { x: 300, y: 60 },
  server2: { x: 300, y: 120 },
  server3: { x: 300, y: 180 },
  datacenter: { x: 500, y: 120 },
};

const PATHS = [
  { from: 'internet', to: 'server1', type: 'normal' },
  { from: 'internet', to: 'server2', type: 'suspicious' },
  { from: 'internet', to: 'server3', type: 'malicious' },
  { from: 'server1', to: 'datacenter', type: 'normal' },
  { from: 'server2', to: 'datacenter', type: 'suspicious' },
  { from: 'server3', to: 'datacenter', type: 'malicious' },
];

const TYPE_COLORS: Record<string, string> = {
  normal: '#00D4FF',
  suspicious: '#FF8C00',
  malicious: '#FF2D55',
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const stats = [
  { label: 'Inbound', value: '8.42 Gbps', icon: ArrowDown, color: '#00D4FF' },
  { label: 'Outbound', value: '12.67 Gbps', icon: ArrowUp, color: '#4DA6FF' },
  { label: 'Packets/sec', value: '156,782', icon: Activity, color: '#00FF87' },
  { label: 'Uptime', value: '98.6%', icon: Wifi, color: '#00FF87' },
  { label: 'Active Connections', value: '23', icon: Activity, color: '#FF8C00' },
];

export default function NetworkTraffic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const nextIdRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    function spawnParticle() {
      const pathIndex = Math.floor(Math.random() * PATHS.length);
      const path = PATHS[pathIndex];
      particlesRef.current.push({
        id: nextIdRef.current++,
        pathIndex,
        progress: 0,
        speed: 0.004 + Math.random() * 0.004,
        color: TYPE_COLORS[path.type],
        size: 2 + Math.random() * 2,
      });
    }

    for (let i = 0; i < 12; i++) {
      spawnParticle();
    }

    let spawnTimer = 0;
    let lastTime = 0;

    function drawNode(x: number, y: number, label: string, isMain = false) {
      if (!ctx) return;
      const r = isMain ? 18 : 14;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
      glow.addColorStop(0, 'rgba(0,212,255,0.3)');
      glow.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.beginPath();
      ctx.arc(x, y, r * 2, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = isMain ? 'rgba(0,30,60,0.9)' : 'rgba(0,20,45,0.85)';
      ctx.fill();
      ctx.strokeStyle = isMain ? '#00D4FF' : '#4169E1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = isMain ? '#00D4FF' : '#94A3B8';
      ctx.font = `bold ${isMain ? 8 : 7}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);

      if (label !== 'INTERNET' && label !== 'DATA\nCENTER') {
        ctx.fillStyle = 'rgba(148,163,184,0.6)';
        ctx.font = '6px Inter, sans-serif';
        ctx.fillText(label, x, y + r + 10);
      }
    }

    function draw(time: number) {
      if (!ctx || !canvas) return;
      const dt = time - lastTime;
      lastTime = time;
      ctx.clearRect(0, 0, W, H);

      // Background grid dots
      ctx.fillStyle = 'rgba(0, 212, 255, 0.04)';
      for (let gx = 0; gx < W; gx += 30) {
        for (let gy = 0; gy < H; gy += 30) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw path lines (faint)
      PATHS.forEach((path) => {
        const from = NODE_POSITIONS[path.from as keyof typeof NODE_POSITIONS];
        const to = NODE_POSITIONS[path.to as keyof typeof NODE_POSITIONS];
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = `${TYPE_COLORS[path.type]}20`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Update and draw particles
      spawnTimer += dt;
      if (spawnTimer > 400) {
        spawnParticle();
        spawnTimer = 0;
      }

      particlesRef.current = particlesRef.current.filter((p) => p.progress < 1);
      particlesRef.current.forEach((p) => {
        p.progress += p.speed;
        const path = PATHS[p.pathIndex];
        const from = NODE_POSITIONS[path.from as keyof typeof NODE_POSITIONS];
        const to = NODE_POSITIONS[path.to as keyof typeof NODE_POSITIONS];
        const x = lerp(from.x, to.x, p.progress);
        const y = lerp(from.y, to.y, p.progress);

        // Trail
        const trailLen = 8;
        for (let t = 0; t < trailLen; t++) {
          const tp = p.progress - t * 0.012;
          if (tp < 0) break;
          const tx = lerp(from.x, to.x, tp);
          const ty = lerp(from.y, to.y, tp);
          ctx.beginPath();
          ctx.arc(tx, ty, p.size * (1 - t / trailLen) * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.floor((1 - t / trailLen) * 80).toString(16).padStart(2, '0');
          ctx.fill();
        }

        // Particle glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3);
        grd.addColorStop(0, p.color + 'CC');
        grd.addColorStop(1, p.color + '00');
        ctx.beginPath();
        ctx.arc(x, y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // Draw nodes
      drawNode(NODE_POSITIONS.internet.x, NODE_POSITIONS.internet.y, 'INTERNET', true);
      drawNode(NODE_POSITIONS.server1.x, NODE_POSITIONS.server1.y, 'SRV-1');
      drawNode(NODE_POSITIONS.server2.x, NODE_POSITIONS.server2.y, 'SRV-2');
      drawNode(NODE_POSITIONS.server3.x, NODE_POSITIONS.server3.y, 'SRV-3');
      drawNode(NODE_POSITIONS.datacenter.x, NODE_POSITIONS.datacenter.y, 'DATA\nCTR', true);

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div className="glass-card p-4 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#00FF87', boxShadow: '0 0 8px #00FF87', animation: 'blink 1.5s ease-in-out infinite' }}
          />
          <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Live Network Traffic</h3>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded bg-cyan-400 inline-block" /> Normal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded inline-block" style={{ background: '#FF8C00' }} /> Suspicious</span>
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded inline-block" style={{ background: '#FF2D55' }} /> Malicious</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 rounded-lg overflow-hidden" style={{ background: 'rgba(0,10,30,0.5)', minHeight: 160 }}>
        <canvas
          ref={canvasRef}
          width={580}
          height={200}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Icon size={12} style={{ color: stat.color }} />
              <span className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}</span>
              <span className="text-xs text-center leading-tight" style={{ color: 'rgba(148,163,184,0.6)', fontSize: '10px' }}>
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
