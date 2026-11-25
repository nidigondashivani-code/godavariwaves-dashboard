import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import envConfig from './config/env.config';
import apiRoutes from './routes';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';

export const createApp = () => {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Allow requests with no origin (mobile apps, server-to-server, curl)
        if (!requestOrigin) return callback(null, true);

        const allowedOrigins = [
          envConfig.clientUrl,
          'http://localhost:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5173',
        ];

        if (
          !envConfig.clientUrl ||
          envConfig.clientUrl === '*' ||
          allowedOrigins.includes(requestOrigin) ||
          requestOrigin.endsWith('.vercel.app') ||
          requestOrigin.includes('localhost') ||
          requestOrigin.includes('127.0.0.1')
        ) {
          return callback(null, true);
        }

        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.use('/api', apiRateLimiter);

  // Serve uploaded attachments
  app.use('/uploads', express.static(envConfig.uploadDir));

  // Primary versioned API routes
  app.use('/api/v1', apiRoutes);

  // 404 fallback for unknown API endpoints
  app.use('/api', (_req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
