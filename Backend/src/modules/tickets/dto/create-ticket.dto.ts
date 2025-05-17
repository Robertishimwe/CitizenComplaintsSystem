import { z } from 'zod';
import { TicketPriority } from '../enums/ticket.enums'; // Use local enum

export const CreateTicketSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters long').trim(),
    categoryId: z.string().cuid('Invalid category ID format').nullable().optional(), // Optional for AI suggestion
    location: z.string().min(5, 'Location description is too short').trim(),
    priority: z.nativeEnum(TicketPriority).optional().default(TicketPriority.MEDIUM),
    detailedDescription: z.string().min(10, 'Detailed description must be at least 10 characters long').trim(),
    // For anonymous submissions (if user is not logged in)
    isAnonymous: z.boolean().optional().default(false),
    anonymousCreatorName: z.string().trim().optional(),
    anonymousCreatorContact: z.string().trim().optional(), // Could be email or phone
  }).refine(data => {
    if (data.isAnonymous && (!data.anonymousCreatorName || !data.anonymousCreatorContact)) {
      return false; // Require name and contact if anonymous
    }
    return true;
  }, {
    message: 'Anonymous submissions require a name and contact information.',
    path: ['anonymousCreatorName'], // Or a general path
  }),
});

export type CreateTicketDto = z.infer<typeof CreateTicketSchema>['body'];
