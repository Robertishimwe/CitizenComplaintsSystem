// src/app.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';

import { env } from '@/config/environment';
import { logger } from '@/config/logger.config'; // Use the named export
import { protect } from '@/middleware/auth.middleware';
import { errorHandler } from '@/middleware/error.middleware';
import { notFoundHandler } from '@/middleware/notFound.middleware';
import { ApiError } from '@/utils/ApiError';

// Import Routers
import userRoutes from '@/modules/users/user.routes';
import authRoutes from '@/modules/auth/auth.routes';
import agencyRoutes from '@/modules/agencies/agency.routes';
import ticketRoutes from '@/modules/tickets/ticket.routes';
import categoryRoutes from '@/modules/categories/category.routes';
import routingRuleRoutes from '@/modules/routingRules/routing-rule.routes';
// import authRoutes from '@/modules/auth/auth.routes'; // Will be added later

const app: Express = express();

// Setup common HTTP request logging with Pino
// This should be one of the first middleware
app.use(pinoHttp({ logger }));

// Enable CORS - Cross-Origin Resource Sharing
// Configure this more strictly for production
app.use(cors({
  origin: '*', // Allow all origins for now, restrict in production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Set security-related HTTP headers
app.use(helmet());

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' })); // Adjust limit as needed

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Gzip compression
app.use(compression());

// Global JWT authentication middleware
// Populates req.user if token is valid. Routes can then use requireAuth or authorize.
app.use(protect);

// API Routes
app.get('/', (req: Request, res: Response) => {
  res.status(200).send({
    message: `Welcome to Citizen Engagement API - ${env.NODE_ENV} environment!`,
    health: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/agencies', agencyRoutes);
app.use('/tickets', ticketRoutes);
app.use('/categories', categoryRoutes);
app.use('/routing-rules', routingRuleRoutes);

// app.use(`${env.API_PREFIX}/auth`, authRoutes); // To be added

// Handle 404 Not Found for any unhandled routes
// This should be after all your routes
app.use(notFoundHandler);

// Global error handler
// This must be the last piece of middleware
app.use(errorHandler);

export default app;