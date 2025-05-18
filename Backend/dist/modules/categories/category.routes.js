"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/categories/category.routes.ts
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const validate_middleware_1 = require("@/middleware/validate.middleware");
const dto_1 = require("./dto");
const role_middleware_1 = require("@/middleware/role.middleware");
const user_enums_1 = require("@/modules/users/enums/user.enums");
const router = (0, express_1.Router)();
const categoryController = new category_controller_1.CategoryController();
router.get('/', (0, validate_middleware_1.validateQuery)(dto_1.ListCategoriesQuerySchema.shape.query), categoryController.listCategories);
// All category routes are admin-only
router.use((0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN]));
// GET /categories/tree - Get categories as a nested tree
router.get('/tree', categoryController.getCategoryTree);
// POST /categories - Create a new category
router.post('/', (0, validate_middleware_1.validateBody)(dto_1.CreateCategorySchema.shape.body), categoryController.createCategory);
// GET /categories - List all categories (paginated)
// router.get(
//   '/',
//   validateQuery(ListCategoriesQuerySchema.shape.query),
//   categoryController.listCategories
// );
// GET /categories/:categoryId - Get a specific category
router.get('/:categoryId', (0, validate_middleware_1.validateParams)(dto_1.UpdateCategorySchema.shape.params), categoryController.getCategoryById);
// PATCH /categories/:categoryId - Update a category
router.patch('/:categoryId', (req, res, next) => {
    const result = dto_1.UpdateCategorySchema.safeParse({ params: req.params, body: req.body });
    if (!result.success) {
        return next(result.error);
    }
    req.validatedParams = result.data.params;
    req.validatedBody = result.data.body;
    next();
}, categoryController.updateCategory);
// DELETE /categories/:categoryId - Delete a category
router.delete('/:categoryId', (0, validate_middleware_1.validateParams)(dto_1.UpdateCategorySchema.shape.params), categoryController.deleteCategory);
exports.default = router;
