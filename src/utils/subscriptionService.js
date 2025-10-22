// Import Dependencies
import axios from './axios'; // Using the project's configured axios instance
import { JWT_HOST_API } from 'configs/auth.config';

// ----------------------------------------------------------------------

const subscriptionService = {
  getCurrentSubscription: (userId) => {
    return axios.get(`${JWT_HOST_API}/stripe-subscriptions/current/${userId}`);
  },

  getUsaStates: () => {
    return axios.get(`${JWT_HOST_API}/pricing/usa_states`);
  },

  updateSubscriptionStates: (subscriptionId, states) => {
    return axios.patch(`${JWT_HOST_API}/stripe-subscriptions/chosen-states/${subscriptionId}`, {
      states_chosen: states,
    });
  },

  getAvailablePlans: (page, per_page) => {
    return axios.get(`${JWT_HOST_API}/pricing/subscriptions?page=${page}&per_page=${per_page}`); ///details?is_fresh_leads=1
  },

  getAdminPlans: () => {
    return axios.get(`${JWT_HOST_API}/pricing/admin`);
  },

  cancelSubscription: (id, reason) => {
    return axios.post(`${JWT_HOST_API}/stripe-subscriptions/cancellation/${id}`, {
      cancelation_reason: reason
    }); ///details?is_fresh_leads=1
  },
  getPreviousSubscription: (page, per_page) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : Intl.DateTimeFormat().resolvedOptions().timeZone;
    return axios.get(`${JWT_HOST_API}/stripe-subscriptions/previous/paginated?page=${page}&per_page=${per_page}&time_zone=${timeZone}`); ///details?is_fresh_leads=1
  },
  createProductPricing: (payload) => {
    return axios.post(`${JWT_HOST_API}/pricing/create-product-pricing`, payload);
  },

  updateProductPricing: (pricingId, payload) => {
    return axios.put(`${JWT_HOST_API}/pricing/${pricingId}`, payload);
  },

  deactivateProductPricing: (pricingId) => {
    return axios.patch(`${JWT_HOST_API}/pricing/deactivate-product-pricing/${pricingId}`);
  },
};

export default subscriptionService; 