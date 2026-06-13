'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Save, CheckCircle, AlertCircle, Target, Key, SlidersHorizontal, Plus, Trash2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface Config {
  target_url: string;
  system_prompt: string;
  scanners: string[];
  pyrit_max_turns: number;
  output_dir: string;
  log_level: string;
  anthropic_api_key_set: boolean;
  openai_api_key_set: boolean;
  mistral_api_key_set: boolean;
  custom_key_names: string[];
  custom_keys_set: Record<string, boolean>;
}

const DEFAULT_CONFIG: Config = {
  target_url: '',
  system_prompt: '',
  scanners: ['garak', 'pyrit', 'vector'],
  pyrit_max_turns: 5,
  output_dir: 'artifacts/',
  log_level: 'INFO',
  anthropic_api_key_set: false,
  openai_api_key_set: false,
  mistral_api_key_set: false,
  custom_key_names: [],
  custom_keys_set: {},
};

function SectionHeader({ icon: Icon, title, color = '#00D4FF' }: { icon: React.ElementType; title: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>{title}</h3>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.8)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#E2E8F0',
          caretColor: '#00D4FF',
        }}
        onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,212,255,0.4)'; e.currentTarget.style.background = 'rgba(0,212,255,0.04)'; }}
        onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      />
    </div>
  );
}

function MaskedKeyField({ label, fieldName, isSet, onSave, onDelete }: {
  label: string; fieldName: string; isSet: boolean;
  onSave: (field: string, value: string) => void;
  onDelete: (field: string) => void;
}) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.8)' }}>{label}</label>
        {isSet && (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(0,255,135,0.1)', color: '#00FF87', border: '1px solid rgba(0,255,135,0.2)' }}>
              Set ✓
            </span>
            <button onClick={() => onDelete(fieldName)}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors"
              style={{ background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.2)', color: 'rgba(255,45,85,0.7)' }}>
              <Trash2 size={10} /> Remove
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center px-3 py-2 rounded-lg gap-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={isSet ? '••••••••••••••••' : 'Enter key…'}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#E2E8F0', caretColor: '#00D4FF' }}
          />
          <button onClick={() => setShow(s => !s)} style={{ color: 'rgba(148,163,184,0.5)' }}>
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        <button
          onClick={() => { if (value.trim()) { onSave(fieldName, value.trim()); setValue(''); } }}
          disabled={!value.trim()}
          className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: value.trim() ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
            border: value.trim() ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
            color: value.trim() ? '#00D4FF' : 'rgba(148,163,184,0.4)',
          }}>
          Save
        </button>
      </div>
      <p className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>
        Stored in server .env only — never sent to browser after save
      </p>
    </div>
  );
}

interface CustomKeyRow { name: string; value: string; show: boolean; }

