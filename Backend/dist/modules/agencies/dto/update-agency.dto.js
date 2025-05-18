"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAgencySchema = void 0;
// src/modules/agencies/dto/update-agency.dto.ts
const zod_1 = require("zod");
const user_enums_1 = require("@/modules/users/enums/user.enums"); // Or a shared enum location
const phoneRegexOptional = /^\+?\d{10,15}$/;
exports.UpdateAgencySchema = zod_1.z.object({
    params: zod_1.z.object({
        agencyId: zod_1.z.string().cuid('Invalid agency ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Agency name must be at least 3 characters long').trim().optional(),
        description: zod_1.z.string().optional(),
        contactEmail: zod_1.z.string().email('Invalid contact email address').toLowerCase().trim().optional(),
        contactPhone: zod_1.z.string().regex(phoneRegexOptional, 'Invalid phone number format').nullable().optional(), // Allows null
        status: zod_1.z.nativeEnum(user_enums_1.ResourceStatus).optional(),
    }),
});
