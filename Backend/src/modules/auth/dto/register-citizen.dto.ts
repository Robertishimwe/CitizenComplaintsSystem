// src/modules/auth/dto/register-citizen.dto.ts
import { z } from 'zod';

const phoneRegex = /^\d{10}$/; // Basic 10-digit phone validation

export const RegisterCitizenSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    phone: z.string().regex(phoneRegex, 'Phone number must be 10 digits').trim(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    // confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'), // Optional: for frontend
  })
  // Optional: .refine(data => data.password === data.confirmPassword, {
  //   message: "Passwords don't match",
  //   path: ['confirmPassword'], // path of error
  // }),
});

export type RegisterCitizenDto = z.infer<typeof RegisterCitizenSchema>['body'];