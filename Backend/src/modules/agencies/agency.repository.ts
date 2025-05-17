import prisma from '@/config/prisma';
import { Prisma, Agency, ResourceStatus } from '@prisma/client';
import { CreateAgencyPayload, UpdateAgencyPayload, AgencyFilter } from './interfaces/agency.interfaces';

export class AgencyRepository {
  async create(data: CreateAgencyPayload): Promise<Agency> {
    return prisma.agency.create({
      data: {
        name: data.name,
        description: data.description,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        status: data.status || ResourceStatus.ACTIVE,
      },
    });
  }

  async findById(id: string): Promise<Agency | null> {
    return prisma.agency.findUnique({
      where: { id },
      // include: { staffMembers: true } // Optionally include related data
    });
  }

  async findByName(name: string): Promise<Agency | null> {
    return prisma.agency.findUnique({
      where: { name },
    });
  }

  async findAll(
    filters: AgencyFilter,
    pagination: { skip: number; take: number },
    sorting: { sortBy: string; sortOrder: 'asc' | 'desc' }
  ): Promise<{ agencies: Agency[]; total: number }> {
    const where: Prisma.AgencyWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const agencies = await prisma.agency.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sorting.sortBy]: sorting.sortOrder,
      },
    });

    const total = await prisma.agency.count({ where });
    return { agencies, total };
  }

  async update(id: string, data: UpdateAgencyPayload): Promise<Agency | null> {
    const updateData: Prisma.AgencyUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
    // Handle setting contactPhone to null or a new value
    if (data.contactPhone === null) {
        updateData.contactPhone = null;
    } else if (data.contactPhone !== undefined) {
        updateData.contactPhone = data.contactPhone;
    }
    if (data.status !== undefined) updateData.status = data.status;

    if (Object.keys(updateData).length === 0) {
        return this.findById(id); // No actual fields to update
    }

    return prisma.agency.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<Agency | null> {
    // Consider implications: what happens to staff, routing rules, tickets assigned to this agency?
    // Prisma schema onDelete rules will handle some of this.
    // Soft delete (setting status to INACTIVE) is often preferred.
    // For now, implementing as a status change to INACTIVE.
    // If hard delete is needed, ensure cascading rules in schema.prisma are set appropriately or handle related entities manually.
    const agency = await this.findById(id);
    if (!agency) return null;

    return prisma.agency.update({
        where: { id },
        data: { status: ResourceStatus.INACTIVE }
    });
    // For hard delete:
    // return prisma.agency.delete({ where: { id } });
  }
}