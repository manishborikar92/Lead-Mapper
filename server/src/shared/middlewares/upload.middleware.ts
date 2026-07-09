import multer from 'multer';
import { Request } from 'express';
import { AppError } from './error.middleware';

// Limit file uploads to 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; 

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  // Validate that the file is indeed a CSV
  const isCsv = file.mimetype === 'text/csv' || file.originalname.endsWith('.csv');
  if (isCsv) {
    callback(null, true);
  } else {
    callback(new AppError('Only CSV files are allowed', 400));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});
