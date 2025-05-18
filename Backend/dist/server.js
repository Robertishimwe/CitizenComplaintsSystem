"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.server = void 0;
// src/server.ts
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app")); // Your Express app
const environment_1 = require("@/config/environment");
const logger_config_1 = require("@/config/logger.config");
const prisma_1 = __importDefault(require("@/config/prisma")); // To ensure Prisma client is connected/handled
const seed_1 = require("@/db/seed");
const bullmq_1 = require("@/config/bullmq");
const notification_worker_1 = require("@/modules/notifications/notification.worker");
const PORT = environment_1.env.PORT || 3000;
const server = http_1.default.createServer(app_1.default);
exports.server = server;
const startServer = async () => {
    try {
        // Optional: Check database connection before starting server
        await prisma_1.default.$connect();
        logger_config_1.logger.info('🔌 Database connected successfully.');
        await (0, bullmq_1.testRedisConnection)();
        await (0, seed_1.seedAdminUser)();
        await (0, notification_worker_1.createNotificationWorker)();
        server.listen(PORT, () => {
            logger_config_1.logger.info(`🚀 Server is listening on port ${PORT}`);
            logger_config_1.logger.info(`🌐 API available at http://localhost:${PORT}${environment_1.env.API_PREFIX}`);
            logger_config_1.logger.info(`🌱 Environment: ${environment_1.env.NODE_ENV}`);
        });
    }
    catch (error) {
        logger_config_1.logger.error('❌ Failed to start server or connect to database:', error);
        await prisma_1.default.$disconnect();
        process.exit(1);
    }
};
exports.startServer = startServer;
const shutdown = async (signal) => {
    logger_config_1.logger.info(`👋 ${signal} signal received. Shutting down gracefully...`);
    server.close(async () => {
        logger_config_1.logger.info('🚫 HTTP server closed.');
        await prisma_1.default.$disconnect();
        logger_config_1.logger.info('🔌 Database connection closed.');
        process.exit(0);
    });
    // Force shutdown if graceful shutdown fails after a timeout
    setTimeout(async () => {
        logger_config_1.logger.warn('⚠️ Graceful shutdown timed out. Forcing exit.');
        await prisma_1.default.$disconnect();
        process.exit(1);
    }, 10000); // 10 seconds timeout
};
// Graceful shutdown handling
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT')); // Catches Ctrl+C
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger_config_1.logger.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally, shutdown server on unhandled rejections (might be too aggressive)
    // shutdown('UNHANDLED_REJECTION');
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.log(">>>>>>>>>>", error);
    logger_config_1.logger.error('💥 Uncaught Exception:', error);
    // It's generally recommended to exit on uncaught exceptions after logging,
    // as the application might be in an inconsistent state.
    shutdown('UNCAUGHT_EXCEPTION');
});
