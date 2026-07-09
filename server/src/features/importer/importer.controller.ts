import { Request, Response, NextFunction } from 'express';
import { CsvService } from './csv.service.js';
import { ExtractionPipeline } from '../../shared/ai/extraction-pipeline.js';
import { ProcessBatchSchema } from './importer.validator.js';
import { AppError } from '../../shared/middlewares/error.middleware.js';
import { CRMRecord } from './types.js';
import { env } from '../../config/env.config.js';
import { RoutingPolicy } from '../../shared/ai/types.js';

export class ImporterController {
  private csvService: CsvService;

  constructor() {
    this.csvService = new CsvService();
  }

  /**
   * Endpoint: POST /api/process-batch
   * Processes a JSON array of raw records via AI Gateway routing and Extraction Pipeline.
   */
  public processBatch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate request body schema
      const { records } = ProcessBatchSchema.parse(req.body);
      const policy = (req.body.policy || env.DEFAULT_ROUTING_POLICY) as RoutingPolicy;

      console.log(`[INFO] [IMPORTER_CONTROLLER] - Processing batch of ${records.length} records with policy ${policy}.`);
      
      const result = await ExtractionPipeline.process(records, policy);

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
   * Handles binary file upload, parses CSV, and processes the raw array
   * via AI Ingestion Pipeline, returning consolidated results.
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

      // 2. Route complete CSV array to the Extraction Pipeline which handles internal batching and caching
      const policy = (req.query.policy || req.body.policy || env.DEFAULT_ROUTING_POLICY) as RoutingPolicy;
      console.log(`[INFO] [IMPORTER_CONTROLLER] - Running Extraction Pipeline with policy: ${policy}`);

      const result = await ExtractionPipeline.process(rawRecords, policy);

      res.status(200).json({
        success: true,
        totalImported: result.records.length,
        totalSkipped: result.skipped.length,
        records: result.records,
        skipped: result.skipped
      });
    } catch (error) {
      next(error);
    }
  };
}
