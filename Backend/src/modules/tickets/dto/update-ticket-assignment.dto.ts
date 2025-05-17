import { z } from 'zod';

export const UpdateTicketAssignmentSchema = z.object({
  params: z.object({
    ticketId: z.string().cuid('Invalid ticket ID format'),
  }),
  body: z.object({
    assignedAgentId: z.string().cuid('Invalid agent ID format').nullable().optional(), // Allow unassigning by setting to null
    // assignedAgencyId could also be here if admin can change it directly post-creation
  }),
});

export type UpdateTicketAssignmentDto = z.infer<typeof UpdateTicketAssignmentSchema>['body'];
