// src/modules/notifications/notification.service.ts
import { notificationQueue } from './notification.queues';
import { NotificationJobName, SmsJobPayload } from './interfaces/notification.interfaces';
import { logger } from '@/config/logger.config';

export class NotificationService {
  async enqueueSmsNotification(payload: SmsJobPayload): Promise<string | undefined> {
    try {
      const job = await notificationQueue.add(NotificationJobName.SEND_SMS, payload);
      logger.info(`SMS notification enqueued with ID ${job.id} for: ${payload.to} - Message: "${payload.text.substring(0,30)}..."`);
      return job.id;
    } catch (error) {
      logger.error('Failed to enqueue SMS notification job:', error);
      throw error; // Re-throw for proper error handling up the chain
    }
  }

  async sendTicketCreationSms(ticketId: string, citizenName: string, citizenPhone: string): Promise<string | undefined> {
    const message = `Hi ${citizenName}, your ticket #${ticketId.substring(0,8)} has been created successfully. We will keep you updated.`;
    return this.enqueueSmsNotification({ to: citizenPhone, text: message });
  }

  async sendTicketUpdateSms(ticketId: string, citizenPhone: string, updateMessage: string): Promise<string | undefined> {
    const message = `Update for ticket #${ticketId.substring(0,8)}: ${updateMessage}`;
    return this.enqueueSmsNotification({ to: citizenPhone, text: message });
  }
}
























// import { notificationQueue } from './notification.queues';
// import { NotificationJobName, SmsJobPayload } from './interfaces/notification.interfaces';
// import { logger } from '@/config/logger.config';

// export class NotificationService {
//   async enqueueSmsNotification(payload: SmsJobPayload): Promise<void> {
//     try {
//       await notificationQueue.add(NotificationJobName.SEND_SMS, payload, {
//         // attempts: 3, // Can override defaultJobOptions here
//         // backoff: { type: 'exponential', delay: 5000 },
//       });
//       logger.info(`SMS notification enqueued for: ${payload.to} - Message: "${payload.text.substring(0,30)}..."`);
//     } catch (error) {
//       logger.error('Failed to enqueue SMS notification job:', error);
//       // Depending on your error strategy, you might re-throw or handle silently
//     }
//   }

//   // Example: Method to send ticket creation SMS
//   async sendTicketCreationSms(ticketId: string, citizenName: string, citizenPhone: string) {
//     const message = `Hi ${citizenName}, your ticket #${ticketId.substring(0,8)} has been created successfully. We will keep you updated.`;
//     await this.enqueueSmsNotification({ to: citizenPhone, text: message });
//   }

//   // Example: Method to send ticket update SMS
//   async sendTicketUpdateSms(ticketId: string, citizenPhone: string, updateMessage: string) {
//     const message = `Update for ticket #${ticketId.substring(0,8)}: ${updateMessage}`;
//     await this.enqueueSmsNotification({ to: citizenPhone, text: message });
//   }
// }
