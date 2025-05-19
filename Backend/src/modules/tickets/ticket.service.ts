// src/modules/tickets/ticket.service.ts
import { TicketRepository, TicketWithDetails } from './ticket.repository';
import {
  CreateTicketDto,
  UpdateTicketByAgentDto,
  AddCommunicationDto,
  ListTicketsQueryDto,
  TransferTicketDto,
  UpdateTicketAssignmentDto,
} from './dto';
import {
  TicketResponse,
  CommunicationResponse,
  PaginatedTicketsResponse,
  CreateTicketPayload,
  UpdateTicketPayload,
  AddCommunicationPayload,
  TicketFilter,
  // TransferTicketPayload, // Already defined in interfaces
} from './interfaces/ticket.interfaces';
import { ApiError } from '@/utils/ApiError';
import { NotificationService } from '@/modules/notifications/notification.service';
import { TicketAiService } from './services/ticket.ai.service';
import prisma from '@/config/prisma';
import { User, UserRole, TicketStatus, ResourceStatus, TicketPriority, Communication, Category } from '@prisma/client'; // Added Communication
import { logger } from '@/config';

export class TicketService {
  private ticketRepository: TicketRepository;
  private notificationService: NotificationService;
  private ticketAiService: TicketAiService;

  constructor() {
    this.ticketRepository = new TicketRepository();
    this.notificationService = new NotificationService();
    this.ticketAiService = new TicketAiService();
  }

  // Regular private method
  private mapCommunicationToResponse(comm: Communication & { sender?: {id: string, name: string, role: UserRole} | null }): CommunicationResponse {
    const response: CommunicationResponse = {
      id: comm.id,
      message: comm.message,
      timestamp: comm.timestamp,
      isInternal: comm.isInternal,
    };
    if (comm.sender) {
      response.sender = { id: comm.sender.id, name: comm.sender.name, role: comm.sender.role };
    }
    return response;
  }

  // Regular private method
  private mapTicketToResponse(ticket: TicketWithDetails): TicketResponse {
    const response: TicketResponse = {
      id: ticket.id,
      title: ticket.title,
      location: ticket.location,
      priority: ticket.priority,
      detailedDescription: ticket.detailedDescription,
      status: ticket.status,
      isAnonymous: ticket.isAnonymous,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      category: ticket.category ? { id: ticket.category.id, name: ticket.category.name } : undefined,
      assignedAgency: ticket.assignedAgency ? { id: ticket.assignedAgency.id, name: ticket.assignedAgency.name } : undefined,
      assignedAgent: ticket.assignedAgent ? { id: ticket.assignedAgent.id, name: ticket.assignedAgent.name, email: ticket.assignedAgent.email } : undefined,
      // Using arrow function wrapper for map to preserve 'this' for mapCommunicationToResponse
      communications: ticket.communications?.map(comm => this.mapCommunicationToResponse(comm)) || [],
      anonymousCreatorName: null,
      anonymousCreatorContact: null
    };

    if (ticket.isAnonymous) {
      response.citizen = {
        name: ticket.anonymousCreatorName || 'Anonymous',
        contact: ticket.anonymousCreatorContact ?? undefined,
      };
    } else if (ticket.citizen) {
      response.citizen = {
        id: ticket.citizen.id,
        name: ticket.citizen.name,
        email: ticket.citizen.email,
        phone: ticket.citizen.phone,
      };
    }
    if (!response.citizen && ticket.isAnonymous) { // Fallback
        response.citizen = { name: 'Anonymous', contact: ticket.anonymousCreatorContact ?? undefined };
    }
    return response;
  }

  // async createTicket(dto: CreateTicketDto, creatingUser?: User): Promise<TicketResponse> {
  //   const payload: CreateTicketPayload = {
  //     ...dto,
  //     status: 'NEW'
  //   };
  //   let assignedAgencyId: string | undefined = undefined;
  //   let initialStatus: TicketStatus = TicketStatus.NEW;
  //   let categoryObject: Category | null = null; // To store the fetched category object
  //     let categoryNameForAi: string | undefined = undefined;

  //   if (creatingUser) {
  //     payload.isAnonymous = false;
  //     payload.citizenId = creatingUser.id;
  //   } else if (!dto.isAnonymous) {
  //     payload.isAnonymous = true;
  //     if (!dto.anonymousCreatorName || !dto.anonymousCreatorContact) {
  //         throw new ApiError(400, 'Name and contact are required for non-logged-in submissions not marked anonymous.');
  //     }
  //   }

