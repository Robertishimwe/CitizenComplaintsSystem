"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgencyController = void 0;
const agency_service_1 = require("./agency.service");
const catchAsync_1 = __importDefault(require("@/utils/catchAsync"));
const ApiError_1 = require("@/utils/ApiError");
class AgencyController {
    constructor() {
        this.createAgency = (0, catchAsync_1.default)(async (req, res) => {
            const dto = req.body;
            const newAgency = await this.agencyService.createAgency(dto);
            res.status(201).json({
                status: 'success',
                message: 'Agency created successfully.',
                data: newAgency,
            });
        });
        this.getAgencyById = (0, catchAsync_1.default)(async (req, res) => {
            const { agencyId } = req.params;
            const agency = await this.agencyService.getAgencyById(agencyId);
            if (!agency) {
                throw new ApiError_1.ApiError(404, 'Agency not found');
            }
            res.status(200).json({
                status: 'success',
                data: agency,
            });
        });
        this.listAgencies = (0, catchAsync_1.default)(async (req, res) => {
            const query = req.query;
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
        this.updateAgency = (0, catchAsync_1.default)(async (req, res) => {
            const { agencyId } = req.params;
            const dto = req.body;
            const updatedAgency = await this.agencyService.updateAgency(agencyId, dto);
            if (!updatedAgency) {
                // This case might not be hit if service throws 404, but as a fallback
                throw new ApiError_1.ApiError(404, 'Agency not found or no changes applied.');
            }
            res.status(200).json({
                status: 'success',
                message: 'Agency updated successfully.',
                data: updatedAgency,
            });
        });
        this.deleteAgency = (0, catchAsync_1.default)(async (req, res) => {
            const { agencyId } = req.params;
            const deactivatedAgency = await this.agencyService.deleteAgency(agencyId);
            if (!deactivatedAgency) {
                // This case might not be hit if service throws 404
                throw new ApiError_1.ApiError(404, 'Agency not found.');
            }
            res.status(200).json({
                status: 'success',
                message: 'Agency deactivated successfully.', // Message reflects soft delete
                data: deactivatedAgency,
            });
        });
        this.agencyService = new agency_service_1.AgencyService();
    }
}
exports.AgencyController = AgencyController;
