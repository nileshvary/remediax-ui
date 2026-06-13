'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[RemediAX ErrorBoundary]', this.props.label ?? '', error, info.componentStack);
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-xl p-8 m-4"
        style={{
          background: 'rgba(255,45,85,0.06)',
          border: '1px solid rgba(255,45,85,0.2)',
          minHeight: 200,
        }}
      >
        <AlertTriangle size={28} style={{ color: '#FF2D55' }} />
        <div className="text-center">
          <p className="font-semibold text-sm mb-1" style={{ color: '#FF2D55' }}>
            {this.props.label ?? 'Component'} failed to render
          </p>
          <p className="text-xs max-w-md" style={{ color: 'rgba(148,163,184,0.7)' }}>
            {error.message}
          </p>
        </div>
        <button
          onClick={() => this.setState({ error: null })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.25)', color: '#FF2D55' }}
        >
          <RefreshCw size={12} />
          Retry
        </button>
      </div>
    );
  }
}
