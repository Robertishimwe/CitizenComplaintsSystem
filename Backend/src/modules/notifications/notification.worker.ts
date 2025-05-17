// src/modules/notifications/notification.worker.ts
import { Worker, Job } from 'bullmq';
import { redisConnectionOptions, defaultQueueName } from '@/config/bullmq';
import { pindoConfig } from '@/config/pindo';
import { NotificationJobName, SmsJobPayload, NotificationJobData } from './interfaces/notification.interfaces';
import { logger } from '@/config/logger.config';
import axios from 'axios';

// Pindo SMS sending function
const sendPindoSms = async (payload: SmsJobPayload): Promise<any> => {
  const requestData = {
    to: `+25${payload.to}`,
    text: payload.text,
    sender: payload.sender || pindoConfig.senderId,
  };
console.log(">>>>>>>>>>>>>>>>>>",requestData)
  const url = `${pindoConfig.baseUrl}${pindoConfig.smsSingleUrl}`;

  try {
    logger.info(`Attempting to send SMS via Pindo to ${payload.to}`);
    
    // Validate API Token
    if (!pindoConfig.apiToken) {
      throw new Error('Pindo API token is not configured');
    }
    
    const response = await axios.post(url, requestData, {
      headers: {
        Authorization: `Bearer ${pindoConfig.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    logger.info(`Pindo SMS sent successfully to ${payload.to}. Response: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error: any) {
    logger.error(`Failed to send Pindo SMS to ${payload.to}. Error: ${error.message}`, {
      status: error.response?.status,
      data: error.response?.data,
      requestData
    });
    throw error; // Re-throw to let BullMQ handle retry logic
  }
};

// Create and export the worker
export const createNotificationWorker = () => {
  const worker = new Worker<NotificationJobData, any, NotificationJobName>(
    defaultQueueName,
    async (job: Job<NotificationJobData, any, NotificationJobName>) => {
      logger.info(`Processing job ${job.id} of type ${job.name} from notification queue.`);
      
      switch (job.name) {
        case NotificationJobName.SEND_SMS:
          return sendPindoSms(job.data as SmsJobPayload);
        default:
          logger.warn(`Unknown job type received: ${job.name}`);
          throw new Error(`Unknown job type: ${job.name}`);
      }
    },
    {
      connection: redisConnectionOptions,
      concurrency: 5,
    }
  );

  // Use type assertions as a workaround for BullMQ v5.52.2 type issues
  type AnyWorkerEvents = any;

  (worker as AnyWorkerEvents).on('completed', (job: any, result: any) => {
    logger.info(`Worker: Job ${job.id} (type: ${job.name}) completed successfully.`);
  });

  (worker as AnyWorkerEvents).on('failed', (job: any, err: Error) => {
    if (job) {
      // Fix the TypeScript error by using optional chaining and providing a default value
      const maxAttempts = job.opts?.attempts || 0;
      const retriesLeft = Math.max(0, maxAttempts - job.attemptsMade);
      
      logger.error(`Worker: Job ${job.id} (type: ${job.name}) failed with error: ${err.message}. Retries left: ${retriesLeft}`);
    } else {
      logger.error(`Worker: A job failed with error: ${err.message} (job details not available)`);
    }
  });

  (worker as AnyWorkerEvents).on('error', (err: Error) => {
    logger.error('Worker encountered an error:', err);
  });

  logger.info('📬 Notification worker initialized and listening for jobs...');
  
  return worker;
};











// // src/modules/notifications/notification.worker.ts
// import { Worker, Job } from 'bullmq';
// import { redisConnectionOptions, defaultQueueName } from '@/config/bullmq';
// import { pindoConfig } from '@/config/pindo';
// import { NotificationJobName, SmsJobPayload, NotificationJobData } from './interfaces/notification.interfaces';
// import { logger } from '@/config/logger.config';
// import axios from 'axios';

// // Pindo SMS sending function
// const sendPindoSms = async (payload: SmsJobPayload): Promise<any> => {
//   const requestData = {
//     to: payload.to,
//     text: payload.text,
//     sender: payload.sender || pindoConfig.senderId,
//   };

//   const url = `${pindoConfig.baseUrl}${pindoConfig.smsSingleUrl}`;

//   try {
//     logger.info(`Attempting to send SMS via Pindo to ${payload.to}`);
    
//     // Validate API Token
//     if (!pindoConfig.apiToken) {
//       throw new Error('Pindo API token is not configured');
//     }
    
//     const response = await axios.post(url, requestData, {
//       headers: {
//         Authorization: `Bearer ${pindoConfig.apiToken}`,
//         'Content-Type': 'application/json',
//       },
//     });
    
//     logger.info(`Pindo SMS sent successfully to ${payload.to}. Response: ${JSON.stringify(response.data)}`);
//     return response.data;
//   } catch (error: any) {
//     logger.error(`Failed to send Pindo SMS to ${payload.to}. Error: ${error.message}`, {
//       status: error.response?.status,
//       data: error.response?.data,
//       requestData
//     });
//     throw error; // Re-throw to let BullMQ handle retry logic
//   }
// };

// // Create and export the worker
// export const createNotificationWorker = () => {
//   const worker = new Worker<NotificationJobData, any, NotificationJobName>(
//     defaultQueueName,
//     async (job: Job<NotificationJobData, any, NotificationJobName>) => {
//       logger.info(`Processing job ${job.id} of type ${job.name} from notification queue.`);
      
//       switch (job.name) {
//         case NotificationJobName.SEND_SMS:
//           return sendPindoSms(job.data as SmsJobPayload);
//         default:
//           logger.warn(`Unknown job type received: ${job.name}`);
//           throw new Error(`Unknown job type: ${job.name}`);
//       }
//     },
//     {
//       connection: redisConnectionOptions,
//       concurrency: 5,
//     }
//   );

//   worker.on('completed', (job, result) => {
//     logger.info(`Worker: Job ${job.id} (type: ${job.name}) completed successfully.`);
//   });

//   worker.on('failed', (job, err) => {
//     if (job) {
//       logger.error(`Worker: Job ${job.id} (type: ${job.name}) failed with error: ${err.message}. Retries left: ${job.opts.attempts - job.attemptsMade}`);
//     } else {
//       logger.error(`Worker: A job failed with error: ${err.message} (job details not available)`);
//     }
//   });

//   worker.on('error', err => {
//     logger.error('Worker encountered an error:', err);
//   });

//   logger.info('📬 Notification worker initialized and listening for jobs...');
  
//   return worker;
// };


















// // // src/modules/notifications/notification.worker.ts
// // import { Worker, Job } from 'bullmq';
// // import { redisConnectionOptions, defaultQueueName } from '@/config/bullmq';
// // import { pindoConfig } from '@/config/pindo'; // Your Pindo API config
// // import { NotificationJobName, SmsJobPayload, NotificationJobData } from './interfaces/notification.interfaces';
// // import { logger } from '@/config/logger.config';
// // import axios from 'axios'; // For making HTTP requests to Pindo

// // // Pindo SMS sending function
// // const sendPindoSms = async (payload: SmsJobPayload): Promise<any> => {
// //   const requestData = {
// //     to: payload.to,
// //     text: payload.text,
// //     sender: pindoConfig.senderId, // Use default sender from config
// //   };

// //   const url = `${pindoConfig.baseUrl}${pindoConfig.smsSingleUrl}`;

// //   try {
// //     logger.info(`Attempting to send SMS via Pindo to ${payload.to}`);
// //     const response = await axios.post(url, requestData, {
// //       headers: {
// //         Authorization: `Bearer ${pindoConfig.apiToken}`,
// //         'Content-Type': 'application/json',
// //       },
// //     });
// //     logger.info(`Pindo SMS sent successfully to ${payload.to}. Response: ${JSON.stringify(response.data)}`);
// //     return response.data;
// //   } catch (error: any) {
// //     logger.error(`Failed to send Pindo SMS to ${payload.to}. Error: ${error.message}`, {
// //         status: error.response?.status,
// //         data: error.response?.data,
// //         requestData
// //     });
// //     throw error; // Re-throw to let BullMQ handle retry logic based on job options
// //   }
// // };


// // // Create a worker
// // // The name of the worker is not critical, but the queue name must match.
// // // Concurrency defines how many jobs this worker can process simultaneously.
// // const worker = new Worker<NotificationJobData, any, NotificationJobName>(
// //   defaultQueueName, // Must match the queue name used in notification.queues.ts
// //   async (job: Job<NotificationJobData, any, NotificationJobName>) => {
// //     logger.info(`Processing job ${job.id} of type ${job.name} from notification queue.`);
// //     switch (job.name) {
// //       case NotificationJobName.SEND_SMS:
// //         // Type assertion is safe here due to job.name check
// //         return sendPindoSms(job.data as SmsJobPayload);
// //       // Add other job types here
// //       // case NotificationJobName.SEND_EMAIL:
// //       //   return sendEmail(job.data as EmailJobPayload);
// //       default:
// //         logger.warn(`Unknown job type received: ${job.name}`);
// //         throw new Error(`Unknown job type: ${job.name}`);
// //     }
// //   },
// //   {
// //     connection: redisConnectionOptions,
// //     concurrency: 5, // Adjust as needed based on your Pindo rate limits and server capacity
// //     // autorun: false, // Set to false if you want to manually start the worker later
// //   }
// // );

// // worker.on('completed', (job, result) => {
// //   logger.info(`Worker: Job ${job.id} (type: ${job.name}) completed successfully.`);
// // });

// // worker.on('failed', (job, err) => {
// //     if (job) {
// //         logger.error(`Worker: Job ${job.id} (type: ${job.name}) failed with error: ${err.message}. Retries left: ${job.opts.attempts - job.attemptsMade}`);
// //     } else {
// //         logger.error(`Worker: A job failed with error: ${err.message} (job details not available)`);
// //     }
// // });

// // worker.on('error', err => {
// //   logger.error('Worker encountered an error:', err);
// // });

// // logger.info('📬 Notification worker initialized and listening for jobs...');

// // // To ensure the worker runs, you need to import this file somewhere in your application's startup,
// // // or run it as a separate process. For simplicity in a single app:
// // // In src/server.ts or src/index.ts: import '@/modules/notifications/notification.worker';
// // // This will instantiate the worker when the app starts.

// // export default worker; // Export if you need to manage it elsewhere