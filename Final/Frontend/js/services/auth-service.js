/**
 * Auth Service
 * API service for authentication operations
 */

import apiClient from './api-client.js';
import { getEndpoint } from '../config/api.js';

export const authService = {
  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {string} credentials.role - User role (worker/employer)
   * @returns {Promise<Object>}
   */
  async login(credentials) {
    return apiClient.post(getEndpoint('AUTH', 'LOGIN'), credentials);
  },

  /**
   * Sign up new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>}
   */
  async signup(userData) {
    return apiClient.post(getEndpoint('AUTH', 'SIGNUP'), userData);
  },

  /**
   * Logout user
   * @returns {Promise<Object>}
   */
  async logout() {
    return apiClient.post(getEndpoint('AUTH', 'LOGOUT'));
  },

  /**
   * Verify auth token
   * @returns {Promise<Object>}
   */
  async verify() {
    return apiClient.get(getEndpoint('AUTH', 'VERIFY'));
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>}
   */
  async updateProfile(profileData) {
    return apiClient.put(getEndpoint('AUTH', 'PROFILE'), profileData);
  },

  /**
   * Send OTP
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<Object>}
   */
  async sendOtp(phoneNumber) {
    return apiClient.post(getEndpoint('AUTH', 'SEND_OTP'), { phoneNumber });
  },

  /**
   * Verify OTP
   * @param {string} phoneNumber - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise<Object>}
   */
  async verifyOtp(phoneNumber, otp) {
    return apiClient.post(getEndpoint('AUTH', 'VERIFY_OTP'), { phoneNumber, otp });
  },

  /**
   * Upload Aadhaar document
   * @param {FormData} formData - Form data with aadhaar image
   * @returns {Promise<Object>}
   */
  async uploadAadhaar(formData) {
    const endpoint = getEndpoint('AUTH', 'UPLOAD_AADHAAR');
    const url = endpoint.startsWith('http') ? endpoint : `http://localhost:3000/api${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }
    
    return response.json();
  }
};




