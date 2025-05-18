"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("./user.repository");
const ApiError_1 = require("@/utils/ApiError");
const password_utils_1 = require("@/utils/password.utils"); // We'll create this utility
const user_enums_1 = require("./enums/user.enums");
class UserService {
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
    }
    mapToUserResponse(user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async createStaffUser(dto) {
        // Check for uniqueness of email and phone
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new ApiError_1.ApiError(409, 'User with this email already exists.');
        }
        const existingPhoneUser = await this.userRepository.findByPhone(dto.phone);
        if (existingPhoneUser) {
            throw new ApiError_1.ApiError(409, 'User with this phone number already exists.');
        }
        if (dto.role === user_enums_1.UserRole.AGENCY_STAFF && !dto.agencyId) {
            throw new ApiError_1.ApiError(400, 'Agency ID is required for AGENCY_STAFF role.');
        }
        if (dto.role === user_enums_1.UserRole.ADMIN && dto.agencyId) {
            throw new ApiError_1.ApiError(400, 'Admin users cannot be assigned to an agency.');
        }
        const defaultPassword = dto.password || (0, password_utils_1.generateRandomPassword)(); // Generate if not provided
        const payload = {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            role: dto.role,
            agencyId: dto.role === user_enums_1.UserRole.AGENCY_STAFF ? dto.agencyId : undefined,
            // password will be handled by repository
        };
        const newUser = await this.userRepository.createUser(payload, defaultPassword);
        // Here you might want to send an email/SMS to the new user with their credentials
        // console.log(`New user created. Temporary Password: ${defaultPassword}`); // For dev
        return this.mapToUserResponse(newUser);
    }
    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        return user ? this.mapToUserResponse(user) : null;
    }
    async listUsers(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filters = {
            role: query.role,
            status: query.status,
            agencyId: query.agencyId,
            search: query.search,
        };
        const sorting = {
            sortBy: query.sortBy || 'createdAt',
            sortOrder: query.sortOrder || 'desc',
        };
        const { users, total } = await this.userRepository.findAll(filters, { skip, take: limit }, sorting);
        return {
            users: users.map(this.mapToUserResponse),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async updateUser(id, dto) {
        const userToUpdate = await this.userRepository.findById(id);
        if (!userToUpdate) {
            throw new ApiError_1.ApiError(404, 'User not found.');
        }
        // Uniqueness checks for email and phone if they are being changed
        if (dto.email && dto.email !== userToUpdate.email) {
            const existingUser = await this.userRepository.findByEmail(dto.email);
            if (existingUser && existingUser.id !== id) {
                throw new ApiError_1.ApiError(409, 'Another user with this email already exists.');
            }
        }
        if (dto.phone && dto.phone !== userToUpdate.phone) {
            const existingPhoneUser = await this.userRepository.findByPhone(dto.phone);
            if (existingPhoneUser && existingPhoneUser.id !== id) {
                throw new ApiError_1.ApiError(409, 'Another user with this phone number already exists.');
            }
        }
        const updatePayload = { ...dto };
        // Logic for agencyId based on role
        if (dto.role) {
            if (dto.role !== user_enums_1.UserRole.AGENCY_STAFF) {
                updatePayload.agencyId = null; // Unset agency if not staff
            }
            else if (dto.role === user_enums_1.UserRole.AGENCY_STAFF && dto.agencyId === undefined) {
                // If role becomes AGENCY_STAFF and no agencyId in DTO, keep current agencyId
                // This case needs careful handling: if agencyId is explicitly null, it means unassign.
                // If undefined, it means "don't change agencyId unless it was previously null and role is now staff".
                if (!userToUpdate.agencyId && dto.agencyId !== null) { // Explicitly null check is important
                    throw new ApiError_1.ApiError(400, 'Agency ID is required when changing role to AGENCY_STAFF if not already assigned.');
                }
                // If dto.agencyId is provided (string or null), it will be used.
                // If dto.agencyId is undefined, the repository will not change it.
            }
        }
        else if (userToUpdate.role !== user_enums_1.UserRole.AGENCY_STAFF && updatePayload.agencyId) {
            // If role is not changing but is not AGENCY_STAFF, and agencyId is provided in payload
            updatePayload.agencyId = null;
        }
        const updatedUser = await this.userRepository.updateUser(id, updatePayload);
        return updatedUser ? this.mapToUserResponse(updatedUser) : null;
    }
    async deleteUser(id) {
        // Consider implications: what happens to tickets assigned to this user?
        // Prisma schema `onDelete: SetNull` handles unlinking from tickets.
        // Business logic might require reassigning tickets before deletion or deactivation.
        // For now, using deactivation (status change) is often safer.
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new ApiError_1.ApiError(404, 'User not found');
        }
        // Soft delete by changing status
        const deactivatedUser = await this.userRepository.updateUser(id, { status: 'INACTIVE' });
        // const deletedUser = await this.userRepository.deleteUser(id); // Hard delete
        return deactivatedUser ? this.mapToUserResponse(deactivatedUser) : null;
    }
}
exports.UserService = UserService;
