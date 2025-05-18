"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("@/config/prisma"));
const environment_1 = require("@/config/environment");
const ApiError_1 = require("@/utils/ApiError");
const password_utils_1 = require("@/utils/password.utils");
const user_repository_1 = require("@/modules/users/user.repository"); // For checking existing users
class AuthService {
    constructor() {
        this.userRepository = new user_repository_1.UserRepository(); // Uses the existing user repository
    }
    generateAccessToken(user) {
        const payload = {
            userId: user.id,
            role: user.role,
            // Add other necessary claims for your application
        };
        return jsonwebtoken_1.default.sign(payload, environment_1.env.JWT_SECRET, {
            expiresIn: `${environment_1.env.JWT_ACCESS_EXPIRATION_MINUTES}m`,
        });
    }
    // Helper to strip password from user object
    sanitizeUser(user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }
    async registerCitizen(dto) {
        // Check if email or phone already exists
        const existingEmailUser = await this.userRepository.findByEmail(dto.email.toLowerCase());
        if (existingEmailUser) {
            throw new ApiError_1.ApiError(409, 'User with this email already exists.');
        }
        const existingPhoneUser = await this.userRepository.findByPhone(dto.phone);
        if (existingPhoneUser) {
            throw new ApiError_1.ApiError(409, 'User with this phone number already exists.');
        }
        const hashedPassword = await (0, password_utils_1.hashPassword)(dto.password);
        const newUser = await prisma_1.default.user.create({
            data: {
                name: dto.name,
                email: dto.email.toLowerCase(),
                phone: dto.phone,
                password: hashedPassword,
                role: client_1.UserRole.CITIZEN,
                status: client_1.ResourceStatus.ACTIVE, // Or PENDING_VERIFICATION if you implement email/phone verification
            },
        });
        return this.sanitizeUser(newUser);
    }
    async login(dto) {
        const user = await this.userRepository.findByPhone(dto.phone);
        if (!user) {
            throw new ApiError_1.ApiError(401, 'Invalid phone number or password.');
        }
        if (user.status === client_1.ResourceStatus.INACTIVE) {
            throw new ApiError_1.ApiError(403, 'Your account is inactive. Please contact support.');
        }
        // Add other status checks if needed (e.g., PENDING_VERIFICATION)
        const isPasswordMatch = await (0, password_utils_1.comparePassword)(dto.password, user.password);
        if (!isPasswordMatch) {
            throw new ApiError_1.ApiError(401, 'Invalid phone number or password.');
        }
        const accessToken = this.generateAccessToken(user);
        return {
            user: this.sanitizeUser(user),
            tokens: {
                accessToken,
            },
        };
    }
    async getMe(userId) {
        const user = await this.userRepository.findById(userId); // findById should ideally not return password
        if (!user) {
            return null;
        }
        return this.sanitizeUser(user);
    }
}
exports.AuthService = AuthService;
