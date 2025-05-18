"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListRoutingRulesQuerySchema = void 0;
// src/modules/routingRules/dto/list-routing-rules-query.dto.ts
const zod_1 = require("zod");
const user_enums_1 = require("@/modules/users/enums/user.enums");
const numericStringWithDefaultAndTransform = (defaultValueAsString) => {
    return zod_1.z.string()
        .optional()
        .default(defaultValueAsString)
        .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' })
        .transform(val => parseInt(val, 10));
};
exports.ListRoutingRulesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: numericStringWithDefaultAndTransform("1")
            .refine(val => val > 0, { message: 'Page must be positive' }),
        limit: numericStringWithDefaultAndTransform("10")
            .refine(val => val > 0, { message: 'Limit must be positive' }),
        status: zod_1.z.nativeEnum(user_enums_1.ResourceStatus).optional(),
        agencyId: zod_1.z.string().cuid('Invalid agency ID format').optional(),
        categoryId: zod_1.z.string().cuid('Invalid category ID format').optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
