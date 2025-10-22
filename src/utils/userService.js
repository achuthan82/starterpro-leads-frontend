import axiosInstance from './axios';
import { API_ENDPOINTS } from 'configs/auth.config';

/**
 * User Service
 * Handles all user-related API calls
 */
class UserService {

  /**
   * Get User Profile
   * @returns {Promise} Response with user profile data
   */
  async getProfile() {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  }

  /**
   * Update User Profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} Response with updated user data
   */
  async updateProfile(userData) {
    const response = await axiosInstance.put(API_ENDPOINTS.USER.UPDATE_PROFILE, userData);
    return response.data;
  }

  /**
   * Delete User Account
   * @returns {Promise} Response confirming account deletion
   */
  async deleteAccount() {
    const response = await axiosInstance.delete(API_ENDPOINTS.USER.DELETE_ACCOUNT);
    return response.data;
  }

  /**
   * Get All Users (Admin only)
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   * @returns {Promise} Response with paginated users list
   */
  async getUsers(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.USERS, { params });
    return response.data;
  }

  /**
   * Get User by ID
   * @param {string} userId - User ID
   * @returns {Promise} Response with user data
   */
  async getUserById(userId) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.USER.USER_BY_ID}/${userId}`);
    return response.data;
  }

  /**
   * Upload User Avatar
   * @param {File} file - Image file
   * @returns {Promise} Response with avatar URL
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axiosInstance.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Update User Preferences
   * @param {Object} preferences - User preferences object
   * @returns {Promise} Response with updated preferences
   */
  async updatePreferences(preferences) {
    const response = await axiosInstance.put('/user/preferences', preferences);
    return response.data;
  }

  /**
   * Get User Activity Log
   * @param {Object} params - Query parameters (page, limit, dateFrom, dateTo)
   * @returns {Promise} Response with activity log
   */
  async getActivityLog(params = {}) {
    const response = await axiosInstance.get('/user/activity', { params });
    return response.data;
  }

  /**
   * Update User Role (Admin only)
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Promise} Response confirming role update
   */
  async updateUserRole(userId, role) {
    const response = await axiosInstance.put(`/user/${userId}/role`, { role });
    return response.data;
  }

  /**
   * Block/Unblock User (Admin only)
   * @param {string} userId - User ID
   * @param {boolean} blocked - Block status
   * @returns {Promise} Response confirming status update
   */
  async updateUserStatus(userId, blocked) {
    const response = await axiosInstance.put(`/user/${userId}/status`, { blocked });
    return response.data;
  }

  /**
   * Verify Registration Token
   * @param {string} token - Verification token from URL
   * @returns {Promise} Response with verification result and redirect URL
   */
  async verifyRegistrationToken(token) {
    console.log('UserService.verifyRegistrationToken - Verifying token:', token);
    const response = await axiosInstance.get(`${API_ENDPOINTS.VERIFICATION.VERIFY_TOKEN}/${token}`);
    console.log('UserService.verifyRegistrationToken - Response:', response.data);
    return response.data;
  }
}

// Export singleton instance
export default new UserService(); 