'use client';

import React, { useEffect, useRef, useState } from "react";
import { useCSVImporter } from '../features/importer/hooks/useCSVImporter';
import { CSVUpload } from '../features/importer/components/csv-upload';
import { CSVPreviewTable } from '../features/importer/components/csv-preview-table';
import { ProgressBar } from '../features/importer/components/progress-bar';
import { ResultDashboard } from '../features/importer/components/result-dashboard';
import { Cpu, ShieldCheck, Layers, FileSpreadsheet, Download, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";

const FEATURES = [
  {
    icon: Cpu,
    title: "Five models, one fallback chain",
    body: "If a Gemini model is rate-limited or down, ingestion moves to the next one in line. No failed uploads, no manual retries.",
  },
  {
    icon: ShieldCheck,
    title: "Skips what it can't use",
    body: "Rows missing both an email and a phone number get flagged and left out, so your CRM doesn't fill up with contacts you can't reach.",
  },
  {
    icon: Layers,
    title: "Structured sheets skip the model",
    body: "Clean, well-labeled columns are matched by rule-based logic in about 2ms. No tokens spent, no round trip to Gemini.",
  },
];

const SAMPLES = [
  { name: "facebook_leads.csv", tag: "Facebook Ads Export", href: "/sample-data/facebook_leads.csv" },
  { name: "google_ads.csv", tag: "Google Ads Lead Sheet", href: "/sample-data/google_ads.csv" },
  { name: "real_estate.csv", tag: "Real Estate CRM Format", href: "/sample-data/real_estate.csv" },
  { name: "messy_spreadsheet.csv", tag: "Messy Spreadsheet", href: "/sample-data/messy_spreadsheet.csv" },
  { name: "edge_cases.csv", tag: "Swapped Columns & Skip Logic", href: "/sample-data/edge_cases.csv" },
];

const MAPPINGS = [
  { from: "fb_lead_email", to: "Email", confidence: 98, ok: true },
  { from: "Phone_Number__c", to: "Phone", confidence: 95, ok: true },
  { from: "Prop_Interest", to: "Property interest", confidence: 91, ok: true },
  { from: "eml", to: "Email", confidence: 88, ok: true },
  { from: "Contact (duplicate)", to: "Skipped — no email/phone", confidence: null, ok: false },
  { from: "Full Name ", to: "Contact name", confidence: 97, ok: true },
];

function MappingConsole() {
  const [visible, setVisible] = useState(3);
  const [cursor, setCursor] = useState(3);
  const reduceMotion = useRef(
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    if (reduceMotion.current) {
      setVisible(MAPPINGS.length);
      return;
    }
    const id = setInterval(() => {
      setCursor((c) => (c + 1) % MAPPINGS.length);
      setVisible((v) => Math.min(v + 1, MAPPINGS.length));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const rows = reduceMotion.current
    ? MAPPINGS
    : Array.from({ length: visible }, (_, i) => MAPPINGS[(cursor - visible + 1 + i + MAPPINGS.length) % MAPPINGS.length]);

  return (
    <div className="rounded-2xl overflow-hidden border border-line bg-panel shadow-neon-card animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-panel2">
        <span className="text-[11px] font-bold tracking-wider uppercase text-mid font-mono">
          Mapping console
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-confirm font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-confirm animate-pulse" />
          live preview
        </span>
      </div>

      <div className="p-4 space-y-2 min-h-[260px] flex flex-col justify-end">
        {rows.map((row, i) => (
          <div
            key={row.from + i}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-line bg-ink/60 hover:border-confirm/20 transition-all duration-200"
          >
            <span className="text-[11px] sm:text-xs truncate flex-1 text-mid font-mono">
              {row.from}
            </span>
            <span className="text-xs shrink-0 text-low font-mono">
              →
            </span>
            <span className={`text-[11px] sm:text-xs truncate flex-1 text-right font-mono ${row.ok ? 'text-hi' : 'text-signal'}`}>
              {row.to}
            </span>
            <span className="shrink-0 w-14 flex items-center justify-end gap-1 font-mono">
              {row.ok ? (
                <>
                  <CheckCircle2 size={13} className="text-confirm" />
                  <span className="text-[10px] text-confirm font-bold">
                    {row.confidence}%
                  </span>
                </>
              ) : (
                <XCircle size={13} className="text-signal" />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const {
    step,
    rawHeaders,
    rawRows,
    importedRecords,
    skippedRows,
    importProgress,
    importError,
    isConnecting,
    isConnected,
    handleFileSelect,
    confirmImport,
    reset
  } = useCSVImporter();

  return (
    <div className="min-h-screen flex flex-col bg-ink text-hi selection:bg-confirm/20 selection:text-confirm">
      {/* Skip Navigation for screen reader accessibility */}
      <a href="#main-dashboard" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-confirm text-ink px-4 py-2 rounded-lg font-semibold z-50">
        Skip to content
      </a>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 w-full border-b border-line bg-ink/80 backdrop-blur-md" role="navigation" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="GrowEasy CRM logo" 
              className="h-10 w-auto select-none pointer-events-none" 
            />
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="/health" 
              target="_blank" 
              rel="noreferrer" 
              className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-mid hover:text-hi focus-ring rounded-lg px-3 py-1.5 transition-colors border border-transparent hover:border-line"
            >
              API Status
            </a>
            <span className="hidden sm:inline-block text-line">|</span>
            <div 
              className="flex items-center gap-2.5 border border-line px-3.5 py-1.5 rounded-full bg-panel2/50"
              aria-live="polite"
              role="status"
            >
              {isConnecting ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-signal"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-signal"></span>
                  </span>
                  <span className="text-[11px] font-bold tracking-tight text-mid">Cold-start Active</span>
                </>
              ) : isConnected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-confirm"></span>
                  </span>
                  <span className="text-[11px] font-bold tracking-tight text-mid">API Gateway Online</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
                  </span>
                  <span className="text-[11px] font-bold tracking-tight text-mid">API Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Grid View */}
      <main id="main-dashboard" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-start">
        {step === 'upload' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Onboarding / Features column */}
            <div className="lg:col-span-7 flex flex-col gap-8 pr-0 lg:pr-4 animate-fade-in">
              <div>
                <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border border-signal/25 bg-signal/10 text-signal font-mono mb-6">
                  Ingestion · v2.0
                </span>

                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.15] mb-4 text-hi font-display font-bold tracking-tight">
                  Turn any lead sheet into clean CRM rows
                </h1>

                <p className="text-[14px] sm:text-[15px] leading-relaxed max-w-lg text-mid">
                  Drop in a raw export from any source. Deterministic rules catch the obvious
                  columns first — Gemini only reads what's left.
                </p>
              </div>

              <div className="space-y-6">
                {FEATURES.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-4 items-start group">
                    <div className="p-2.5 rounded-xl shrink-0 bg-confirm/10 text-confirm transition-colors group-hover:bg-confirm/15 duration-200">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-hi tracking-tight">
                        {title}
                      </h3>
                      <p className="text-[12.5px] sm:text-[13px] mt-1 leading-relaxed text-mid">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-line p-5 sm:p-6 bg-panel shadow-neon-card">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileSpreadsheet size={16} className="text-signal" />
                  <h4 className="text-sm font-bold text-hi tracking-tight">
                    Try it with real mess
                  </h4>
                </div>
                <p className="text-[12px] mb-4 text-low">
                  Five exports built to stress-test the mapper. Download and try importing.
                </p>

                <div className="divide-y divide-line/20">
                  {SAMPLES.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      download
                      className="flex items-center justify-between py-3.5 group first:pt-0 last:pb-0 focus-ring rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="text-xs sm:text-[13px] truncate text-hi font-mono group-hover:text-confirm transition-colors">
                          {s.name}
                        </p>
                        <p className="text-[11px] mt-0.5 text-low">
                          {s.tag}
                        </p>
                      </div>
                      <span className="shrink-0 ml-4 p-2 rounded-xl border border-line bg-panel2/30 text-mid transition-all hover:bg-panel2 hover:text-hi">
                        <Download size={13} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Upload Panel + MappingConsole */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-6">
              <div className="border border-line rounded-3xl p-6 sm:p-8 bg-panel shadow-neon-card">
                <CSVUpload 
                  onFileSelect={handleFileSelect} 
                  error={importError} 
                />
              </div>

              <MappingConsole />
              
              <p className="text-[11px] leading-relaxed text-low">
                A sample of what the mapper does to each row of an upload — matched fields,
                confidence, and anything it chose to leave out.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-line rounded-3xl p-5 sm:p-8 md:p-10 bg-panel shadow-neon-card flex-grow min-h-[400px] flex flex-col justify-start">
            {step === 'preview' && (
              <CSVPreviewTable
                headers={rawHeaders}
                rows={rawRows}
                onConfirm={confirmImport}
                onCancel={reset}
              />
            )}

            {step === 'importing' && (
              <ProgressBar 
                progress={importProgress} 
              />
            )}

            {step === 'results' && (
              <ResultDashboard
                imported={importedRecords}
                skipped={skippedRows}
                totalUploaded={rawRows.length}
                onReset={reset}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-line py-6 text-center bg-panel/30" role="contentinfo">
        <p className="text-xs text-low">
          &copy; {new Date().getFullYear()} GrowEasy CRM. Powered by Google Gemini. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
