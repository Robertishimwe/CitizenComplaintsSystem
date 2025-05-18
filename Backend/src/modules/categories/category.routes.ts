// src/modules/categories/category.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { CategoryController } from './category.controller';
import { validateBody, validateQuery, validateParams } from '@/middleware/validate.middleware';
import { CreateCategorySchema, UpdateCategorySchema, ListCategoriesQuerySchema } from './dto';
import { authorize } from '@/middleware/role.middleware';
import { UserRole } from '@/modules/users/enums/user.enums';

const router = Router();
const categoryController = new CategoryController();


router.get(
  '/',
  validateQuery(ListCategoriesQuerySchema.shape.query),
  categoryController.listCategories
);
// All category routes are admin-only
router.use(authorize([UserRole.ADMIN]));

// GET /categories/tree - Get categories as a nested tree
router.get('/tree', categoryController.getCategoryTree);

// POST /categories - Create a new category
router.post(
  '/',
  validateBody(CreateCategorySchema.shape.body),
  categoryController.createCategory
);

// GET /categories - List all categories (paginated)
// router.get(
//   '/',
//   validateQuery(ListCategoriesQuerySchema.shape.query),
//   categoryController.listCategories
// );

// GET /categories/:categoryId - Get a specific category
router.get(
  '/:categoryId',
  validateParams(UpdateCategorySchema.shape.params),
  categoryController.getCategoryById
);

// PATCH /categories/:categoryId - Update a category
router.patch(
  '/:categoryId',
  (req: Request, res: Response, next: NextFunction) => {
    const result = UpdateCategorySchema.safeParse({ params: req.params, body: req.body });
    if (!result.success) {
      return next(result.error);
    }
    req.validatedParams = result.data.params;
    req.validatedBody = result.data.body;
    next();
  },
  categoryController.updateCategory
);

// DELETE /categories/:categoryId - Delete a category
router.delete(
  '/:categoryId',
  validateParams(UpdateCategorySchema.shape.params),
  categoryController.deleteCategory
);

export default router;
