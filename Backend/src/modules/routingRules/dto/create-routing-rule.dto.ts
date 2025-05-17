// src/modules/routingRules/dto/create-routing-rule.dto.ts
import { z } from 'zod';
import { ResourceStatus } from '@/modules/users/enums/user.enums'; // Or a shared enum location

export const CreateRoutingRuleSchema = z.object({
  body: z.object({
    categoryId: z.string().cuid('Invalid category ID format'),
    assignedAgencyId: z.string().cuid('Invalid agency ID format'),
    description: z.string().optional().default(''),
    status: z.nativeEnum(ResourceStatus).optional().default(ResourceStatus.ACTIVE),
  }),
});

export type CreateRoutingRuleDto = z.infer<typeof CreateRoutingRuleSchema>['body'];
