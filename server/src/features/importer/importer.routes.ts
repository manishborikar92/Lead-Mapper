import { Router } from 'express';
import { ImporterController } from './importer.controller';
import { uploadMiddleware } from '../../shared/middlewares/upload.middleware';

const router = Router();
const controller = new ImporterController();

// Route: POST /api/process-batch (JSON Array ingestion)
router.post('/process-batch', controller.processBatch);

// Route: POST /api/import (Binary File Upload ingestion)
router.post('/import', uploadMiddleware.single('file'), controller.importCsv);

export { router as importerRouter };
