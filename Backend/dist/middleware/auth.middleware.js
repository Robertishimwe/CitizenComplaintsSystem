"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("@/config/environment"); // Use path alias or relative path
const ApiError_1 = require("@/utils/ApiError");
const prisma_1 = __importDefault(require("@/config/prisma"));
const user_enums_1 = require("@/modules/users/enums/user.enums");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Allow access if no token is present, for public routes
    // Specific routes needing auth should call protect first.
    // If you want to enforce auth on all routes by default and only allow some public,
    // then this logic should throw an error if no token.
    // For this system, some routes (like view anonymous ticket) are public.
    if (!token) {
        // If a route explicitly requires authentication and no token is found,
        // it should be handled by the route or a subsequent middleware.
        // Or, you can throw an error here if the expectation is that `protect` always means "must be authenticated".
        // For now, let's assume if a token exists, we validate it. If not, `req.user` remains undefined.
        // Routes that NEED a user will check for `req.user`.
        return next(); // Proceed, req.user will be undefined
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.env.JWT_SECRET);
        const currentUser = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId, status: user_enums_1.ResourceStatus.ACTIVE },
        });
        if (!currentUser) {
            return next(new ApiError_1.ApiError(401, 'User belonging to this token no longer exists or is inactive.'));
        }
        // Attach user to the request object
        req.user = currentUser;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new ApiError_1.ApiError(401, 'Token expired, please log in again.'));
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new ApiError_1.ApiError(401, 'Invalid token, please log in again.'));
        }
        return next(new ApiError_1.ApiError(401, 'Not authorized, token failed.'));
    }
};
exports.protect = protect;
// Middleware to ensure a user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return next(new ApiError_1.ApiError(401, 'Authentication required. Please log in.'));
    }
    next();
};
exports.requireAuth = requireAuth;
