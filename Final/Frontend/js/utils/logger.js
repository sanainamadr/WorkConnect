/**
 * Production-Ready Logger
 * Console logging that respects environment
 */

import { isProduction, isDebugMode } from '../config/env.js';

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = isProduction() ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;

/**
 * Base logger function
 */
function log(level, message, ...args) {
  // In production, only log errors and warnings
  if (isProduction() && level > LOG_LEVELS.WARN) {
    return;
  }
  
  // In debug mode, log everything
  if (!isDebugMode() && level > LOG_LEVELS.INFO) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}]`;
  
  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(prefix, message, ...args);
      // In production, send to error reporting service
      if (isProduction()) {
        reportError(message, args);
      }
      break;
    case LOG_LEVELS.WARN:
      console.warn(prefix, message, ...args);
      break;
    case LOG_LEVELS.INFO:
      console.info(prefix, message, ...args);
      break;
    case LOG_LEVELS.DEBUG:
      console.debug(prefix, message, ...args);
      break;
  }
}

/**
 * Report error to monitoring service (Sentry, etc.)
 */
function reportError(message, args) {
  // Only in production
  if (!isProduction()) return;
  
  // Check if error reporting is enabled
  const errorReportingEnabled = window.env?.VITE_ENABLE_ERROR_REPORTING !== 'false';
  if (!errorReportingEnabled) return;
  
  // Here you would integrate with Sentry, LogRocket, etc.
  // Example:
  // if (window.Sentry) {
  //   window.Sentry.captureException(new Error(message), { extra: args });
  // }
  
  // For now, just log to console in production (can be replaced with actual service)
  console.error('[ERROR REPORT]', message, args);
}

/**
 * Logger object with methods
 */
export const logger = {
  error: (message, ...args) => log(LOG_LEVELS.ERROR, message, ...args),
  warn: (message, ...args) => log(LOG_LEVELS.WARN, message, ...args),
  info: (message, ...args) => log(LOG_LEVELS.INFO, message, ...args),
  debug: (message, ...args) => log(LOG_LEVELS.DEBUG, message, ...args),
};

export default logger;




