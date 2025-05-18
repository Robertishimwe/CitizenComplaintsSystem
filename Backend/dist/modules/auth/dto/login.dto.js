"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = void 0;
// src/modules/auth/dto/login.dto.ts
const zod_1 = require("zod");
const phoneRegex = /^\d{10}$/;
exports.LoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().regex(phoneRegex, 'Phone number must be 10 digits'),
        password: zod_1.z.string().min(1, 'Password is required'), // Basic check, actual length validated during creation
    }),
});
