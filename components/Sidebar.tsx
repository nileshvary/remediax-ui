'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import RemediAXLogo from './RemediAXLogo';
import {
  LayoutDashboard,
  Network,
  BarChart3,
  Settings,
  Bot,
  Send,
  X,
  Radar,
  Shield,
  FileText,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const navItems = [
  { icon: LayoutDashboard,    label: 'Dashboard',   active: true  },
  { icon: Radar,              label: 'Scan',         active: false },
  { icon: Shield,             label: 'Guardrails',   active: false },
  { icon: FileText,           label: 'Reports',      active: false },
  { icon: BarChart3,          label: 'Benchmark',    active: false },
  { icon: Clock,              label: 'CVE Watcher',  active: false },
  { icon: Network,            label: 'Pipeline',     active: false },
  { icon: SlidersHorizontal,  label: 'Config',       active: false },
  { icon: Settings,           label: 'Settings',     active: false },
];

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I\'m the RemediAX AI Security Assistant. Ask me about scan findings, OWASP LLM Top 10, ASI Agentic Top 10, or how to fix vulnerabilities.' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setSending(true);

    try {
      const res = await fetch(`${API}/api/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || 'No response.' }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Unable to reach the AI assistant. Make sure the FastAPI bridge is running on port 8001.' },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <aside
      className="flex flex-col"
      style={{
        width: '220px',
        minWidth: '220px',
        height: '100vh',
        background: 'rgba(8, 13, 28, 0.95)',
        borderRight: '1px solid rgba(0, 212, 255, 0.1)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo area */}
      <div className="px-4 py-5 border-b" style={{ borderColor: 'rgba(0, 212, 255, 0.1)' }}>
        <RemediAXLogo size="sm" showText={true} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.label;
            return (
              <li key={item.label}>
                <motion.button
                  onClick={() => setActiveItem(item.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium group relative"
                  style={{
                    background: isActive ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                    color: isActive ? '#00D4FF' : 'rgba(148, 163, 184, 0.8)',
                    borderLeft: isActive ? '2px solid #00D4FF' : '2px solid transparent',
                  }}
                  whileHover={{ background: isActive ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.05)', x: isActive ? 0 : 2, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon size={16} style={{ color: isActive ? '#00D4FF' : 'inherit', flexShrink: 0 }} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: '#FF2D55',
                        color: '#fff',
                        fontSize: '10px',
                        minWidth: '20px',
                        textAlign: 'center',
                        boxShadow: '0 0 8px rgba(255, 45, 85, 0.6)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-l"
                      style={{ background: '#00D4FF', boxShadow: '0 0 8px #00D4FF' }}
                    />
                  )}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* AI Security Assistant panel */}
      <div className="mx-3 mb-4">
        {/* Chat panel (expanded) */}
        {chatOpen && (
          <div
            className="rounded-xl mb-2 flex flex-col"
            style={{
              background: 'rgba(8,13,28,0.98)',
              border: '1px solid rgba(139,92,246,0.35)',
              maxHeight: 320,
            }}
          >
            {/* Chat header */}
            <div
              className="flex items-center justify-between px-3 py-2 rounded-t-xl"
              style={{ borderBottom: '1px solid rgba(139,92,246,0.2)' }}
            >
              <div className="flex items-center gap-1.5">
                <Bot size={13} style={{ color: '#A78BFA' }} />
                <span className="text-xs font-semibold" style={{ color: '#A78BFA' }}>
                  AI Assistant
                </span>
              </div>
              <button onClick={() => setChatOpen(false)}>
                <X size={13} style={{ color: 'rgba(148,163,184,0.5)' }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2" style={{ maxHeight: 210 }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="text-xs rounded-lg px-2.5 py-1.5 max-w-[85%]"
                    style={{
                      background: m.role === 'user'
                        ? 'rgba(0,212,255,0.15)'
                        : 'rgba(139,92,246,0.15)',
                      color: m.role === 'user' ? '#BAE6FD' : '#DDD6FE',
                      border: m.role === 'user'
                        ? '1px solid rgba(0,212,255,0.25)'
                        : '1px solid rgba(139,92,246,0.25)',
                      lineHeight: 1.5,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div
                    className="text-xs rounded-lg px-2.5 py-1.5"
                    style={{
                      background: 'rgba(139,92,246,0.1)',
                      color: 'rgba(167,139,250,0.6)',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}
                  >
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-2 px-2 py-2 rounded-b-xl"
              style={{ borderTop: '1px solid rgba(139,92,246,0.15)' }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about threats…"
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: '#E2E8F0', caretColor: '#A78BFA' }}
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                style={{ color: input.trim() ? '#A78BFA' : 'rgba(148,163,184,0.3)' }}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Collapsed assistant card — always visible */}
        <div
          className="rounded-xl p-3 cursor-pointer"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
          }}
          onClick={() => setChatOpen((o) => !o)}
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold" style={{ color: '#F1F5F9' }}>
              AI Security Assistant
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{
                background: '#00AAFF',
                boxShadow: '0 0 5px #00AAFF',
                animation: 'blink 1.5s ease-in-out infinite',
              }} />
              <span className="text-xs" style={{ color: '#00AAFF' }}>Online</span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(148,163,184,0.6)' }}>
            Ask me anything about your security posture...
          </p>

          {/* Orb */}
          <div className="flex justify-center items-center py-1">
            <div style={{ position: 'relative', width: 36, height: 36 }}>
              {/* Outer rotating shimmer ring */}
              <div style={{
                position: 'absolute', inset: -6,
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, transparent 55%, rgba(139,92,246,0.65) 72%, rgba(96,165,250,0.85) 84%, transparent 100%)',
                animation: 'orb-spin 3s linear infinite',
                filter: 'blur(3px)',
              }} />
              {/* Counter-rotating mid ring */}
              <div style={{
                position: 'absolute', inset: -3,
                borderRadius: '50%',
                background: 'conic-gradient(from 180deg, transparent 58%, rgba(167,139,250,0.4) 72%, rgba(59,130,246,0.55) 84%, transparent 100%)',
                animation: 'orb-spin 5s linear infinite reverse',
                filter: 'blur(2px)',
              }} />
              {/* Core sphere */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 35%, rgba(255,255,255,0.55) 0%, rgba(147,197,253,0.9) 18%, rgba(99,102,241,0.85) 45%, rgba(49,46,129,0.95) 72%, rgba(15,10,40,1) 100%)',
                boxShadow: '0 0 18px rgba(139,92,246,0.55), 0 0 40px rgba(99,102,241,0.28), inset 0 0 20px rgba(0,0,0,0.4)',
                animation: 'orb-breathe 3s ease-in-out infinite',
              }} />
              {/* Specular highlight */}
              <div style={{
                position: 'absolute', top: '16%', left: '22%',
                width: '28%', height: '18%',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 100%)',
                filter: 'blur(1px)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
