"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationQueue = exports.getNotificationQueue = exports.initializeNotificationQueue = void 0;
// src/modules/notifications/notification.queues.ts
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@/config/bullmq");
const logger_config_1 = require("@/config/logger.config");
// First, create a function to initialize the queue with proper error handling
const initializeNotificationQueue = async () => {
    try {
        logger_config_1.logger.info(`Initializing notification queue: ${bullmq_2.defaultQueueName}`);
        // Log a simplified version of the Redis configuration to avoid type issues
        logger_config_1.logger.info(`Initializing Redis connection for BullMQ notification queue: ${bullmq_2.defaultQueueName}`);
        // Create the queue
        const queue = new bullmq_1.Queue(bullmq_2.defaultQueueName, {
            connection: bullmq_2.redisConnectionOptions,
            defaultJobOptions: bullmq_2.defaultJobOptions,
        });
        // Use type assertion to bypass the strict type checking
        queue.on('error', (error) => {
            logger_config_1.logger.error(`Notification Queue Error: ${error.message}`, { stack: error.stack });
        });
        queue.on('waiting', (jobId) => {
            logger_config_1.logger.debug(`Job ${jobId} is waiting in notification queue.`);
        });
        queue.on('active', (job) => {
            logger_config_1.logger.debug(`Job ${job.id} is active in notification queue.`);
        });
        queue.on('completed', (job, result) => {
            logger_config_1.logger.info(`Job ${job.id} completed in notification queue.`);
            logger_config_1.logger.debug(`Job ${job.id} result:`, result);
        });
        queue.on('failed', (job, err) => {
            if (job) {
                logger_config_1.logger.error(`Job ${job.id} failed in notification queue: ${err.message}`, {
                    stack: err.stack,
                    jobData: job.data,
                    jobName: job.name,
                    attemptsMade: job.attemptsMade
                });
            }
            else {
                logger_config_1.logger.error(`A job failed in notification queue (job data unavailable): ${err.message}`, {
                    stack: err.stack
                });
            }
        });
        // Additionally, use QueueEvents for more comprehensive monitoring
        const queueEvents = new bullmq_1.QueueEvents(bullmq_2.defaultQueueName, {
            connection: bullmq_2.redisConnectionOptions
        });
        // QueueEvents has different event types than Queue
        queueEvents.on('failed', ({ jobId, failedReason }) => {
            logger_config_1.logger.error(`QueueEvents: Job ${jobId} failed with reason: ${failedReason}`);
        });
        queueEvents.on('completed', ({ jobId }) => {
            logger_config_1.logger.info(`QueueEvents: Job ${jobId} completed successfully`);
        });
        queueEvents.on('error', (error) => {
            logger_config_1.logger.error(`QueueEvents Error: ${error.message}`, { stack: error.stack });
        });
        logger_config_1.logger.info('Notification queue initialized successfully');
        return { queue, queueEvents };
    }
    catch (error) {
        // Safely handle unknown error
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger_config_1.logger.error('Failed to initialize notification queue', {
            error: errorMessage,
            stack: errorStack
        });
        throw error;
    }
};
exports.initializeNotificationQueue = initializeNotificationQueue;
// Create and export the queue
let notificationQueue;
// Initialize the queue and export it
const getNotificationQueue = async () => {
    if (!notificationQueue) {
        const { queue } = await (0, exports.initializeNotificationQueue)();
        exports.notificationQueue = notificationQueue = queue;
    }
    return notificationQueue;
};
exports.getNotificationQueue = getNotificationQueue;
// For backward compatibility, also export the queue directly
// But initialize it first for safety
(0, exports.initializeNotificationQueue)()
    .then(({ queue }) => {
    exports.notificationQueue = notificationQueue = queue;
})
    .catch((error) => {
    // Safely handle unknown error
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger_config_1.logger.error('Failed to initialize notification queue on module load', {
        error: errorMessage
    });
});
// // src/modules/notifications/notification.queues.ts
// import { Queue, QueueEvents, Job } from 'bullmq';
// import { redisConnectionOptions, defaultQueueName, defaultJobOptions } from '@/config/bullmq';
// import { NotificationJobName, NotificationJobData, SmsJobPayload } from './interfaces/notification.interfaces';
// import { logger } from '@/config/logger.config';
// // First, create a function to initialize the queue with proper error handling
// export const initializeNotificationQueue = async () => {
//   try {
//     logger.info(`Initializing notification queue: ${defaultQueueName}`);
//     // Log Redis configuration but handle different connection types safely
//     const connectionInfo = {
//       host: typeof redisConnectionOptions === 'object' && 'host' in redisConnectionOptions ? 
//         redisConnectionOptions.host : 'cluster mode',
//       port: typeof redisConnectionOptions === 'object' && 'port' in redisConnectionOptions ? 
//         redisConnectionOptions.port : 'n/a',
//       tls: typeof redisConnectionOptions === 'object' && 'tls' in redisConnectionOptions ? 
//         !!redisConnectionOptions.tls : false,
//       username: typeof redisConnectionOptions === 'object' && 'username' in redisConnectionOptions ? 
//         redisConnectionOptions.username : 'not set'
//     };
//     logger.info(`Redis configuration: ${JSON.stringify(connectionInfo)}`);
//     // Create the queue
//     const queue = new Queue<NotificationJobData, any, NotificationJobName>(
//       defaultQueueName,
//       {
//         connection: redisConnectionOptions,
//         defaultJobOptions: defaultJobOptions,
//       }
//     );
//     // Set up comprehensive event handling with correct BullMQ types
//     queue.on('error', (error) => {
//       logger.error(`Notification Queue Error: ${error.message}`, { stack: error.stack });
//     });
//     // In BullMQ, 'waiting' event can either receive a jobId string or a Job object
//     // Handle both cases to be safe
//     queue.on('waiting', (job) => {
//       const jobId = typeof job === 'string' ? job : job.id;
//       logger.debug(`Job ${jobId} is waiting in notification queue.`);
//     });
//     queue.on('active', (job) => {
//       logger.debug(`Job ${job.id} is active in notification queue.`);
//     });
//     queue.on('completed', (job, result) => {
//       logger.info(`Job ${job.id} completed in notification queue.`);
//       logger.debug(`Job ${job.id} result:`, result);
//     });
//     queue.on('failed', (job, err) => {
//       if (job) {
//         logger.error(`Job ${job.id} failed in notification queue: ${err.message}`, { 
//           stack: err.stack,
//           jobData: job.data,
//           jobName: job.name,
//           attemptsMade: job.attemptsMade
//         });
//       } else {
//         logger.error(`A job failed in notification queue (job data unavailable): ${err.message}`, { 
//           stack: err.stack 
//         });
//       }
//     });
//     // Additionally, use QueueEvents for more comprehensive monitoring
//     const queueEvents = new QueueEvents(defaultQueueName, {
//       connection: redisConnectionOptions
//     });
//     queueEvents.on('failed', ({ jobId, failedReason }) => {
//       logger.error(`QueueEvents: Job ${jobId} failed with reason: ${failedReason}`);
//     });
//     queueEvents.on('completed', ({ jobId }) => {
//       logger.info(`QueueEvents: Job ${jobId} completed successfully`);
//     });
//     queueEvents.on('error', (error) => {
//       logger.error(`QueueEvents Error: ${error.message}`, { stack: error.stack });
//     });
//     logger.info('Notification queue initialized successfully');
//     return { queue, queueEvents };
//   } catch (error) {
//     // Safely handle unknown error
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     const errorStack = error instanceof Error ? error.stack : undefined;
//     logger.error('Failed to initialize notification queue', { 
//       error: errorMessage,
//       stack: errorStack
//     });
//     throw error;
//   }
// };
// // Create and export the queue
// let notificationQueue: Queue<NotificationJobData, any, NotificationJobName>;
// // Initialize the queue and export it
// export const getNotificationQueue = async (): Promise<Queue<NotificationJobData, any, NotificationJobName>> => {
//   if (!notificationQueue) {
//     const { queue } = await initializeNotificationQueue();
//     notificationQueue = queue;
//   }
//   return notificationQueue;
// };
// // For backward compatibility, also export the queue directly
// // But initialize it first for safety
// initializeNotificationQueue()
//   .then(({ queue }) => {
//     notificationQueue = queue;
//   })
//   .catch((error) => {
//     // Safely handle unknown error
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     logger.error('Failed to initialize notification queue on module load', { 
//       error: errorMessage
//     });
//   });
// export { notificationQueue };
// // // src/modules/notifications/notification.queues.ts
// // import { Queue, QueueEvents } from 'bullmq';
// // import { redisConnectionOptions, defaultQueueName, defaultJobOptions } from '@/config/bullmq';
// // import { NotificationJobName, NotificationJobData } from './interfaces/notification.interfaces';
// // import { logger } from '@/config/logger.config';
// // // First, create a function to initialize the queue with proper error handling
// // export const initializeNotificationQueue = async () => {
// //   try {
// //     logger.info(`Initializing notification queue: ${defaultQueueName}`);
// //     // Log Redis configuration but handle different connection types
// //     // Safely access properties that might not exist on ClusterOptions
// //     const connectionInfo = {
// //       host: 'host' in redisConnectionOptions ? redisConnectionOptions.host : 'cluster mode',
// //       port: 'port' in redisConnectionOptions ? redisConnectionOptions.port : 'n/a',
// //       tls: 'tls' in redisConnectionOptions ? !!redisConnectionOptions.tls : false,
// //       username: 'username' in redisConnectionOptions ? redisConnectionOptions.username : 'not set'
// //     };
// //     logger.info(`Redis configuration: ${JSON.stringify(connectionInfo)}`);
// //     // Create the queue
// //     const queue = new Queue<NotificationJobData, any, NotificationJobName>(
// //       defaultQueueName,
// //       {
// //         connection: redisConnectionOptions,
// //         defaultJobOptions: defaultJobOptions,
// //       }
// //     );
// //     // Set up comprehensive event handling - with proper TypeScript typing
// //     queue.on('error', (error: Error) => {
// //       logger.error(`Notification Queue Error: ${error.message}`, { stack: error.stack });
// //     });
// //     queue.on('waiting', (jobId: string) => {
// //       logger.debug(`Job ${jobId} is waiting in notification queue.`);
// //     });
// //     // For these events, we need to use the 'any' type because the exact types
// //     // depend on the Queue's generic parameters
// //     queue.on('active' as any, (job: any) => {
// //       logger.debug(`Job ${job.id} is active in notification queue.`);
// //     });
// //     queue.on('completed' as any, (job: any, result: any) => {
// //       logger.info(`Job ${job.id} completed in notification queue.`);
// //       logger.debug(`Job ${job.id} result:`, result);
// //     });
// //     queue.on('failed' as any, (job: any, err: Error) => {
// //       if (job) {
// //         logger.error(`Job ${job.id} failed in notification queue: ${err.message}`, { 
// //           stack: err.stack,
// //           jobData: job.data,
// //           jobName: job.name,
// //           attemptsMade: job.attemptsMade
// //         });
// //       } else {
// //         logger.error(`A job failed in notification queue (job data unavailable): ${err.message}`, { 
// //           stack: err.stack 
// //         });
// //       }
// //     });
// //     // Additionally, use QueueEvents for more comprehensive monitoring
// //     const queueEvents = new QueueEvents(defaultQueueName, {
// //       connection: redisConnectionOptions
// //     });
// //     queueEvents.on('failed', ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
// //       logger.error(`QueueEvents: Job ${jobId} failed with reason: ${failedReason}`);
// //     });
// //     queueEvents.on('completed', ({ jobId }: { jobId: string }) => {
// //       logger.info(`QueueEvents: Job ${jobId} completed successfully`);
// //     });
// //     queueEvents.on('error', (error: Error) => {
// //       logger.error(`QueueEvents Error: ${error.message}`, { stack: error.stack });
// //     });
// //     logger.info('Notification queue initialized successfully');
// //     return { queue, queueEvents };
// //   } catch (error: unknown) {
// //     const err = error as Error;
// //     logger.error('Failed to initialize notification queue', { 
// //       error: err.message, 
// //       stack: err.stack 
// //     });
// //     throw error;
// //   }
// // };
// // // Create and export the queue
// // let notificationQueue: Queue<NotificationJobData, any, NotificationJobName>;
// // // Initialize the queue and export it
// // export const getNotificationQueue = async (): Promise<Queue<NotificationJobData, any, NotificationJobName>> => {
// //   if (!notificationQueue) {
// //     const { queue } = await initializeNotificationQueue();
// //     notificationQueue = queue;
// //   }
// //   return notificationQueue;
// // };
// // // For backward compatibility, also export the queue directly
// // // But initialize it first for safety
// // initializeNotificationQueue()
// //   .then(({ queue }) => {
// //     notificationQueue = queue;
// //   })
// //   .catch((error: unknown) => {
// //     const err = error as Error;
// //     logger.error('Failed to initialize notification queue on module load', { 
// //       error: err.message 
// //     });
// //   });
// // export { notificationQueue };
// // // // src/modules/notifications/notification.queues.ts
// // // import { Queue, QueueEvents } from 'bullmq';
// // // import { redisConnectionOptions, defaultQueueName, defaultJobOptions } from '@/config/bullmq';
// // // import { NotificationJobName, NotificationJobData } from './interfaces/notification.interfaces';
// // // import { logger } from '@/config/logger.config';
// // // // First, create a function to initialize the queue with proper error handling
// // // export const initializeNotificationQueue = async () => {
// // //   try {
// // //     logger.info(`Initializing notification queue: ${defaultQueueName}`);
// // //     logger.info(`Redis configuration: ${JSON.stringify({
// // //       host: redisConnectionOptions.host,
// // //       port: redisConnectionOptions.port,
// // //       tls: !!redisConnectionOptions.tls,
// // //       username: redisConnectionOptions.username || 'not set'
// // //     })}`);
// // //     // Create the queue
// // //     const queue = new Queue<NotificationJobData, any, NotificationJobName>(
// // //       defaultQueueName,
// // //       {
// // //         connection: redisConnectionOptions,
// // //         defaultJobOptions: defaultJobOptions,
// // //       }
// // //     );
// // //     // Set up comprehensive event handling
// // //     queue.on('error', (error) => {
// // //       logger.error(`Notification Queue Error: ${error.message}`, { stack: error.stack });
// // //     });
// // //     queue.on('waiting', (jobId) => {
// // //       logger.debug(`Job ${jobId} is waiting in notification queue.`);
// // //     });
// // //     queue.on('active', (job) => {
// // //       logger.debug(`Job ${job.id} is active in notification queue.`);
// // //     });
// // //     queue.on('completed', (job, result) => {
// // //       logger.info(`Job ${job.id} completed in notification queue.`);
// // //       logger.debug(`Job ${job.id} result:`, result);
// // //     });
// // //     queue.on('failed', (job, err) => {
// // //       if (job) {
// // //         logger.error(`Job ${job.id} failed in notification queue: ${err.message}`, { 
// // //           stack: err.stack,
// // //           jobData: job.data,
// // //           jobName: job.name,
// // //           attemptsMade: job.attemptsMade
// // //         });
// // //       } else {
// // //         logger.error(`A job failed in notification queue (job data unavailable): ${err.message}`, { 
// // //           stack: err.stack 
// // //         });
// // //       }
// // //     });
// // //     // Additionally, use QueueEvents for more comprehensive monitoring
// // //     const queueEvents = new QueueEvents(defaultQueueName, {
// // //       connection: redisConnectionOptions
// // //     });
// // //     queueEvents.on('failed', ({ jobId, failedReason }) => {
// // //       logger.error(`QueueEvents: Job ${jobId} failed with reason: ${failedReason}`);
// // //     });
// // //     queueEvents.on('completed', ({ jobId }) => {
// // //       logger.info(`QueueEvents: Job ${jobId} completed successfully`);
// // //     });
// // //     queueEvents.on('error', (error) => {
// // //       logger.error(`QueueEvents Error: ${error.message}`, { stack: error.stack });
// // //     });
// // //     logger.info('Notification queue initialized successfully');
// // //     return { queue, queueEvents };
// // //   } catch (error) {
// // //     logger.error('Failed to initialize notification queue', { 
// // //       error: error.message, 
// // //       stack: error.stack 
// // //     });
// // //     throw error;
// // //   }
// // // };
// // // // Create and export the queue
// // // let notificationQueue: Queue<NotificationJobData, any, NotificationJobName>;
// // // // Initialize the queue and export it
// // // export const getNotificationQueue = async (): Promise<Queue<NotificationJobData, any, NotificationJobName>> => {
// // //   if (!notificationQueue) {
// // //     const { queue } = await initializeNotificationQueue();
// // //     notificationQueue = queue;
// // //   }
// // //   return notificationQueue;
// // // };
// // // // For backward compatibility, also export the queue directly
// // // // But initialize it first for safety
// // // initializeNotificationQueue()
// // //   .then(({ queue }) => {
// // //     notificationQueue = queue;
// // //   })
// // //   .catch(error => {
// // //     logger.error('Failed to initialize notification queue on module load', { 
// // //       error: error.message 
// // //     });
// // //   });
// // // export { notificationQueue };
// // // // // src/modules/notifications/notification.queues.ts
// // // // import { Queue, WorkerOptions } from 'bullmq';
// // // // import { redisConnectionOptions, defaultQueueName, defaultJobOptions } from '@/config/bullmq';
// // // // import { NotificationJobName, NotificationJobData } from './interfaces/notification.interfaces';
// // // // // You can create multiple queues for different purposes if needed
// // // // // For now, one default queue for all notifications.
// // // // export const notificationQueue = new Queue<NotificationJobData, any, NotificationJobName>(
// // // //   defaultQueueName, // Or a specific name like 'sms-notifications'
// // // //   {
// // // //     connection: redisConnectionOptions,
// // // //     defaultJobOptions: defaultJobOptions,
// // // //   }
// // // // );
// // // // // Optional: Log queue events for debugging
// // // // notificationQueue.on('error', (error) => {
// // // //   console.error(`Notification Queue Error: ${error.message}`);
// // // // });
// // // // notificationQueue.on('waiting', (jobId) => {
// // // //   // console.log(`Job ${jobId} is waiting in notification queue.`);
// // // // });
// // // // notificationQueue.on('active', (job) => {
// // // //   // console.log(`Job ${job.id} is active in notification queue.`);
// // // // });
// // // // notificationQueue.on('completed', (job, result) => {
// // // //   // console.log(`Job ${job.id} completed in notification queue. Result:`, result);
// // // // });
// // // // notificationQueue.on('failed', (job, err) => {
// // // //   if (job) {
// // // //     console.error(`Job ${job.id} failed in notification queue: ${err.message}`, err.stack);
// // // //   } else {
// // // //     console.error(`A job failed in notification queue (job data unavailable): ${err.message}`, err.stack);
// // // //   }
// // // // });
