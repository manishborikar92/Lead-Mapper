'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Download, RefreshCw, ArrowUpRight } from 'lucide-react';
import { CRMRecord } from '../types';

interface ResultDashboardProps {
  imported: CRMRecord[];
  skipped: Record<string, any>[];
  totalUploaded: number;
  onReset: () => void;
}

export function ResultDashboard({ imported, skipped, totalUploaded, onReset }: ResultDashboardProps) {
  const [activeTab, setActiveTab] = useState<'success' | 'skipped'>('success');

  const successRate = totalUploaded > 0 ? Math.round((imported.length / totalUploaded) * 100) : 0;

  // Download mapped records as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(imported, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `groweasy_crm_leads_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, tab: 'success' | 'skipped') => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Ingestion Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" role="region" aria-label="Ingestion Statistics">
        <div className="border border-l-4 rounded-xl p-5 flex flex-col shadow-neon-card hover:-translate-y-0.5 transition-all duration-300 bg-panel border-line border-l-confirm">
          <span className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Total Uploaded</span>
          <span className="text-3xl font-bold tracking-tight" style={{ color: '#F3F1EA', fontFamily: "'Space Grotesk', sans-serif" }}>{totalUploaded}</span>
          <span className="text-xs mt-2" style={{ color: '#5F6A76' }}>Source rows from CSV</span>
        </div>
        
        <div className="border border-l-4 rounded-xl p-5 flex flex-col shadow-neon-card hover:-translate-y-0.5 transition-all duration-300 bg-panel border-line border-l-confirm">
          <span className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Successfully Mapped</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} style={{ color: '#4FD1C5' }} aria-hidden="true" />
            <span className="text-3xl font-bold tracking-tight" style={{ color: '#F3F1EA', fontFamily: "'Space Grotesk', sans-serif" }}>{imported.length}</span>
          </div>
          <span className="text-xs mt-2" style={{ color: '#5F6A76' }}>Ingested CRM leads</span>
        </div>
        
        <div className="border border-l-4 rounded-xl p-5 flex flex-col shadow-neon-card hover:-translate-y-0.5 transition-all duration-300 bg-panel border-line border-l-signal">
          <span className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Skipped Records</span>
          <div className="flex items-center gap-2">
            <XCircle size={20} style={{ color: '#FF7A45' }} aria-hidden="true" />
            <span className="text-3xl font-bold tracking-tight" style={{ color: '#F3F1EA', fontFamily: "'Space Grotesk', sans-serif" }}>{skipped.length}</span>
          </div>
          <span className="text-xs mt-2" style={{ color: '#5F6A76' }}>No phone or email found</span>
        </div>
        
        <div className="border border-l-4 rounded-xl p-5 flex flex-col shadow-neon-card hover:-translate-y-0.5 transition-all duration-300 bg-panel border-line border-l-confirm">
          <span className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Success Ingestion Rate</span>
          <span className="text-3xl font-bold tracking-tight" style={{ color: '#F3F1EA', fontFamily: "'Space Grotesk', sans-serif" }}>{successRate}%</span>
          <span className="text-xs mt-2" style={{ color: '#5F6A76' }}>Ingestion ratio</span>
        </div>
      </div>

      {/* 2. Actions & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-line pb-4 gap-4">
        <div className="flex bg-panel/60 p-1 rounded-xl border border-line" role="tablist" aria-label="Ingestion outcome logs">
          <button 
            type="button" 
            role="tab"
            id="tab-success"
            aria-controls="panel-success"
            aria-selected={activeTab === 'success'}
            tabIndex={0}
            className="px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all focus-ring cursor-pointer"
            style={{
              background: activeTab === 'success' ? '#141B23' : 'transparent',
              color: activeTab === 'success' ? '#4FD1C5' : '#9AA4B1',
              border: activeTab === 'success' ? '1px solid #212B34' : '1px solid transparent'
            }}
            onClick={() => setActiveTab('success')}
            onKeyDown={(e) => handleTabKeyDown(e, 'success')}
          >
            Mapped Leads ({imported.length})
          </button>
          <button 
            type="button" 
            role="tab"
            id="tab-skipped"
            aria-controls="panel-skipped"
            aria-selected={activeTab === 'skipped'}
            tabIndex={0}
            className="px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all focus-ring cursor-pointer"
            style={{
              background: activeTab === 'skipped' ? '#141B23' : 'transparent',
              color: activeTab === 'skipped' ? '#4FD1C5' : '#9AA4B1',
              border: activeTab === 'skipped' ? '1px solid #212B34' : '1px solid transparent'
            }}
            onClick={() => setActiveTab('skipped')}
            onKeyDown={(e) => handleTabKeyDown(e, 'skipped')}
          >
            Skipped Rows ({skipped.length})
          </button>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            type="button" 
            className="flex items-center justify-center gap-2 h-11 px-4 py-2 rounded-xl text-sm font-medium border hover:bg-panel2 transition-all focus-ring cursor-pointer w-full sm:w-auto"
            style={{
              background: '#10151C',
              borderColor: '#212B34',
              color: '#9AA4B1'
            }}
            onClick={onReset}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Import Another
          </button>
          {imported.length > 0 && (
            <button 
              type="button" 
              className="flex items-center justify-center gap-1.5 h-11 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-95 transition-all focus-ring cursor-pointer shadow-lg w-full sm:w-auto"
              style={{
                background: '#4FD1C5',
                color: '#0A0D12',
              }}
              onClick={handleExportJSON}
            >
              <Download size={14} aria-hidden="true" />
              Export JSON
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Tab content display */}
      <div className="border border-line rounded-2xl overflow-hidden shadow-neon-card relative" style={{ background: '#10151C' }}>
        <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-ink/30 to-transparent z-20" />

        {activeTab === 'success' ? (
          <div 
            id="panel-success"
            role="tabpanel"
            aria-labelledby="tab-success"
          >
            {imported.length === 0 ? (
              <div className="text-center py-16" style={{ color: '#5F6A76' }}>
                No records were successfully mapped to CRM leads.
              </div>
            ) : (
              <div className="overflow-auto max-h-[440px] custom-scrollbar" tabIndex={0}>
                <table className="w-full border-collapse text-left text-[13px] min-w-max" aria-label="Ingested Leads Records">
                  <thead>
                    <tr className="border-b border-line" style={{ background: '#141B23' }}>
                      <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 border-r border-line whitespace-nowrap" style={{ background: '#141B23', color: '#9AA4B1', borderColor: '#212B34', fontFamily: "'JetBrains Mono', monospace" }}>Created At</th>
                      <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 whitespace-nowrap" style={{ background: '#141B23', color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Name</th>
                      <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 whitespace-nowrap" style={{ background: '#141B23', color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Email</th>
                      <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 whitespace-nowrap" style={{ background: '#141B23', color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Mobile</th>
                      <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 whitespace-nowrap" style={{ background: '#141B23', color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Company</th>
                      <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 whitespace-nowrap" style={{ background: '#141B23', color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Source</th>
                      <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 whitespace-nowrap" style={{ background: '#141B23', color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Status</th>
                      <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 whitespace-nowrap" style={{ background: '#141B23', color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/20">
                    {imported.map((lead, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-panel2/40">
                        <td className="p-4 whitespace-nowrap" style={{ color: '#9AA4B1' }}>{lead.created_at}</td>
                        <td className="p-4 font-semibold whitespace-nowrap" style={{ color: '#F3F1EA' }}>{lead.name || '-'}</td>
                        <td className="p-4 whitespace-nowrap" style={{ color: '#F3F1EA' }}>{lead.email || '-'}</td>
                        <td className="p-4 whitespace-nowrap" style={{ color: '#F3F1EA' }}>
                          {lead.country_code ? `${lead.country_code} ` : ''}
                          {lead.mobile_without_country_code || '-'}
                        </td>
                        <td className="p-4 whitespace-nowrap" style={{ color: '#F3F1EA' }}>{lead.company || '-'}</td>
                        <td className="p-4 whitespace-nowrap">
                          {lead.data_source ? (
                            <span 
                              className="inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                              style={{
                                color: '#4FD1C5',
                                background: 'rgba(79, 209, 197, 0.08)',
                                fontFamily: "'JetBrains Mono', monospace"
                              }}
                            >
                              {lead.data_source}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {lead.crm_status ? (
                            <span 
                              className="inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                              style={{
                                color: lead.crm_status === 'GOOD_LEAD_FOLLOW_UP' ? '#4FD1C5' : lead.crm_status === 'DID_NOT_CONNECT' ? '#FF7A45' : lead.crm_status === 'BAD_LEAD' ? '#ef4444' : '#F3F1EA',
                                background: lead.crm_status === 'GOOD_LEAD_FOLLOW_UP' ? 'rgba(79, 209, 197, 0.08)' : lead.crm_status === 'DID_NOT_CONNECT' ? 'rgba(255, 122, 69, 0.08)' : lead.crm_status === 'BAD_LEAD' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(79, 209, 197, 0.2)'
                              }}
                            >
                              {lead.crm_status.replace(/_/g, ' ')}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-4 max-w-[250px] truncate" title={lead.crm_note} style={{ color: '#9AA4B1' }}>
                          {lead.crm_note || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div 
            id="panel-skipped"
            role="tabpanel"
            aria-labelledby="tab-skipped"
          >
            {skipped.length === 0 ? (
              <div className="text-center py-16" style={{ color: '#5F6A76' }}>
                No records were skipped during this import.
              </div>
            ) : (
              <div className="overflow-auto max-h-[440px] custom-scrollbar" tabIndex={0}>
                <table className="w-full border-collapse text-left text-[13px] min-w-max" aria-label="Skipped Data Rows">
                  <thead>
                    <tr className="border-b border-line" style={{ background: '#141B23' }}>
                      <th scope="col" className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10 border-r border-line text-center w-12" style={{ background: '#141B23', color: '#9AA4B1', borderColor: '#212B34', fontFamily: "'JetBrains Mono', monospace" }}>#</th>
                      {Object.keys(skipped[0] || {}).filter(k => k !== 'row_index').map((key, i) => (
                        <th scope="col" key={i} className="sticky top-0 p-4 text-xs font-semibold uppercase tracking-wider z-10" style={{ background: '#141B23', color: '#9AA4B1', fontFamily: "'JetBrains Mono', monospace" }}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/20">
                    {skipped.map((row, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-panel2/40 bg-red-950/5">
                        <td className="p-4 font-semibold border-r bg-[#10151C] text-center" style={{ borderColor: 'rgba(33, 43, 52, 0.2)', color: '#FF7A45', fontFamily: "'JetBrains Mono', monospace" }}>{idx + 1}</td>
                        {Object.entries(row).filter(([k]) => k !== 'row_index').map(([, val], i) => (
                          <td key={i} style={{ color: '#9AA4B1' }} className="p-4">{val !== undefined && val !== null ? String(val) : '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultDashboard;
