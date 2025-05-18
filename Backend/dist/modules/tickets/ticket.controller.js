"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const ticket_service_1 = require("./ticket.service");
const catchAsync_1 = __importDefault(require("@/utils/catchAsync"));
const ApiError_1 = require("@/utils/ApiError");
class TicketController {
    constructor() {
        this.createTicket = (0, catchAsync_1.default)(async (req, res) => {
            const dto = req.validatedBody;
            const creatingUser = req.user; // User might be undefined if anonymous submission is allowed without login
            const newTicket = await this.ticketService.createTicket(dto, creatingUser);
            res.status(201).json({
                status: 'success',
                message: 'Ticket created successfully.',
                data: newTicket,
            });
        });
        this.getTicketById = (0, catchAsync_1.default)(async (req, res) => {
            const { ticketId } = req.validatedParams; // Assuming UpdateTicketParamsDto has ticketId
            const requestingUser = req.user;
            const ticket = await this.ticketService.getTicketById(ticketId, requestingUser);
            if (!ticket) {
                throw new ApiError_1.ApiError(404, 'Ticket not found or not authorized.');
            }
            res.status(200).json({
                status: 'success',
                data: ticket,
            });
        });
        this.listTickets = (0, catchAsync_1.default)(async (req, res) => {
            const query = req.validatedQuery;
            const requestingUser = req.user;
            const result = await this.ticketService.listTickets(query, requestingUser);
            res.status(200).json({
                status: 'success',
                data: result.tickets,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        });
        this.updateTicketByAgent = (0, catchAsync_1.default)(async (req, res) => {
            const { ticketId } = req.validatedParams;
            const dto = req.validatedBody;
            const agent = req.user; // requireAuth middleware should ensure req.user exists
            const updatedTicket = await this.ticketService.updateTicketByAgent(ticketId, dto, agent);
            res.status(200).json({
                status: 'success',
                message: 'Ticket updated successfully.',
                data: updatedTicket,
            });
        });
        this.updateTicketAssignment = (0, catchAsync_1.default)(async (req, res) => {
            const { ticketId } = req.validatedParams; // Assuming it has ticketId
            const dto = req.validatedBody;
            const adminUser = req.user; // requireAuth & authorize (ADMIN) should ensure this
            const updatedTicket = await this.ticketService.updateTicketAssignment(ticketId, dto, adminUser);
            res.status(200).json({
                status: 'success',
                message: 'Ticket assignment updated.',
                data: updatedTicket,
            });
        });
        this.addCommunication = (0, catchAsync_1.default)(async (req, res) => {
            const { ticketId } = req.validatedParams; // Assuming UpdateTicketParamsDto has ticketId
            const dto = req.validatedBody;
            const sendingUser = req.user; // User could be undefined for anonymous ticket replies if allowed
            const newCommunication = await this.ticketService.addCommunication(ticketId, dto, sendingUser);
            res.status(201).json({
                status: 'success',
                message: 'Communication added successfully.',
                data: newCommunication,
            });
        });
        this.transferTicket = (0, catchAsync_1.default)(async (req, res) => {
            const { ticketId } = req.validatedParams; // Assuming it has ticketId
            const dto = req.validatedBody;
            const transferringAgent = req.user; // requireAuth and authorize (AGENCY_STAFF or ADMIN)
            const transferredTicket = await this.ticketService.transferTicket(ticketId, dto, transferringAgent);
            res.status(200).json({
                status: 'success',
                message: 'Ticket transferred successfully.',
                data: transferredTicket,
            });
        });
        this.ticketService = new ticket_service_1.TicketService();
    }
}
exports.TicketController = TicketController;
