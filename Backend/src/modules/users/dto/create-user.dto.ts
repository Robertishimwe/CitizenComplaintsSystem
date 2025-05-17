import { z } from 'zod';
import { UserRole } from '../enums/user.enums'; // Use local enum

// Basic phone validation (10 digits). More complex validation can be added.
const phoneRegex = /^\d{10}$/;

export const CreateStaffUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(phoneRegex, 'Phone number must be 10 digits'),
    role: z.enum([UserRole.ADMIN, UserRole.AGENCY_STAFF], {
      errorMap: () => ({ message: 'Role must be ADMIN or AGENCY_STAFF' })
    }),
    password: z.string().min(8, 'Password must be at least 8 characters long').optional(), // Admin can set it, or service can generate
    agencyId: z.string().cuid('Invalid agency ID format').optional(),
  }).refine(data => {
    if (data.role === UserRole.AGENCY_STAFF && !data.agencyId) {
      return false; // Invalid if agency staff but no agencyId
    }
    return true;
  }, {
    message: 'Agency ID is required for AGENCY_STAFF role',
    path: ['agencyId'], // Path of the error
  }),
});

export type CreateStaffUserDto = z.infer<typeof CreateStaffUserSchema>['body'];
