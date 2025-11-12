// Import Dependencies
import axiosInstance from "./axios";
import { API_ENDPOINTS } from "configs/auth.config"; // Using the project's configured axios instance
import { JWT_HOST_API } from "configs/auth.config";

// ----------------------------------------------------------------------

const profileService = {
  getBasicDetails: () => {
    return axiosInstance.get(`${JWT_HOST_API}/user/me`);
  },
  getLicenseDetails: (state = null) => {
    const url = state 
      ? `${JWT_HOST_API}/license-number?state=${encodeURIComponent(state)}`
      : `${JWT_HOST_API}/license-number`;
    return axiosInstance.get(url);
  },
  getUsaStates: () => {
    return axiosInstance.get(`${JWT_HOST_API}/pricing/usa_states`);
  },
  addLiscenceDetails: (data) => {
    return axiosInstance.post(`${JWT_HOST_API}/license-number`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      },);
  },
  getCarriersLogo: () => {
    return axiosInstance.get(`${JWT_HOST_API}${API_ENDPOINTS.CARRIERS.LOGO_COLLAGE}`);
  },
};

export default profileService;
