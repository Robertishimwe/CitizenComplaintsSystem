"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingRuleController = void 0;
const routing_rule_service_1 = require("./routing-rule.service");
const catchAsync_1 = __importDefault(require("@/utils/catchAsync"));
const ApiError_1 = require("@/utils/ApiError");
class RoutingRuleController {
    constructor() {
        this.createRule = (0, catchAsync_1.default)(async (req, res) => {
            const dto = req.validatedBody;
            const newRule = await this.ruleService.createRule(dto);
            res.status(201).json({
                status: 'success',
                message: 'Routing rule created successfully.',
                data: newRule,
            });
        });
        this.getRuleById = (0, catchAsync_1.default)(async (req, res) => {
            const { ruleId } = req.validatedParams; // ruleId from params
            const rule = await this.ruleService.getRuleById(ruleId);
            if (!rule) {
                throw new ApiError_1.ApiError(404, 'Routing rule not found');
            }
            res.status(200).json({
                status: 'success',
                data: rule,
            });
        });
        this.listRules = (0, catchAsync_1.default)(async (req, res) => {
            const query = req.validatedQuery;
            const result = await this.ruleService.listRules(query);
            res.status(200).json({
                status: 'success',
                data: result.routingRules,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        });
        this.updateRule = (0, catchAsync_1.default)(async (req, res) => {
            const { ruleId } = req.validatedParams;
            const dto = req.validatedBody;
            const updatedRule = await this.ruleService.updateRule(ruleId, dto);
            if (!updatedRule) {
                throw new ApiError_1.ApiError(404, 'Routing rule not found or no changes applied.');
            }
            res.status(200).json({
                status: 'success',
                message: 'Routing rule updated successfully.',
                data: updatedRule,
            });
        });
        this.deleteRule = (0, catchAsync_1.default)(async (req, res) => {
            const { ruleId } = req.validatedParams;
            const result = await this.ruleService.deleteRule(ruleId);
            res.status(200).json({
                status: 'success',
                message: result?.message || 'Routing rule deleted.',
                // data: { id: ruleId }
            });
        });
        this.ruleService = new routing_rule_service_1.RoutingRuleService();
    }
}
exports.RoutingRuleController = RoutingRuleController;
