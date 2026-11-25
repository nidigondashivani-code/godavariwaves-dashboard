import http from 'http';
import app from './app';
import envConfig from './config/env.config';
import { initializeDatabase } from './database';
import { initSocketServer } from './config/socket.config';
import registerSocketHandlers from './socket';
import { logger } from './utils/logger.util';
import initAllCronJobs from './cron';

const startServer = async () => {
  try {
    await initializeDatabase();
    initAllCronJobs();

    const httpServer = http.createServer(app);
    const io = initSocketServer(httpServer);
    registerSocketHandlers(io);

    httpServer.listen(envConfig.port, () => {
      logger.info(`Godavari Wave EMS Backend listening on http://localhost:${envConfig.port}`);
      logger.info(`API Base URL: http://localhost:${envConfig.port}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start backend server:', error);
    process.exit(1);
  }
};

startServer();
