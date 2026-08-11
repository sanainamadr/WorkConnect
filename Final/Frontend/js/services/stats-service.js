/**
 * Stats Service
 * API service for statistics
 */

import apiClient from './api-client.js';
import { getEndpoint } from '../config/api.js';

export const statsService = {
  /**
   * Get home page stats
   * @returns {Promise<Object>}
   */
  async getHomeStats() {
    return apiClient.get(getEndpoint('STATS', 'HOME'));
  }
};




