import { z } from 'zod';

export const UpdateCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().cuid('Invalid category ID format'),
  }),
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters long').trim().optional(),
    description: z.string().optional(),
    parentCategoryId: z.string().cuid('Invalid parent category ID format').nullable().optional(), // Allow setting parent to null or a new ID
  }),
});

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>['body'];
export type UpdateCategoryParamsDto = z.infer<typeof UpdateCategorySchema>['params'];
