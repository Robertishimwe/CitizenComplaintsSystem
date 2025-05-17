import { ConnectionOptions } from 'bullmq';
import { env } from './environment';

export const defaultQueueName = 'citizen-engagement-queue';

export const redisConnectionOptions: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined, // Only set password if it exists
  maxRetriesPerRequest: null, // Important for BullMQ as per docs
  // enableReadyCheck: false, // Optional: Sometimes needed in specific environments
};

// You can define specific queue options here if needed
export const defaultJobOptions = {
  attempts: 3, // Number of times to retry a failed job
  backoff: {
    type: 'exponential', // 'fixed' or 'exponential'
    delay: 1000, // Delay in ms for the first retry
  },
  removeOnComplete: {
    count: 1000, // Keep last 1000 completed jobs
    age: 24 * 60 * 60, // Keep completed jobs for 24 hours
  },
  removeOnFail: {
    count: 5000, // Keep last 5000 failed jobs
    // age: 7 * 24 * 60 * 60, // Keep failed jobs for 7 days (optional)
  },
};

// Example: Export a connection object if you create multiple queues
// import IORedis from 'ioredis';
// export const redisClient = new IORedis(redisConnectionOptions);