'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { ImportProgress } from '../types';

interface ProgressBarProps {
  progress: ImportProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const statusMessage = progress.message || 'Extracting lead fields and mapping columns...';

  return (
    <div className="flex justify-center items-center py-16 w-full animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div 
        className="w-full max-w-md border border-line rounded-2xl p-8 shadow-neon-card relative overflow-hidden"
        style={{
          background: '#10151C',
        }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Lead processing progress"
        aria-live="polite"
      >
        {/* Subtle top edge glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-confirm to-transparent opacity-60" />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin" size={22} style={{ color: '#4FD1C5' }} aria-hidden="true" />
            <h3 className="text-lg font-bold tracking-tight" style={{ color: '#F3F1EA', fontFamily: "'Space Grotesk', sans-serif" }}>Processing Leads</h3>
          </div>
          <span 
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse"
            style={{
              color: '#4FD1C5',
              background: 'rgba(79, 209, 197, 0.1)',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            AI Ingestion
          </span>
        </div>

        {/* Indeterminate glowing shimmer bar */}
        <div className="w-full h-2 rounded-full overflow-hidden mb-5 relative bg-panel" style={{ background: '#0A0D12' }}>
          <div 
            className="h-full rounded-full w-1/2 animate-shimmer absolute left-0" 
            style={{
              background: 'linear-gradient(to right, transparent, #4FD1C5, transparent)'
            }}
          />
        </div>

        <div className="text-sm text-center leading-relaxed text-balance" style={{ color: '#9AA4B1' }}>
          {statusMessage}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
