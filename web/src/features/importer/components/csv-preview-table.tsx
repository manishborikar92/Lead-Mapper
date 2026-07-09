'use client';

import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

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
    <div className="flex flex-col w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#F3F1EA', fontFamily: "'Space Grotesk', sans-serif" }}>CSV Data Preview</h3>
          <p className="text-sm mt-1" style={{ color: '#9AA4B1' }}>
            Showing first {previewRows.length} of {rows.length} rows. Please review and confirm the import.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            type="button" 
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium border transition-all focus-ring cursor-pointer"
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
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg focus-ring cursor-pointer"
            style={{
              background: '#4FD1C5',
              color: '#0A0D12',
            }}
            onClick={onConfirm}
          >
            <Play size={16} aria-hidden="true" />
            Confirm Import
          </button>
        </div>
      </div>

      <div 
        className="overflow-auto max-h-[480px] border border-line rounded-xl custom-scrollbar"
        style={{
          background: 'rgba(16, 21, 28, 0.4)'
        }}
        tabIndex={0}
        role="region"
        aria-label="CSV preview scrollable grid"
      >
        <table className="w-full border-collapse text-left text-sm min-w-max" aria-label="CSV preview dataset">
          <thead>
            <tr className="border-b border-line" style={{ background: '#10151C' }}>
              <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 border-r border-line whitespace-nowrap" style={{ color: '#9AA4B1', background: '#10151C', fontFamily: "'JetBrains Mono', monospace" }}>#</th>
              {headers.map((h, i) => (
                <th scope="col" key={i} className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 whitespace-nowrap" style={{ color: '#9AA4B1', background: '#10151C', fontFamily: "'JetBrains Mono', monospace" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/30">
            {previewRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="transition-colors hover:bg-[#141B23]/50">
                <td className="p-4 font-semibold text-center border-r bg-[#10151C]/25 whitespace-nowrap" style={{ borderColor: 'rgba(33, 43, 52, 0.2)', color: '#5F6A76' }}>{rowIndex + 1}</td>
                {headers.map((header, colIndex) => {
                  const cellValue = row[header];
                  return (
                    <td key={colIndex} className="p-4 max-w-[280px] truncate whitespace-nowrap" style={{ color: '#F3F1EA' }}>
                      {cellValue !== undefined && cellValue !== null ? String(cellValue) : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CSVPreviewTable;
