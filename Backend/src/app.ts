import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';

import { env } from '@/config/environment';
import { logger } from '@/config/logger.config'; 
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
// import authRoutes from '@/modules/auth/auth.routes'; //

const app: Express = express();

app.use(pinoHttp({ logger }));


app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet());

app.use(express.json({ limit: '10mb' })); 

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


app.use(notFoundHandler);


app.use(errorHandler);

export default app;
