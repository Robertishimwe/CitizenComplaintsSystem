export enum NotificationJobName {
  SEND_SMS = 'send-sms',
  // Add other job types if needed
}

export interface SmsJobPayload {
  to: string; // Recipient phone number
  text: string;
  sender?: string; // Optional, can use default from config
  ticketId?: string; // Optional context
  userId?: string; // Optional context
}

// Interface for all possible job data types in this queue
export type NotificationJobData = SmsJobPayload; // Add other payload types with | if you have more jobs