import { z } from 'zod';
import { TicketStatus, TicketPriority } from '../enums/ticket.enums';

const numericStringWithDefaultAndTransform = (defaultValueAsString: string) => {
  return z.string()
    .optional().default(defaultValueAsString)
    .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' })
    .transform(val => parseInt(val, 10));
};

const statusArraySchema = z.preprocess((val) => {
    if (typeof val === 'string') return val.split(',');
    if (Array.isArray(val)) return val;
    return undefined;
}, z.array(z.nativeEnum(TicketStatus)).optional());


export const ListTicketsQuerySchema = z.object({
  query: z.object({
    page: numericStringWithDefaultAndTransform("1").refine(val => val > 0),
    limit: numericStringWithDefaultAndTransform("10").refine(val => val > 0),
    status: statusArraySchema, // E.g. status=NEW,ASSIGNED
    priority: z.nativeEnum(TicketPriority).optional(),
    assignedAgencyId: z.string().cuid().optional(),
    assignedAgentId: z.string().cuid().optional(),
    citizenId: z.string().cuid().optional(), // For admins/agents viewing a specific citizen's tickets
    categoryId: z.string().cuid().optional(),
    isAnonymous: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    search: z.string().min(1).optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type ListTicketsQueryDto = z.infer<typeof ListTicketsQuerySchema>['query'];
