import React from 'react';

export default function Loading() {
  return (
    <div className="flex-grow flex items-center justify-center bg-[#07090f] text-slate-100 min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-indigo/20 border-t-brand-cyan animate-spin" />
        <span className="text-sm font-medium text-slate-400 tracking-wider">Loading Lead-Mapper workspace...</span>
      </div>
    </div>
  );
}
