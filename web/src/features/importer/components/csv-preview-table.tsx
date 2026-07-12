'use client';

import React from 'react';
import { Play, RotateCcw, ArrowUpRight } from 'lucide-react';

interface CSVPreviewTableProps {
  headers: string[];
  rows: Record<string, any>[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function CSVPreviewTable({ headers, rows, onConfirm, onCancel }: CSVPreviewTableProps) {
  // Show up to 100 rows in preview to avoid DOM bloat
  const previewRows = rows.slice(0, 100);

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
        <div>
          <h3 className="text-2xl font-bold tracking-tight" style={{ color: '#F3F1EA', fontFamily: "'Space Grotesk', sans-serif" }}>CSV Data Preview</h3>
          <p className="text-sm mt-1" style={{ color: '#9AA4B1' }}>
            Reviewing first {previewRows.length} of {rows.length} records. Confirm to map columns.
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            type="button" 
            className="flex items-center justify-center gap-2 h-12 sm:h-11 px-5 rounded-xl font-medium border hover:bg-panel2 transition-all focus-ring cursor-pointer w-full sm:w-auto text-sm"
            style={{
              background: '#10151C',
              borderColor: '#212B34',
              color: '#9AA4B1'
            }}
            onClick={onCancel}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Cancel
          </button>
          <button 
            type="button" 
            className="flex items-center justify-center gap-1.5 h-12 sm:h-11 px-5 rounded-xl font-semibold hover:opacity-95 transition-all shadow-md focus-ring cursor-pointer w-full sm:w-auto text-sm"
            style={{
              background: '#4FD1C5',
              color: '#0A0D12',
            }}
            onClick={onConfirm}
          >
            <Play size={15} fill="#0A0D12" aria-hidden="true" />
            Confirm Import
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      <div className="relative w-full border border-line rounded-2xl overflow-hidden shadow-neon-card" style={{ background: '#10151C' }}>
        {/* Right side fade indicator showing scroll availability */}
        <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-ink/30 to-transparent z-20" />
        
        <div 
          className="overflow-auto max-h-[440px] custom-scrollbar"
          tabIndex={0}
          role="region"
          aria-label="CSV preview scrollable grid"
        >
          <table className="w-full border-collapse text-left text-[13px] min-w-max" aria-label="CSV preview dataset">
            <thead>
              <tr className="border-b border-line" style={{ background: '#141B23' }}>
                <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 border-r border-line text-center w-12" style={{ color: '#9AA4B1', background: '#141B23', borderColor: '#212B34', fontFamily: "'JetBrains Mono', monospace" }}>#</th>
                {headers.map((h, i) => (
                  <th scope="col" key={i} className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10" style={{ color: '#9AA4B1', background: '#141B23', fontFamily: "'JetBrains Mono', monospace" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/20">
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="transition-colors hover:bg-panel2/40">
                  <td className="p-4 font-semibold text-center border-r bg-[#10151C] text-xs" style={{ borderColor: 'rgba(33, 43, 52, 0.2)', color: '#5F6A76', fontFamily: "'JetBrains Mono', monospace" }}>{rowIndex + 1}</td>
                  {headers.map((header, colIndex) => {
                    const cellValue = row[header];
                    return (
                      <td key={colIndex} className="p-4 max-w-[280px] truncate" style={{ color: '#F3F1EA' }}>
                        {cellValue !== undefined && cellValue !== null ? String(cellValue) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CSVPreviewTable;
