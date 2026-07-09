import { Request, Response, NextFunction } from 'express';
import { CsvService } from './csv.service';
import { AiService } from './ai.service';
import { ProcessBatchSchema } from './importer.validator';
import { AppError } from '../../shared/middlewares/error.middleware';
import { CRMRecord } from './types';

export class ImporterController {
  private csvService: CsvService;
  private aiService: AiService;

  constructor() {
    this.csvService = new CsvService();
    this.aiService = new AiService();
  }

  /**
   * Endpoint: POST /api/process-batch
   * Processes a JSON array of raw records via Gemini API mapping.
   */
  public processBatch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate request body schema
      const { records } = ProcessBatchSchema.parse(req.body);

      console.log(`[INFO] [IMPORTER_CONTROLLER] - Processing batch of ${records.length} records.`);
      
      const result = await this.aiService.processBatch(records);

      res.status(200).json({
        success: true,
        processedCount: result.records.length,
        skippedCount: result.skipped.length,
        records: result.records,
        skipped: result.skipped
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Endpoint: POST /api/import
   * Handles binary file upload, parses CSV, splits records into batches,
   * processes them with Gemini, and returns consolidated results.
   */
  public importCsv = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('No CSV file uploaded', 400);
      }

      console.log(`[INFO] [IMPORTER_CONTROLLER] - Uploaded file received: ${req.file.originalname} (${req.file.size} bytes).`);

      // 1. Parse CSV File
      const rawRecords = await this.csvService.parse(req.file.buffer);

      if (rawRecords.length === 0) {
        throw new AppError('Uploaded CSV file is empty', 400);
      }

      console.log(`[INFO] [IMPORTER_CONTROLLER] - CSV parsed successfully. Found ${rawRecords.length} raw rows.`);

      // 2. Batch and process via AI service
      const BATCH_SIZE = 20;
      const validRecords: CRMRecord[] = [];
      const skippedRecords: Record<string, any>[] = [];

      for (let i = 0; i < rawRecords.length; i += BATCH_SIZE) {
        const batch = rawRecords.slice(i, i + BATCH_SIZE);
        console.log(`[INFO] [IMPORTER_CONTROLLER] - Processing internal batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} rows)`);
        
        try {
          const result = await this.aiService.processBatch(batch);
          validRecords.push(...result.records);
          skippedRecords.push(...result.skipped);
        } catch (batchError: any) {
          console.error(`[ERROR] [IMPORTER_CONTROLLER] - Internal batch processing failed at rows ${i}-${i + batch.length}:`, batchError.message);
          // For file uploads, if a batch fails completely, we record the raw records in that batch as skipped
          skippedRecords.push(...batch);
        }
      }

      res.status(200).json({
        success: true,
        totalImported: validRecords.length,
        totalSkipped: skippedRecords.length,
        records: validRecords,
        skipped: skippedRecords
      });
    } catch (error) {
      next(error);
    }
  };
}
