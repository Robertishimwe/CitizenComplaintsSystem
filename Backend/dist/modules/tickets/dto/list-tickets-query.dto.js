"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTicketsQuerySchema = void 0;
const zod_1 = require("zod");
const ticket_enums_1 = require("../enums/ticket.enums");
const numericStringWithDefaultAndTransform = (defaultValueAsString) => {
    return zod_1.z.string()
        .optional().default(defaultValueAsString)
        .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' })
        .transform(val => parseInt(val, 10));
};
const statusArraySchema = zod_1.z.preprocess((val) => {
    if (typeof val === 'string')
        return val.split(',');
    if (Array.isArray(val))
        return val;
    return undefined;
}, zod_1.z.array(zod_1.z.nativeEnum(ticket_enums_1.TicketStatus)).optional());
exports.ListTicketsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: numericStringWithDefaultAndTransform("1").refine(val => val > 0),
        limit: numericStringWithDefaultAndTransform("10").refine(val => val > 0),
        status: statusArraySchema, // E.g. status=NEW,ASSIGNED
        priority: zod_1.z.nativeEnum(ticket_enums_1.TicketPriority).optional(),
        assignedAgencyId: zod_1.z.string().cuid().optional(),
        assignedAgentId: zod_1.z.string().cuid().optional(),
        citizenId: zod_1.z.string().cuid().optional(), // For admins/agents viewing a specific citizen's tickets
        categoryId: zod_1.z.string().cuid().optional(),
        isAnonymous: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').optional(),
        search: zod_1.z.string().min(1).optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
