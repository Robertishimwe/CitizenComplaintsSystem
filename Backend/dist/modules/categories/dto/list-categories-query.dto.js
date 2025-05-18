"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCategoriesQuerySchema = void 0;
const zod_1 = require("zod");
const numericStringWithDefaultAndTransform = (defaultValueAsString) => {
    return zod_1.z.string()
        .optional()
        .default(defaultValueAsString)
        .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' })
        .transform(val => parseInt(val, 10));
};
exports.ListCategoriesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: numericStringWithDefaultAndTransform("1")
            .refine(val => val > 0, { message: 'Page must be positive' }),
        limit: numericStringWithDefaultAndTransform("10")
            .refine(val => val > 0, { message: 'Limit must be positive' }),
        search: zod_1.z.string().min(1).optional(),
        sortBy: zod_1.z.string().optional().default('name'), // Default sort by name
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('asc'),
        isRoot: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').optional(), // For boolean query params
        // treeView: z.enum(['true', 'false']).transform(val => val === 'true').optional(), // If you want a flat list vs a nested tree structure in response
    }),
});
