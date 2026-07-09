import { ModelMetadata } from './types.js';

export class ModelRegistry {
  private static models: Map<string, ModelMetadata> = new Map();

  static {
    // Register available free-tier models with capability metadata
    const registered = [
      {
        id: 'models/gemini-3.1-flash-lite',
        providerId: 'google',
        name: 'Gemini 3.1 Flash Lite',
        capabilities: {
          supportsStructuredOutput: true,
          supportsJsonMode: true,
          contextLength: 1048576,
          qualityTier: 'medium' as const,
          speedTier: 'fast' as const
        }
      },
      {
        id: 'models/gemini-2.5-flash-lite',
        providerId: 'google',
        name: 'Gemini 2.5 Flash Lite',
        capabilities: {
          supportsStructuredOutput: true,
          supportsJsonMode: true,
          contextLength: 1048576,
          qualityTier: 'medium' as const,
          speedTier: 'fast' as const
        }
      },
      {
        id: 'models/gemini-2.5-flash',
        providerId: 'google',
        name: 'Gemini 2.5 Flash',
        capabilities: {
          supportsStructuredOutput: true,
          supportsJsonMode: true,
          contextLength: 1048576,
          qualityTier: 'high' as const,
          speedTier: 'medium' as const
        }
      },
      {
        id: 'models/gemini-2.0-flash',
        providerId: 'google',
        name: 'Gemini 2.0 Flash',
        capabilities: {
          supportsStructuredOutput: true,
          supportsJsonMode: true,
          contextLength: 1048576,
          qualityTier: 'medium' as const,
          speedTier: 'fast' as const
        }
      },
      {
        id: 'models/gemini-3.5-flash',
        providerId: 'google',
        name: 'Gemini 3.5 Flash',
        capabilities: {
          supportsStructuredOutput: true,
          supportsJsonMode: true,
          contextLength: 1048576,
          qualityTier: 'high' as const,
          speedTier: 'medium' as const
        }
      }
    ];

    registered.forEach((m) => {
      this.models.set(m.id, {
        ...m,
        health: {
          consecutiveFailures: 0,
          lastSuccessTime: null,
          lastFailureTime: null,
          averageLatencyMs: 0,
          cooldownUntil: null,
          failureCount: { quota: 0, timeout: 0, schema: 0, transient: 0 },
          healthScore: 100
        }
      });
    });
  }

  public static getModels(): ModelMetadata[] {
    return Array.from(this.models.values());
  }

  public static getModel(id: string): ModelMetadata | undefined {
    return this.models.get(id);
  }

  /**
   * Records a successful execution on a model, updating latency and health score.
   */
  public static recordSuccess(id: string, latencyMs: number): void {
    const model = this.models.get(id);
    if (!model) return;

    const health = model.health;
    health.consecutiveFailures = 0;
    health.lastSuccessTime = Date.now();
    health.cooldownUntil = null;
    
    // Rolling latency calculate
    health.averageLatencyMs = health.averageLatencyMs === 0 
      ? latencyMs 
      : Math.round((health.averageLatencyMs * 0.7) + (latencyMs * 0.3));

    this.calculateHealthScore(model);
  }

  /**
   * Records a failure on a model, logging error category and applying cooldowns.
   */
  public static recordFailure(id: string, category: 'quota' | 'timeout' | 'schema' | 'transient'): void {
    const model = this.models.get(id);
    if (!model) return;

    const health = model.health;
    health.consecutiveFailures += 1;
    health.lastFailureTime = Date.now();
    health.failureCount[category] += 1;

    // Apply Cooldown: Quota (429) and severe transient 503s trigger immediate cooldowns
    if (category === 'quota' || category === 'timeout' || health.consecutiveFailures >= 2) {
      // Cooldown for 5 minutes in production, but let's make it configurable/shorter if testing
      const cooldownMinutes = process.env.NODE_ENV === 'test' ? 0.02 : 5; // ~1 second for tests, 5 mins for prod
      health.cooldownUntil = Date.now() + cooldownMinutes * 60 * 1000;
    }

    this.calculateHealthScore(model);
  }

  /**
   * Recalculates the model stability health score.
   */
  private static calculateHealthScore(model: ModelMetadata): void {
    const health = model.health;
    
    let penalty = 0;
    penalty += health.consecutiveFailures * 30; // High penalty for consecutive faults
    penalty += health.failureCount.quota * 15;
    penalty += health.failureCount.timeout * 20;
    penalty += health.failureCount.schema * 10;
    penalty += health.failureCount.transient * 5;

    health.healthScore = Math.max(0, 100 - penalty);
  }

  /**
   * Checks if a model is currently on cooldown.
   */
  public static isOnCooldown(id: string): boolean {
    const model = this.models.get(id);
    if (!model) return false;
    
    const cooldownUntil = model.health.cooldownUntil;
    if (!cooldownUntil) return false;

    if (Date.now() > cooldownUntil) {
      // Cooldown expired!
      model.health.cooldownUntil = null;
      return false;
    }

    return true;
  }
}
