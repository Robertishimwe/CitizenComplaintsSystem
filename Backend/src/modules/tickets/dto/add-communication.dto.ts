import { z } from 'zod';

export const AddCommunicationSchema = z.object({
  params: z.object({
    ticketId: z.string().cuid('Invalid ticket ID format'),
  }),
  body: z.object({
    message: z.string().min(1, 'Message cannot be empty').trim(),
    isInternal: z.boolean().optional().default(false), // For agency staff internal notes
  }),
});

export type AddCommunicationDto = z.infer<typeof AddCommunicationSchema>['body'];
