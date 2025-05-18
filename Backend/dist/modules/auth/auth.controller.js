"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const catchAsync_1 = __importDefault(require("@/utils/catchAsync"));
const ApiError_1 = require("@/utils/ApiError"); // If needed for direct error throwing
class AuthController {
    constructor() {
        this.registerCitizen = (0, catchAsync_1.default)(async (req, res) => {
            const dto = req.body;
            const newUser = await this.authService.registerCitizen(dto);
            res.status(201).json({
                status: 'success',
                message: 'Citizen registered successfully.',
                data: newUser,
            });
        });
        this.login = (0, catchAsync_1.default)(async (req, res) => {
            const dto = req.body;
            const loginResponse = await this.authService.login(dto);
            res.status(200).json({
                status: 'success',
                message: 'Login successful.',
                data: loginResponse,
            });
        });
        this.getMe = (0, catchAsync_1.default)(async (req, res) => {
            // req.user is populated by the `protect` or `requireAuth` middleware
            if (!req.user) {
                // This should ideally be caught by requireAuth middleware if used before this handler
                throw new ApiError_1.ApiError(401, 'User not authenticated');
            }
            // The authService.getMe can re-fetch or use req.user data
            // Re-fetching ensures fresh data, using req.user is faster but might be stale if not updated on every request
            const userProfile = await this.authService.getMe(req.user.id);
            if (!userProfile) {
                throw new ApiError_1.ApiError(404, 'User profile not found.'); // Should not happen if req.user exists
            }
            res.status(200).json({
                status: 'success',
                data: userProfile,
            });
        });
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
