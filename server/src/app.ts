import express from 'express';
import cors from 'cors';
import { env } from './config/env.config';
import { importerRouter } from './features/importer/importer.routes';
import { errorMiddleware } from './shared/middlewares/error.middleware';

const app = express();

// Configure CORS
const allowedOrigin = env.ALLOWED_ORIGIN || '*';
console.log(`[INFO] [APP] - Configuring CORS with Allowed Origin: ${allowedOrigin}`);

app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  })
);

// Inject Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Route
app.get('/health', (req, res) => {
  const timestamp = new Date().toISOString();
  res.status(200).json({
    status: 'healthy',
    timestamp,
    uptime: process.uptime(),
    provider: env.GEMINI_API_KEY ? 'gemini' : 'none'
  });
});

// Mount Importer Router
app.use('/api', importerRouter);

// Centralized Error Middleware (Must be registered last)
app.use(errorMiddleware);

export { app };
export default app;
