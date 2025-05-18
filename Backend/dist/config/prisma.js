"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const environment_1 = require("./environment"); // Assuming environment.ts exports `env`
// Initialize Prisma Client
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: environment_1.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
exports.default = prisma;
if (environment_1.env.NODE_ENV !== 'production')
    globalThis.prismaGlobal = prisma;
/**
 * This setup ensures that in development, you don't create a new PrismaClient
 * instance every time your code reloads (due to HMR or similar).
 * In production, it will always create a new instance.
 */ 
