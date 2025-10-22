import axiosInstance from './axios';
import { API_ENDPOINTS } from 'configs/auth.config';

/**
 * Notifications Service
 * Handles all notification-related API calls
 */
class NotificationsService {

  /**
   * Get All Notifications
   * @param {Object} params - Query parameters (page, limit, read, type, etc.)
   * @returns {Promise} Response with paginated notifications list
   */
  async getNotifications(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params });
    return response.data;
  }

  /**
   * Get Notification by ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Response with notification details
   */
  async getNotificationById(notificationId) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}`);
    return response.data;
  }

  /**
   * Mark Notification as Read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Response confirming notification marked as read
   */
  async markAsRead(notificationId) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.NOTIFICATIONS.MARK_READ}/${notificationId}`);
    return response.data;
  }

  /**
   * Mark All Notifications as Read
   * @returns {Promise} Response confirming all notifications marked as read
   */
  async markAllAsRead() {
    const response = await axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ);
    return response.data;
  }

  /**
   * Delete Notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Response confirming deletion
   */
  async deleteNotification(notificationId) {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}`);
    return response.data;
  }

  /**
   * Delete All Notifications
   * @returns {Promise} Response confirming all notifications deleted
   */
  async deleteAllNotifications() {
    const response = await axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.BASE);
    return response.data;
  }

  /**
   * Get Unread Notifications Count
   * @returns {Promise} Response with unread count
   */
  async getUnreadCount() {
    const response = await axiosInstance.get(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/unread-count`);
    return response.data;
  }

  /**
   * Get Notification Settings
   * @returns {Promise} Response with user notification preferences
   */
  async getNotificationSettings() {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.SETTINGS);
    return response.data;
  }

  /**
   * Update Notification Settings
   * @param {Object} settings - Notification preferences
   * @returns {Promise} Response with updated settings
   */
  async updateNotificationSettings(settings) {
    const response = await axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.SETTINGS, settings);
    return response.data;
  }

  /**
   * Subscribe to Push Notifications
   * @param {Object} subscription - Push subscription object
   * @returns {Promise} Response confirming subscription
   */
  async subscribeToPush(subscription) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/push-subscribe`, subscription);
    return response.data;
  }

  /**
   * Unsubscribe from Push Notifications
   * @param {string} endpoint - Push subscription endpoint
   * @returns {Promise} Response confirming unsubscription
   */
  async unsubscribeFromPush(endpoint) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/push-unsubscribe`, { endpoint });
    return response.data;
  }

  /**
   * Send Test Notification
   * @param {Object} notificationData - Test notification data
   * @returns {Promise} Response confirming test notification sent
   */
  async sendTestNotification(notificationData) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/test`, notificationData);
    return response.data;
  }

  /**
   * Get Notification Types
   * @returns {Promise} Response with available notification types
   */
  async getNotificationTypes() {
    const response = await axiosInstance.get(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/types`);
    return response.data;
  }

  /**
   * Create Custom Notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise} Response with created notification
   */
  async createNotification(notificationData) {
    const response = await axiosInstance.post(API_ENDPOINTS.NOTIFICATIONS.BASE, notificationData);
    return response.data;
  }

  /**
   * Get Notification History
   * @param {Object} params - Query parameters (dateFrom, dateTo, type)
   * @returns {Promise} Response with notification history
   */
  async getNotificationHistory(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/history`, { params });
    return response.data;
  }
}

// Export singleton instance
export default new NotificationsService(); 