// Import Dependencies
import axios from './axios'; // Using the project's configured axios instance
import { JWT_HOST_API } from 'configs/auth.config';

// ----------------------------------------------------------------------

const revenueService = {
//   getCurrentSubscription: (userId) => {
//     return axios.get(`${JWT_HOST_API}/stripe-subscriptions/current/${userId}`);
//   },
  getPlans: (startDate, endDate) => {
    return axios.get(`${JWT_HOST_API}/revenue/revenue-by-plan?start_date=${startDate}&end_date=${endDate}`);
  },

};

export default revenueService; 