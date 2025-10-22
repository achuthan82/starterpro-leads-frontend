import axiosInstance from "./axios";
import { API_ENDPOINTS } from "configs/auth.config";

/**
 * Promo Code Service
 * Handles all promo code related API calls
 */
class PromoCodeService {
  /**
   * Get All Promo Codes - List with filters
   * @param {Object} params - Query parameters (active, code, coupon)
   * @returns {Promise} Response with promo codes list
   */
  async getPromoCodes(params = {}) {
    console.log(
      "PromoCodeService.getPromoCodes - Making request to:",
      API_ENDPOINTS.PROMO_CODES.LIST,
    );
    console.log("PromoCodeService.getPromoCodes - Query params:", params);
    console.log(
      "PromoCodeService.getPromoCodes - Auth token exists:",
      !!localStorage.getItem("authToken"),
    );

    const response = await axiosInstance.get(API_ENDPOINTS.PROMO_CODES.LIST, {
      params: params,
    });

    console.log("PromoCodeService.getPromoCodes - Raw response:", response);
    console.log(
      "PromoCodeService.getPromoCodes - Response data:",
      response.data,
    );
    return response.data;
  }

  /**
   * Create New Promo Code
   * @param {Object} promoCodeData - Promo code data (active, code, coupon, expires_at, max_redemptions)
   * @returns {Promise} Response confirming promo code creation
   */
  async createPromoCode(promoCodeData) {
    const params={
     time_zone:Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
    console.log(
      "PromoCodeService.createPromoCode - Creating promo code:",
      promoCodeData,
    );
    const response = await axiosInstance.post(
      API_ENDPOINTS.PROMO_CODES.CREATE,
      promoCodeData,
      {
        params:params
      }
    );
    console.log("PromoCodeService.createPromoCode - Response:", response.data);
    return response.data;
  }

  /**
   * Update Promo Code
   * @param {string} promoCodeId - Promo code ID
   * @param {Object} promoCodeData - Updated promo code data
   * @returns {Promise} Response with updated promo code information
   */
  async updatePromoCode(promoCodeId, promoCodeData) {
    console.log(
      "PromoCodeService.updatePromoCode - Updating promo code:",
      promoCodeId,
      promoCodeData,
    );
    const response = await axiosInstance.put(
      `${API_ENDPOINTS.PROMO_CODES.BASE}/${promoCodeId}`,
      promoCodeData,
    );
    return response.data;
  }

  /**
   * Delete Promo Code
   * @param {string} promoCodeId - Promo code ID
   * @returns {Promise} Response confirming promo code deletion
   */
  async deletePromoCode(promoCodeId) {
    console.log(
      "PromoCodeService.deletePromoCode - Deleting promo code:",
      promoCodeId,
    );
    const response = await axiosInstance.delete(
      `${API_ENDPOINTS.PROMO_CODES.BASE}/${promoCodeId}`,
    );
    return response.data;
  }

  /**
   * Get Promo Code Details
   * @param {string} promoCodeId - Promo code ID
   * @returns {Promise} Response with detailed promo code information
   */
  async getPromoCodeDetails(promoCodeId) {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.PROMO_CODES.BASE}/${promoCodeId}`,
    );
    return response.data;
  }
  async getAssignees(val) {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.PROMO_CODES.BASE}/unassigned-users?page=1&per_page=20&name_search=${val}`,
    );
    return response.data;
  }
  /**
   * Toggle Promo Code Status (Active/Inactive)
   * @param {string} promoCodeId - Promo code ID
   * @param {boolean} isActive - Whether to activate (true) or deactivate (false)
   * @returns {Promise} Response with updated promo code status
   */
  async togglePromoCodeStatus(promoCodeId, isActive) {
    console.log(
      "PromoCodeService.togglePromoCodeStatus - Updating status:",
      promoCodeId,
      "isActive:",
      isActive,
    );
    const response = await axiosInstance.patch(
      `${API_ENDPOINTS.PROMO_CODES.BASE}/${promoCodeId}`,
      {
        is_active: isActive,
      },
    );
    return response.data;
  }

  /**
   * Get Promo Code Usage Statistics
   * @param {string} promoCodeId - Promo code ID
   * @returns {Promise} Response with usage statistics
   */
  async getPromoCodeStats(promoCodeId) {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.PROMO_CODES.BASE}/${promoCodeId}/stats`,
    );
    return response.data;
  }

  /**
   * Validate Promo Code
   * @param {string} code - Promo code to validate
   * @returns {Promise} Response with validation result
   */
  async validatePromoCode(code) {
    const response = await axiosInstance.post(
      `${API_ENDPOINTS.PROMO_CODES.BASE}/validate`,
      { code },
    );
    return response.data;
  }
}

// Export singleton instance
export default new PromoCodeService();
