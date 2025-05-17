import { z } from 'zod';

export const TransferTicketSchema = z.object({
  params: z.object({
    ticketId: z.string().cuid('Invalid ticket ID format'),
  }),
  body: z.object({
    newAgencyId: z.string().cuid('New agency ID must be a valid CUID.'),
    transferComment: z.string().optional(), // Optional comment from the agent initiating transfer
  }),
});

export type TransferTicketDto = z.infer<typeof TransferTicketSchema>['body'];
