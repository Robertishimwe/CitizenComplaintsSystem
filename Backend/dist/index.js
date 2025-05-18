"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
require("dotenv/config"); // Ensure environment variables are loaded first, if not handled by environment.ts directly at top
const server_1 = require("./server");
const config_1 = require("./config"); // Imports from config/index.ts
// Validate essential environment variables before starting (optional, good practice)
// This is mostly handled by environment.ts now, but can be a quick check here
const essentialVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
const missingVars = essentialVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    config_1.logger.error(`❌ Missing essential environment variables: ${missingVars.join(', ')}`);
    config_1.logger.error("Please check your .env file or environment configuration.");
    process.exit(1);
}
// Start the server
(0, server_1.startServer)().catch((error) => {
    config_1.logger.error('🚨 Application failed to start:', error);
    process.exit(1);
});