  //   // if (dto.categoryId) {
  //   //   const category = await prisma.category.findUnique({ where: { id: dto.categoryId } });
  //   //   if (!category) {
  //   //     throw new ApiError(404, `Category with ID "${dto.categoryId}" not found.`);
  //   //   }
  //   //   const routingRule = await prisma.routingRule.findUnique({
  //   //     where: { categoryId: dto.categoryId, status: ResourceStatus.ACTIVE },
  //   //   });
  //   //   if (routingRule && routingRule.assignedAgencyId) {
  //   //     const agency = await prisma.agency.findUnique({where: {id: routingRule.assignedAgencyId}});
  //   //     if (agency && agency.status === ResourceStatus.ACTIVE) {
  //   //         assignedAgencyId = routingRule.assignedAgencyId;
  //   //     } else {
  //   //         console.warn(`Routing rule found for category ${dto.categoryId} but agency ${routingRule.assignedAgencyId} is inactive or not found.`);
  //   //     }
  //   //   } else {
  //   //     console.warn(`No active routing rule found for category ${dto.categoryId}. Ticket will be unassigned from an agency.`);
  //   //   }
  //   // } else {
  //   //    console.warn(`No category ID provided. Ticket will be unassigned from an agency and category.`);
  //   // }

  //       // 1. Handle Category and Attempt Rule-Based Assignment
  //       if (dto.categoryId) {
  //         categoryObject = await prisma.category.findUnique({ where: { id: dto.categoryId } });
  //         if (!categoryObject) {
  //           // If categoryId is provided but not found, it's an error.
  //           // We won't proceed to AI if an invalid category ID was given.
  //           throw new ApiError(400, `Invalid category ID: "${dto.categoryId}" not found.`);
  //         }
  //         payload.categoryId = dto.categoryId; // Store valid categoryId in payload
  //         categoryNameForAi = categoryObject.name; // Use for AI context
    
  //         const routingRule = await prisma.routingRule.findUnique({
  //           where: { categoryId: dto.categoryId, status: ResourceStatus.ACTIVE },
  //         });
    
