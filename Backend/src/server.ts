// src/server.ts
import http from 'http';
import app from './app'; // Your Express app
import { env } from '@/config/environment';
import { logger } from '@/config/logger.config';
import prisma from '@/config/prisma'; // To ensure Prisma client is connected/handled
import { seedAdminUser } from '@/db/seed';
import { testRedisConnection } from '@/config/bullmq';
import { createNotificationWorker } from '@/modules/notifications/notification.worker';

const PORT = env.PORT || 3000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    // Optional: Check database connection before starting server
    await prisma.$connect();
    logger.info('🔌 Database connected successfully.');
    await testRedisConnection()
    await seedAdminUser();
    await createNotificationWorker()

    server.listen(PORT, () => {
      logger.info(`🚀 Server is listening on port ${PORT}`);
      logger.info(`🌐 API available at http://localhost:${PORT}${env.API_PREFIX}`);
      logger.info(`🌱 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server or connect to database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  logger.info(`👋 ${signal} signal received. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('🚫 HTTP server closed.');
    await prisma.$disconnect();
    logger.info('🔌 Database connection closed.');
    process.exit(0);
  });

  // Force shutdown if graceful shutdown fails after a timeout
  setTimeout(async () => {
    logger.warn('⚠️ Graceful shutdown timed out. Forcing exit.');
    await prisma.$disconnect();
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

// Graceful shutdown handling
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT')); // Catches Ctrl+C

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
  logger.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, shutdown server on unhandled rejections (might be too aggressive)
  // shutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {

  console.log(">>>>>>>>>>",error)
  logger.error('💥 Uncaught Exception:', error);
  // It's generally recommended to exit on uncaught exceptions after logging,
  // as the application might be in an inconsistent state.
  shutdown('UNCAUGHT_EXCEPTION');
});

export { server, startServer };
