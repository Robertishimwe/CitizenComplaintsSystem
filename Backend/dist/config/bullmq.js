"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultJobOptions = exports.testRedisConnection = exports.redisConnectionOptions = exports.defaultQueueName = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_config_1 = require("./logger.config");
// Import environment variables - adjust your import as needed
// import { env } from './environment';
// For demonstration, using direct values from your Redis CLI command
// In production, use environment variables instead
const redisConfig = {
    REDIS_HOST: 'redis-robertishimwe100-c7ab.f.aivencloud.com',
    REDIS_PORT: 19348,
    REDIS_PASSWORD: 'AVNS_gNMrk_Fskm4nfVvmqfa',
    REDIS_USERNAME: 'default',
    REDIS_TLS_ENABLED: true
};
exports.defaultQueueName = 'citizen-engagement-queue';
exports.redisConnectionOptions = {
    host: redisConfig.REDIS_HOST,
    port: redisConfig.REDIS_PORT,
    username: redisConfig.REDIS_USERNAME,
    password: redisConfig.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Important for BullMQ as per docs
    // TLS Configuration - Critical for Aiven Redis
    tls: redisConfig.REDIS_TLS_ENABLED ? {
        rejectUnauthorized: true
    } : undefined,
    // Optional settings that might help with connection stability
    enableReadyCheck: false,
    // maxRetriesPerRequest: null,
    reconnectOnError: (err) => {
        logger_config_1.logger.error(`Redis connection error: ${err.message}`);
        return true; // Always try to reconnect
    }
};
// Test Redis connection function (run this before starting your app)
const testRedisConnection = async () => {
    logger_config_1.logger.info('Testing Redis connection with the following settings:');
    logger_config_1.logger.info(`- Host: ${redisConfig.REDIS_HOST}`);
    logger_config_1.logger.info(`- Port: ${redisConfig.REDIS_PORT}`);
    logger_config_1.logger.info(`- TLS Enabled: ${redisConfig.REDIS_TLS_ENABLED}`);
    logger_config_1.logger.info(`- Using Username: ${redisConfig.REDIS_USERNAME}`);
    logger_config_1.logger.info(`- Using Password: ${!!redisConfig.REDIS_PASSWORD}`);
    const redis = new ioredis_1.default({
        host: redisConfig.REDIS_HOST,
        port: redisConfig.REDIS_PORT,
        username: redisConfig.REDIS_USERNAME,
        password: redisConfig.REDIS_PASSWORD,
        tls: redisConfig.REDIS_TLS_ENABLED ? {
            rejectUnauthorized: true
        } : undefined,
    });
    try {
        // Set up error listener
        redis.on('error', (error) => {
            logger_config_1.logger.error(`Redis error during connection test: ${error.message}`);
        });
        // Test connection by setting and getting a test value
        logger_config_1.logger.info('Attempting to connect to Redis...');
        await redis.set('bullmq_connection_test', 'success');
        logger_config_1.logger.info('Successfully set test value in Redis');
        const testResult = await redis.get('bullmq_connection_test');
        logger_config_1.logger.info(`Retrieved test value from Redis: "${testResult}"`);
        await redis.quit();
        if (testResult === 'success') {
            logger_config_1.logger.info('✅ Successfully connected to Redis and verified read/write access');
            return true;
        }
        else {
            logger_config_1.logger.error('❌ Connected to Redis but test failed - unexpected return value');
            return false;
        }
    }
    catch (error) {
        logger_config_1.logger.error('❌ Failed to connect to Redis:', error);
        try {
            await redis.quit();
        }
        catch (quitError) {
            logger_config_1.logger.error('Error while closing Redis connection:', quitError);
        }
        return false;
    }
};
exports.testRedisConnection = testRedisConnection;
exports.defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 1000,
    },
    removeOnComplete: {
        count: 1000,
        age: 24 * 60 * 60,
    },
    removeOnFail: {
        count: 5000,
    },
};
// import { ConnectionOptions } from 'bullmq';
// import IORedis from 'ioredis';
// import { env } from './environment';
// export const defaultQueueName = 'citizen-engagement-queue';
//  export const redisConnectionOptions: ConnectionOptions = {
//   host: env.REDIS_HOST,
//   port: env.REDIS_PORT,
//   password: env.REDIS_PASSWORD || undefined, // Only set password if it exists
//   maxRetriesPerRequest: null, // Important for BullMQ as per docs
//   enableReadyCheck: false, // Helps with some Redis connection issues
//   // TLS Configuration for Aiven Redis
//   tls: {
//     rejectUnauthorized: true,
//     // If you need to provide certificates, uncomment these:
//     // ca: fs.readFileSync('/path/to/ca.pem', 'utf8'),
//     // cert: fs.readFileSync('/path/to/cert.pem', 'utf8'),
//     // key: fs.readFileSync('/path/to/key.pem', 'utf8'),
//   },
//   // Username if required (Aiven Redis uses authentication)
//   username: 'default', // or process.env.REDIS_USERNAME if you store it in env
// };
// // export const redisConnectionOptions: ConnectionOptions = {
// //   host: env.REDIS_HOST,
// //   port: env.REDIS_PORT,
// //   username: 'default', // Aiven requires a username
// //   password: env.REDIS_PASSWORD || undefined,
// //   tls: {
// //     rejectUnauthorized: true
// //   },
// //   // Other options...
// // };
// // export const redisConnectionOptions: ConnectionOptions = {
// //   host: env.REDIS_HOST,
// //   port: env.REDIS_PORT,
// //   password: env.REDIS_PASSWORD || undefined, // Only set password if it exists
// //   maxRetriesPerRequest: null, // Important for BullMQ as per docs
// //   // enableReadyCheck: false, // Optional: Sometimes needed in specific environments
// // };
// export const testRedisConnection = async (): Promise<boolean> => {
//   console.log('Testing Redis connection with the following settings:');
//   console.log(`- Host: ${env.REDIS_HOST}`);
//   console.log(`- Port: ${env.REDIS_PORT}`);
//   console.log(`- TLS Enabled: ${env.REDIS_TLS_ENABLED}`);
//   console.log(`- Using Password: ${!!env.REDIS_PASSWORD}`);
//   console.log(`- Username: ${env.REDIS_USERNAME}`);
//   const redis = new IORedis(redisConnectionOptions);
//   try {
//     // Test connection by setting and getting a test value
//     await redis.set('bullmq_connection_test', 'success');
//     const testResult = await redis.get('bullmq_connection_test');
//     await redis.quit();
//     if (testResult === 'success') {
//       console.log('✅ Successfully connected to Redis');
//       return true;
//     } else {
//       console.error('❌ Connected to Redis but test failed');
//       return false;
//     }
//   } catch (error) {
//     console.error('❌ Failed to connect to Redis:', error);
//     return false;
//   }
// };
// // You can define specific queue options here if needed
// export const defaultJobOptions = {
//   attempts: 3, // Number of times to retry a failed job
//   backoff: {
//     type: 'exponential', // 'fixed' or 'exponential'
//     delay: 1000, // Delay in ms for the first retry
//   },
//   removeOnComplete: {
//     count: 1000, // Keep last 1000 completed jobs
//     age: 24 * 60 * 60, // Keep completed jobs for 24 hours
//   },
//   removeOnFail: {
//     count: 5000, // Keep last 5000 failed jobs
//     // age: 7 * 24 * 60 * 60, // Keep failed jobs for 7 days (optional)
//   },
// };
// // Example: Export a connection object if you create multiple queues
// // import IORedis from 'ioredis';
// // export const redisClient = new IORedis(redisConnectionOptions);
