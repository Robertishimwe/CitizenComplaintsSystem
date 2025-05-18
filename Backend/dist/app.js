"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const pino_http_1 = __importDefault(require("pino-http"));
const environment_1 = require("@/config/environment");
const logger_config_1 = require("@/config/logger.config"); // Use the named export
const auth_middleware_1 = require("@/middleware/auth.middleware");
const error_middleware_1 = require("@/middleware/error.middleware");
const notFound_middleware_1 = require("@/middleware/notFound.middleware");
// Import Routers
const user_routes_1 = __importDefault(require("@/modules/users/user.routes"));
const auth_routes_1 = __importDefault(require("@/modules/auth/auth.routes"));
const agency_routes_1 = __importDefault(require("@/modules/agencies/agency.routes"));
const ticket_routes_1 = __importDefault(require("@/modules/tickets/ticket.routes"));
const category_routes_1 = __importDefault(require("@/modules/categories/category.routes"));
const routing_rule_routes_1 = __importDefault(require("@/modules/routingRules/routing-rule.routes"));
// import authRoutes from '@/modules/auth/auth.routes'; // Will be added later
const app = (0, express_1.default)();
// Setup common HTTP request logging with Pino
// This should be one of the first middleware
app.use((0, pino_http_1.default)({ logger: logger_config_1.logger }));
// Enable CORS - Cross-Origin Resource Sharing
// Configure this more strictly for production
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for now, restrict in production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Set security-related HTTP headers
app.use((0, helmet_1.default)());
// Parse JSON request bodies
app.use(express_1.default.json({ limit: '10mb' })); // Adjust limit as needed
// Parse URL-encoded request bodies
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Gzip compression
app.use((0, compression_1.default)());
// Global JWT authentication middleware
// Populates req.user if token is valid. Routes can then use requireAuth or authorize.
app.use(auth_middleware_1.protect);
// API Routes
app.get('/', (req, res) => {
    res.status(200).send({
        message: `Welcome to Citizen Engagement API - ${environment_1.env.NODE_ENV} environment!`,
        health: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
app.use('/users', user_routes_1.default);
app.use('/auth', auth_routes_1.default);
app.use('/agencies', agency_routes_1.default);
app.use('/tickets', ticket_routes_1.default);
app.use('/categories', category_routes_1.default);
app.use('/routing-rules', routing_rule_routes_1.default);
// app.use(`${env.API_PREFIX}/auth`, authRoutes); // To be added
// Handle 404 Not Found for any unhandled routes
// This should be after all your routes
app.use(notFound_middleware_1.notFoundHandler);
// Global error handler
// This must be the last piece of middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
