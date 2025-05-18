// src/modules/users/user.repository.ts
import prisma from '@/config/prisma';
import { Prisma, User, UserRole, ResourceStatus } from '@prisma/client';
// Assuming user.interfaces.ts is in an 'interfaces' subfolder
import { CreateStaffPayload, UpdateUserPayload, UserFilter } from './interfaces/user.interfaces';
import { hashPassword } from '@/utils/password.utils';

export class UserRepository {
  async createUser(data: CreateStaffPayload, defaultPassword?: string): Promise<User> {
    const passwordToHash = data.password || defaultPassword;
    if (!passwordToHash) {
      throw new Error('Password is required for user creation if not auto-generated.');
    }
    const hashedPassword = await hashPassword(passwordToHash);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        password: hashedPassword,
        status: ResourceStatus.ACTIVE, // Default to active
        // Connect to agency only if role is AGENCY_STAFF and agencyId is provided
        agency: data.role === UserRole.AGENCY_STAFF && data.agencyId
          ? { connect: { id: data.agencyId } }
          : undefined,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { agency: true } // Include agency details
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phone },
    });
  }

  async findAll(
    filters: UserFilter,
    pagination: { skip: number; take: number },
    sorting: { sortBy: string; sortOrder: 'asc' | 'desc' }
  ): Promise<{ users: User[]; total: number }> {
    const where: Prisma.UserWhereInput = {};
    if (filters.role) where.role = filters.role;
    if (filters.status) where.status = filters.status;
    if (filters.agencyId) where.agencyId = filters.agencyId; // Filtering by agencyId is still direct
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sorting.sortBy]: sorting.sortOrder,
      },
      include: {
        agency: {
          select: { id: true, name: true }
        }
      }
    });

    const total = await prisma.user.count({ where });
    return { users, total };
  }

  async updateUser(id: string, data: UpdateUserPayload): Promise<User | null> {
    const prismaUpdateData: Prisma.UserUpdateInput = {};

    // Map direct fields
    if (data.name !== undefined) prismaUpdateData.name = data.name;
    if (data.email !== undefined) prismaUpdateData.email = data.email;
    if (data.phone !== undefined) prismaUpdateData.phone = data.phone;
    if (data.status !== undefined) prismaUpdateData.status = data.status;
    // Role is handled specially due to its interaction with agency
    if (data.role !== undefined) prismaUpdateData.role = data.role;


    // Determine final agency action based on role and agencyId in DTO
    let agencyAction: Prisma.AgencyUpdateOneWithoutStaffMembersNestedInput | undefined = undefined;

    if (data.role && data.role !== UserRole.AGENCY_STAFF) {
      // If role is explicitly set to non-staff, disconnect agency
      agencyAction = { disconnect: true };
    } else if (data.role === UserRole.AGENCY_STAFF) {
      // If role is staff (or becoming staff)
      if (data.agencyId === null) { // Explicitly unassigning
        agencyAction = { disconnect: true };
      } else if (data.agencyId) { // Assigning or changing agency
        agencyAction = { connect: { id: data.agencyId } };
      }
      // If data.agencyId is undefined AND role is becoming AGENCY_STAFF,
      // the service layer should have ensured an agencyId is present or throw an error.
      // If role is already AGENCY_STAFF and agencyId is undefined, no change to agency connection.
    } else if (data.agencyId === null) { // Role not changing or not provided, but unassigning agency
        agencyAction = { disconnect: true };
    } else if (data.agencyId) { // Role not changing or not provided, but assigning agency (ensure user role allows this - service layer)
        // This case should be validated by service: only set agency if role is/will be AGENCY_STAFF
        // For now, we'll trust the service layer. If it's not AGENCY_STAFF, Prisma might error or role update might override.
        const currentUser = await this.findById(id); // Fetch current user to check role if not changing
        if (currentUser?.role === UserRole.AGENCY_STAFF || data.role === UserRole.AGENCY_STAFF){
             agencyAction = { connect: { id: data.agencyId } };
        } else {
            // Trying to assign agency to a non-staff user without changing role to staff.
            // This is likely an invalid state. The service layer should prevent this.
            // For safety in repository, we could choose to ignore this agencyId or explicitly disconnect.
            // Let's opt to ignore if role is not being set to AGENCY_STAFF here.
            // If the role update to AGENCY_STAFF is also in `data`, it will be handled.
        }
    }

    if (agencyAction) {
        prismaUpdateData.agency = agencyAction;
    }


    if (Object.keys(prismaUpdateData).length === 0) {
      // No actual data to update, return the current user
      // This avoids an unnecessary database call if the DTO was empty or resulted in no changes.
      return prisma.user.findUnique({ where: { id }, include: {agency: true} });
    }

    return prisma.user.update({
      where: { id },
      data: prismaUpdateData,
      include: { agency: true }
    });
  }

  async deleteUser(id: string): Promise<User | null> {
    // Soft delete by changing status to INACTIVE
    // Also disconnect from agency if they are staff
    const user = await this.findById(id);
    if (!user) return null;

    const updateData: Prisma.UserUpdateInput = { status: ResourceStatus.INACTIVE };
    if (user.role === UserRole.AGENCY_STAFF) {
        updateData.agency = { disconnect: true };
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      include: { agency: true }
    });
  }

  async countByEmailOrPhone(email: string, phone: string, excludeUserId?: string): Promise<number> {
    const where: Prisma.UserWhereInput = {
      OR: [{ email }, { phone }],
    };
    if (excludeUserId) {
      where.NOT = { id: excludeUserId };
    }
    return prisma.user.count({ where });
  }
}
