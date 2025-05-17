// src/modules/auth/dto/login.dto.ts
import { z } from 'zod';

const phoneRegex = /^\d{10}$/;

export const LoginSchema = z.object({
  body: z.object({
    phone: z.string().regex(phoneRegex, 'Phone number must be 10 digits'),
    password: z.string().min(1, 'Password is required'), // Basic check, actual length validated during creation
  }),
});

export type LoginDto = z.infer<typeof LoginSchema>['body'];