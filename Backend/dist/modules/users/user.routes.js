"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const validate_middleware_1 = require("@/middleware/validate.middleware");
const dto_1 = require("./dto");
const role_middleware_1 = require("@/middleware/role.middleware"); // Your role middleware
const user_enums_1 = require("./enums/user.enums");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// All user management routes should be protected and admin-only
// GET /users - List all users (Admin)
router.get('/', (0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN, user_enums_1.UserRole.AGENCY_STAFF]), (0, validate_middleware_1.validateQuery)(dto_1.ListUsersQuerySchema.shape.query), // Validate query part of the schema
userController.listUsers);
// POST /users - Create a new staff user (Admin)
router.post('/', (0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN]), (0, validate_middleware_1.validateBody)(dto_1.CreateStaffUserSchema.shape.body), // Validate body part of the schema
userController.createStaffUser);
// GET /users/:userId - Get a specific user (Admin)
router.get('/:userId', (0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN]), (0, validate_middleware_1.validateParams)(dto_1.UpdateUserSchema.shape.params), // userId validation from UpdateUserSchema
userController.getUserById);
// PATCH /users/:userId - Update a user (Admin)
router.patch('/:userId', (0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN]), (req, res, next) => {
    const result = dto_1.UpdateUserSchema.safeParse({ params: req.params, body: req.body });
    if (!result.success) {
        // Pass ZodError to global error handler
        return next(result.error);
    }
    req.params = result.data.params;
    req.body = result.data.body;
    next();
}, userController.updateUser);
// DELETE /users/:userId - Delete (deactivate) a user (Admin)
router.delete('/:userId', (0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN]), (0, validate_middleware_1.validateParams)(dto_1.UpdateUserSchema.shape.params), // userId validation
userController.deleteUser);
exports.default = router;
