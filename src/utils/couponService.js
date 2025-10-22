// Import Dependencies
import axios from "./axios"; // Using the project's configured axios instance
import { JWT_HOST_API } from "configs/auth.config";

// ----------------------------------------------------------------------
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : Intl.DateTimeFormat().resolvedOptions().timeZone
const couponService = {
  //   getCurrentSubscription: (userId) => {
  //     return axios.get(`${JWT_HOST_API}/stripe-subscriptions/current/${userId}`);
  //   },
  editCoupon: (id, data) => {
    return axios.put(`${JWT_HOST_API}/coupon_code/${id}`, data);
  },
  addCoupons: (data) => {
    return axios.post(`${JWT_HOST_API}/coupon_code`, data);
  },
  deleteCoupon: (id) => {
    return axios.delete(`${JWT_HOST_API}/coupon_code/${id}`);
  },
  getCoupons: (page, per_page) => {
    return axios.get(
      `${JWT_HOST_API}/coupon_code/paginated?page=${page}&per_page=${per_page}&time_zone=${timeZone}`,
    );
  },
};

export default couponService;
