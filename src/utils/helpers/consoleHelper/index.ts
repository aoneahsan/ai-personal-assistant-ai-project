/**
 * Console Helper - Centralized logging with environment-based controls
 */

const isProduction = import.meta.env.PROD;

export const consoleError = (message: string, ...data: unknown[]): void => {
  if (isProduction) return;
  console.error(message, ...data);
};

export const consoleLog = (message: string, ...data: unknown[]): void => {
  console.log(message, ...data);
};

export const consoleWarn = (message: string, ...data: unknown[]): void => {
  if (isProduction) return;
  console.warn(message, ...data);
};

export const consoleInfo = (message: string, ...data: unknown[]): void => {
  if (isProduction) return;
  console.info(message, ...data);
};

export const consoleDebug = (message: string, ...data: unknown[]): void => {
  console.debug(message, ...data);
};

export const consoleDir = (...data: unknown[]) => {
  if (isProduction) return;
  console.dir(...data);
};

// Console log with object support
export const consoleLogObject = (obj: Record<string, unknown>): void => {
  console.log(JSON.stringify(obj, null, 2));
};
