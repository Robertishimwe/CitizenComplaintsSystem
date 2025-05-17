import { Request, Response } from 'express';
import { TicketService } from './ticket.service';
import {
  CreateTicketDto,
  UpdateTicketByAgentDto,
  UpdateTicketParamsDto,
  AddCommunicationDto,
  ListTicketsQueryDto,
  TransferTicketDto,
  UpdateTicketAssignmentDto,
} from './dto';
import catchAsync from '@/utils/catchAsync';
import { ApiError } from '@/utils/ApiError';
import { User } from '@prisma/client'; // To type req.user

export class TicketController {
  private ticketService: TicketService;

  constructor() {
    this.ticketService = new TicketService();
  }

  createTicket = catchAsync(async (req: Request, res: Response) => {
    const dto = req.validatedBody as CreateTicketDto;
    const creatingUser = req.user as User | undefined; // User might be undefined if anonymous submission is allowed without login
    const newTicket = await this.ticketService.createTicket(dto, creatingUser);
    res.status(201).json({
      status: 'success',
      message: 'Ticket created successfully.',
      data: newTicket,
    });
  });

  getTicketById = catchAsync(async (req: Request, res: Response) => {
    const { ticketId } = req.validatedParams as UpdateTicketParamsDto; // Assuming UpdateTicketParamsDto has ticketId
    const requestingUser = req.user as User | undefined;
    const ticket = await this.ticketService.getTicketById(ticketId, requestingUser);
    if (!ticket) {
      throw new ApiError(404, 'Ticket not found or not authorized.');
    }
    res.status(200).json({
      status: 'success',
      data: ticket,
    });
  });

  listTickets = catchAsync(async (req: Request, res: Response) => {
    const query = req.validatedQuery as ListTicketsQueryDto;
    const requestingUser = req.user as User | undefined;
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

  updateTicketByAgent = catchAsync(async (req: Request, res: Response) => {
    const { ticketId } = req.validatedParams as UpdateTicketParamsDto;
    const dto = req.validatedBody as UpdateTicketByAgentDto;
    const agent = req.user as User; // requireAuth middleware should ensure req.user exists
    const updatedTicket = await this.ticketService.updateTicketByAgent(ticketId, dto, agent);
    res.status(200).json({
      status: 'success',
      message: 'Ticket updated successfully.',
      data: updatedTicket,
    });
  });

  updateTicketAssignment = catchAsync(async (req: Request, res: Response) => {
    const { ticketId } = req.validatedParams as UpdateTicketParamsDto; // Assuming it has ticketId
    const dto = req.validatedBody as UpdateTicketAssignmentDto;
    const adminUser = req.user as User; // requireAuth & authorize (ADMIN) should ensure this
    const updatedTicket = await this.ticketService.updateTicketAssignment(ticketId, dto, adminUser);
    res.status(200).json({
        status: 'success',
        message: 'Ticket assignment updated.',
        data: updatedTicket,
    });
  });

  addCommunication = catchAsync(async (req: Request, res: Response) => {
    const { ticketId } = req.validatedParams as UpdateTicketParamsDto; // Assuming UpdateTicketParamsDto has ticketId
    const dto = req.validatedBody as AddCommunicationDto;
    const sendingUser = req.user as User | undefined; // User could be undefined for anonymous ticket replies if allowed
    const newCommunication = await this.ticketService.addCommunication(ticketId, dto, sendingUser);
    res.status(201).json({
      status: 'success',
      message: 'Communication added successfully.',
      data: newCommunication,
    });
  });

  transferTicket = catchAsync(async (req: Request, res: Response) => {
    const { ticketId } = req.validatedParams as UpdateTicketParamsDto; // Assuming it has ticketId
    const dto = req.validatedBody as TransferTicketDto;
    const transferringAgent = req.user as User; // requireAuth and authorize (AGENCY_STAFF or ADMIN)
    const transferredTicket = await this.ticketService.transferTicket(ticketId, dto, transferringAgent);
    res.status(200).json({
        status: 'success',
        message: 'Ticket transferred successfully.',
        data: transferredTicket,
    });
  });
}
