"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategorySchema = void 0;
const zod_1 = require("zod");
exports.UpdateCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        categoryId: zod_1.z.string().cuid('Invalid category ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Category name must be at least 2 characters long').trim().optional(),
        description: zod_1.z.string().optional(),
        parentCategoryId: zod_1.z.string().cuid('Invalid parent category ID format').nullable().optional(), // Allow setting parent to null or a new ID
    }),
});
