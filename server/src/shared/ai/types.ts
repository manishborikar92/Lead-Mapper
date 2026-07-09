import { CRMRecord } from '../../features/importer/types';

export type QualityTier = 'high' | 'medium' | 'low';
export type SpeedTier = 'fast' | 'medium' | 'slow';
export type RoutingPolicy = 'HighQuality' | 'Balanced' | 'HighThroughput' | 'EmergencyFallback';
export type ErrorCategory = 'quota' | 'timeout' | 'schema' | 'transient';

export interface ModelCapabilities {
  supportsStructuredOutput: boolean;
  supportsJsonMode: boolean;
  contextLength: number;
  qualityTier: QualityTier;
  speedTier: SpeedTier;
}

export interface ModelHealth {
  consecutiveFailures: number;
  lastSuccessTime: number | null;
  lastFailureTime: number | null;
  averageLatencyMs: number;
  cooldownUntil: number | null;
  failureCount: {
    quota: number;
    timeout: number;
    schema: number;
    transient: number;
  };
  healthScore: number; // 0 to 100
}

export interface ModelMetadata {
  id: string; // e.g. 'models/gemini-3.1-flash-lite'
  providerId: string; // e.g. 'google'
  name: string;
  capabilities: ModelCapabilities;
  health: ModelHealth;
}

export interface CacheEntry {
  hash: string;
  response: {
    records: CRMRecord[];
    skipped: Record<string, any>[];
  };
  createdAt: number;
  lastAccessedAt: number;
}

export type ConfidenceBand = 'High' | 'Medium' | 'Low';

export interface PreprocessedRecord {
  record: Record<string, any>;
  confidence: ConfidenceBand;
  mappedRecord?: Partial<CRMRecord>;
}

export interface PreprocessingResult {
  records: PreprocessedRecord[];
  confidence: ConfidenceBand; // Overall batch confidence
}
