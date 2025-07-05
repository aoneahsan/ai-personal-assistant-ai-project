import ENV_KEYS from '@/utils/envKeys';
import { io, Socket } from 'socket.io-client';

let socketIoObj: Socket | null = null;

export const connectToSocketIoServer = () => {
  if (!ENV_KEYS.socketIoServerUrl) return;

  if (!socketIoObj || !socketIoObj.connected || !socketIoObj.id) {
    socketIoObj = io(ENV_KEYS.socketIoServerUrl, { transports: ['websocket'] });

    if (socketIoObj) {
      socketIoObj.on('connect', () => {
        // Socket connected successfully
      });
    }

    return socketIoObj;
  } else {
    return socketIoObj;
  }
};

export const getSocketIoInstance = () => {
  return socketIoObj;
};
