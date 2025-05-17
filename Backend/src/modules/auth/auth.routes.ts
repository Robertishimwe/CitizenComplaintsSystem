// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '@/middleware/validate.middleware';
import { RegisterCitizenSchema, LoginSchema } from './dto';
import { requireAuth } from '@/middleware/auth.middleware'; // To protect /me route

const router = Router();
const authController = new AuthController();

// POST /auth/register/citizen - Citizen self-registration
router.post(
  '/register/citizen',
  validateBody(RegisterCitizenSchema.shape.body),
  authController.registerCitizen
);

// POST /auth/login - User login (any role)
router.post(
  '/login',
  validateBody(LoginSchema.shape.body),
  authController.login
);

// GET /auth/me - Get current authenticated user's profile
// This route requires authentication
router.get(
    '/me',
    requireAuth, // Ensures req.user is populated and user is authenticated
    authController.getMe
);

export default router;
