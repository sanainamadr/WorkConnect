/**
 * Global Error Handler
 * Production-ready error handling and reporting
 */

import { logger } from './logger.js';
import { isProduction } from '../config/env.js';

/**
 * Error types
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Error handler class
 */
class ErrorHandler {
  /**
   * Handle and format errors
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   * @returns {Object} Formatted error
   */
  handle(error, context = 'Unknown') {
    const errorInfo = {
      type: this.getErrorType(error),
      message: this.getErrorMessage(error),
      context,
      timestamp: new Date().toISOString(),
      stack: isProduction() ? undefined : error.stack,
    };
    
    // Log error
    logger.error(`[${context}]`, errorInfo);
    
    // Report to monitoring service in production
    if (isProduction()) {
      this.reportError(errorInfo);
    }
    
    return errorInfo;
  }
  
  /**
   * Get error type
   * @param {Error} error - Error object
   * @returns {string}
   */
  getErrorType(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return ErrorTypes.NETWORK;
    }
    if (error.status === 401 || error.status === 403) {
      return ErrorTypes.AUTH;
    }
    if (error.status >= 400 && error.status < 500) {
      return ErrorTypes.VALIDATION;
    }
    if (error.status >= 500) {
      return ErrorTypes.API;
    }
    return ErrorTypes.UNKNOWN;
  }
  
  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string}
   */
  getErrorMessage(error) {
    // Network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return isProduction() 
        ? 'Unable to connect to server. Please check your internet connection.'
        : 'Network error: Unable to connect to server.';
    }
    
    // API errors with messages
    if (error.message) {
      return error.message;
    }
    
    // Status-based messages
    if (error.status === 401) {
      return 'Your session has expired. Please login again.';
    }
    if (error.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.status === 500) {
      return isProduction()
        ? 'An error occurred on the server. Please try again later.'
        : 'Server error: ' + error.message;
    }
    
    // Default message
    return isProduction()
      ? 'An unexpected error occurred. Please try again.'
      : error.message || 'Unknown error occurred';
  }
  
  /**
   * Report error to monitoring service
   * @param {Object} errorInfo - Error information
   */
  reportError(errorInfo) {
    // Integrate with error reporting service (Sentry, LogRocket, etc.)
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(errorInfo.message), {
    //     tags: { type: errorInfo.type, context: errorInfo.context },
    //     extra: errorInfo
    //   });
    // }
    
    // For now, just log (can be replaced with actual service)
    logger.error('[ERROR REPORT]', errorInfo);
  }
  
  /**
   * Show user-friendly error message
   * @param {Error} error - Error object
   * @param {string} context - Context
   */
  showError(error, context = 'Unknown') {
    const errorInfo = this.handle(error, context);
    const message = errorInfo.message;
    
    // Show alert or toast notification
    // In production, use a toast library instead of alert
    if (isProduction()) {
      // Use toast notification library
      this.showToast(message, 'error');
    } else {
      // In development, use alert for debugging
      alert(`Error: ${message}`);
    }
  }
  
  /**
   * Show toast notification (placeholder - integrate with toast library)
   * @param {string} message - Message to show
   * @param {string} type - Type (error, success, warning, info)
   */
  showToast(message, type = 'error') {
    // Integrate with your toast library (e.g., react-toastify, vue-toastification)
    // For now, use a simple implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-black' :
      'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Set up global error handlers
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handle(event.reason, 'Unhandled Promise Rejection');
  });
  
  // Handle general errors
  window.addEventListener('error', (event) => {
    errorHandler.handle(event.error || new Error(event.message), 'Global Error Handler');
  });
}

export default errorHandler;




