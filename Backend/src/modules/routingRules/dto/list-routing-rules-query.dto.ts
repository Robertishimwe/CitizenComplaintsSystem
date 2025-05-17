// src/modules/routingRules/dto/list-routing-rules-query.dto.ts
import { z } from 'zod';
import { ResourceStatus } from '@/modules/users/enums/user.enums';

const numericStringWithDefaultAndTransform = (defaultValueAsString: string) => {
  return z.string()
    .optional()
    .default(defaultValueAsString)
    .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' })
    .transform(val => parseInt(val, 10));
};

export const ListRoutingRulesQuerySchema = z.object({
  query: z.object({
    page: numericStringWithDefaultAndTransform("1")
            .refine(val => val > 0, { message: 'Page must be positive' }),
    limit: numericStringWithDefaultAndTransform("10")
            .refine(val => val > 0, { message: 'Limit must be positive' }),
    status: z.nativeEnum(ResourceStatus).optional(),
    agencyId: z.string().cuid('Invalid agency ID format').optional(),
    categoryId: z.string().cuid('Invalid category ID format').optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type ListRoutingRulesQueryDto = z.infer<typeof ListRoutingRulesQuerySchema>['query'];
