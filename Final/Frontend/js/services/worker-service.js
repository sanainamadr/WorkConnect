/**
 * Worker Service
 * API service for worker-related operations
 */

import apiClient from './api-client.js';
import { getEndpoint } from '../config/api.js';

export const workerService = {
  /**
   * Get worker dashboard
   * @returns {Promise<Object>}
   */
  async getDashboard() {
    return apiClient.get(getEndpoint('WORKER', 'DASHBOARD'));
  },

  /**
   * Get available jobs
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  async getJobs(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = getEndpoint('WORKER', 'JOBS') + (queryParams ? `?${queryParams}` : '');
    return apiClient.get(endpoint);
  },

  /**
   * Get job details
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>}
   */
  async getJobDetails(jobId) {
    return apiClient.get(getEndpoint('WORKER', 'JOB_DETAIL')(jobId));
  },

  /**
   * Apply to job
   * @param {string} jobId - Job ID
   * @param {Object} applicationData - Application data
   * @param {string} applicationData.coverLetter - Cover letter
   * @returns {Promise<Object>}
   */
  async applyToJob(jobId, applicationData) {
    return apiClient.post(getEndpoint('WORKER', 'APPLY')(jobId), applicationData);
  },

  /**
   * Get application details
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>}
   */
  async getApplicationDetails(applicationId) {
    return apiClient.get(getEndpoint('WORKER', 'APPLICATION_DETAIL')(applicationId));
  },

  /**
   * Get notifications
   * @returns {Promise<Object>}
   */
  async getNotifications() {
    return apiClient.get(getEndpoint('WORKER', 'NOTIFICATIONS'));
  },

  /**
   * Update availability
   * @param {string} availability - Availability status
   * @returns {Promise<Object>}
   */
  async updateAvailability(availability) {
    return apiClient.put(getEndpoint('WORKER', 'AVAILABILITY'), { availability });
  },

  /**
   * Get bookings
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  async getBookings(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = getEndpoint('WORKER', 'BOOKINGS') + (queryParams ? `?${queryParams}` : '');
    return apiClient.get(endpoint);
  },

  /**
   * Get earnings
   * @returns {Promise<Object>}
   */
  async getEarnings() {
    return apiClient.get(getEndpoint('WORKER', 'EARNINGS'));
  },

  /**
   * Check worker availability
   * @param {string} workerId - Worker ID
   * @param {string} date - Date string
   * @returns {Promise<Object>}
   */
  async checkAvailability(workerId, date) {
    return apiClient.get(getEndpoint('WORKER', 'AVAILABILITY_CHECK')(workerId, date));
  }
};




