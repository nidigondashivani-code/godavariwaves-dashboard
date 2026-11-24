import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import envConfig from './env.config';

let ioInstance: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: [envConfig.clientUrl, 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
      credentials: true,
    },
  });
  return ioInstance;
};

export const getIO = (): SocketIOServer | null => ioInstance;

export default { initSocketServer, getIO };
