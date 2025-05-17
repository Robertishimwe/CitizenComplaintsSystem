import { z } from 'zod';
import { UserRole, ResourceStatus } from '../enums/user.enums';

const numericString = (defaultValue: number | undefined = undefined) =>
  z.string()
    .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string' })
    .transform(val => parseInt(val, 10))
    .optional()
    .default(defaultValue !== undefined ? `${defaultValue}` : undefined);


export const ListUsersQuerySchema = z.object({
  query: z.object({
    page: numericString(1).refine(val => val === undefined || val > 0, { message: 'Page must be positive' }),
    limit: numericString(10).refine(val => val === undefined || val > 0, { message: 'Limit must be positive' }),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(ResourceStatus).optional(),
    agencyId: z.string().cuid('Invalid agency ID format').optional(),
    search: z.string().min(1).optional(), // Search by name or email
    sortBy: z.string().optional().default('createdAt'), // Field to sort by
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'), // Sort order
  }),
});

export type ListUsersQueryDto = z.infer<typeof ListUsersQuerySchema>['query'];
