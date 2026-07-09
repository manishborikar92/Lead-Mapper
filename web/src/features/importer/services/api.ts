import { CRMRecord } from '../types';

export interface ImportCsvResponse {
  success: boolean;
  totalImported: number;
  totalSkipped: number;
  records: CRMRecord[];
  skipped: Record<string, any>[];
  error?: string;
  details?: any;
}

export class ImporterApi {
  /**
   * Pings the backend healthcheck endpoint to wake it up proactively.
   */
  public static async pingHealth(): Promise<{ status: string; provider: string } | null> {
    try {
      const res = await fetch('/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.warn('[ImporterApi] - Backend ping failed:', err);
      return null;
    }
  }

  /**
   * Uploads the raw CSV file to the backend for backend-owned batching and AI mapping.
   */
  public static async importCsvFile(file: File): Promise<ImportCsvResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/import', {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to import file on backend');
    }

    return data as ImportCsvResponse;
  }
}
