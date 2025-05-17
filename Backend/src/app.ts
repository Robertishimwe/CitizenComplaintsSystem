// src/app.ts (simplified)
import express from 'express';
import { protect } from '@/middleware/auth.middleware';
import { errorHandler } from '@/middleware/error.middleware';
import { notFoundHandler } from '@/middleware/notFound.middleware';
import { env } from '@/config/environment';
import logger from '@/config/logger.config'; // Morgan can also be used for HTTP request logging
import pinoHttp from 'pino-http';


// Example Router
// import authRoutes from '@/modules/auth/auth.routes';
// import ticketRoutes from '@/modules/tickets/ticket.routes';

const app = express();

// Request logging (Pino HTTP)
app.use(pinoHttp({ logger }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply JWT authentication globally (or selectively on routes)
// If applied globally, req.user will be populated if token is valid.
// Public routes won't fail if no token, but req.user will be undefined.
app.use(protect);

// Mount your routes
// app.use(`${env.API_PREFIX}/auth`, authRoutes);
// app.use(`${env.API_PREFIX}/tickets`, ticketRoutes);
// ... other routes

// Handle 404 Not Found for any unhandled routes
app.use(notFoundHandler);

// Global error handler (should be the last middleware)
app.use(errorHandler);

export default app;