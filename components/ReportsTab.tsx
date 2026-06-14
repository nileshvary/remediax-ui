'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Download, ExternalLink, AlertCircle, FileText, Loader2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8002';

interface ScoreData {
  score: number;
  label: string;
  finding_count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH:     '#F97316',
  MEDIUM:   '#EAB308',
  LOW:      '#22C55E',
};

export default function ReportsTab() {
  const [score, setScore] = useState<ScoreData | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [reportExists, setReportExists] = useState<boolean | null>(null);
  const [iframeKey] = useState(0);

  useEffect(() => {
    fetch(`${API}/api/score`)
      .then(r => r.json())
      .then(setScore)
      .catch(() => {});

    fetch(`${API}/api/report/exists`)
      .then(r => r.json())
      .then((d: { exists: boolean }) => setReportExists(d.exists))
      .catch(() => setReportExists(false));
  }, []);

  const openInNewTab = () => window.open(`${API}/api/report`, '_blank');

  const downloadPDF = () => {
    // Open full report in new tab — user presses Ctrl+P → Save as PDF.
    // Blob URL + auto-print was revoked before the browser finished printing,
    // causing silent truncation. Direct URL is simpler and reliable.
    window.open(`${API}/api/report`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Metadata bar */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: heading + stats */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 40, height: 40, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              <FileText size={18} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: '#E2E8F0', fontSize: 15 }}>Security Report</h2>
              <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: 12 }}>Agent 3 output — summary.html</p>
            </div>

            {score && (
              <div className="flex items-center gap-3 ml-4">
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Shield size={12} style={{ color: '#00D4FF' }} />
                  <span style={{ color: '#E2E8F0', fontSize: 12 }}>{score.finding_count} findings</span>
                </div>

                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => {
                  const count = score[sev.toLowerCase() as keyof ScoreData] as number;
                  if (!count) return null;
                  return (
                    <div
                      key={sev}
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: `${SEVERITY_COLORS[sev]}18`, color: SEVERITY_COLORS[sev], border: `1px solid ${SEVERITY_COLORS[sev]}30` }}
                    >
                      {count} {sev}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={downloadPDF}
              disabled={reportExists === false}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: reportExists === false ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.12)',
                border: reportExists === false ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(59,130,246,0.3)',
                color: reportExists === false ? 'rgba(148,163,184,0.4)' : '#3B82F6',
                cursor: reportExists === false ? 'not-allowed' : 'pointer',
              }}
            >
              <Download size={14} />
              Download PDF
            </button>

            <button
              onClick={openInNewTab}
              disabled={reportExists === false}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: reportExists === false ? 'rgba(255,255,255,0.04)' : 'rgba(0,212,255,0.08)',
                border: reportExists === false ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,212,255,0.2)',
                color: reportExists === false ? 'rgba(148,163,184,0.4)' : '#00D4FF',
                cursor: reportExists === false ? 'not-allowed' : 'pointer',
              }}
            >
              <ExternalLink size={14} />
              Open in New Tab
            </button>
          </div>
        </div>
      </div>

      {/* Report viewer */}
      <div
        className="rounded-xl overflow-hidden relative"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          minHeight: 'calc(100vh - 260px)',
        }}
      >
        {reportExists === false ? (
          /* Report file missing */
          <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 'calc(100vh - 260px)' }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 56, height: 56, background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)' }}
            >
              <AlertCircle size={24} style={{ color: '#FF8C00' }} />
            </div>
            <div className="text-center">
              <p className="font-semibold" style={{ color: '#E2E8F0', fontSize: 15 }}>Report not found</p>
              <p className="mt-1" style={{ color: 'rgba(148,163,184,0.6)', fontSize: 13 }}>
                Run Agent 3 (ReporterAgent) to generate <code style={{ color: '#00D4FF' }}>artifacts/summary.html</code>
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Loading spinner — shown until iframe fires onLoad */}
            {!iframeLoaded && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                style={{ background: 'rgba(10,15,30,0.85)', zIndex: 10 }}
              >
                <Loader2 size={28} style={{ color: '#00D4FF', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 13 }}>Loading report…</p>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={`${API}/api/report`}
              title="RemediAX Security Report"
              onLoad={() => setIframeLoaded(true)}
              style={{
                width: '100%',
                height: 'calc(100vh - 260px)',
                border: 'none',
                display: 'block',
                borderRadius: 12,
              }}
            />
          </>
        )}
      </div>

      {/* PDF tip */}
      {reportExists !== false && (
        <p style={{ color: 'rgba(148,163,184,0.4)', fontSize: 11, textAlign: 'center' }}>
          To save as PDF: click <strong style={{ color: 'rgba(148,163,184,0.6)' }}>Download PDF</strong> → report opens in a new tab with all findings → press <kbd style={{ color: 'rgba(148,163,184,0.6)' }}>Ctrl+P</kbd> → Destination: <em style={{ color: 'rgba(148,163,184,0.6)' }}>Save as PDF</em>
        </p>
      )}
    </div>
  );
}