  //         if (routingRule && routingRule.assignedAgencyId) {
  //           const agency = await prisma.agency.findUnique({ where: { id: routingRule.assignedAgencyId } });
  //           if (agency && agency.status === ResourceStatus.ACTIVE) {
  //              payload.assignedAgencyId = routingRule.assignedAgencyId; // Set on payload
  //              payload.status = TicketStatus.ASSIGNED; 
  //             logger.info(`Ticket auto-assigned to agency "${agency.name}" (ID: ${agency.id}) via routing rule for category "${categoryObject.name}". Status set to ${initialStatus}.`);
  //           } else {
  //             logger.warn(`Rule-based: Agency for category "${categoryObject.name}" (rule points to ID: ${routingRule.assignedAgencyId}) is inactive or not found. Will attempt AI suggestion.`);
  //           }
  //         } else {
  //           logger.info(`No active routing rule for category "${categoryObject.name}". Will attempt AI suggestion.`);
  //         }
  //       } else {
  //         logger.info('No category ID provided by user. Will attempt AI-based agency suggestion.');
  //         // categoryNameForAi remains undefined
  //       }
  //   payload.status = initialStatus;
  //   payload.assignedAgencyId = assignedAgencyId;

  
  //   const newTicket = await this.ticketRepository.create(payload, assignedAgencyId);
    async createTicket(dto: CreateTicketDto, creatingUser?: User): Promise<TicketResponse> {
    // Initialize payload directly from dto.
    // status and assignedAgencyId will be added/updated based on logic.
    const payload: CreateTicketPayload = { ...dto };

    // Set defaults that might be overridden
    payload.status = TicketStatus.NEW; // Default status
    // payload.assignedAgencyId will be set if routing occurs

    let categoryObject: Category | null = null;
    let categoryNameForAi: string | undefined = undefined;

    if (creatingUser) {
      payload.isAnonymous = false;
      payload.citizenId = creatingUser.id;
    } else if (!dto.isAnonymous) { // This implies a submission without login, not explicitly anonymous
      payload.isAnonymous = true; // Treat as anonymous
      if (!dto.anonymousCreatorName || !dto.anonymousCreatorContact) {
        throw new ApiError(400, 'Name and contact are required for non-logged-in submissions not marked anonymous.');
      }
      // Ensure anonymous details from DTO are in payload
      payload.anonymousCreatorName = dto.anonymousCreatorName;
      payload.anonymousCreatorContact = dto.anonymousCreatorContact;
    }
    // If dto.isAnonymous is true, payload.isAnonymous is already true from ...dto.

    // 1. Handle Category and Attempt Rule-Based Assignment
    if (dto.categoryId) {
      categoryObject = await prisma.category.findUnique({ where: { id: dto.categoryId } });

      console.log("<><><><><>", categoryObject)
      if (!categoryObject) {
        throw new ApiError(400, `Invalid category ID: "${dto.categoryId}" not found.`);
      }
      payload.categoryId = dto.categoryId; // Ensure it's in payload
      categoryNameForAi = categoryObject.name;

      const routingRule = await prisma.routingRule.findUnique({
        where: { categoryId: dto.categoryId, status: ResourceStatus.ACTIVE },
      });

      if (routingRule && routingRule.assignedAgencyId) {
        const agency = await prisma.agency.findUnique({ where: { id: routingRule.assignedAgencyId } });
        if (agency && agency.status === ResourceStatus.ACTIVE) {
          payload.assignedAgencyId = routingRule.assignedAgencyId; // Set on payload
          payload.status = TicketStatus.ASSIGNED;         // Set on payload
          logger.info(`Ticket auto-assigned to agency "${agency.name}" via rule. Status: ${payload.status}.`);
        } else {
          logger.warn(`Rule-based: Agency for category "${categoryObject.name}" is inactive/not found. Will attempt AI.`);
        }
      } else {
        logger.info(`No active routing rule for category "${categoryObject.name}". Will attempt AI.`);
      }
    } else {
      logger.info('No category ID provided by user. Will attempt AI.');
    }

    // 2. AI-Based Assignment (if not assigned by rule OR no category was given)
    if (!payload.assignedAgencyId) { // Check if agency was assigned in the step above
      logger.info(`Attempting AI-based agency suggestion. Category for AI context: "${categoryNameForAi || 'None'}".`);
      const allCategories = await prisma.category.findMany({ select: { id: true, name: true, description: true } });
      const allAgencies = await prisma.agency.findMany({ where: { status: ResourceStatus.ACTIVE }, select: { id: true, name: true, description: true } });
      const allRoutingRulesFromDb = await prisma.routingRule.findMany({
          where: { status: ResourceStatus.ACTIVE},
          include: { category: {select: {name: true}}, assignedAgency: {select: {name:true}}}
      });
      const aiContext = {
        categories: allCategories,
        agencies: allAgencies,
        routingRules: allRoutingRulesFromDb.map(r => ({ categoryName: r.category?.name, agencyName: r.assignedAgency?.name })),
      };

      const aiSuggestedAgencyId = await this.ticketAiService.suggestAgencyForTicket(
        { title: dto.title, detailedDescription: dto.detailedDescription, categoryName: categoryNameForAi },
        aiContext
      );

      if (aiSuggestedAgencyId) {
        const aiAgency = allAgencies.find(a => a.id === aiSuggestedAgencyId);
        if (aiAgency) {
          payload.assignedAgencyId = aiSuggestedAgencyId; // Set on payload
          payload.status = TicketStatus.ASSIGNED;         // Set on payload
          logger.info(`Ticket auto-assigned to agency "${aiAgency.name}" via AI. Status: ${payload.status}.`);
        } else {
            logger.warn(`AI suggested agency ID "${aiSuggestedAgencyId}" (not valid/active). Ticket remains unassigned by AI.`);
        }
      } else {
        logger.info('AI did not provide agency suggestion. Ticket remains unassigned by AI.');
      }
    }
    // At this point, payload.status and payload.assignedAgencyId hold the final determined values.
    // If still no assignedAgencyId, payload.status would likely still be NEW (its initial default).
    // If no assignedAgencyId but AI suggested one, status is ASSIGNED.
    // If rule assigned, status is ASSIGNED.

    // The repository's create method now takes the consolidated payload
    const newTicket = await this.ticketRepository.create(payload);


    let recipientPhone = '';
    let recipientName = 'Citizen';

    if (newTicket.citizen && newTicket.citizen.phone) {
      recipientPhone = newTicket.citizen.phone;
      recipientName = newTicket.citizen.name;
    } else if (newTicket.isAnonymous && newTicket.anonymousCreatorContact) {
      const phoneRegex = /^\+?\d{10,15}$/;
      if (phoneRegex.test(newTicket.anonymousCreatorContact)) {
        recipientPhone = newTicket.anonymousCreatorContact;
      }
      recipientName = newTicket.anonymousCreatorName || 'Citizen';
    }

    if (recipientPhone) {
      await this.notificationService.sendTicketCreationSms(newTicket.id, recipientName, recipientPhone);
    }

    return this.mapTicketToResponse(newTicket);
  }

