'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Next.js App Error Boundary]:', error);
  }, [error]);

  return (
    <div className="flex-grow flex items-center justify-center bg-[#07090f] text-slate-100 min-h-screen p-6">
      <div 
        className="w-full max-w-md bg-obsidian-900 border border-obsidian-800 rounded-2xl p-8 text-center shadow-neon-card"
        role="alert"
        aria-live="assertive"
      >
        <div className="bg-red-500/10 p-4 rounded-full w-fit mx-auto mb-6">
          <AlertCircle className="text-red-400" size={32} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Workspace Error Encountered</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          An unexpected error occurred in your Lead-Mapper workspace. You can attempt to reset the application thread.
        </p>
        <button 
          type="button" 
          className="flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl bg-gradient-to-r from-brand-indigo to-brand-cyan hover:from-brand-indigo/90 hover:to-brand-cyan/90 text-slate-900 w-full transition-all shadow-lg focus-ring cursor-pointer"
          onClick={reset}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Reset Workspace Thread
        </button>
      </div>
    </div>
  );
}
