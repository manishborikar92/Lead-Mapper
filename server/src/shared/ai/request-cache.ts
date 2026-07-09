import crypto from 'crypto';
import { CacheEntry } from './types.js';
import { CRMRecord } from '../../features/importer/types.js';

export class RequestCache {
  private static cache: Map<string, CacheEntry> = new Map();
  private static readonly MAX_SIZE = 500;
  private static readonly TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Generates a deterministic SHA-256 hash of a raw records array.
   */
  public static hashPayload(records: Record<string, any>[]): string {
    // Sort keys inside objects to ensure deterministic stringification
    const sorted = records.map((rec) => {
      const keys = Object.keys(rec).sort();
      const obj: Record<string, any> = {};
      keys.forEach((k) => {
        obj[k] = rec[k];
      });
      return obj;
    });

    const serialized = JSON.stringify(sorted);
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Retrieves a cached extraction outcome if present and not expired.
   */
  public static get(hash: string): { records: CRMRecord[]; skipped: Record<string, any>[] } | null {
    const entry = this.cache.get(hash);
    if (!entry) return null;

    // Check expiration
    if (Date.now() - entry.createdAt > this.TTL_MS) {
      this.cache.delete(hash);
      return null;
    }

    // Update LRU metrics
    entry.lastAccessedAt = Date.now();
    return entry.response;
  }

  /**
   * Caches a successful, Zod-validated response.
   */
  public static set(
    hash: string, 
    response: { records: CRMRecord[]; skipped: Record<string, any>[] }
  ): void {
    // Enforce size constraints (evict LRU if full)
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictLRU();
    }

    this.cache.set(hash, {
      hash,
      response,
      createdAt: Date.now(),
      lastAccessedAt: Date.now()
    });
  }

  /**
   * Evicts the least recently accessed cache entry.
   */
  private static evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessedAt < oldestTime) {
        oldestTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clears the cache (useful for testing).
   */
  public static clear(): void {
    this.cache.clear();
  }
}
