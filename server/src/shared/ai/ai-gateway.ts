import { GoogleGeminiProvider } from './gemini.provider.js';
import { ModelRegistry } from './model-registry.js';
import { PolicyEngine } from './policy-engine.js';
import { ErrorCategory, RoutingPolicy } from './types.js';
import { AppError } from '../../shared/middlewares/error.middleware.js';

export class AiGateway {
  private static geminiProvider = new GoogleGeminiProvider();

  /**
   * Routes and executes an AI inference request using policy-driven failovers and smart retries.
   */
  public static async executeInference(
    prompt: string,
    systemInstruction: string,
    responseSchema: any,
    policy: RoutingPolicy = 'Balanced'
  ): Promise<string> {
    const start = Date.now();
    
    // Resolve prioritized model list for policy
    const modelList = PolicyEngine.getPriorityList(policy);
    if (modelList.length === 0) {
      throw new AppError('AI Gateway: No eligible models found in registry for policy ' + policy, 500);
    }

    let lastError: Error | null = null;

    // Failover loop
    for (let i = 0; i < modelList.length; i++) {
      const model = modelList[i];
      const modelStart = Date.now();
      
      const maxRetries = 2; // Smart retry transient errors
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          const provider = model.providerId === 'google' ? this.geminiProvider : null;
          if (!provider) {
            throw new Error(`Unsupported provider: ${model.providerId}`);
          }

          const responseText = await provider.callModel(model.id, prompt, systemInstruction, responseSchema);
          
          // SUCCESS! Record metrics and latency
          const latency = Date.now() - modelStart;
          ModelRegistry.recordSuccess(model.id, latency);
          
          console.log(
            `[INFO] [AI_GATEWAY] - Policy: ${policy} | Provider: ${model.providerId} | Model: ${model.id} | Cache: MISS | Confidence: Medium/Low | Latency: ${latency}ms | Retries: ${attempt} | Status: Success`
          );

          return responseText;
          
        } catch (error: any) {
          const errorMsg = (error.message || '').toLowerCase();
          let category: ErrorCategory = 'transient';

          if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('resourceexhausted')) {
            category = 'quota';
          } else if (errorMsg.includes('timeout') || errorMsg.includes('408') || errorMsg.includes('deadline')) {
            category = 'timeout';
          } else if (errorMsg.includes('schema') || errorMsg.includes('json') || errorMsg.includes('validation')) {
            category = 'schema';
          }

          console.warn(
            `[WARN] [AI_GATEWAY] - Failure on model ${model.id} (attempt ${attempt + 1}/${maxRetries + 1}): [${category.toUpperCase()}] ${errorMsg}`
          );

          // Mark model failure in registry
          ModelRegistry.recordFailure(model.id, category);
          lastError = error;

          // Smart Retry Logic:
          // If it's a quota exhaustion (429) or severe 503 spike, immediately trigger cooldown and failover without retrying
          if (category === 'quota' || errorMsg.includes('503')) {
            console.log(`[INFO] [AI_GATEWAY] - Quota/503 hit on ${model.id}. Triggering cooldown and failover.`);
            break; // Break retries loop, move to next model
          }

          // Otherwise, transient error -> increment retries with exponential backoff
          attempt++;
          if (attempt <= maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }

      // If we reach here, this model failed. Failover logs it
      console.warn(`[WARN] [AI_GATEWAY] - Failover triggered from model ${model.id} to next priority model.`);
    }

    const totalLatency = Date.now() - start;
    console.error(`[ERROR] [AI_GATEWAY] - Ingestion failed on all registered models. Policy: ${policy} | Total Latency: ${totalLatency}ms`);
    throw new AppError(`AI Gateway: All registered models failed. Last error: ${lastError?.message}`, 500);
  }
}
