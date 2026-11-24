export const logger = {
  info: (message: string, meta?: unknown) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [INFO] ${message}`, meta !== undefined ? meta : '');
  },
  warn: (message: string, meta?: unknown) => {
    const ts = new Date().toISOString();
    console.warn(`[${ts}] [WARN] ${message}`, meta !== undefined ? meta : '');
  },
  error: (message: string, meta?: unknown) => {
    const ts = new Date().toISOString();
    console.error(`[${ts}] [ERROR] ${message}`, meta !== undefined ? meta : '');
  },
};

export default logger;
