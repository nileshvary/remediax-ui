'use client';

import React, { useEffect, useRef, useState } from 'react';
import RemediAXLogo from './RemediAXLogo';
import {
  LayoutDashboard,
  Network,
  Brain,
  AlertTriangle,
  Server,
  ShieldAlert,
  BarChart3,
  Zap,
  Settings,
  Bot,
  Globe,
  TrendingUp,
  Send,
  X,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const navItems = [
  { icon: Globe, label: 'Overview', active: false },
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Network, label: 'Network Monitor', active: false },
  { icon: ShieldAlert, label: 'Threat Intelligence', active: false },
  { icon: Brain, label: 'AI Insights', active: false },
  { icon: AlertTriangle, label: 'Alerts', active: false, badge: 12 },
  { icon: Server, label: 'Assets', active: false },
  { icon: TrendingUp, label: 'Vulnerabilities', active: false },
  { icon: BarChart3, label: 'Reports', active: false },
  { icon: Zap, label: 'Automation', active: false },
  { icon: Settings, label: 'Settings', active: false },
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
                <button
                  onClick={() => setActiveItem(item.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative"
                  style={{
                    background: isActive ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                    color: isActive ? '#00D4FF' : 'rgba(148, 163, 184, 0.8)',
                    borderLeft: isActive ? '2px solid #00D4FF' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 212, 255, 0.05)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148, 163, 184, 0.8)';
                    }
                  }}
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
                </button>
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
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <Bot size={16} style={{ color: '#A78BFA' }} />
              <span
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{
                  background: '#00FF87',
                  boxShadow: '0 0 6px #00FF87',
                  animation: 'blink 1.5s ease-in-out infinite',
                }}
              />
            </div>
            <span className="text-xs font-semibold" style={{ color: '#A78BFA' }}>
              AI Security Assistant
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>
            {chatOpen ? 'Click to collapse chat.' : 'Click to ask about threats, OWASP categories, or remediation.'}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: '#00FF87',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            <span className="text-xs" style={{ color: '#00FF87' }}>Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
