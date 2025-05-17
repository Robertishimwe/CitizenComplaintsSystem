// src/index.ts
import 'dotenv/config'; // Ensure environment variables are loaded first, if not handled by environment.ts directly at top
import { startServer } from './server';
import { logger } from './config'; // Imports from config/index.ts

// Validate essential environment variables before starting (optional, good practice)
// This is mostly handled by environment.ts now, but can be a quick check here
const essentialVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
const missingVars = essentialVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
    logger.error(`❌ Missing essential environment variables: ${missingVars.join(', ')}`);
    logger.error("Please check your .env file or environment configuration.");
    process.exit(1);
}


// Start the server
startServer().catch((error) => {
  logger.error('🚨 Application failed to start:', error);
  process.exit(1);
});
