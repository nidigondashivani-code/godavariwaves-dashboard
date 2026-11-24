import { Server as SocketIOServer } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.util';
import { logger } from '../utils/logger.util';

export const registerSocketHandlers = (io: SocketIOServer): void => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next();
    try {
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
    } catch {
      // Allow connection but unauthenticated room join skipped
    }
    next();
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    if (user?.userId) {
      socket.join(`user_${user.userId}`);
      if (user.role === 'Admin' || user.role === 'HR') {
        socket.join('admins');
      }
      logger.info(`Socket connected: user_${user.userId}`);
    }

    socket.on('disconnect', () => {
      // Cleanup handled automatically by Socket.IO
    });
  });
};

export default registerSocketHandlers;