export default function ConfigTab() {
  const [cfg, setCfg] = useState<Config>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [customRows, setCustomRows] = useState<CustomKeyRow[]>([]);

  useEffect(() => {
    fetch(`${API}/api/config`)
      .then(r => r.json())
      .then((data: Config) => {
        setCfg({ ...DEFAULT_CONFIG, ...data });
        if (data.custom_key_names?.length) {
          setCustomRows(data.custom_key_names.map(name => ({ name, value: '', show: false })));
        }
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch(`${API}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: cfg.target_url,
          system_prompt: cfg.system_prompt,
          scanners: cfg.scanners,
          pyrit_max_turns: cfg.pyrit_max_turns,
          output_dir: cfg.output_dir,
          log_level: cfg.log_level,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Could not save — is the API server running?');
    } finally {
      setSaving(false);
    }
  }

  async function saveKey(field: string, value: string) {
    try {
      await fetch(`${API}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      setCfg(c => ({ ...c, [`${field}_set`]: true }));
    } catch { /* silent */ }
  }

  async function deleteKey(field: string) {
    try {
      await fetch(`${API}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: '' }),
      });
      setCfg(c => ({ ...c, [`${field}_set`]: false }));
    } catch { /* silent */ }
  }

  async function saveCustomKey(idx: number) {
    const row = customRows[idx];
    if (!row.name.trim() || !row.value.trim()) return;
    try {
      await fetch(`${API}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_keys: { [row.name.trim()]: row.value.trim() } }),
      });
      setCustomRows(r => r.map((x, i) => i === idx ? { ...x, value: '', show: false } : x));
      setCfg(c => ({
        ...c,
        custom_key_names: [...new Set([...c.custom_key_names, row.name.trim().toUpperCase()])],
        custom_keys_set: { ...c.custom_keys_set, [row.name.trim().toUpperCase()]: true },
      }));
    } catch { /* silent */ }
  }

  function toggleScanner(name: string) {
    setCfg(c => ({
      ...c,
      scanners: c.scanners.includes(name)
        ? c.scanners.filter(s => s !== name)
        : [...c.scanners, name],
    }));
  }

  const SCANNERS = [
    { id: 'garak',  label: 'Garak',          desc: 'OWASP LLM01, LLM05 — red-teaming probes',        color: '#06B6D4' },
    { id: 'pyrit',  label: 'PyRIT',           desc: 'LLM01-LLM07, LLM09, LLM10 — multi-turn attack',  color: '#F97316' },
    { id: 'vector', label: 'Vector Poisoner', desc: 'ASI01-ASI10 — agentic & RAG poisoning',           color: '#8B5CF6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 max-w-3xl"
    >
      {/* Section 1 — Scan Target */}
      <div className="glass-card p-5">
        <SectionHeader icon={Target} title="Scan Target" color="#00D4FF" />
        <div className="space-y-4">
          <InputField
            label="Target URL or Model ID"
            value={cfg.target_url}
            onChange={v => setCfg(c => ({ ...c, target_url: v }))}
            placeholder="https://your-llm-app.com/chat  or  openai:gpt-4o"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.8)' }}>
              Target System Prompt <span style={{ color: 'rgba(148,163,184,0.4)' }}>(optional — used by Agent 2 for hardening)</span>
            </label>
            <textarea
              value={cfg.system_prompt}
              onChange={e => setCfg(c => ({ ...c, system_prompt: e.target.value }))}
              placeholder="Paste the target LLM's system prompt here…"
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#E2E8F0',
                caretColor: '#00D4FF',
              }}
              onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,212,255,0.4)'; }}
              onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; }}
            />
          </div>
        </div>
      </div>

      {/* Section 2 — API Keys */}
      <div className="glass-card p-5">
        <SectionHeader icon={Key} title="API Keys" color="#F59E0B" />
        <div className="space-y-4">
          <MaskedKeyField
            label="ANTHROPIC_API_KEY"
            fieldName="anthropic_api_key"
            isSet={cfg.anthropic_api_key_set}
            onSave={saveKey}
            onDelete={deleteKey}
          />
          <MaskedKeyField
            label="OPENAI_API_KEY (optional — for OpenAI targets)"
            fieldName="openai_api_key"
            isSet={cfg.openai_api_key_set}
            onSave={saveKey}
            onDelete={deleteKey}
          />

          {/* Custom keys */}
          {customRows.map((row, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <input
                  value={row.name}
                  onChange={e => setCustomRows(r => r.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                  placeholder="KEY_NAME (e.g. GEMINI_API_KEY)"
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0', marginRight: 8 }}
                />
                {cfg.custom_keys_set[row.name.toUpperCase()] && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium mr-2"
                    style={{ background: 'rgba(0,255,135,0.1)', color: '#00FF87', border: '1px solid rgba(0,255,135,0.2)', whiteSpace: 'nowrap' }}>
                    Set ✓
                  </span>
                )}
                <button onClick={() => setCustomRows(r => r.filter((_, i) => i !== idx))}
                  style={{ color: 'rgba(255,45,85,0.6)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center px-3 py-2 rounded-lg gap-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <input
                    type={row.show ? 'text' : 'password'}
                    value={row.value}
                    onChange={e => setCustomRows(r => r.map((x, i) => i === idx ? { ...x, value: e.target.value } : x))}
                    placeholder={cfg.custom_keys_set[row.name.toUpperCase()] ? '••••••••••••••••' : 'Enter key…'}
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: '#E2E8F0', caretColor: '#00D4FF' }}
                  />
                  <button onClick={() => setCustomRows(r => r.map((x, i) => i === idx ? { ...x, show: !x.show } : x))}
                    style={{ color: 'rgba(148,163,184,0.5)' }}>
                    {row.show ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <button
                  onClick={() => saveCustomKey(idx)}
                  disabled={!row.name.trim() || !row.value.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: (row.name.trim() && row.value.trim()) ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: (row.name.trim() && row.value.trim()) ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: (row.name.trim() && row.value.trim()) ? '#00D4FF' : 'rgba(148,163,184,0.4)',
                  }}>
                  Save
                </button>
              </div>
              <p className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>Stored in server .env only — never sent to browser after save</p>
            </div>
          ))}

          <button
            onClick={() => setCustomRows(r => [...r, { name: '', value: '', show: false }])}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-fit"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', color: 'rgba(148,163,184,0.6)' }}>
            <Plus size={12} />
            Add Custom Key
          </button>
        </div>
      </div>

      {/* Section 3 — Scan Settings */}
      <div className="glass-card p-5">
        <SectionHeader icon={SlidersHorizontal} title="Scan Settings" color="#8B5CF6" />
        <div className="space-y-5">
          {/* Scanners */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'rgba(148,163,184,0.8)' }}>Scanners to Run</label>
            <div className="space-y-2">
              {SCANNERS.map(s => (
                <label key={s.id} className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: cfg.scanners.includes(s.id) ? `${s.color}0A` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${cfg.scanners.includes(s.id) ? `${s.color}30` : 'rgba(255,255,255,0.07)'}`,
                  }}>
                  <div className="mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: cfg.scanners.includes(s.id) ? s.color : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${cfg.scanners.includes(s.id) ? s.color : 'rgba(255,255,255,0.15)'}`,
                    }}
                    onClick={() => toggleScanner(s.id)}>
                    {cfg.scanners.includes(s.id) && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div onClick={() => toggleScanner(s.id)}>
                    <p className="text-sm font-medium" style={{ color: cfg.scanners.includes(s.id) ? s.color : '#E2E8F0' }}>{s.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>{s.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* PyRIT turns + output dir */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.8)' }}>PyRIT Max Turns</label>
              <input
                type="number"
                min={1} max={20}
                value={cfg.pyrit_max_turns}
                onChange={e => setCfg(c => ({ ...c, pyrit_max_turns: parseInt(e.target.value) || 5 }))}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0' }}
              />
            </div>
            <InputField
              label="Output Directory"
              value={cfg.output_dir}
              onChange={v => setCfg(c => ({ ...c, output_dir: v }))}
              placeholder="artifacts/"
            />
          </div>

          {/* Log level */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.8)' }}>Log Level</label>
            <select
              value={cfg.log_level}
              onChange={e => setCfg(c => ({ ...c, log_level: e.target.value }))}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(8,13,28,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0' }}>
              {['INFO', 'DEBUG', 'WARNING', 'ERROR'].map(l => (
                <option key={l} value={l} style={{ background: '#0A0F1E' }}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save row */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
          style={{
            background: saving ? 'rgba(0,212,255,0.06)' : 'rgba(0,212,255,0.12)',
            border: '1px solid rgba(0,212,255,0.3)',
            color: '#00D4FF',
          }}>
          <Save size={14} />
          <span>{saving ? 'Saving…' : 'Save Config'}</span>
        </button>

        {saved && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-sm"
            style={{ color: '#00FF87' }}>
            <CheckCircle size={14} />
            <span>Saved successfully</span>
          </motion.div>
        )}
        {error && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#FF2D55' }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
