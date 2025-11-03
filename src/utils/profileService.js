// Import Dependencies
import axios from "./axios"; // Using the project's configured axios instance
import { JWT_HOST_API } from "configs/auth.config";

// ----------------------------------------------------------------------

const profileService = {
  getBasicDetails: () => {
    return axios.get(`${JWT_HOST_API}/users/me`);
  },
  getLicenseDetails: () => {
    return axios.get(`${JWT_HOST_API}/license-number`);
  },
  getUsaStates: () => {
    return axios.get(`${JWT_HOST_API}/pricing/usa_states`);
  },
  addLiscenceDetails: (data) => {
    return axios.post(`${JWT_HOST_API}/license-number`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      },);
  },
};

export default profileService;
