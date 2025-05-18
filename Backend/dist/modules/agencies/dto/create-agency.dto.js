"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAgencySchema = void 0;
const zod_1 = require("zod");
const user_enums_1 = require("@/modules/users/enums/user.enums"); // Or a shared enum location
const phoneRegexOptional = /^\+?\d{10,15}$/; // Basic international phone format, optional
exports.CreateAgencySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Agency name must be at least 3 characters long').trim(),
        description: zod_1.z.string().optional().default(''),
        contactEmail: zod_1.z.string().email('Invalid contact email address').toLowerCase().trim(),
        contactPhone: zod_1.z.string().regex(phoneRegexOptional, 'Invalid phone number format').optional(),
        status: zod_1.z.nativeEnum(user_enums_1.ResourceStatus).optional().default(user_enums_1.ResourceStatus.ACTIVE),
    }),
});
