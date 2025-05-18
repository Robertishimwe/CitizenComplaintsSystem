"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routing_rule_controller_1 = require("./routing-rule.controller");
const validate_middleware_1 = require("@/middleware/validate.middleware");
const dto_1 = require("./dto");
const role_middleware_1 = require("@/middleware/role.middleware");
const user_enums_1 = require("@/modules/users/enums/user.enums");
const router = (0, express_1.Router)();
const ruleController = new routing_rule_controller_1.RoutingRuleController();
// All routing rule routes are admin-only
router.use((0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN]));
// POST /routing-rules - Create a new rule
router.post('/', (0, validate_middleware_1.validateBody)(dto_1.CreateRoutingRuleSchema.shape.body), ruleController.createRule);
// GET /routing-rules - List all rules
router.get('/', (0, validate_middleware_1.validateQuery)(dto_1.ListRoutingRulesQuerySchema.shape.query), ruleController.listRules);
// GET /routing-rules/:ruleId - Get a specific rule
router.get('/:ruleId', (0, validate_middleware_1.validateParams)(dto_1.UpdateRoutingRuleSchema.shape.params), ruleController.getRuleById);
// PATCH /routing-rules/:ruleId - Update a rule
router.patch('/:ruleId', (req, res, next) => {
    const result = dto_1.UpdateRoutingRuleSchema.safeParse({ params: req.params, body: req.body });
    if (!result.success) {
        return next(result.error);
    }
    req.validatedParams = result.data.params;
    req.validatedBody = result.data.body;
    next();
}, ruleController.updateRule);
// DELETE /routing-rules/:ruleId - Delete a rule
router.delete('/:ruleId', (0, validate_middleware_1.validateParams)(dto_1.UpdateRoutingRuleSchema.shape.params), ruleController.deleteRule);
exports.default = router;
