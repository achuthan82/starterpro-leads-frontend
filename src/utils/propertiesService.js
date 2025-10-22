import axiosInstance from './axios';
import { API_ENDPOINTS } from 'configs/auth.config';

/**
 * Properties Service
 * Handles all property management related API calls
 */
class PropertiesService {

  /**
   * Get All Properties
   * @param {Object} params - Query parameters (page, limit, search, type, status, etc.)
   * @returns {Promise} Response with paginated properties list
   */
  async getProperties(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.PROPERTIES.BASE, { params });
    return response.data;
  }

  /**
   * Get Property by ID
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with property details
   */
  async getPropertyById(propertyId) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`);
    return response.data;
  }

  /**
   * Create New Property
   * @param {Object} propertyData - Property information
   * @returns {Promise} Response with created property data
   */
  async createProperty(propertyData) {
    const response = await axiosInstance.post(API_ENDPOINTS.PROPERTIES.BASE, propertyData);
    return response.data;
  }

  /**
   * Update Property Information
   * @param {string} propertyId - Property ID
   * @param {Object} propertyData - Updated property data
   * @returns {Promise} Response with updated property data
   */
  async updateProperty(propertyId, propertyData) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`, propertyData);
    return response.data;
  }

  /**
   * Delete Property
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response confirming deletion
   */
  async deleteProperty(propertyId) {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`);
    return response.data;
  }

  /**
   * Search Properties
   * @param {Object} searchParams - Search criteria (location, price range, type, etc.)
   * @returns {Promise} Response with matching properties
   */
  async searchProperties(searchParams) {
    const response = await axiosInstance.get(API_ENDPOINTS.PROPERTIES.SEARCH, { params: searchParams });
    return response.data;
  }

  /**
   * Get Featured Properties
   * @param {Object} params - Query parameters (limit, type, location)
   * @returns {Promise} Response with featured properties
   */
  async getFeaturedProperties(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.PROPERTIES.FEATURED, { params });
    return response.data;
  }

  /**
   * Get Property Categories
   * @returns {Promise} Response with available property categories
   */
  async getPropertyCategories() {
    const response = await axiosInstance.get(API_ENDPOINTS.PROPERTIES.CATEGORIES);
    return response.data;
  }

  /**
   * Upload Property Images
   * @param {string} propertyId - Property ID
   * @param {FormData} images - Image files
   * @returns {Promise} Response with uploaded image URLs
   */
  async uploadPropertyImages(propertyId, images) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/images`, images, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Delete Property Image
   * @param {string} propertyId - Property ID
   * @param {string} imageId - Image ID to delete
   * @returns {Promise} Response confirming image deletion
   */
  async deletePropertyImage(propertyId, imageId) {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/images/${imageId}`);
    return response.data;
  }

  /**
   * Get Property Analytics
   * @param {string} propertyId - Property ID
   * @param {Object} params - Date range parameters
   * @returns {Promise} Response with property analytics data
   */
  async getPropertyAnalytics(propertyId, params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/analytics`, { params });
    return response.data;
  }

  /**
   * Get Similar Properties
   * @param {string} propertyId - Property ID
   * @param {Object} params - Similarity criteria
   * @returns {Promise} Response with similar properties
   */
  async getSimilarProperties(propertyId, params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/similar`, { params });
    return response.data;
  }

  /**
   * Add Property to Favorites
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response confirming addition to favorites
   */
  async addToFavorites(propertyId) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/favorite`);
    return response.data;
  }

  /**
   * Remove Property from Favorites
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response confirming removal from favorites
   */
  async removeFromFavorites(propertyId) {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/favorite`);
    return response.data;
  }

  /**
   * Get User's Favorite Properties
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with favorite properties
   */
  async getFavoriteProperties(params = {}) {
    const response = await axiosInstance.get('/properties/favorites', { params });
    return response.data;
  }

  /**
   * Schedule Property Viewing
   * @param {string} propertyId - Property ID
   * @param {Object} viewingData - Viewing appointment details
   * @returns {Promise} Response with scheduled viewing
   */
  async scheduleViewing(propertyId, viewingData) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/viewings`, viewingData);
    return response.data;
  }

  /**
   * Get Property Viewings
   * @param {string} propertyId - Property ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with property viewings
   */
  async getPropertyViewings(propertyId, params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/viewings`, { params });
    return response.data;
  }

  /**
   * Add Property Review
   * @param {string} propertyId - Property ID
   * @param {Object} reviewData - Review data (rating, comment)
   * @returns {Promise} Response with added review
   */
  async addPropertyReview(propertyId, reviewData) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/reviews`, reviewData);
    return response.data;
  }

  /**
   * Get Property Reviews
   * @param {string} propertyId - Property ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with property reviews
   */
  async getPropertyReviews(propertyId, params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/reviews`, { params });
    return response.data;
  }

  /**
   * Get Market Price Analysis
   * @param {Object} propertyData - Property details for analysis
   * @returns {Promise} Response with market analysis
   */
  async getMarketAnalysis(propertyData) {
    const response = await axiosInstance.post('/properties/market-analysis', propertyData);
    return response.data;
  }

  /**
   * Get Property Price History
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with price history
   */
  async getPriceHistory(propertyId) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/price-history`);
    return response.data;
  }

  /**
   * Update Property Status
   * @param {string} propertyId - Property ID
   * @param {string} status - New status (available, sold, rented, off-market)
   * @returns {Promise} Response with updated property status
   */
  async updatePropertyStatus(propertyId, status) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}/status`, { status });
    return response.data;
  }
}

// Export singleton instance
export default new PropertiesService(); 