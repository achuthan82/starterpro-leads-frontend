// Import Dependencies
import axios from './axios'; // Using the project's configured axios instance
import { JWT_HOST_API } from 'configs/auth.config';

// ----------------------------------------------------------------------

const invoiceService = {
//   getCurrentSubscription: (userId) => {
//     return axios.get(`${JWT_HOST_API}/stripe-subscriptions/current/${userId}`);
//   },
  getInvoiceHistory: (page, per_page) => {
    return axios.get(`${JWT_HOST_API}/stripe-subscriptions/order-summary?page=${page}&per_page=${per_page}`);
  },
   getInvoiceDetails: (id, type) => {
    return axios.get(`${JWT_HOST_API}/invoice/${id}?is_marketplace=${type}`);
  },
  getInvoicePlatformHistory: (page, per_page) => {
    return axios.get(`${JWT_HOST_API}/platform-susbcription/order-summary?page=${page}&per_page=${per_page}`);
  },
  getInvoicePlatformDetails: (id, type) => {
    return axios.get(`${JWT_HOST_API}/invoice/platform-subscription/${id}?is_marketplace=${type}`);
  },
};

export default invoiceService; 