import { z } from 'zod';

const numericStringWithDefaultAndTransform = (defaultValueAsString: string) => {
  return z.string()
    .optional()
    .default(defaultValueAsString)
    .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' })
    .transform(val => parseInt(val, 10));
};

export const ListCategoriesQuerySchema = z.object({
  query: z.object({
    page: numericStringWithDefaultAndTransform("1")
            .refine(val => val > 0, { message: 'Page must be positive' }),
    limit: numericStringWithDefaultAndTransform("10")
            .refine(val => val > 0, { message: 'Limit must be positive' }),
    search: z.string().min(1).optional(),
    sortBy: z.string().optional().default('name'), // Default sort by name
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    isRoot: z.enum(['true', 'false']).transform(val => val === 'true').optional(), // For boolean query params
    // treeView: z.enum(['true', 'false']).transform(val => val === 'true').optional(), // If you want a flat list vs a nested tree structure in response
  }),
});

export type ListCategoriesQueryDto = z.infer<typeof ListCategoriesQuerySchema>['query'];
