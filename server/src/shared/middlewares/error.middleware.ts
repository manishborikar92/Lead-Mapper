import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  if (err instanceof z.ZodError) {
    console.warn(`[${timestamp}] [WARN] [VALIDATION] - Bad request on ${req.method} ${req.url}:`, err.issues);
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
    return;
  }

  if (err instanceof AppError) {
    console.warn(`[${timestamp}] [WARN] [APP_ERROR] - Operational error: ${err.message} (${err.statusCode})`);
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
    return;
  }

  // Log unexpected exceptions in full stack
  console.error(`[${timestamp}] [ERROR] [UNCAUGHT] - Unexpected server error:`, err);
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred on the server'
  });
}
