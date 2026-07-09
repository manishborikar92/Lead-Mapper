'use client';

import React, { useEffect, useRef, useState } from "react";
import { useCSVImporter } from '../features/importer/hooks/useCSVImporter';
import { CSVUpload } from '../features/importer/components/csv-upload';
import { CSVPreviewTable } from '../features/importer/components/csv-preview-table';
import { ProgressBar } from '../features/importer/components/progress-bar';
import { ResultDashboard } from '../features/importer/components/result-dashboard';
import { Cpu, ShieldCheck, Layers, FileSpreadsheet, Download, CheckCircle2, XCircle } from "lucide-react";

const TOKENS = {
  ink: "#0A0D12",
  panel: "#10151C",
  panel2: "#141B23",
  line: "#212B34",
  paper: "#ECE6D6",
  signal: "#FF7A45",
  confirm: "#4FD1C5",
  hi: "#F3F1EA",
  mid: "#9AA4B1",
  low: "#5F6A76",
};

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
  { name: "facebook_leads.csv", tag: "Facebook Ads", href: "/sample-data/facebook_leads.csv" },
  { name: "google_ads.csv", tag: "Google Ads", href: "/sample-data/google_ads.csv" },
  { name: "real_estate.csv", tag: "Real Estate CRM", href: "/sample-data/real_estate.csv" },
  { name: "messy_spreadsheet.csv", tag: "Messy Spreadsheet", href: "/sample-data/messy_spreadsheet.csv" },
  { name: "edge_cases.csv", tag: "Swapped columns, skip logic", href: "/sample-data/edge_cases.csv" },
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
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ background: TOKENS.panel, borderColor: TOKENS.line }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: TOKENS.line, background: TOKENS.panel2 }}
      >
        <span
          className="text-[11px] font-medium tracking-wide uppercase"
          style={{ color: TOKENS.mid, fontFamily: "'JetBrains Mono', monospace" }}
        >
          Mapping console
        </span>
        <span
          className="flex items-center gap-1.5 text-[11px]"
          style={{ color: TOKENS.confirm, fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: TOKENS.confirm }}
          />
          live preview
        </span>
      </div>

      <div className="p-4 space-y-2 min-h-[260px] flex flex-col justify-end">
        {rows.map((row, i) => (
          <div
            key={row.from + i}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 border"
            style={{
              background: TOKENS.ink,
              borderColor: TOKENS.line,
            }}
          >
            <span
              className="text-[12px] truncate flex-1"
              style={{ color: TOKENS.mid, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {row.from}
            </span>
            <span className="text-[13px] shrink-0" style={{ color: TOKENS.low }}>
              →
            </span>
            <span
              className="text-[12px] truncate flex-1 text-right"
              style={{ color: row.ok ? TOKENS.hi : TOKENS.signal, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {row.to}
            </span>
            <span className="shrink-0 w-14 flex items-center justify-end gap-1">
              {row.ok ? (
                <>
                  <CheckCircle2 size={13} color={TOKENS.confirm} />
                  <span className="text-[11px]" style={{ color: TOKENS.confirm, fontFamily: "'JetBrains Mono', monospace" }}>
                    {row.confidence}%
                  </span>
                </>
              ) : (
                <XCircle size={13} color={TOKENS.signal} />
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
      <nav className="sticky top-0 z-40 w-full border-b bg-ink/75 backdrop-blur-md" style={{ borderColor: TOKENS.line }} role="navigation" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="GrowEasy CRM logo" 
              className="h-10 w-auto select-none pointer-events-none" 
            />
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a 
              href="/health" 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm font-medium hover:text-slate-200 focus-ring rounded px-2.5 py-1"
              style={{ color: TOKENS.mid }}
            >
              API Status
            </a>
            <span style={{ color: TOKENS.line }}>|</span>
            <div 
              className="flex items-center gap-2.5 border px-3.5 py-1.5 rounded-full"
              style={{ background: 'rgba(20, 27, 35, 0.4)', borderColor: TOKENS.line }}
              aria-live="polite"
              role="status"
            >
              {isConnecting ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: TOKENS.signal }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: TOKENS.signal }}></span>
                  </span>
                  <span className="text-xs font-semibold" style={{ color: TOKENS.mid }}>Cold-start Active</span>
                </>
              ) : isConnected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: TOKENS.confirm }}></span>
                  </span>
                  <span className="text-xs font-semibold" style={{ color: TOKENS.mid }}>API Gateway Online</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
                  </span>
                  <span className="text-xs font-semibold" style={{ color: TOKENS.mid }}>API Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Grid View */}
      <main id="main-dashboard" className="flex-grow max-w-7xl w-full mx-auto px-6 py-12 flex flex-col justify-start">
        {step === 'upload' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Onboarding / Features column */}
            <div className="lg:col-span-7 flex flex-col gap-10 pr-0 lg:pr-6">
              <div>
                <span
                  className="inline-block px-3 py-1 text-[11px] font-medium uppercase tracking-wider rounded-full border mb-6"
                  style={{
                    color: TOKENS.signal,
                    borderColor: `${TOKENS.signal}40`,
                    background: `${TOKENS.signal}14`,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Ingestion · v2.0
                </span>

                <h1
                  className="text-4xl lg:text-[2.75rem] leading-[1.1] mb-4"
                  style={{ color: TOKENS.hi, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                >
                  Turn any lead sheet into clean CRM rows
                </h1>

                <p className="text-[15px] leading-relaxed max-w-lg" style={{ color: TOKENS.mid }}>
                  Drop in a raw export from any source. Deterministic rules catch the obvious
                  columns first — Gemini only reads what's left.
                </p>
              </div>

              <div className="space-y-5">
                {FEATURES.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-4 items-start">
                    <div
                      className="p-2 rounded-lg shrink-0 mt-0.5"
                      style={{ background: `${TOKENS.confirm}14`, color: TOKENS.confirm }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold" style={{ color: TOKENS.hi }}>
                        {title}
                      </h3>
                      <p className="text-[13px] mt-1 leading-relaxed" style={{ color: TOKENS.mid }}>
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl border p-5"
                style={{ background: TOKENS.panel, borderColor: TOKENS.line }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet size={15} style={{ color: TOKENS.signal }} />
                  <h4 className="text-[13px] font-semibold" style={{ color: TOKENS.hi }}>
                    Try it with real mess
                  </h4>
                </div>
                <p className="text-[12px] mb-4" style={{ color: TOKENS.low }}>
                  Five exports built to stress-test the mapper.
                </p>

                <div className="divide-y" style={{ borderColor: TOKENS.line }}>
                  {SAMPLES.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      download
                      className="flex items-center justify-between py-3 group first:pt-0 last:pb-0"
                      style={{ borderColor: TOKENS.line }}
                    >
                      <div className="min-w-0">
                        <p
                          className="text-[12.5px] truncate"
                          style={{ color: TOKENS.hi, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {s.name}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: TOKENS.low }}>
                          {s.tag}
                        </p>
                      </div>
                      <span
                        className="shrink-0 ml-4 p-1.5 rounded-md border transition-colors hover:bg-panel2/50"
                        style={{ borderColor: TOKENS.line, color: TOKENS.mid }}
                      >
                        <Download size={13} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Upload Panel + MappingConsole */}
            <div className="lg:col-span-5 lg:sticky lg:top-10 flex flex-col gap-6">
              <div 
                className="border rounded-3xl p-8 backdrop-blur-xl shadow-neon-card"
                style={{ background: TOKENS.panel, borderColor: TOKENS.line }}
              >
                <CSVUpload 
                  onFileSelect={handleFileSelect} 
                  error={importError} 
                />
              </div>

              <MappingConsole />
              
              <p className="text-[11px] leading-relaxed" style={{ color: TOKENS.low }}>
                A sample of what the mapper does to each row of an upload — matched fields,
                confidence, and anything it chose to leave out.
              </p>
            </div>
          </div>
        ) : (
          <div 
            className="border rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-neon-card flex-grow"
            style={{ background: TOKENS.panel, borderColor: TOKENS.line }}
          >
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
      <footer className="w-full border-t py-6 text-center" style={{ borderColor: TOKENS.line }} role="contentinfo">
        <p className="text-xs" style={{ color: TOKENS.low }}>
          &copy; {new Date().getFullYear()} GrowEasy CRM. Powered by Google Gemini. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
