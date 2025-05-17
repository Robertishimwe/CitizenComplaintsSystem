// src/modules/users/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { CreateStaffUserDto, UpdateUserDto, ListUsersQueryDto, UpdateUserParamsDto } from './dto';
import catchAsync from '@/utils/catchAsync'; // Assumed utility
import { ApiError } from '@/utils/ApiError';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createStaffUser = catchAsync(async (req: Request, res: Response) => {
    const dto: CreateStaffUserDto = req.body;
    const newUser = await this.userService.createStaffUser(dto);
    res.status(201).json({
      status: 'success',
      message: 'Staff user created successfully. Credentials might be sent separately.',
      data: newUser,
    });
  });

  getUserById = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    res.status(200).json({
      status: 'success',
      data: user,
    });
  });

  listUsers = catchAsync(async (req: Request, res: Response) => {
    // const query = req.query as ListUsersQueryDto; // Type assertion, validation handles structure
    const query = req.query as unknown as ListUsersQueryDto;
    const result = await this.userService.listUsers(query);
    res.status(200).json({
      status: 'success',
      data: result.users,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  });

  updateUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params as UpdateUserParamsDto;
    const dto: UpdateUserDto = req.body;
    const updatedUser = await this.userService.updateUser(userId, dto);
    if (!updatedUser) {
      throw new ApiError(404, 'User not found or no changes made'); // Or handle "no changes" differently
    }
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: updatedUser,
    });
  });

  deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    // The service now deactivates instead of deleting.
    const deactivatedUser = await this.userService.deleteUser(userId);
    if (!deactivatedUser) {
        throw new ApiError(404, 'User not found');
    }
    res.status(200).json({
      status: 'success',
      message: 'User deactivated successfully.', // Changed message
      data: deactivatedUser
    });
  });
}
