import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-grow flex items-center justify-center bg-[#07090f] text-slate-100 min-h-screen p-6">
      <div 
        className="w-full max-w-md bg-obsidian-900 border border-obsidian-800 rounded-2xl p-8 text-center shadow-neon-card"
        role="region"
        aria-label="404 Not Found Page"
      >
        <div className="bg-brand-cyan/10 p-4 rounded-full w-fit mx-auto mb-6">
          <Compass className="text-brand-cyan" size={32} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Page Not Found</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          The page or workspace view you are searching for does not exist. Let's return to the import dashboard.
        </p>
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl bg-obsidian-800 hover:bg-obsidian-700/80 border border-obsidian-750 text-slate-200 w-full transition-all focus-ring cursor-pointer"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
