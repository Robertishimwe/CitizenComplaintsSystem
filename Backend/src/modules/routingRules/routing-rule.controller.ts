import { Request, Response } from 'express';
import { RoutingRuleService } from './routing-rule.service';
import { CreateRoutingRuleDto, UpdateRoutingRuleDto, ListRoutingRulesQueryDto, UpdateRoutingRuleParamsDto } from './dto';
import catchAsync from '@/utils/catchAsync';
import { ApiError } from '@/utils/ApiError';

export class RoutingRuleController {
  private ruleService: RoutingRuleService;

  constructor() {
    this.ruleService = new RoutingRuleService();
  }

  createRule = catchAsync(async (req: Request, res: Response) => {
    const dto = req.validatedBody as CreateRoutingRuleDto;
    const newRule = await this.ruleService.createRule(dto);
    res.status(201).json({
      status: 'success',
      message: 'Routing rule created successfully.',
      data: newRule,
    });
  });

  getRuleById = catchAsync(async (req: Request, res: Response) => {
    const { ruleId } = req.validatedParams as UpdateRoutingRuleParamsDto; // ruleId from params
    const rule = await this.ruleService.getRuleById(ruleId);
    if (!rule) {
      throw new ApiError(404, 'Routing rule not found');
    }
    res.status(200).json({
      status: 'success',
      data: rule,
    });
  });

  listRules = catchAsync(async (req: Request, res: Response) => {
    const query = req.validatedQuery as ListRoutingRulesQueryDto;
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

  updateRule = catchAsync(async (req: Request, res: Response) => {
    const { ruleId } = req.validatedParams as UpdateRoutingRuleParamsDto;
    const dto = req.validatedBody as UpdateRoutingRuleDto;
    const updatedRule = await this.ruleService.updateRule(ruleId, dto);
     if (!updatedRule) {
      throw new ApiError(404, 'Routing rule not found or no changes applied.');
    }
    res.status(200).json({
      status: 'success',
      message: 'Routing rule updated successfully.',
      data: updatedRule,
    });
  });

  deleteRule = catchAsync(async (req: Request, res: Response) => {
    const { ruleId } = req.validatedParams as UpdateRoutingRuleParamsDto;
    const result = await this.ruleService.deleteRule(ruleId);
    res.status(200).json({
      status: 'success',
      message: result?.message || 'Routing rule deleted.',
      // data: { id: ruleId }
    });
  });
}
