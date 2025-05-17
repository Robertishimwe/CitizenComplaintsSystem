// src/modules/routingRules/dto/update-routing-rule.dto.ts
import { z } from 'zod';
import { ResourceStatus } from '@/modules/users/enums/user.enums';

export const UpdateRoutingRuleSchema = z.object({
  params: z.object({
    ruleId: z.string().cuid('Invalid routing rule ID format'),
  }),
  body: z.object({
    // categoryId is typically not updatable. If changing category, a new rule is made.
    assignedAgencyId: z.string().cuid('Invalid agency ID format').optional(),
    description: z.string().optional(),
    status: z.nativeEnum(ResourceStatus).optional(),
  }),
});

export type UpdateRoutingRuleDto = z.infer<typeof UpdateRoutingRuleSchema>['body'];
export type UpdateRoutingRuleParamsDto = z.infer<typeof UpdateRoutingRuleSchema>['params'];
