"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/auth/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("@/middleware/validate.middleware");
const dto_1 = require("./dto");
const auth_middleware_1 = require("@/middleware/auth.middleware"); // To protect /me route
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// POST /auth/register/citizen - Citizen self-registration
router.post('/register/citizen', (0, validate_middleware_1.validateBody)(dto_1.RegisterCitizenSchema.shape.body), authController.registerCitizen);
// POST /auth/login - User login (any role)
router.post('/login', (0, validate_middleware_1.validateBody)(dto_1.LoginSchema.shape.body), authController.login);
// GET /auth/me - Get current authenticated user's profile
// This route requires authentication
router.get('/me', auth_middleware_1.requireAuth, // Ensures req.user is populated and user is authenticated
authController.getMe);
exports.default = router;
