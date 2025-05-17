import { Router, Request, Response, NextFunction  } from 'express';
import { UserController } from './user.controller';
import { validateBody, validateQuery, validateParams } from '@/middleware/validate.middleware';
import { CreateStaffUserSchema, UpdateUserSchema, ListUsersQuerySchema } from './dto';
import { authorize } from '@/middleware/role.middleware'; // Your role middleware
import { UserRole } from './enums/user.enums';

const router = Router();
const userController = new UserController();

// All user management routes should be protected and admin-only
// GET /users - List all users (Admin)
router.get(
  '/',
  authorize([UserRole.ADMIN]),
  validateQuery(ListUsersQuerySchema.shape.query), // Validate query part of the schema
  userController.listUsers
);

// POST /users - Create a new staff user (Admin)
router.post(
  '/',
  authorize([UserRole.ADMIN]),
  validateBody(CreateStaffUserSchema.shape.body), // Validate body part of the schema
  userController.createStaffUser
);

// GET /users/:userId - Get a specific user (Admin)
router.get(
  '/:userId',
  authorize([UserRole.ADMIN]),
  validateParams(UpdateUserSchema.shape.params), // userId validation from UpdateUserSchema
  userController.getUserById
);

// PATCH /users/:userId - Update a user (Admin)
router.patch(
  '/:userId',
  authorize([UserRole.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => { // Custom validation to use combined schema
    const result = UpdateUserSchema.safeParse({ params: req.params, body: req.body });
    if (!result.success) {
      // Pass ZodError to global error handler
      return next(result.error);
    }
    req.params = result.data.params;
    req.body = result.data.body;
    next();
  },
  userController.updateUser
);

// DELETE /users/:userId - Delete (deactivate) a user (Admin)
router.delete(
  '/:userId',
  authorize([UserRole.ADMIN]),
  validateParams(UpdateUserSchema.shape.params), // userId validation
  userController.deleteUser
);

export default router;
