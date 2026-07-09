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
    <div className="flex justify-center py-12 w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div 
        className="w-full max-w-md border border-line rounded-2xl p-8 shadow-neon-card"
        style={{
          background: '#10151C',
        }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Lead processing progress"
        aria-live="polite"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin" size={24} style={{ color: '#4FD1C5' }} aria-hidden="true" />
            <h3 className="text-lg font-semibold" style={{ color: '#F3F1EA', fontFamily: "'Space Grotesk', sans-serif" }}>Processing Leads</h3>
          </div>
          <span 
            className="text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{
              color: '#4FD1C5',
              background: 'rgba(79, 209, 197, 0.1)',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            AI Ingestion
          </span>
        </div>

        {/* Indeterminate glowing bar */}
        <div className="w-full h-2 rounded-full overflow-hidden mb-4 relative" style={{ background: '#141B23' }}>
          <div 
            className="h-full rounded-full w-1/2 animate-shimmer absolute left-0" 
            style={{
              background: 'linear-gradient(to right, #212B34, #4FD1C5, #212B34)'
            }}
          />
        </div>

        <div className="text-sm text-center leading-relaxed" style={{ color: '#9AA4B1' }}>
          {statusMessage}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
