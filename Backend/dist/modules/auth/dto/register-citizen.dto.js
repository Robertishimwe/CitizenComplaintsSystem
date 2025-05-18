"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterCitizenSchema = void 0;
// src/modules/auth/dto/register-citizen.dto.ts
const zod_1 = require("zod");
const phoneRegex = /^\d{10}$/; // Basic 10-digit phone validation
exports.RegisterCitizenSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters long').trim(),
        email: zod_1.z.string().email('Invalid email address').toLowerCase().trim(),
        phone: zod_1.z.string().regex(phoneRegex, 'Phone number must be 10 digits').trim(),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
        // confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'), // Optional: for frontend
    })
    // Optional: .refine(data => data.password === data.confirmPassword, {
    //   message: "Passwords don't match",
    //   path: ['confirmPassword'], // path of error
    // }),
});
