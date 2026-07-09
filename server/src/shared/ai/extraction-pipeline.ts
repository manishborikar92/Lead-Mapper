import { PreprocessingService } from './preprocessing.service.js';
import { RequestCache } from './request-cache.js';
import { AiGateway } from './ai-gateway.js';
import { CRMRecord, RoutingPolicy } from './types.js';
import { SYSTEM_PROMPT, generateUserPrompt } from '../../features/importer/extraction.prompt.js';
import { MappedRecordSchema } from '../../features/importer/importer.validator.js';
import { AppError } from '../../shared/middlewares/error.middleware.js';

export class ExtractionPipeline {
  /**
   * Orchestrates the complete ingestion lifecycle: preprocessing, caching, AI Gateway routing, post-processing validation, and merging.
   */
  public static async process(
    rawRecords: Record<string, any>[],
    policy: RoutingPolicy = 'Balanced'
  ): Promise<{ records: CRMRecord[]; skipped: Record<string, any>[] }> {
    const start = Date.now();

    // 1. Run Preprocessing Service
    const prepResult = PreprocessingService.preprocess(rawRecords);
    
    const resolvedLeads: CRMRecord[] = [];
    const skippedRecords: Record<string, any>[] = [];
    const unresolvedRawRows: Record<string, any>[] = [];
    
    // Track row indices mapping
    const rowMapping: Record<number, number> = {}; // unresolved original index to current sub-array index

    // Process high-confidence matches immediately
    prepResult.records.forEach((prepRec, originalIndex) => {
      if (prepRec.confidence === 'High') {
        if (prepRec.mappedRecord) {
          resolvedLeads.push(prepRec.mappedRecord as CRMRecord);
        } else {
          // Double skip guard check
          skippedRecords.push(prepRec.record);
        }
      } else {
        rowMapping[originalIndex] = unresolvedRawRows.length;
        unresolvedRawRows.push(prepRec.record);
      }
    });

    // If all records were resolved deterministically with high confidence, exit early
    if (unresolvedRawRows.length === 0) {
      console.log(`[INFO] [EXTRACTION_PIPELINE] - Pipeline execution: 100% resolved deterministically. Latency: ${Date.now() - start}ms`);
      return { records: resolvedLeads, skipped: skippedRecords };
    }

    // 2. Process unresolved rows in batches of 20
    const BATCH_SIZE = 20;
    const aiSkipped: Record<string, any>[] = [];

    for (let chunkIdx = 0; chunkIdx < unresolvedRawRows.length; chunkIdx += BATCH_SIZE) {
      const batch = unresolvedRawRows.slice(chunkIdx, chunkIdx + BATCH_SIZE);
      const cacheHash = RequestCache.hashPayload(batch);
      const cachedResponse = RequestCache.get(cacheHash);

      let batchRecords: CRMRecord[] = [];
      let batchSkipped: Record<string, any>[] = [];

      if (cachedResponse) {
        console.log(`[INFO] [EXTRACTION_PIPELINE] - Request Cache HIT for batch starting at ${chunkIdx}. Retrieved ${cachedResponse.records.length} records.`);
        batchRecords = cachedResponse.records;
        batchSkipped = cachedResponse.skipped;
      } else {
        // 3. Cache Miss -> Route to AI Inference Gateway
        const userPrompt = generateUserPrompt(batch);
        
        // Structure Gemini structured JSON output schema
        const responseSchema: any = {
          type: "object",
          properties: {
            records: {
              type: "array",
              description: "List of successfully mapped and formatted CRM records",
              items: {
                type: "object",
                properties: {
                  row_index: { type: "integer", description: "The original sub-array index of the row" },
                  created_at: { type: "string", description: "Normalized Date YYYY-MM-DD HH:MM:SS" },
                  name: { type: "string" },
                  email: { type: "string" },
                  country_code: { type: "string" },
                  mobile_without_country_code: { type: "string" },
                  company: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  country: { type: "string" },
                  lead_owner: { type: "string" },
                  crm_status: { 
                    type: "string", 
                    enum: ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"]
                  },
                  crm_note: { type: "string" },
                  data_source: { 
                    type: "string", 
                    enum: ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"]
                  },
                  possession_time: { type: "string" },
                  description: { type: "string" }
                },
                required: [
                  "row_index", "created_at", "name", "email", "country_code", "mobile_without_country_code",
                  "company", "city", "state", "country", "lead_owner", 
                  "crm_note", "possession_time", "description"
                ]
              }
            }
          },
          required: ["records"]
        };

        const responseText = await AiGateway.executeInference(
          userPrompt,
          SYSTEM_PROMPT,
          responseSchema,
          policy
        );

        // 4. Parse & Validate Mapped Records
        try {
          const parsed = JSON.parse(responseText);
          if (!parsed.records || !Array.isArray(parsed.records)) {
            throw new Error('Gemini response format invalid: missing records array');
          }

          // Validate each item via Zod and check skip rules
          const mappedRecords: CRMRecord[] = [];
          const skippedIndices = new Set<number>();

          parsed.records.forEach((rec: any) => {
            const originalSubIndex = rec.row_index;
            const zodResult = MappedRecordSchema.safeParse(rec);
            
            if (!zodResult.success) {
              console.warn(`[WARN] [EXTRACTION_PIPELINE] - Zod validation failed for record:`, zodResult.error.message);
              throw new Error(`Zod Schema Validation Failure: ${zodResult.error.message}`);
            }

            const validated = zodResult.data as CRMRecord;
            
            // Double-layer skip guard check
            const hasEmail = (validated.email || '').includes('@');
            const hasPhone = (validated.mobile_without_country_code || '').replace(/[^0-9]/g, '').length >= 7;

            if (!hasEmail && !hasPhone) {
              skippedIndices.add(originalSubIndex);
            } else {
              mappedRecords.push(validated);
            }
          });

          // Identify skipped records
          batch.forEach((row, subIndex) => {
            const isMapped = mappedRecords.some(r => r.row_index === subIndex);
            if (!isMapped || skippedIndices.has(subIndex)) {
              batchSkipped.push(row);
            }
          });

          batchRecords = mappedRecords;

          // 5. Cache ONLY validated successful responses
          RequestCache.set(cacheHash, { records: batchRecords, skipped: batchSkipped });

        } catch (err: any) {
          console.error('[ERROR] [EXTRACTION_PIPELINE] - Failed post-processing JSON output:', err.message);
          throw new AppError(`AI Ingestion Parsing failed: ${err.message}`, 422);
        }
      }

      // Merge records, shifting index values back to raw array indexes
      batchRecords.forEach((rec) => {
        const absoluteUnresolvedIndex = chunkIdx + rec.row_index;
        const originalIndexStr = Object.keys(rowMapping).find(k => rowMapping[parseInt(k)] === absoluteUnresolvedIndex);
        
        if (originalIndexStr) {
          const originalIndex = parseInt(originalIndexStr);
          const prepRec = prepResult.records[originalIndex];
          const merged: CRMRecord = {
            ...prepRec.mappedRecord,
            ...rec,
            row_index: originalIndex
          } as CRMRecord;
          resolvedLeads.push(merged);
        } else {
          resolvedLeads.push({
            ...rec,
            row_index: absoluteUnresolvedIndex
          });
        }
      });

      aiSkipped.push(...batchSkipped);
    }

    const totalSkipped = [...skippedRecords, ...aiSkipped];

    console.log(`[INFO] [EXTRACTION_PIPELINE] - Pipeline completed. Ingested: ${resolvedLeads.length} | Skipped: ${totalSkipped.length} | Latency: ${Date.now() - start}ms`);
    
    return {
      records: resolvedLeads.sort((a, b) => (a.row_index || 0) - (b.row_index || 0)),
      skipped: totalSkipped
    };
  }
}
