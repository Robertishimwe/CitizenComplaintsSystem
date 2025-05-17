// src/modules/agencies/dto/update-agency.dto.ts
import { z } from 'zod';
import { ResourceStatus } from '@/modules/users/enums/user.enums'; // Or a shared enum location

const phoneRegexOptional = /^\+?\d{10,15}$/;

export const UpdateAgencySchema = z.object({
  params: z.object({
    agencyId: z.string().cuid('Invalid agency ID format'),
  }),
  body: z.object({
    name: z.string().min(3, 'Agency name must be at least 3 characters long').trim().optional(),
    description: z.string().optional(),
    contactEmail: z.string().email('Invalid contact email address').toLowerCase().trim().optional(),
    contactPhone: z.string().regex(phoneRegexOptional, 'Invalid phone number format').nullable().optional(), // Allows null
    status: z.nativeEnum(ResourceStatus).optional(),
  }),
});

export type UpdateAgencyDto = z.infer<typeof UpdateAgencySchema>['body'];
export type UpdateAgencyParamsDto = z.infer<typeof UpdateAgencySchema>['params'];
