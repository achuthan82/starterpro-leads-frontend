import axiosInstance from './axios';
import { API_ENDPOINTS } from 'configs/auth.config';

/**
 * Available Service
 * Handles all availability related API calls
 */
class AvailableService {
  /**
   * Get appointment settings
   * @returns {Promise} Response with appointment settings data
   */
  async getAppointmentSettings() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AVAILABILITY.SETTINGS_DETAILS);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment settings:', error);
      throw error;
    }
  }

  /**
   * Create or update appointment settings using POST
   * @param {Object} settingsData - Appointment settings configuration
   * @param {Array} settingsData.availability - Array of availability time slots
   * @param {string} settingsData.availability[].start - Start time (format: "HH:MM")
   * @param {string} settingsData.availability[].end - End time (format: "HH:MM")
   * @param {number} settingsData.duration_minutes - Appointment duration in minutes
   * @param {string} settingsData.timezone - Timezone identifier
   * @returns {Promise} Response with created/updated settings data
   */
  async saveAppointmentSettings(settingsData) {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.AVAILABILITY.SETTINGS_CREATE,
        settingsData
      );
      return response.data;
    } catch (error) {
      console.error('Error saving appointment settings:', error);
      throw error;
    }
  }

  /**
   * Get system timezone
   * @returns {string} System timezone
   */
  getSystemTimezone() {
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return systemTimezone === 'Asia/Calcutta' ? 'Asia/Kolkata' : systemTimezone;
  }
}

const availableService = new AvailableService();
export default availableService;