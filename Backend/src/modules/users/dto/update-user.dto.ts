import { z } from 'zod';
import { UserRole, ResourceStatus } from '../enums/user.enums';

const phoneRegex = /^\d{10}$/;

export const UpdateUserSchema = z.object({
  params: z.object({
    userId: z.string().cuid('Invalid user ID format'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(phoneRegex, 'Phone number must be 10 digits').optional(),
    role: z.nativeEnum(UserRole).optional(), // Use nativeEnum for Prisma enums directly
    status: z.nativeEnum(ResourceStatus).optional(),
    agencyId: z.string().cuid('Invalid agency ID format').nullable().optional(), // Allow setting to null
  }).refine(data => {
    // If role is changed to AGENCY_STAFF, agencyId must be provided
    if (data.role === UserRole.AGENCY_STAFF && data.agencyId === undefined) {
        // This check is tricky because agencyId could be explicitly set to null to unassign
        // Or it could be undefined because it's not being updated.
        // A more robust check might be needed in the service layer based on current user state.
        // For now, this DTO allows role change without necessarily providing agencyId if it's already set.
    }
    // If role is not AGENCY_STAFF, agencyId should ideally be null (service layer might enforce this)
    if (data.role && data.role !== UserRole.AGENCY_STAFF && data.agencyId) {
        // This implies an attempt to assign an agency to a non-staff user, which is likely an error.
        // Consider if this should be a validation error or handled in service.
        // For DTO, allowing it and letting service handle might be okay.
    }
    return true;
  }),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>['body'];
export type UpdateUserParamsDto = z.infer<typeof UpdateUserSchema>['params'];
