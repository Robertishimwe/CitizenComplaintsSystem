import prisma from '@/config/prisma';
import { Prisma, User, UserRole, ResourceStatus } from '@prisma/client';
import { CreateStaffPayload, UpdateUserPayload, UserFilter } from './user.interfaces';
import { hashPassword } from '@/utils/password.utils'; // We'll create this utility

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
        agencyId: data.role === UserRole.AGENCY_STAFF ? data.agencyId : null,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { agency: true } // Include agency details if needed
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
    if (filters.agencyId) where.agencyId = filters.agencyId;
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
        agency: { // Optionally include agency details
          select: { id: true, name: true }
        }
      }
    });

    const total = await prisma.user.count({ where });
    return { users, total };
  }

  async updateUser(id: string, data: UpdateUserPayload): Promise<User | null> {
    const updateData: Prisma.UserUpdateInput = { ...data };

    // Ensure agencyId is null if role is not AGENCY_STAFF
    if (data.role && data.role !== UserRole.AGENCY_STAFF) {
      updateData.agencyId = null;
    } else if (data.role === UserRole.AGENCY_STAFF && data.agencyId === undefined) {
      // If role is changing to AGENCY_STAFF but agencyId is not provided, this might be an issue.
      // The service layer should ensure agencyId is present or fetch current if not changing.
      // For now, if agencyId is explicitly null for AGENCY_STAFF, it means unassignment.
    }


    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteUser(id: string): Promise<User | null> {
    // Instead of hard delete, consider soft delete by changing status to INACTIVE
    // For now, implementing as per Prisma's delete
    // Be cautious with cascading deletes if defined in schema
    return prisma.user.delete({
      where: { id },
    });
  }

  // Helper to count users by email or phone (for uniqueness checks)
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
