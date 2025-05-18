"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategorySchema = void 0;
const zod_1 = require("zod");
exports.CreateCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Category name must be at least 2 characters long').trim(),
        description: zod_1.z.string().optional().default(''),
        parentCategoryId: zod_1.z.string().cuid('Invalid parent category ID format').nullable().optional(), // Allow null or undefined
    }),
});