  async getTicketById(ticketId: string, requestingUser?: User): Promise<TicketResponse | null> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      return null;
    }

    if (ticket.isAnonymous) {
        return this.mapTicketToResponse(ticket);
    }
    if (!requestingUser) {
        throw new ApiError(401, 'Authentication required to view this ticket.');
    }
    if (requestingUser.role === UserRole.ADMIN) {
        return this.mapTicketToResponse(ticket);
    }
    if (requestingUser.role === UserRole.CITIZEN && ticket.citizenId === requestingUser.id) {
        return this.mapTicketToResponse(ticket);
    }
    if (requestingUser.role === UserRole.AGENCY_STAFF && ticket.assignedAgencyId === requestingUser.agencyId) {
        return this.mapTicketToResponse(ticket);
    }

    throw new ApiError(403, 'You are not authorized to view this ticket.');
  }

  async listTickets(query: ListTicketsQueryDto, requestingUser?: User): Promise<PaginatedTicketsResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filters: TicketFilter = { ...query };
    const sorting = {
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    };

    const { tickets, total } = await this.ticketRepository.findAll(filters, { skip, take: limit }, sorting, requestingUser);

    return {
      // Using arrow function wrapper for map to preserve 'this' for mapTicketToResponse
      tickets: tickets.map(ticket => this.mapTicketToResponse(ticket)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateTicketByAgent(ticketId: string, dto: UpdateTicketByAgentDto, agent: User): Promise<TicketResponse | null> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new ApiError(404, 'Ticket not found.');
    }
    if (agent.role !== UserRole.ADMIN && ticket.assignedAgencyId !== agent.agencyId) {
        throw new ApiError(403, 'You are not authorized to update this ticket.');
    }

    const payload: UpdateTicketPayload = { ...dto };

    const updatedTicket = await this.ticketRepository.update(ticketId, payload);

    if (updatedTicket && updatedTicket.citizen?.phone && dto.status) {
        const statusUpdateMessage = `Your ticket status is now ${dto.status}.`;
        await this.notificationService.sendTicketUpdateSms(ticketId, updatedTicket.citizen.phone, statusUpdateMessage);
    }

    return updatedTicket ? this.mapTicketToResponse(updatedTicket) : null;
  }

  async updateTicketAssignment(ticketId: string, dto: UpdateTicketAssignmentDto, adminUser: User): Promise<TicketResponse | null> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found.');

    const payload: UpdateTicketPayload = {};
    let newStatus: TicketStatus | undefined = ticket.status;

    if (dto.assignedAgentId !== undefined) {
        if (dto.assignedAgentId) {
            const agentToAssign = await prisma.user.findUnique({ where: {id: dto.assignedAgentId }});
            if (!agentToAssign || agentToAssign.role !== UserRole.AGENCY_STAFF) {
                throw new ApiError(400, 'Invalid agent ID or user is not an agency staff.');
            }
            if (ticket.assignedAgencyId && agentToAssign.agencyId !== ticket.assignedAgencyId) {
                throw new ApiError(400, 'Agent does not belong to the ticket\'s currently assigned agency.');
            }
            if (!ticket.assignedAgencyId && agentToAssign.agencyId) {
                payload.assignedAgencyId = agentToAssign.agencyId;
            }
            payload.assignedAgentId = dto.assignedAgentId;
            newStatus = (ticket.status === TicketStatus.NEW || ticket.status === TicketStatus.IN_PROGRESS_PENDING_AGENT) ? TicketStatus.ASSIGNED : ticket.status;
        } else {
            payload.assignedAgentId = null;
            newStatus = TicketStatus.IN_PROGRESS_PENDING_AGENT;
        }
    }

    if (newStatus && newStatus !== ticket.status) {
        payload.status = newStatus;
    }

    const updatedTicket = await this.ticketRepository.update(ticketId, payload);
    return updatedTicket ? this.mapTicketToResponse(updatedTicket) : null;
  }

  async addCommunication(ticketId: string, dto: AddCommunicationDto, sendingUser?: User): Promise<CommunicationResponse> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new ApiError(404, 'Ticket not found.');
    }

    let canComment = false;
    if (sendingUser) {
        if (sendingUser.role === UserRole.ADMIN) canComment = true;
        else if (sendingUser.role === UserRole.CITIZEN && ticket.citizenId === sendingUser.id && !ticket.isAnonymous) canComment = true;
        else if (sendingUser.role === UserRole.AGENCY_STAFF && ticket.assignedAgencyId === sendingUser.agencyId) canComment = true;
        else if (ticket.isAnonymous) canComment = true;
    }

    // if (!canComment) {
    //     throw new ApiError(403, 'You are not authorized to add communication to this ticket.');
    // }
    if (dto.isInternal && sendingUser?.role === UserRole.CITIZEN) {
        throw new ApiError(400, 'Citizens cannot add internal notes.');
    }

    const payload: AddCommunicationPayload = { ...dto, ticketId };
    if (sendingUser) {
      payload.senderId = sendingUser.id;
    }

    const newCommunication = await this.ticketRepository.addCommunication(payload);

    // Update ticket status if citizen replies
    let statusChanged = false;
    if (sendingUser?.role === UserRole.CITIZEN && ticket.status === TicketStatus.IN_PROGRESS_PENDING_CITIZEN) {
        await this.ticketRepository.update(ticketId, { status: TicketStatus.IN_PROGRESS_PENDING_AGENT });
        statusChanged = true;
    }

    // Notify relevant parties for public messages
    if (!dto.isInternal) {
        if (sendingUser?.role === UserRole.AGENCY_STAFF && ticket.citizen?.phone) {
            const updateMessage = `${sendingUser.name} replied to your ticket.`;
            await this.notificationService.sendTicketUpdateSms(ticketId, ticket.citizen.phone, updateMessage);
        }
        // Potentially notify agent if citizen replies and agent has notification preferences (e.g., email)
    }

    // If status changed, fetch the updated ticket to include in the response if needed, or just return communication
    // For now, just returning the communication. Caller can re-fetch ticket if full updated state is needed.
    return this.mapCommunicationToResponse(newCommunication);
  }

  async transferTicket(ticketId: string, dto: TransferTicketDto, transferringAgent: User): Promise<TicketResponse | null> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found.');

    if (transferringAgent.role !== UserRole.AGENCY_STAFF && transferringAgent.role !== UserRole.ADMIN) {
        throw new ApiError(403, 'Only agency staff or admins can transfer tickets.');
    }
    if (transferringAgent.role === UserRole.AGENCY_STAFF && ticket.assignedAgencyId !== transferringAgent.agencyId) {
        throw new ApiError(403, 'You can only transfer tickets assigned to your agency.');
    }
    if (ticket.assignedAgencyId === dto.newAgencyId) {
        throw new ApiError(400, 'Ticket is already assigned to this agency.');
    }

    const newAgency = await prisma.agency.findUnique({ where: { id: dto.newAgencyId }});
    if (!newAgency) throw new ApiError(404, 'Target agency for transfer not found.');
    if (newAgency.status === ResourceStatus.INACTIVE) throw new ApiError(400, 'Cannot transfer ticket to an inactive agency.');

    const updatePayload: UpdateTicketPayload = {
        assignedAgencyId: dto.newAgencyId,
        assignedAgentId: null,
        status: TicketStatus.IN_PROGRESS_PENDING_AGENT,
    };

    const updatedTicket = await this.ticketRepository.update(ticketId, updatePayload);

    if (updatedTicket) {
        let transferMessage = `Ticket transferred from agency "${ticket.assignedAgency?.name || 'Previous Agency'}" to "${newAgency.name}" by ${transferringAgent.name}.`;
        if (dto.transferComment) {
            transferMessage += ` Comment: ${dto.transferComment}`;
        }
        await this.ticketRepository.addCommunication({
            ticketId,
            message: transferMessage,
            senderId: transferringAgent.id,
            isInternal: false, // Public transfer log
        });

        if (updatedTicket.citizen?.phone) {
            const citizenMessage = `Your ticket #${ticketId.substring(0,8)} has been transferred to ${newAgency.name} for further assistance.`;
            await this.notificationService.sendTicketUpdateSms(ticketId, updatedTicket.citizen.phone, citizenMessage);
        }
    }

    return updatedTicket ? this.mapTicketToResponse(updatedTicket) : null;
  }
}














