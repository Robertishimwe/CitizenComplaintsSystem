"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRoutingRuleSchema = void 0;
// src/modules/routingRules/dto/update-routing-rule.dto.ts
const zod_1 = require("zod");
const user_enums_1 = require("@/modules/users/enums/user.enums");
exports.UpdateRoutingRuleSchema = zod_1.z.object({
    params: zod_1.z.object({
        ruleId: zod_1.z.string().cuid('Invalid routing rule ID format'),
    }),
    body: zod_1.z.object({
        // categoryId is typically not updatable. If changing category, a new rule is made.
        assignedAgencyId: zod_1.z.string().cuid('Invalid agency ID format').optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(user_enums_1.ResourceStatus).optional(),
    }),
});
