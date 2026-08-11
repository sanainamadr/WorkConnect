/**
 * Booking Service
 * API service for booking operations
 */

import apiClient from './api-client.js';
import { getEndpoint } from '../config/api.js';

export const bookingService = {
  /**
   * Create booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>}
   */
  async create(bookingData) {
    return apiClient.post(getEndpoint('BOOKING', 'CREATE'), bookingData);
  },

  /**
   * Get bookings
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  async getBookings(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = getEndpoint('BOOKING', 'LIST') + (queryParams ? `?${queryParams}` : '');
    return apiClient.get(endpoint);
  },

  /**
   * Get booking details
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>}
   */
  async getDetails(bookingId) {
    return apiClient.get(getEndpoint('BOOKING', 'DETAIL')(bookingId));
  },

  /**
   * Update booking status
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  async updateStatus(bookingId, status) {
    return apiClient.patch(getEndpoint('BOOKING', 'UPDATE_STATUS')(bookingId), { status });
  },

  /**
   * Get employer bookings
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  async getEmployerBookings(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = getEndpoint('BOOKING', 'EMPLOYER_BOOKINGS') + (queryParams ? `?${queryParams}` : '');
    return apiClient.get(endpoint);
  },

  /**
   * Get worker bookings
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  async getWorkerBookings(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = getEndpoint('BOOKING', 'WORKER_BOOKINGS') + (queryParams ? `?${queryParams}` : '');
    return apiClient.get(endpoint);
  }
};