// import { TicketRepository, TicketWithDetails } from './ticket.repository';
// import {
//   CreateTicketDto,
//   UpdateTicketByAgentDto,
//   AddCommunicationDto,
//   ListTicketsQueryDto,
//   TransferTicketDto,
//   UpdateTicketAssignmentDto,
// } from './dto';
// import {
//   TicketResponse,
//   CommunicationResponse,
//   PaginatedTicketsResponse,
//   CreateTicketPayload,
//   UpdateTicketPayload,
//   AddCommunicationPayload,
//   TicketFilter,
//   TransferTicketPayload,
// } from './interfaces/ticket.interfaces';
// import { ApiError } from '@/utils/ApiError';
// import { NotificationService } from '@/modules/notifications/notification.service';
// import prisma from '@/config/prisma'; // For direct checks (e.g., routing rules, user existence)
// import { User, UserRole, TicketStatus, ResourceStatus } from '@prisma/client';

// export class TicketService {
//   private ticketRepository: TicketRepository;
//   private notificationService: NotificationService;

//   constructor() {
//     this.ticketRepository = new TicketRepository();
//     this.notificationService = new NotificationService();
//   }

//   private mapCommunicationToResponse(comm: any): CommunicationResponse {
//     // Prisma's Communication type after include sender
//     const response: CommunicationResponse = {
//       id: comm.id,
//       message: comm.message,
//       timestamp: comm.timestamp,
//       isInternal: comm.isInternal,
//     };
//     if (comm.sender) {
//       response.sender = { id: comm.sender.id, name: comm.sender.name, role: comm.sender.role };
//     } else {
//       // Handle case where sender might be anonymous for ticket-level anonymous replies (if implemented)
//       // For now, assuming sender is always a registered user if senderId is present
//     }
//     return response;
//   }

//   private mapTicketToResponse(ticket: TicketWithDetails): TicketResponse {
//     const response: TicketResponse = {
//         id: ticket.id,
//         title: ticket.title,
//         location: ticket.location,
//         priority: ticket.priority,
//         detailedDescription: ticket.detailedDescription,
//         status: ticket.status,
//         isAnonymous: ticket.isAnonymous,
//         createdAt: ticket.createdAt,
//         updatedAt: ticket.updatedAt,
//         category: ticket.category ? { id: ticket.category.id, name: ticket.category.name } : null,
//         assignedAgency: ticket.assignedAgency ? { id: ticket.assignedAgency.id, name: ticket.assignedAgency.name } : null,
//         assignedAgent: ticket.assignedAgent ? { id: ticket.assignedAgent.id, name: ticket.assignedAgent.name, email: ticket.assignedAgent.email } : null, // Added email
//         communications: ticket.communications?.map(this.mapCommunicationToResponse) || [],
//         anonymousCreatorName: null,
//         anonymousCreatorContact: null
//     };

