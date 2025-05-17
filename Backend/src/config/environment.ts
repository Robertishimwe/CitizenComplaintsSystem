// src/config/environment.ts
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file based on NODE_ENV or default to .env
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.join(process.cwd(), envFile) });

const numericString = (defaultValue: number) =>
  z.string().refine(val => !isNaN(parseFloat(val)), {
    message: 'Must be a numeric string',
  }).transform(val => parseInt(val, 10)).default(`${defaultValue}`);


const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: numericString(3000),
  API_PREFIX: z.string().default('/api/v1'),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_ACCESS_EXPIRATION_MINUTES: numericString(30),
  JWT_REFRESH_EXPIRATION_DAYS: numericString(30),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: numericString(6379),
  REDIS_PASSWORD: z.string().optional(),

  PINDO_API_TOKEN: z.string().min(1, 'PINDO_API_TOKEN is required'),
  PINDO_SENDER_ID: z.string().min(1, 'PINDO_SENDER_ID is required'),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

try {
  const parsedEnv = environmentSchema.parse(process.env);

  // Export the validated and typed environment variables
  // This makes them easily accessible throughout your application
  // e.g., import { env } from '@/config'; console.log(env.PORT);
  // Using '@/' assumes you have path aliases configured in tsconfig.json
  // Otherwise use relative paths like '../config'

  // For direct export:
  // export const NODE_ENV = parsedEnv.NODE_ENV;
  // export const PORT = parsedEnv.PORT;
  // ... etc.

  // Or export as a single object
  export const env = parsedEnv;

} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(
      '❌ Invalid environment variables:',
      error.flatten().fieldErrors,
    );
    process.exit(1);
  }
  console.error('❌ Unknown error loading environment variables:', error);
  process.exit(1);
}
