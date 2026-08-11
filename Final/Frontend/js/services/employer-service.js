/**
 * Employer Service
 * API service for employer-related operations
 */

import apiClient from './api-client.js';
import { getEndpoint } from '../config/api.js';

export const employerService = {
  /**
   * Get employer dashboard
   * @returns {Promise<Object>}
   */
  async getDashboard() {
    return apiClient.get(getEndpoint('EMPLOYER', 'DASHBOARD'));
  },

  /**
   * Get jobs
   * @returns {Promise<Object>}
   */
  async getJobs() {
    return apiClient.get(getEndpoint('EMPLOYER', 'JOBS'));
  },

  /**
   * Get job details
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>}
   */
  async getJobDetails(jobId) {
    return apiClient.get(getEndpoint('EMPLOYER', 'JOB_DETAIL')(jobId));
  },

  /**
   * Create job
   * @param {Object} jobData - Job data
   * @returns {Promise<Object>}
   */
  async createJob(jobData) {
    return apiClient.post(getEndpoint('EMPLOYER', 'CREATE_JOB'), jobData);
  },

  /**
   * Update job
   * @param {string} jobId - Job ID
   * @param {Object} jobData - Job data
   * @returns {Promise<Object>}
   */
  async updateJob(jobId, jobData) {
    return apiClient.put(getEndpoint('EMPLOYER', 'UPDATE_JOB')(jobId), jobData);
  },

  /**
   * Delete job
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>}
   */
  async deleteJob(jobId) {
    return apiClient.delete(getEndpoint('EMPLOYER', 'DELETE_JOB')(jobId));
  },

  /**
   * Get job applicants
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>}
   */
  async getJobApplicants(jobId) {
    return apiClient.get(getEndpoint('EMPLOYER', 'JOB_APPLICANTS')(jobId));
  },

  /**
   * Get application details
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>}
   */
  async getApplicationDetails(applicationId) {
    return apiClient.get(getEndpoint('EMPLOYER', 'APPLICATION_DETAIL')(applicationId));
  },

  /**
   * Update application status
   * @param {string} applicationId - Application ID
   * @param {string} status - Status (accepted/rejected/pending)
   * @returns {Promise<Object>}
   */
  async updateApplicationStatus(applicationId, status) {
    return apiClient.patch(getEndpoint('EMPLOYER', 'UPDATE_APPLICATION_STATUS')(applicationId), { status });
  },

  /**
   * Get ranked worker recommendations for a job
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} { jobId, jobTitle, recommendations: [...] }
   */
  async getJobRecommendations(jobId) {
    return apiClient.get(getEndpoint('EMPLOYER', 'JOB_RECOMMENDATIONS')(jobId));
  }
};




