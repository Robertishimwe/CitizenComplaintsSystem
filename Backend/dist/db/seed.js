"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminUser = void 0;
// src/db/seed.ts
const prisma_1 = __importDefault(require("@/config/prisma"));
const environment_1 = require("@/config/environment");
const logger_config_1 = require("@/config/logger.config");
const client_1 = require("@prisma/client"); // Or from your enums if defined locally
const password_utils_1 = require("@/utils/password.utils");
const seedAdminUser = async () => {
    // Optional: Only run seeder in development environment
    if (environment_1.env.NODE_ENV !== 'development' && environment_1.env.NODE_ENV !== 'test') {
        logger_config_1.logger.info('🌱 Admin seeder skipped in non-development environment.');
        return;
    }
    try {
        const adminEmail = environment_1.env.DEFAULT_ADMIN_EMAIL;
        const existingAdmin = await prisma_1.default.user.findUnique({
            where: { email: adminEmail },
        });
        if (existingAdmin) {
            logger_config_1.logger.info(`🌱 Admin user with email "${adminEmail}" already exists. Seeding skipped.`);
            return;
        }
        const hashedPassword = await (0, password_utils_1.hashPassword)(environment_1.env.DEFAULT_ADMIN_PASSWORD);
        const adminUser = await prisma_1.default.user.create({
            data: {
                name: environment_1.env.DEFAULT_ADMIN_NAME,
                email: adminEmail,
                phone: environment_1.env.DEFAULT_ADMIN_PHONE, // Ensure this phone is unique or handle potential conflicts
                password: hashedPassword,
                role: client_1.UserRole.ADMIN,
                status: client_1.ResourceStatus.ACTIVE,
                // No agencyId for ADMIN
            },
        });
        logger_config_1.logger.info(`🌱 Admin user "${adminUser.name}" with email "${adminUser.email}" created successfully.`);
    }
    catch (error) {
        logger_config_1.logger.error('❌ Error during admin user seeding:', error);
        // Depending on severity, you might want to throw the error to halt server startup
        // or just log it and continue. For a seeder, logging is often sufficient.
    }
};
exports.seedAdminUser = seedAdminUser;