//     if (ticket.isAnonymous) {
//       response.citizen = { name: ticket.anonymousCreatorName || 'Anonymous', contact: ticket.anonymousCreatorContact ?? undefined, };
//     } else if (ticket.citizen) {
//       response.citizen = {
//         id: ticket.citizen.id,
//         name: ticket.citizen.name,
//         email: ticket.citizen.email,
//         phone: ticket.citizen.phone,
//       };
//     }
//     return response;
//   }

//   async createTicket(dto: CreateTicketDto, creatingUser?: User): Promise<TicketResponse> {
//     const payload: CreateTicketPayload = { ...dto };
//     let assignedAgencyId: string | undefined = undefined;

//     if (creatingUser) {
//       payload.isAnonymous = false; // Logged-in user cannot submit anonymously this way
//       payload.citizenId = creatingUser.id;
//     } else if (!dto.isAnonymous) {
//       // If not logged in and not explicitly anonymous, treat as anonymous for safety
//       // Or throw error if anonymous contact details are missing
//       payload.isAnonymous = true;
//       if (!dto.anonymousCreatorName || !dto.anonymousCreatorContact) {
//           throw new ApiError(400, 'Name and contact are required for non-logged-in submissions not marked anonymous.');
//       }
//     }

//     if (dto.categoryId) {
//       const category = await prisma.category.findUnique({ where: { id: dto.categoryId } });
//       if (!category) {
//         throw new ApiError(404, `Category with ID "${dto.categoryId}" not found.`);
//       }
//       // Find routing rule for this category
//       const routingRule = await prisma.routingRule.findUnique({
//         where: { categoryId: dto.categoryId, status: ResourceStatus.ACTIVE },
//       });
//       if (routingRule && routingRule.assignedAgencyId) {
//         const agency = await prisma.agency.findUnique({where: {id: routingRule.assignedAgencyId}});
//         if (agency && agency.status === ResourceStatus.ACTIVE) {
//             assignedAgencyId = routingRule.assignedAgencyId;
//         } else {
//             // TODO: Handle case where routed agency is inactive or not found
//             // Assign to a default agency or leave unassigned for admin review
//             console.warn(`Routing rule found for category ${dto.categoryId} but agency ${routingRule.assignedAgencyId} is inactive or not found.`);
//         }
//       } else {
//         // TODO: No active routing rule found. AI suggestion or default assignment logic would go here.
//         // For now, it remains unassigned to an agency if no rule.
//         console.warn(`No active routing rule found for category ${dto.categoryId}. Ticket will be unassigned from an agency.`);
//       }
//     } else {
//       // TODO: No category ID provided. AI suggestion or default assignment logic.
//       // For now, remains unassigned.
//        console.warn(`No category ID provided. Ticket will be unassigned from an agency and category.`);
//     }

//     const newTicket = await this.ticketRepository.create(payload, assignedAgencyId);

//     // Send SMS notification
//     let recipientPhone = '';
//     let recipientName = 'Citizen';

//     if (newTicket.citizen && newTicket.citizen.phone) {
//       recipientPhone = newTicket.citizen.phone;
//       recipientName = newTicket.citizen.name;
//     } else if (newTicket.isAnonymous && newTicket.anonymousCreatorContact) {
//       // Attempt to parse phone from anonymous contact, basic check
//       const phoneRegex = /^\+?\d{10,15}$/;
//       if (phoneRegex.test(newTicket.anonymousCreatorContact)) {
//         recipientPhone = newTicket.anonymousCreatorContact;
//       }
//       recipientName = newTicket.anonymousCreatorName || 'Citizen';
//     }

//     if (recipientPhone) {
//       await this.notificationService.sendTicketCreationSms(newTicket.id, recipientName, recipientPhone);
//     }

//     return this.mapTicketToResponse(newTicket);
//   }

//   async getTicketById(ticketId: string, requestingUser?: User): Promise<TicketResponse | null> {
//     const ticket = await this.ticketRepository.findById(ticketId);
//     if (!ticket) {
//       return null;
//     }

//     // Authorization:
//     if (ticket.isAnonymous) { // Anyone with ID can view anonymous tickets
//         return this.mapTicketToResponse(ticket);
//     }
//     if (!requestingUser) { // Non-anonymous ticket and no logged-in user
//         throw new ApiError(401, 'Authentication required to view this ticket.');
//     }
//     if (requestingUser.role === UserRole.ADMIN) {
//         return this.mapTicketToResponse(ticket); // Admin sees all
//     }
//     if (requestingUser.role === UserRole.CITIZEN && ticket.citizenId === requestingUser.id) {
//         return this.mapTicketToResponse(ticket); // Citizen sees their own
//     }
//     if (requestingUser.role === UserRole.AGENCY_STAFF && ticket.assignedAgencyId === requestingUser.agencyId) {
//         return this.mapTicketToResponse(ticket); // Agent sees tickets for their agency
//     }

