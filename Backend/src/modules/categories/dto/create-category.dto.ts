import { z } from 'zod';

export const CreateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters long').trim(),
    description: z.string().optional().default(''),
    parentCategoryId: z.string().cuid('Invalid parent category ID format').nullable().optional(), // Allow null or undefined
  }),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>['body'];
