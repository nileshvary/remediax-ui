'use client';

import React, { Component, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ─── Particle field ───────────────────────────────────────────────────────────

function ParticleField() {
  const ref = React.useRef<THREE.Points>(null);

  // Generate random sphere of points
  const count = 900;
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
      ref.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00D4FF"
        size={0.35}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  );
}

// Second layer — purple accent particles
function PurpleField() {
  const ref = React.useRef<THREE.Points>(null);

  const positions = React.useMemo(() => {
    const arr = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 200;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.025;
      ref.current.rotation.z += delta * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#7C3AED"
        size={0.25}
        sizeAttenuation
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

// ─── CSS fallback (no WebGL) ──────────────────────────────────────────────────

function CSSFallback() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        background:
          'radial-gradient(ellipse at 15% 50%, rgba(124,58,237,0.09) 0%, transparent 55%),' +
          'radial-gradient(ellipse at 85% 20%, rgba(0,212,255,0.07) 0%, transparent 50%),' +
          'radial-gradient(ellipse at 50% 80%, rgba(0,212,255,0.04) 0%, transparent 40%)',
      }}
    />
  );
}

// ─── Error boundary — catches WebGL init failures ─────────────────────────────

interface EBState { failed: boolean }
class WebGLErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <CSSFallback /> : this.props.children;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ParticleBackground() {
  return (
    <WebGLErrorBoundary>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Suspense fallback={<CSSFallback />}>
          <Canvas
            camera={{ position: [0, 0, 55], fov: 75 }}
            gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
            style={{ background: 'transparent' }}
          >
            <ParticleField />
            <PurpleField />
          </Canvas>
        </Suspense>
      </div>
    </WebGLErrorBoundary>
  );
}
