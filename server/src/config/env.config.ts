import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.preprocess(
    (val) => val ?? '5000',
    z.string().transform((val) => parseInt(val, 10))
  ),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required for AI operations'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  ALLOWED_ORIGIN: z.string().default('http://localhost:3000')
});

let parsedEnv: z.infer<typeof envSchema>;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingKeys = error.issues.map(issue => issue.path.join('.')).join(', ');
    console.error(`[ERROR] [CONFIG] Environment validation failed. Missing or invalid keys: ${missingKeys}`);
    error.issues.forEach(issue => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
  } else {
    console.error('[ERROR] [CONFIG] Environment validation failed:', error);
  }
  process.exit(1);
}

export const env = parsedEnv;
