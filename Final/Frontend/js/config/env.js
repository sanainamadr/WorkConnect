/**
 * Environment Configuration
 * Production-ready environment variable handling
 */

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not set
 * @returns {string|*}
 */
function getEnv(key, defaultValue = null) {
  // Check window.env first (injected by build process)
  if (typeof window !== 'undefined' && window.env && window.env[key] !== undefined) {
    return window.env[key];
  }
  
  // Check import.meta.env (Vite/ES modules)
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    if (import.meta.env[key] !== undefined) {
      return import.meta.env[key];
    }
  }
  
  // Fallback to defaultValue
  return defaultValue;
}

/**
 * Check if running in production
 * @returns {boolean}
 */
export function isProduction() {
  return getEnv('NODE_ENV', 'development') === 'production';
}

/**
 * Check if running in development
 * @returns {boolean}
 */
export function isDevelopment() {
  return !isProduction();
}

/**
 * Get API base URL from environment
 * @returns {string}
 */
export function getApiBaseUrl() {
  // In production, use environment variable or relative URL
  if (isProduction()) {
    return getEnv('VITE_API_URL') || 
           getEnv('REACT_APP_API_URL') || 
           '/api'; // Relative URL for same-domain deployment
  }
  
  // In development, use localhost
  return getEnv('VITE_API_URL', 'http://localhost:3000/api');
}

/**
 * Get Socket.IO URL from environment
 * @returns {string}
 */
export function getSocketUrl() {
  if (isProduction()) {
    return getEnv('VITE_SOCKET_URL') || 
           getEnv('REACT_APP_SOCKET_URL') || 
           window.location.origin; // Same origin for production
  }
  
  return getEnv('VITE_SOCKET_URL', 'http://localhost:3000');
}

/**
 * Get app version
 * @returns {string}
 */
export function getAppVersion() {
  return getEnv('VITE_APP_VERSION', '1.0.0');
}

/**
 * Get app name
 * @returns {string}
 */
export function getAppName() {
  return getEnv('VITE_APP_NAME', 'Skill Link');
}

/**
 * Check if debug mode is enabled
 * @returns {boolean}
 */
export function isDebugMode() {
  return getEnv('VITE_DEBUG', 'false') === 'true' || isDevelopment();
}

/**
 * Get feature flags
 * @returns {Object}
 */
export function getFeatureFlags() {
  return {
    enableAnalytics: getEnv('VITE_ENABLE_ANALYTICS', 'false') === 'true',
    enableErrorReporting: getEnv('VITE_ENABLE_ERROR_REPORTING', 'true') === 'true',
    enablePerformanceMonitoring: getEnv('VITE_ENABLE_PERFORMANCE', 'false') === 'true',
  };
}

export default {
  isProduction,
  isDevelopment,
  getApiBaseUrl,
  getSocketUrl,
  getAppVersion,
  getAppName,
  isDebugMode,
  getFeatureFlags,
};