//     throw new ApiError(403, 'You are not authorized to view this ticket.');
//   }

//   async listTickets(query: ListTicketsQueryDto, requestingUser?: User): Promise<PaginatedTicketsResponse> {
//     const page = query.page || 1;
//     const limit = query.limit || 10;
//     const skip = (page - 1) * limit;

//     const filters: TicketFilter = { ...query }; // Spread DTO into filter type
//     const sorting = {
//       sortBy: query.sortBy || 'createdAt',
//       sortOrder: query.sortOrder || 'desc',
//     };

//     const { tickets, total } = await this.ticketRepository.findAll(filters, { skip, take: limit }, sorting, requestingUser);

//     return {
//       tickets: tickets.map(this.mapTicketToResponse),
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     };
//   }

//   async updateTicketByAgent(ticketId: string, dto: UpdateTicketByAgentDto, agent: User): Promise<TicketResponse | null> {
//     const ticket = await this.ticketRepository.findById(ticketId);
//     if (!ticket) {
//       throw new ApiError(404, 'Ticket not found.');
//     }
//     // Authorization: Agent must belong to the ticket's assigned agency or be an admin
//     if (agent.role !== UserRole.ADMIN && ticket.assignedAgencyId !== agent.agencyId) {
//         throw new ApiError(403, 'You are not authorized to update this ticket.');
//     }

//     const payload: UpdateTicketPayload = { ...dto };
//     // Agent specific logic for status transitions can be added here
//     // e.g., if status is RESOLVED, check for resolution notes

//     const updatedTicket = await this.ticketRepository.update(ticketId, payload);

//     if (updatedTicket && updatedTicket.citizen?.phone && dto.status) { // Notify on status change
//         const statusUpdateMessage = `Your ticket status is now ${dto.status}.`;
//         await this.notificationService.sendTicketUpdateSms(ticketId, updatedTicket.citizen.phone, statusUpdateMessage);
//     }

//     return updatedTicket ? this.mapTicketToResponse(updatedTicket) : null;
//   }

//   async updateTicketAssignment(ticketId: string, dto: UpdateTicketAssignmentDto, adminUser: User): Promise<TicketResponse | null> {
//     // Only Admin can assign/reassign agents broadly for now.
//     // Agency lead might assign agents within their agency - requires more complex role/permission system.
//     const ticket = await this.ticketRepository.findById(ticketId);
//     if (!ticket) throw new ApiError(404, 'Ticket not found.');

//     const payload: UpdateTicketPayload = {};
//     let newStatus: TicketStatus | undefined = ticket.status;

//     if (dto.assignedAgentId !== undefined) { // handles null for unassignment
//         if (dto.assignedAgentId) { // Assigning to a new agent
//             const agentToAssign = await prisma.user.findUnique({ where: {id: dto.assignedAgentId }});
//             if (!agentToAssign || agentToAssign.role !== UserRole.AGENCY_STAFF) {
//                 throw new ApiError(400, 'Invalid agent ID or user is not an agency staff.');
//             }
//             if (ticket.assignedAgencyId && agentToAssign.agencyId !== ticket.assignedAgencyId) {
//                 throw new ApiError(400, 'Agent does not belong to the ticket\'s currently assigned agency.');
//             }
//             if (!ticket.assignedAgencyId && agentToAssign.agencyId) { // If ticket has no agency, assign agent's agency
//                 payload.assignedAgencyId = agentToAssign.agencyId;
//             }
//             payload.assignedAgentId = dto.assignedAgentId;
//             newStatus = (ticket.status === TicketStatus.NEW || ticket.status === TicketStatus.IN_PROGRESS_PENDING_AGENT) ? TicketStatus.ASSIGNED : ticket.status;
//         } else { // Unassigning agent (assignedAgentId is null)
//             payload.assignedAgentId = null;
//             // If unassigned, status might go back to IN_PROGRESS_PENDING_AGENT or stay as is if agency level.
//             newStatus = TicketStatus.IN_PROGRESS_PENDING_AGENT; // Or based on context
//         }
//     }

//     if (newStatus && newStatus !== ticket.status) {
//         payload.status = newStatus;
//     }


//     const updatedTicket = await this.ticketRepository.update(ticketId, payload);
//     return updatedTicket ? this.mapTicketToResponse(updatedTicket) : null;
//   }


//   async addCommunication(ticketId: string, dto: AddCommunicationDto, sendingUser?: User): Promise<CommunicationResponse> {
//     const ticket = await this.ticketRepository.findById(ticketId);
//     if (!ticket) {
//       throw new ApiError(404, 'Ticket not found.');
//     }

