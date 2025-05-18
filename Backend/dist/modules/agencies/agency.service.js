"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgencyService = void 0;
const agency_repository_1 = require("./agency.repository");
const ApiError_1 = require("@/utils/ApiError");
const client_1 = require("@prisma/client");
class AgencyService {
    constructor() {
        this.agencyRepository = new agency_repository_1.AgencyRepository();
    }
    async createAgency(dto) {
        const existingAgency = await this.agencyRepository.findByName(dto.name);
        if (existingAgency) {
            throw new ApiError_1.ApiError(409, `Agency with name "${dto.name}" already exists.`);
        }
        const payload = {
            name: dto.name,
            description: dto.description,
            contactEmail: dto.contactEmail,
            contactPhone: dto.contactPhone,
            status: dto.status || client_1.ResourceStatus.ACTIVE,
        };
        return this.agencyRepository.create(payload);
    }
    async getAgencyById(id) {
        const agency = await this.agencyRepository.findById(id);
        if (!agency) {
            // Optionally throw ApiError(404, 'Agency not found') if preferred over returning null
        }
        return agency;
    }
    async listAgencies(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filters = {
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
    async updateAgency(id, dto) {
        const agencyToUpdate = await this.agencyRepository.findById(id);
        if (!agencyToUpdate) {
            throw new ApiError_1.ApiError(404, 'Agency not found.');
        }
        if (dto.name && dto.name !== agencyToUpdate.name) {
            const existingNameAgency = await this.agencyRepository.findByName(dto.name);
            if (existingNameAgency && existingNameAgency.id !== id) {
                throw new ApiError_1.ApiError(409, `Another agency with name "${dto.name}" already exists.`);
            }
        }
        const payload = { ...dto };
        return this.agencyRepository.update(id, payload);
    }
    async deleteAgency(id) {
        // Service layer confirms existence before attempting delete (or deactivation)
        const agency = await this.agencyRepository.findById(id);
        if (!agency) {
            throw new ApiError_1.ApiError(404, 'Agency not found.');
        }
        // The repository now handles deactivation
        return this.agencyRepository.delete(id);
    }
}
exports.AgencyService = AgencyService;
