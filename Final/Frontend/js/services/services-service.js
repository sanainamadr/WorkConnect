/**
 * Services Service
 * API service for service listing and details
 */

import apiClient from './api-client.js';
import { getEndpoint } from '../config/api.js';

export const servicesService = {
  /**
   * Get all services
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = getEndpoint('SERVICES', 'LIST') + (queryParams ? `?${queryParams}` : '');
    return apiClient.get(endpoint);
  },

  /**
   * Get service by slug
   * @param {string} slug - Service slug
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  async getBySlug(slug, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = getEndpoint('SERVICES', 'BY_SLUG')(slug) + (queryParams ? `?${queryParams}` : '');
    return apiClient.get(endpoint);
  },

  /**
   * Get job by slug
   * @param {string} slug - Job slug
   * @returns {Promise<Object>}
   */
  async getJobBySlug(slug) {
    return apiClient.get(getEndpoint('SERVICES', 'JOB_BY_SLUG')(slug));
  }
};




