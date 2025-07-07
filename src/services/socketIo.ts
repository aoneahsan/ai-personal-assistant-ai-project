import ENV_KEYS from '@/utils/envKeys';
import { consoleError, consoleLog, consoleWarn } from '@/utils/helpers/consoleHelper';
import { logError, logInfo } from '@/sentryErrorLogging';
import { io, Socket } from 'socket.io-client';

interface SocketIoState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastError: string | null;
}

let socketIoObj: Socket | null = null;
let socketState: SocketIoState = {
  isConnected: false,
  isConnecting: false,
  reconnectAttempts: 0,
  lastError: null,
};

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000; // 2 seconds
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

export const connectToSocketIoServer = (): Socket | null => {
  if (!ENV_KEYS.socketIoServerUrl) {
    consoleWarn('SocketIO server URL not configured');
    return null;
  }

  if (socketIoObj && socketIoObj.connected) {
    consoleLog('SocketIO already connected');
    return socketIoObj;
  }

  if (socketState.isConnecting) {
    consoleLog('SocketIO connection already in progress');
    return socketIoObj;
  }

  try {
    socketState.isConnecting = true;
    consoleLog('Connecting to SocketIO server:', ENV_KEYS.socketIoServerUrl);

    socketIoObj = io(ENV_KEYS.socketIoServerUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionDelayMax: MAX_RECONNECT_DELAY,
      maxReconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    });

    setupSocketEventHandlers(socketIoObj);

    return socketIoObj;
  } catch (error) {
    consoleError('Error creating SocketIO connection:', error);
    logError(error instanceof Error ? error : new Error('SocketIO connection creation failed'), {
      serverUrl: ENV_KEYS.socketIoServerUrl,
      errorType: 'socketio_creation_error',
    });
    
    socketState.isConnecting = false;
    socketState.lastError = error instanceof Error ? error.message : 'Unknown error';
    return null;
  }
};

const setupSocketEventHandlers = (socket: Socket) => {
  socket.on('connect', () => {
    consoleLog('SocketIO connected successfully', { socketId: socket.id });
    logInfo('SocketIO connected', { socketId: socket.id });
    
    socketState.isConnected = true;
    socketState.isConnecting = false;
    socketState.reconnectAttempts = 0;
    socketState.lastError = null;
  });

  socket.on('disconnect', (reason) => {
    consoleWarn('SocketIO disconnected:', reason);
    logInfo('SocketIO disconnected', { reason });
    
    socketState.isConnected = false;
    socketState.isConnecting = false;
  });

  socket.on('connect_error', (error) => {
    socketState.reconnectAttempts++;
    const errorMessage = error instanceof Error ? error.message : 'Connection failed';
    
    consoleError(`SocketIO connection error (attempt ${socketState.reconnectAttempts}):`, error);
    logError(error instanceof Error ? error : new Error('SocketIO connection error'), {
      attempt: socketState.reconnectAttempts,
      maxAttempts: MAX_RECONNECT_ATTEMPTS,
      errorType: 'socketio_connection_error',
    });
    
    socketState.isConnecting = false;
    socketState.lastError = errorMessage;

    if (socketState.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      consoleError('SocketIO max reconnection attempts reached');
      logError(new Error('SocketIO max reconnection attempts reached'), {
        totalAttempts: socketState.reconnectAttempts,
        errorType: 'socketio_max_reconnects_exceeded',
      });
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    consoleLog(`SocketIO reconnected after ${attemptNumber} attempts`);
    logInfo('SocketIO reconnected', { attemptNumber });
    
    socketState.isConnected = true;
    socketState.isConnecting = false;
    socketState.reconnectAttempts = 0;
    socketState.lastError = null;
  });

  socket.on('reconnect_error', (error) => {
    consoleError('SocketIO reconnection error:', error);
    logError(error instanceof Error ? error : new Error('SocketIO reconnection error'), {
      attempt: socketState.reconnectAttempts,
      errorType: 'socketio_reconnection_error',
    });
  });

  socket.on('reconnect_failed', () => {
    consoleError('SocketIO reconnection failed - all attempts exhausted');
    logError(new Error('SocketIO reconnection failed'), {
      totalAttempts: socketState.reconnectAttempts,
      errorType: 'socketio_reconnection_failed',
    });
    
    socketState.isConnecting = false;
    socketState.lastError = 'Reconnection failed';
  });
};

export const getSocketIoInstance = (): Socket | null => {
  return socketIoObj;
};

export const getSocketState = (): SocketIoState => {
  return { ...socketState };
};

export const disconnectSocketIo = (): void => {
  if (socketIoObj) {
    consoleLog('Disconnecting SocketIO');
    socketIoObj.disconnect();
    socketIoObj = null;
    socketState.isConnected = false;
    socketState.isConnecting = false;
  }
};

export const reconnectSocketIo = (): void => {
  if (socketIoObj && !socketState.isConnected && !socketState.isConnecting) {
    consoleLog('Manually reconnecting SocketIO');
    socketState.isConnecting = true;
    socketIoObj.connect();
  } else {
    consoleLog('Creating new SocketIO connection');
    disconnectSocketIo();
    connectToSocketIoServer();
  }
};
