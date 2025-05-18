"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStaffUserSchema = void 0;
const zod_1 = require("zod");
const user_enums_1 = require("../enums/user.enums"); // Use local enum
// Basic phone validation (10 digits). More complex validation can be added.
const phoneRegex = /^\d{10}$/;
exports.CreateStaffUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters long'),
        email: zod_1.z.string().email('Invalid email address'),
        phone: zod_1.z.string().regex(phoneRegex, 'Phone number must be 10 digits'),
        role: zod_1.z.enum([user_enums_1.UserRole.ADMIN, user_enums_1.UserRole.AGENCY_STAFF], {
            errorMap: () => ({ message: 'Role must be ADMIN or AGENCY_STAFF' })
        }),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters long').optional(), // Admin can set it, or service can generate
        agencyId: zod_1.z.string().cuid('Invalid agency ID format').optional(),
    }).refine(data => {
        if (data.role === user_enums_1.UserRole.AGENCY_STAFF && !data.agencyId) {
            return false; // Invalid if agency staff but no agencyId
        }
        return true;
    }, {
        message: 'Agency ID is required for AGENCY_STAFF role',
        path: ['agencyId'], // Path of the error
    }),
});
