// Import Dependencies
import axios from "./axios"; // Using the project's configured axios instance
import { JWT_HOST_API } from "configs/auth.config";

// ----------------------------------------------------------------------

const suppressionService = {
  uploadDocs: (agent_id, mortgage_id, formData) => {
    return axios.post(
      `${JWT_HOST_API}/leads/docs/1/${mortgage_id}/${agent_id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
  getDocs: (agent_id, mortgage_id) => {
    return axios.get(
      `${JWT_HOST_API}/leads/docs/1/${mortgage_id}/${agent_id}`,
    );
  },
  getPendingRequest: (page, per_page) => {
    return axios.get(
      `${JWT_HOST_API}/leads/suppression-requests/1?page=${page}&per_page=${per_page}`,
    );
  }
};

export default suppressionService;
