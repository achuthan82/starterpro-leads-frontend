// Import Dependencies
import axios from './axios'; // Using the project's configured axios instance
import { JWT_HOST_API } from 'configs/auth.config';

// ----------------------------------------------------------------------

const platformSubscriptionService = {
  getCurrentSubscription: (userId) => {
    return axios.get(`${JWT_HOST_API}/platform-susbcription/current/${userId}`);
  },

  getAvailablePlans: (page, per_page) => {
    return axios.get(`${JWT_HOST_API}/pricing/platform-subscriptions?page=${page}&per_page=${per_page}`); ///details?is_fresh_leads=1
  },

  // cancelSubscription: (id, reason) => {
  //   return axios.post(`${JWT_HOST_API}/platform-susbcription/cancel/${id}`, {
  //     cancelation_reason: reason
  //   }); ///details?is_fresh_leads=1
  // },

  temporaryCancelSubscription: (id) => {
    return axios.post(`${JWT_HOST_API}/platform-susbcription/temporary/cancel/${id}`);
  },
  getPreviousSubscription: (page, per_page) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : Intl.DateTimeFormat().resolvedOptions().timeZone;
    return axios.get(`${JWT_HOST_API}/platform-susbcription/previous/paginated?page=${page}&per_page=${per_page}&time_zone=${timeZone}`); ///details?is_fresh_leads=1
  },
};

export default platformSubscriptionService; 