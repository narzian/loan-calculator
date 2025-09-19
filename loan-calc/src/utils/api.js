/**
 * API Service for Frontend-Backend Communication
 * Handles requests to Cloudflare Functions endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Base API request function with error handling
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - API response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || `HTTP ${response.status}`,
        response.status,
        data.error?.code,
        data.error?.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or parsing errors
    throw new ApiError(
      'Network error or server unavailable',
      0,
      'NETWORK_ERROR',
      error.message
    );
  }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Get authentication token from storage or context
 * In Phase 3, this will be integrated with Supabase Auth
 * @returns {string|null} - Bearer token
 */
function getAuthToken() {
  // Placeholder for Phase 3 authentication integration
  // This will be connected to Supabase Auth context
  return localStorage.getItem('supabase_access_token');
}

/**
 * Add authorization header if token is available
 * @param {object} headers - Existing headers
 * @returns {object} - Headers with authorization
 */
function withAuth(headers = {}) {
  const token = getAuthToken();
  if (token) {
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return headers;
}

// =============================================================================
// Loan Calculation Endpoints
// =============================================================================

/**
 * Calculate loan details (existing endpoint)
 * @param {object} loanData - Loan parameters
 * @returns {Promise<object>} - Calculation results
 */
export async function calculateLoan(loanData) {
  return apiRequest('/calc', {
    method: 'POST',
    body: JSON.stringify(loanData),
  });
}

/**
 * Health check endpoint
 * @returns {Promise<object>} - Health status
 */
export async function checkHealth() {
  return apiRequest('/health');
}

// =============================================================================
// Saved Calculations Endpoints (Require Authentication)
// =============================================================================

/**
 * Get all saved calculations for the authenticated user
 * @returns {Promise<object>} - List of saved calculations
 */
export async function getSavedCalculations() {
  return apiRequest('/saves', {
    headers: withAuth(),
  });
}

/**
 * Save a new calculation
 * @param {object} calculationData - Calculation data to save
 * @param {string} calculationData.name - Name for the saved calculation
 * @param {object} calculationData.calculation - Loan calculation results
 * @param {string[]} [calculationData.tags] - Optional tags
 * @param {boolean} [calculationData.is_favorite] - Whether to mark as favorite
 * @returns {Promise<object>} - Saved calculation data
 */
export async function saveCalculation(calculationData) {
  return apiRequest('/saves', {
    method: 'POST',
    headers: withAuth(),
    body: JSON.stringify(calculationData),
  });
}

/**
 * Get a specific saved calculation by ID
 * @param {string} calculationId - ID of the calculation
 * @returns {Promise<object>} - Calculation data
 */
export async function getSavedCalculation(calculationId) {
  return apiRequest(`/saves/${calculationId}`, {
    headers: withAuth(),
  });
}

/**
 * Update a saved calculation
 * @param {string} calculationId - ID of the calculation to update
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated calculation data
 */
export async function updateSavedCalculation(calculationId, updates) {
  return apiRequest(`/saves/${calculationId}`, {
    method: 'PUT',
    headers: withAuth(),
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a saved calculation
 * @param {string} calculationId - ID of the calculation to delete
 * @returns {Promise<object>} - Deletion confirmation
 */
export async function deleteSavedCalculation(calculationId) {
  return apiRequest(`/saves/${calculationId}`, {
    method: 'DELETE',
    headers: withAuth(),
  });
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user has a valid token
 */
export function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Handle API errors in components
 * @param {ApiError} error - API error to handle
 * @returns {object} - User-friendly error information
 */
export function handleApiError(error) {
  if (!(error instanceof ApiError)) {
    return {
      message: 'An unexpected error occurred',
      canRetry: true,
      isAuthError: false,
    };
  }

  const isAuthError = error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_INVALID';
  
  return {
    message: error.message,
    code: error.code,
    details: error.details,
    canRetry: !isAuthError && error.status !== 400,
    isAuthError,
    status: error.status,
  };
}

// Export the ApiError class for instanceof checks
export { ApiError };