import { Router, Request, Response, NextFunction } from 'express';
import { RoutingRuleController } from './routing-rule.controller';
import { validateBody, validateQuery, validateParams } from '@/middleware/validate.middleware';
import { CreateRoutingRuleSchema, UpdateRoutingRuleSchema, ListRoutingRulesQuerySchema } from './dto';
import { authorize } from '@/middleware/role.middleware';
import { UserRole } from '@/modules/users/enums/user.enums';

const router = Router();
const ruleController = new RoutingRuleController();

// All routing rule routes are admin-only
router.use(authorize([UserRole.ADMIN]));

// POST /routing-rules - Create a new rule
router.post(
  '/',
  validateBody(CreateRoutingRuleSchema.shape.body),
  ruleController.createRule
);

// GET /routing-rules - List all rules
router.get(
  '/',
  validateQuery(ListRoutingRulesQuerySchema.shape.query),
  ruleController.listRules
);

// GET /routing-rules/:ruleId - Get a specific rule
router.get(
  '/:ruleId',
  validateParams(UpdateRoutingRuleSchema.shape.params),
  ruleController.getRuleById
);

// PATCH /routing-rules/:ruleId - Update a rule
router.patch(
  '/:ruleId',
  (req: Request, res: Response, next: NextFunction) => {
    const result = UpdateRoutingRuleSchema.safeParse({ params: req.params, body: req.body });
    if (!result.success) {
      return next(result.error);
    }
    req.validatedParams = result.data.params;
    req.validatedBody = result.data.body;
    next();
  },
  ruleController.updateRule
);

// DELETE /routing-rules/:ruleId - Delete a rule
router.delete(
  '/:ruleId',
  validateParams(UpdateRoutingRuleSchema.shape.params),
  ruleController.deleteRule
);

export default router;
