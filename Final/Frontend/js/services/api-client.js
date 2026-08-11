/**
 * API Client
 * Base HTTP client for API requests with error handling
 */

import { getApiUrl } from '../config/api.js';
import { token } from '../utils/storage.js';

/**
 * Default fetch options
 */
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Get auth headers
 * @returns {Object} Headers with auth token
 */
function getAuthHeaders() {
  const headers = { ...defaultOptions.headers };
  const authToken = token.get();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>}
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  let data;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (error) {
    throw new Error('Failed to parse response');
  }

  if (!response.ok) {
    const error = new Error(data.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * API Client class
 */
class ApiClient {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>}
   */
  async get(endpoint, options = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
        ...options,
      });
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>}
   */
  async post(endpoint, body = {}, options = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
        ...options,
      });
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>}
   */
  async put(endpoint, body = {}, options = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
        ...options,
      });
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>}
   */
  async patch(endpoint, body = {}, options = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
        ...options,
      });
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>}
   */
  async delete(endpoint, options = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
        ...options,
      });
      return handleResponse(response);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }
}

// Export singleton instance
export default new ApiClient();




