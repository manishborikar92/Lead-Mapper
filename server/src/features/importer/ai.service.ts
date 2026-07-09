import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.config';
import { SYSTEM_PROMPT, generateUserPrompt } from './extraction.prompt';
import { MappedRecordSchema } from './importer.validator';
import { CRMRecord } from './types';
import { AppError } from '../../shared/middlewares/error.middleware';

export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  /**
   * Sends a batch of raw records to Gemini to map and normalize to CRM fields.
   * Implements exponential backoff retries and Zod post-validation.
   */
  public async processBatch(
    rawRecords: Record<string, any>[]
  ): Promise<{ records: CRMRecord[]; skipped: Record<string, any>[] }> {
    const userPrompt = generateUserPrompt(rawRecords);
    
    // Define Gemini response schema structure
    const responseSchema: any = {
      type: "object",
      properties: {
        records: {
          type: "array",
          description: "List of successfully mapped and formatted CRM records",
          items: {
            type: "object",
            properties: {
              row_index: { type: "integer", description: "The exact original index of this row in the input array" },
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

    // Use the model configured in our centralized environment configuration
    const modelName = env.GEMINI_MODEL;
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.1 // Keep extraction highly deterministic
      },
      systemInstruction: SYSTEM_PROMPT
    });

    const maxRetries = 3;
    let attempt = 0;
    let responseText = '';

    while (attempt < maxRetries) {
      try {
        const result = await model.generateContent(userPrompt);
        responseText = result.response.text();
        if (responseText) break;
      } catch (error: any) {
        attempt++;
        console.warn(`[WARN] [AI_SERVICE] - Gemini API call failed (attempt ${attempt}/${maxRetries}):`, error.message);
        if (attempt >= maxRetries) {
          throw new AppError(`LLM Processing failed after ${maxRetries} attempts: ${error.message}`, 502);
        }
        // Exponential backoff wait
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Parse Response
    let parsedJson: { records?: any[] };
    try {
      parsedJson = JSON.parse(responseText);
    } catch (err: any) {
      console.error('[ERROR] [AI_SERVICE] - Failed to parse Gemini response as JSON:', responseText);
      throw new AppError('AI model did not return a valid JSON object', 502);
    }

    const aiRecords = parsedJson.records || [];
    const validRecords: CRMRecord[] = [];
    const skippedRecords: Record<string, any>[] = [];

    const successfulIndexes = new Set<number>();

    // Process all records returned by the AI
    for (const record of aiRecords) {
      try {
        const email = (record.email || '').trim();
        const mobile = (record.mobile_without_country_code || '').trim();

        // Enforce skip-row programmatic guard:
        // Must contain email OR mobile subscriber number
        if (!email && !mobile) {
          continue;
        }

        // Validate using Zod schema
        const validated = MappedRecordSchema.parse(record);
        validRecords.push(validated as CRMRecord);
        if (validated.row_index !== undefined) {
          successfulIndexes.add(validated.row_index);
        }
      } catch (err: any) {
        console.warn('[WARN] [AI_SERVICE] - A record failed validation, skipping:', record, err.message);
      }
    }

    // Classify any input records that are not in successfulIndexes as skipped
    for (let i = 0; i < rawRecords.length; i++) {
      if (!successfulIndexes.has(i)) {
        skippedRecords.push(rawRecords[i]);
      }
    }

    return {
      records: validRecords,
      skipped: skippedRecords
    };
  }
}