//     // Authorization:
//     // Citizen can comment on their own non-anonymous ticket
//     // Agent can comment on tickets assigned to their agency (internal or public)
//     // Admin can comment on any ticket
//     let canComment = false;
//     if (sendingUser) {
//         if (sendingUser.role === UserRole.ADMIN) canComment = true;
//         else if (sendingUser.role === UserRole.CITIZEN && ticket.citizenId === sendingUser.id && !ticket.isAnonymous) canComment = true;
//         else if (sendingUser.role === UserRole.AGENCY_STAFF && ticket.assignedAgencyId === sendingUser.agencyId) canComment = true;
//     }
//     // Allow anonymous comment if ticket is anonymous and further rules apply (e.g. via a secure link - not implemented here)

//     if (!canComment) {
//         throw new ApiError(403, 'You are not authorized to add communication to this ticket.');
//     }
//     if (dto.isInternal && sendingUser?.role === UserRole.CITIZEN) {
//         throw new ApiError(400, 'Citizens cannot add internal notes.');
//     }


//     const payload: AddCommunicationPayload = { ...dto, ticketId };
//     if (sendingUser) {
//       payload.senderId = sendingUser.id;
//     }

//     const newCommunication = await this.ticketRepository.addCommunication(payload);

//     // Update ticket status if citizen replies (example logic)
//     if (sendingUser?.role === UserRole.CITIZEN && ticket.status === TicketStatus.IN_PROGRESS_PENDING_CITIZEN) {
//         await this.ticketRepository.update(ticketId, { status: TicketStatus.IN_PROGRESS_PENDING_AGENT });
//     }
//     // Notify agent if citizen replies, or citizen if agent replies (publicly)
//     if (!dto.isInternal) {
//         if (sendingUser?.role === UserRole.CITIZEN && ticket.assignedAgent?.email && ticket.citizen?.phone) { // Assuming agent has phone for SMS, or use email
//             // This notification to agent might be better as email or in-app
//         } else if (sendingUser?.role === UserRole.AGENCY_STAFF && ticket.citizen?.phone) {
//             const updateMessage = `${sendingUser.name} replied to your ticket.`;
//             await this.notificationService.sendTicketUpdateSms(ticketId, ticket.citizen.phone, updateMessage);
//         }
//     }


//     return this.mapCommunicationToResponse(newCommunication);
//   }

//   async transferTicket(ticketId: string, dto: TransferTicketPayload, transferringAgent: User): Promise<TicketResponse | null> {
//     const ticket = await this.ticketRepository.findById(ticketId);
//     if (!ticket) throw new ApiError(404, 'Ticket not found.');

//     if (transferringAgent.role !== UserRole.AGENCY_STAFF && transferringAgent.role !== UserRole.ADMIN) {
//         throw new ApiError(403, 'Only agency staff or admins can transfer tickets.');
//     }
//     if (transferringAgent.role === UserRole.AGENCY_STAFF && ticket.assignedAgencyId !== transferringAgent.agencyId) {
//         throw new ApiError(403, 'You can only transfer tickets assigned to your agency.');
//     }
//     if (ticket.assignedAgencyId === dto.newAgencyId) {
//         throw new ApiError(400, 'Ticket is already assigned to this agency.');
//     }

//     const newAgency = await prisma.agency.findUnique({ where: { id: dto.newAgencyId }});
//     if (!newAgency) throw new ApiError(404, 'Target agency for transfer not found.');
//     if (newAgency.status === ResourceStatus.INACTIVE) throw new ApiError(400, 'Cannot transfer ticket to an inactive agency.');

//     const updatePayload: UpdateTicketPayload = {
//         assignedAgencyId: dto.newAgencyId,
//         assignedAgentId: null, // Unassign current agent
//         status: TicketStatus.IN_PROGRESS_PENDING_AGENT, // Or ASSIGNED for the new agency
//     };

//     const updatedTicket = await this.ticketRepository.update(ticketId, updatePayload);

//     // Add an automated communication about the transfer
//     if (updatedTicket) {
//         let transferMessage = `Ticket transferred from agency "${ticket.assignedAgency?.name || 'Previous Agency'}" to "${newAgency.name}" by ${transferringAgent.name}.`;
//         if (dto.transferComment) {
//             transferMessage += ` Comment: ${dto.transferComment}`;
//         }
//         await this.ticketRepository.addCommunication({
//             ticketId,
//             message: transferMessage,
//             senderId: transferringAgent.id, // System action attributed to the agent
//             isInternal: false, // Make it public so citizen knows
//         });

//         // Notify citizen
//         if (updatedTicket.citizen?.phone) {
//             const citizenMessage = `Your ticket #${ticketId.substring(0,8)} has been transferred to ${newAgency.name} for further assistance.`;
//             await this.notificationService.sendTicketUpdateSms(ticketId, updatedTicket.citizen.phone, citizenMessage);
//         }
//     }

//     return updatedTicket ? this.mapTicketToResponse(updatedTicket) : null;
//   }
// }
