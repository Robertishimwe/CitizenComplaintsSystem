"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoutingRuleSchema = void 0;
// src/modules/routingRules/dto/create-routing-rule.dto.ts
const zod_1 = require("zod");
const user_enums_1 = require("@/modules/users/enums/user.enums"); // Or a shared enum location
exports.CreateRoutingRuleSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string().cuid('Invalid category ID format'),
        assignedAgencyId: zod_1.z.string().cuid('Invalid agency ID format'),
        description: zod_1.z.string().optional().default(''),
        status: zod_1.z.nativeEnum(user_enums_1.ResourceStatus).optional().default(user_enums_1.ResourceStatus.ACTIVE),
    }),
});
