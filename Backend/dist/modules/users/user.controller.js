"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const catchAsync_1 = __importDefault(require("@/utils/catchAsync")); // Assumed utility
const ApiError_1 = require("@/utils/ApiError");
class UserController {
    constructor() {
        this.createStaffUser = (0, catchAsync_1.default)(async (req, res) => {
            const dto = req.body;
            const newUser = await this.userService.createStaffUser(dto);
            res.status(201).json({
                status: 'success',
                message: 'Staff user created successfully. Credentials might be sent separately.',
                data: newUser,
            });
        });
        this.getUserById = (0, catchAsync_1.default)(async (req, res) => {
            const { userId } = req.params;
            const user = await this.userService.getUserById(userId);
            if (!user) {
                throw new ApiError_1.ApiError(404, 'User not found');
            }
            res.status(200).json({
                status: 'success',
                data: user,
            });
        });
        this.listUsers = (0, catchAsync_1.default)(async (req, res) => {
            // const query = req.query as ListUsersQueryDto; // Type assertion, validation handles structure
            const query = req.query;
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
        this.updateUser = (0, catchAsync_1.default)(async (req, res) => {
            const { userId } = req.params;
            const dto = req.body;
            const updatedUser = await this.userService.updateUser(userId, dto);
            if (!updatedUser) {
                throw new ApiError_1.ApiError(404, 'User not found or no changes made'); // Or handle "no changes" differently
            }
            res.status(200).json({
                status: 'success',
                message: 'User updated successfully',
                data: updatedUser,
            });
        });
        this.deleteUser = (0, catchAsync_1.default)(async (req, res) => {
            const { userId } = req.params;
            // The service now deactivates instead of deleting.
            const deactivatedUser = await this.userService.deleteUser(userId);
            if (!deactivatedUser) {
                throw new ApiError_1.ApiError(404, 'User not found');
            }
            res.status(200).json({
                status: 'success',
                message: 'User deactivated successfully.', // Changed message
                data: deactivatedUser
            });
        });
        this.userService = new user_service_1.UserService();
    }
}
exports.UserController = UserController;
