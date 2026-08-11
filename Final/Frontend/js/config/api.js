/**
 * API Configuration
 * Centralized configuration for all API endpoints
 * Production-ready with environment variable support
 */

import { getApiBaseUrl, getSocketUrl, isProduction } from './env.js';

const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: "/auth/login",
      SIGNUP: "/auth/signup",
      LOGOUT: "/auth/logout",
      VERIFY: "/auth/verify",
      PROFILE: "/auth/profile",
      SEND_OTP: "/auth/send-otp",
      VERIFY_OTP: "/auth/verify-otp",
      UPLOAD_AADHAAR: "/auth/upload-aadhaar"
    },
    // Worker endpoints
    WORKER: {
      DASHBOARD: "/worker/dashboard",
      JOBS: "/worker/jobs",
      JOB_DETAIL: (id) => `/worker/jobs/${id}`,
      APPLY: (id) => `/worker/jobs/${id}/apply`,
      APPLICATIONS: "/worker/applications",
      APPLICATION_DETAIL: (id) => `/worker/applications/${id}`,
      NOTIFICATIONS: "/worker/notifications",
      AVAILABILITY: "/worker/availability",
      BOOKINGS: "/worker/bookings",
      EARNINGS: "/worker/earnings",
      AVAILABILITY_CHECK: (id, date) => `/workers/${id}/availability?date=${date}`
    },
    // Employer endpoints
    EMPLOYER: {
      DASHBOARD: "/employer/dashboard",
      JOBS: "/employer/jobs",
      JOB_DETAIL: (id) => `/employer/jobs/${id}`,
      CREATE_JOB: "/employer/jobs",
      UPDATE_JOB: (id) => `/employer/jobs/${id}`,
      DELETE_JOB: (id) => `/employer/jobs/${id}`,
      JOB_APPLICANTS: (id) => `/employer/jobs/${id}/applicants`,
      JOB_RECOMMENDATIONS: (id) => `/employer/jobs/${id}/recommendations`,
      APPLICATION_DETAIL: (id) => `/employer/applications/${id}`,
      UPDATE_APPLICATION_STATUS: (id) => `/employer/applications/${id}/status`
    },
    // Booking endpoints
    BOOKING: {
      CREATE: "/bookings",
      LIST: "/bookings",
      DETAIL: (id) => `/bookings/${id}`,
      UPDATE_STATUS: (id) => `/bookings/${id}/status`,
      EMPLOYER_BOOKINGS: "/bookings/employer",
      WORKER_BOOKINGS: "/bookings/worker"
    },
    // Services endpoints
    SERVICES: {
      LIST: "/services",
      BY_SLUG: (slug) => `/services/${slug}`,
      JOB_BY_SLUG: (slug) => `/services/job/${slug}`
    },
    // Messages endpoints
    MESSAGES: {
      LIST: "/messages",
      CONVERSATION: (id) => `/messages/conversation/${id}`,
      SEND: "/messages/send"
    },
    // Stats endpoints
    STATS: {
      HOME: "/stats/home"
    },
    // Health check
    HEALTH: "/health"
  },
  // Socket.IO configuration
  SOCKET: {
    URL: getSocketUrl(),
    OPTIONS: {
      transports: isProduction() ? ["websocket"] : ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: isProduction() ? 10 : 5,
      timeout: isProduction() ? 20000 : 10000,
      forceNew: false,
      upgrade: true
    }
  }
};

/**
 * Build full API URL
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full URL
 */
export function getApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Get API endpoint by key path
 * @param {...string} keys - Path to endpoint (e.g., 'AUTH', 'LOGIN')
 * @returns {string} Endpoint path
 */
export function getEndpoint(...keys) {
  let current = API_CONFIG.ENDPOINTS;
  for (const key of keys) {
    if (current[key] === undefined) {
      throw new Error(`Endpoint not found: ${keys.join('.')}`);
    }
    current = current[key];
  }
  return typeof current === 'function' ? current : current;
}

export default API_CONFIG;

