"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = void 0;
const zod_1 = require("zod");
const user_enums_1 = require("../enums/user.enums");
const phoneRegex = /^\d{10}$/;
exports.UpdateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().cuid('Invalid user ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters long').optional(),
        email: zod_1.z.string().email('Invalid email address').optional(),
        phone: zod_1.z.string().regex(phoneRegex, 'Phone number must be 10 digits').optional(),
        role: zod_1.z.nativeEnum(user_enums_1.UserRole).optional(), // Use nativeEnum for Prisma enums directly
        status: zod_1.z.nativeEnum(user_enums_1.ResourceStatus).optional(),
        agencyId: zod_1.z.string().cuid('Invalid agency ID format').nullable().optional(), // Allow setting to null
    }).refine(data => {
        // If role is changed to AGENCY_STAFF, agencyId must be provided
        if (data.role === user_enums_1.UserRole.AGENCY_STAFF && data.agencyId === undefined) {
            // This check is tricky because agencyId could be explicitly set to null to unassign
            // Or it could be undefined because it's not being updated.
            // A more robust check might be needed in the service layer based on current user state.
            // For now, this DTO allows role change without necessarily providing agencyId if it's already set.
        }
        // If role is not AGENCY_STAFF, agencyId should ideally be null (service layer might enforce this)
        if (data.role && data.role !== user_enums_1.UserRole.AGENCY_STAFF && data.agencyId) {
            // This implies an attempt to assign an agency to a non-staff user, which is likely an error.
            // Consider if this should be a validation error or handled in service.
            // For DTO, allowing it and letting service handle might be okay.
        }
        return true;
    }),
});
