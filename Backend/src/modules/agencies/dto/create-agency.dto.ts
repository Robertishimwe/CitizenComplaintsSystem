import { z } from 'zod';
import { ResourceStatus } from '@/modules/users/enums/user.enums'; // Or a shared enum location

const phoneRegexOptional = /^\+?\d{10,15}$/; // Basic international phone format, optional

export const CreateAgencySchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Agency name must be at least 3 characters long').trim(),
    description: z.string().optional().default(''),
    contactEmail: z.string().email('Invalid contact email address').toLowerCase().trim(),
    contactPhone: z.string().regex(phoneRegexOptional, 'Invalid phone number format').optional(),
    status: z.nativeEnum(ResourceStatus).optional().default(ResourceStatus.ACTIVE),
  }),
});

export type CreateAgencyDto = z.infer<typeof CreateAgencySchema>['body'];
