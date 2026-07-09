import { ModelRegistry } from './model-registry.js';
import { ModelMetadata, RoutingPolicy } from './types.js';

export class PolicyEngine {
  /**
   * Returns a prioritized list of models matching the routing policy.
   * Automatically filters out models on cooldown unless policy is EmergencyFallback.
   */
  public static getPriorityList(policy: RoutingPolicy): ModelMetadata[] {
    const allModels = ModelRegistry.getModels();
    
    // 1. Filter out models on cooldown (unless EmergencyFallback is active)
    let eligibleModels = allModels;
    if (policy !== 'EmergencyFallback') {
      eligibleModels = allModels.filter((m) => !ModelRegistry.isOnCooldown(m.id));
    }

    // If no models are available off-cooldown, fallback immediately to emergency mode
    if (eligibleModels.length === 0) {
      eligibleModels = allModels;
    }

    // 2. Sort according to policy capability preferences
    return eligibleModels.sort((a, b) => {
      // Always prefer models with higher health score as a baseline first
      if (Math.abs(a.health.healthScore - b.health.healthScore) > 30) {
        return b.health.healthScore - a.health.healthScore;
      }

      switch (policy) {
        case 'HighQuality':
          // Sort Quality: High > Medium > Low
          const qualityOrder = { high: 3, medium: 2, low: 1 };
          const qualityA = qualityOrder[a.capabilities.qualityTier];
          const qualityB = qualityOrder[b.capabilities.qualityTier];
          if (qualityA !== qualityB) return qualityB - qualityA;
          // Prefer structured output
          if (a.capabilities.supportsStructuredOutput !== b.capabilities.supportsStructuredOutput) {
            return a.capabilities.supportsStructuredOutput ? -1 : 1;
          }
          return b.health.healthScore - a.health.healthScore;

        case 'HighThroughput':
          // Sort Speed: Fast > Medium > Slow
          const speedOrder = { fast: 3, medium: 2, slow: 1 };
          const speedA = speedOrder[a.capabilities.speedTier];
          const speedB = speedOrder[b.capabilities.speedTier];
          if (speedA !== speedB) return speedB - speedA;
          return b.health.healthScore - a.health.healthScore;

        case 'EmergencyFallback':
          // Pure health score sorting, ignore everything else
          return b.health.healthScore - a.health.healthScore;

        case 'Balanced':
        default:
          // Balanced: Prefer Medium/High quality, Fast speed, then Health
          const balQualityOrder = { high: 2, medium: 3, low: 1 }; // Prefer medium first, then high, then low
          const balA = balQualityOrder[a.capabilities.qualityTier];
          const balB = balQualityOrder[b.capabilities.qualityTier];
          if (balA !== balB) return balB - balA;

          const balSpeedOrder = { fast: 3, medium: 2, slow: 1 };
          const balSpeedA = balSpeedOrder[a.capabilities.speedTier];
          const balSpeedB = balSpeedOrder[b.capabilities.speedTier];
          if (balSpeedA !== balSpeedB) return balSpeedB - balSpeedA;

          return b.health.healthScore - a.health.healthScore;
      }
    });
  }
}
