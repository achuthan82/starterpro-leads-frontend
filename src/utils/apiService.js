/**
 * ShieldNest API Service
 * Centralized API service that exports all individual services
 * 
 * Usage:
 * import { authService, userService, agentService } from 'utils/apiService';
 * 
 * Or import all:
 * import apiService from 'utils/apiService';
 * apiService.auth.login(credentials);
 */

// Import all individual services
import authService from './authService';
import userService from './userService';
import agentService from './agentService';
import leadsService from './leadsService';
import dashboardService from './dashboardService';
import propertiesService from './propertiesService';
import notificationsService from './notificationsService';
import adminService from './adminService';
import ordersService from './ordersService';
import subscriptionService from './subscriptionService';
import invoiceService from './invoiceService';
import stateService from './stateService';
import leadUploadService from './leadUploadService';
import promoCodeService from './promoCodeService';
import revenueService from './revenueService';
import prospectService from './prospectService';
import couponService from './couponService';
import profileService from './profileService';
import { JWT_HOST_API } from 'configs/auth.config';

// Export individual services
export { authService };
export { userService };
export { agentService };
export { leadsService };
export { dashboardService };
export { propertiesService };
export { notificationsService };
export { adminService };
export { ordersService };
export { subscriptionService };
export {invoiceService};
export {stateService}
export {leadUploadService}
export {promoCodeService}
export {revenueService}
export {prospectService}
export {couponService}
export {profileService}
// Export combined API service object
const apiService = {
  auth: authService,
  user: userService,
  agent: agentService,
  leads: leadsService,
  dashboard: dashboardService,
  properties: propertiesService,
  notifications: notificationsService,
  admin: adminService,
  orders: ordersService,
  subscriptions: subscriptionService,
  invoice:invoiceService,
  state: stateService,
  upload:leadUploadService,
  promoCode: promoCodeService,
  revenue:revenueService,
  prospect:prospectService,
  coupon:couponService,
  profile:profileService
};

export default apiService;

// API Status and Health Check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${JWT_HOST_API}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// API Utilities
export const apiUtils = {
  /**
   * Format API Error for Display
   * @param {Object} error - API error object
   * @returns {string} Formatted error message
   */
  formatError(error) {
    if (error?.message) {
      return error.message;
    }
    
    if (error?.errors && Array.isArray(error.errors)) {
      return error.errors.map(err => err.message || err).join(', ');
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unexpected error occurred';
  },

  /**
   * Check if error is a network error
   * @param {Object} error - Error object
   * @returns {boolean} True if network error
   */
  isNetworkError(error) {
    return !error?.response && error?.request;
  },

  /**
   * Check if error is authentication error
   * @param {Object} error - Error object
   * @returns {boolean} True if auth error
   */
  isAuthError(error) {
    return error?.response?.status === 401;
  },

  /**
   * Check if error is validation error
   * @param {Object} error - Error object
   * @returns {boolean} True if validation error
   */
  isValidationError(error) {
    return error?.response?.status === 422;
  },

  /**
   * Extract validation errors from API response
   * @param {Object} error - API error object
   * @returns {Object} Field-specific error messages
   */
  getValidationErrors(error) {
    if (error?.response?.data?.errors) {
      return error.response.data.errors;
    }
    return {};
  }
};

// API Constants
export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

export const USER_ROLES = {
  USER: 'user',
  AGENT: 'agent',
  ADMIN: 'admin'
};

export const PROPERTY_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SOLD: 'sold',
  RENTED: 'rented',
  OFF_MARKET: 'off_market'
};

export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  CONVERTED: 'converted',
  LOST: 'lost'
};

export const AGENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  ACTIVE: 'active'
}; 