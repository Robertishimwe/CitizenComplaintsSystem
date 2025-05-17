import { z } from 'zod';
import { TicketStatus, TicketPriority } from '../enums/ticket.enums';

export const UpdateTicketByAgentSchema = z.object({
  params: z.object({
    ticketId: z.string().cuid('Invalid ticket ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(TicketStatus).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    // More fields can be added as needed for agent updates
    // e.g., internal notes, resolution details
  }),
});

export type UpdateTicketByAgentDto = z.infer<typeof UpdateTicketByAgentSchema>['body'];
export type UpdateTicketParamsDto = z.infer<typeof UpdateTicketByAgentSchema>['params'];
