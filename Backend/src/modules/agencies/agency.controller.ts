import { Request, Response } from 'express';
import { AgencyService } from './agency.service';
import { CreateAgencyDto, UpdateAgencyDto, ListAgenciesQueryDto, UpdateAgencyParamsDto } from './dto';
import catchAsync from '@/utils/catchAsync';
import { ApiError } from '@/utils/ApiError';

export class AgencyController {
  private agencyService: AgencyService;

  constructor() {
    this.agencyService = new AgencyService();
  }

  createAgency = catchAsync(async (req: Request, res: Response) => {
    const dto: CreateAgencyDto = req.body;
    const newAgency = await this.agencyService.createAgency(dto);
    res.status(201).json({
      status: 'success',
      message: 'Agency created successfully.',
      data: newAgency,
    });
  });

  getAgencyById = catchAsync(async (req: Request, res: Response) => {
    const { agencyId } = req.params as { agencyId: string };
    const agency = await this.agencyService.getAgencyById(agencyId);
    if (!agency) {
      throw new ApiError(404, 'Agency not found');
    }
    res.status(200).json({
      status: 'success',
      data: agency,
    });
  });

  listAgencies = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListAgenciesQueryDto;
    const result = await this.agencyService.listAgencies(query);
    res.status(200).json({
      status: 'success',
      data: result.agencies,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  });

  updateAgency = catchAsync(async (req: Request, res: Response) => {
    const { agencyId } = req.params as UpdateAgencyParamsDto;
    const dto: UpdateAgencyDto = req.body;
    const updatedAgency = await this.agencyService.updateAgency(agencyId, dto);
     if (!updatedAgency) {
      // This case might not be hit if service throws 404, but as a fallback
      throw new ApiError(404, 'Agency not found or no changes applied.');
    }
    res.status(200).json({
      status: 'success',
      message: 'Agency updated successfully.',
      data: updatedAgency,
    });
  });

  deleteAgency = catchAsync(async (req: Request, res: Response) => {
    const { agencyId } = req.params as { agencyId: string };
    const deactivatedAgency = await this.agencyService.deleteAgency(agencyId);
     if (!deactivatedAgency) {
      // This case might not be hit if service throws 404
      throw new ApiError(404, 'Agency not found.');
    }
    res.status(200).json({
      status: 'success',
      message: 'Agency deactivated successfully.', // Message reflects soft delete
      data: deactivatedAgency,
    });
  });
}
