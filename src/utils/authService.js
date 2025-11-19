import axiosInstance from './axios';
import { API_ENDPOINTS } from 'configs/auth.config';
import { setSession } from './jwt';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  
  /**
   * User Login
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with user data and token
   */
  async login(credentials) {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Handle different token field names - check both top level and data object
    const token = response.auth_token || response.token || response.access_token || response.accessToken ||
                 response.data?.token || response.data?.access_token || response.data?.accessToken || response.data?.auth_token;
    
    if (token) {
      setSession(token);
    }
    
    return response.data;
  }

  /**
   * User Registration
   * @param {Object} userData - { email, password, firstName, lastName, phone, role }
   * @returns {Promise} Response with user data
   */
  async register(userData) {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  }

  /**
   * Register from Invitation
   * @param {Object} data - { agency, confirm_password, name, password, phone }
   * @param {string} registerToken - The invitation token for Authorization header
   * @returns {Promise} Response with user data
   */
  async registerFromInvitation(data, registerToken) {
    const response = await axiosInstance.put(
      API_ENDPOINTS.AUTH.REGISTER_FROM_INVITATION,
      data,
      {
        headers: {
          Authorization: `Bearer ${registerToken}`
        }
      }
    );
    return response.data;
  }

  /**
   * User Logout
   * @returns {Promise} Response confirming logout
   */
  async logout() {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.AUTH.LOGOUT);
      setSession(null);
      return response.data;
    } catch (error) {
      setSession(null); // Remove token even if API call fails
      throw error;
    }
  }

  /**
   * Refresh Authentication Token
   * @returns {Promise} Response with new token
   */
  async refreshToken() {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH);
    
    if (response.data.token) {
      setSession(response.data.token);
    }
    
    return response.data;
  }

  /**
   * Forgot Password
   * @param {Object} data - { email }
   * @returns {Promise} Response confirming password reset email sent
   */
  async forgotPassword(data) {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  }

  /**
   * Reset Password
   * @param {Object} data - { new_password, confirm_password }
   * @param {string} token - The reset token for Authorization header
   * @returns {Promise} Response confirming password reset
   */
  async resetPassword(data, token) {
    const response = await axiosInstance.patch(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }

  /**
   * Verify Email
   * @param {Object} data - { token }
   * @returns {Promise} Response confirming email verification
   */
  async verifyEmail(data) {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return response.data;
  }

  /**
   * Change Password
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise} Response confirming password change
   */
  async changePassword(data) {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  }

  /**
   * Get User Profile
   * @returns {Promise} Response with user profile data
   */
  async getProfile() {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  /**
   * Get current user from token
   * @returns {Object|null} User data or null
   */
  getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      // Decode JWT token to get user data
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new AuthService(); 