/**
 * Console Helper - Centralized logging with environment-based controls
 */

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown[];
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  addLog(level: LogLevel, message: string, data?: unknown[]) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

const logger = Logger.getInstance();

export const consoleError = (message: string, ...data: unknown[]): void => {
  logger.addLog(LogLevel.ERROR, message, data);
  console.error(`[ERROR] ${message}`, ...data);
};

export const consoleLog = (message: string, ...data: unknown[]): void => {
  if (isDevelopment) {
    logger.addLog(LogLevel.INFO, message, data);
  }
  console.log(`[LOG] ${message}`, ...data);
};

export const consoleWarn = (message: string, ...data: unknown[]): void => {
  logger.addLog(LogLevel.WARN, message, data);
  if (!isProduction) {
    console.warn(`[WARN] ${message}`, ...data);
  }
};

export const consoleInfo = (message: string, ...data: unknown[]): void => {
  logger.addLog(LogLevel.INFO, message, data);
  if (!isProduction) {
    console.info(`[INFO] ${message}`, ...data);
  }
};

export const consoleDebug = (message: string, ...data: unknown[]): void => {
  logger.addLog(LogLevel.DEBUG, message, data);
  if (isDevelopment) {
    console.debug(`[DEBUG] ${message}`, ...data);
  }
};

export const consoleDir = (...data: unknown[]) => {
  if (!isProduction) {
    console.dir(...data);
  }
};

// Console log with object support
export const consoleLogObject = (obj: Record<string, unknown>): void => {
  const message = 'Object logged';
  logger.addLog(LogLevel.INFO, message, [obj]);
  console.log(`[OBJECT] ${JSON.stringify(obj, null, 2)}`);
};

// Utility functions to manage logs
export const getLogs = (): LogEntry[] => logger.getLogs();
export const clearLogs = (): void => logger.clearLogs();
export const exportLogs = (): string => logger.exportLogs();

// Default export for easy importing
export default {
  error: consoleError,
  log: consoleLog,
  warn: consoleWarn,
  info: consoleInfo,
  debug: consoleDebug,
  dir: consoleDir,
  object: consoleLogObject,
  getLogs,
  clearLogs,
  exportLogs,
};
