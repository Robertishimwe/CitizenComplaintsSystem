import { AgencyRepository } from './agency.repository';
import { CreateAgencyDto, UpdateAgencyDto, ListAgenciesQueryDto } from './dto';
import { AgencyResponse, PaginatedAgenciesResponse, AgencyFilter, CreateAgencyPayload, UpdateAgencyPayload } from './interfaces/agency.interfaces';
import { ApiError } from '@/utils/ApiError';
import { ResourceStatus } from '@prisma/client';

export class AgencyService {
  private agencyRepository: AgencyRepository;

  constructor() {
    this.agencyRepository = new AgencyRepository();
  }

  async createAgency(dto: CreateAgencyDto): Promise<AgencyResponse> {
    const existingAgency = await this.agencyRepository.findByName(dto.name);
    if (existingAgency) {
      throw new ApiError(409, `Agency with name "${dto.name}" already exists.`);
    }

    const payload: CreateAgencyPayload = {
      name: dto.name,
      description: dto.description,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      status: dto.status || ResourceStatus.ACTIVE,
    };

    return this.agencyRepository.create(payload);
  }

  async getAgencyById(id: string): Promise<AgencyResponse | null> {
    const agency = await this.agencyRepository.findById(id);
    if (!agency) {
      // Optionally throw ApiError(404, 'Agency not found') if preferred over returning null
    }
    return agency;
  }

  async listAgencies(query: ListAgenciesQueryDto): Promise<PaginatedAgenciesResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filters: AgencyFilter = {
      status: query.status,
      search: query.search,
    };
    const sorting = {
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    };

    const { agencies, total } = await this.agencyRepository.findAll(filters, { skip, take: limit }, sorting);

    return {
      agencies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateAgency(id: string, dto: UpdateAgencyDto): Promise<AgencyResponse | null> {
    const agencyToUpdate = await this.agencyRepository.findById(id);
    if (!agencyToUpdate) {
      throw new ApiError(404, 'Agency not found.');
    }

    if (dto.name && dto.name !== agencyToUpdate.name) {
      const existingNameAgency = await this.agencyRepository.findByName(dto.name);
      if (existingNameAgency && existingNameAgency.id !== id) {
        throw new ApiError(409, `Another agency with name "${dto.name}" already exists.`);
      }
    }

    const payload: UpdateAgencyPayload = { ...dto };
    return this.agencyRepository.update(id, payload);
  }

  async deleteAgency(id: string): Promise<AgencyResponse | null> {
    // Service layer confirms existence before attempting delete (or deactivation)
    const agency = await this.agencyRepository.findById(id);
    if (!agency) {
        throw new ApiError(404, 'Agency not found.');
    }
    // The repository now handles deactivation
    return this.agencyRepository.delete(id);
  }
}
