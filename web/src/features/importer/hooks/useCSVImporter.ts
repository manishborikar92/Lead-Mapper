import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { CRMRecord, ImportStep, ImportProgress } from '../types';
import { ImporterApi } from '../services/api';

export function useCSVImporter() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  
  // Raw CSV Preview data
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  
  // Import outcomes
  const [importedRecords, setImportedRecords] = useState<CRMRecord[]>([]);
  const [skippedRows, setSkippedRows] = useState<Record<string, any>[]>([]);
  
  // Ingestion status
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    status: 'idle',
    message: ''
  });
  const [importError, setImportError] = useState<string | null>(null);

  // Wake up check (CORS / Render free tier cold-start mitigation)
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Proactive ping to wake up Render Web Service on mount
  useEffect(() => {
    let active = true;
    
    async function wakeServer() {
      setIsConnecting(true);
      const result = await ImporterApi.pingHealth();
      if (active) {
        if (result && result.status === 'healthy') {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
        setIsConnecting(false);
      }
    }

    wakeServer();

    return () => {
      active = false;
    };
  }, []);

  /**
   * Reads and parses a CSV file locally using PapaParse.
   */
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setImportError(null);

    Papa.parse(selectedFile as any, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setImportError(`Failed to parse CSV file: ${results.errors[0].message}`);
          return;
        }

        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, any>[];

        if (rows.length === 0) {
          setImportError('The selected CSV file contains no data rows.');
          return;
        }

        setRawHeaders(headers);
        setRawRows(rows);
        setStep('preview');
      },
      error: (error) => {
        setImportError(`File reading failed: ${error.message}`);
      }
    });
  };

  /**
   * Dispatches the CSV file to the backend for processing in a single operation.
   */
  const confirmImport = async () => {
    if (!file) return;

    setStep('importing');
    setImportError(null);
    setImportedRecords([]);
    setSkippedRows([]);
    setImportProgress({
      status: 'importing',
      message: 'Uploading CSV file and mapping records with Google Gemini AI...'
    });

    try {
      const response = await ImporterApi.importCsvFile(file);

      setImportedRecords(response.records);
      setSkippedRows(response.skipped);
      setImportProgress({
        status: 'completed',
        message: 'Import successfully finished!'
      });
      setStep('results');
    } catch (err: any) {
      console.error('[useCSVImporter] Ingestion failed:', err.message);
      setImportError(err.message || 'An unexpected error occurred during processing.');
      setImportProgress({
        status: 'failed',
        message: 'Processing failed.'
      });
      setStep('preview'); // Allow user to retry from preview
    }
  };

  /**
   * Resets the importer state back to initial upload step.
   */
  const reset = () => {
    setFile(null);
    setRawHeaders([]);
    setRawRows([]);
    setImportedRecords([]);
    setSkippedRows([]);
    setImportProgress({ status: 'idle', message: '' });
    setImportError(null);
    setStep('upload');
  };

  return {
    step,
    file,
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
  };
}
