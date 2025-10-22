// Import Dependencies
import axios from "./axios"; // Using the project's configured axios instance
import { JWT_HOST_API } from "configs/auth.config";

// ----------------------------------------------------------------------

const prospectService = {
  getUsers: (page, per_page) => {
    return axios.post(
      `${JWT_HOST_API}/user/interested/requests/paginated?page=${page}&per_page=${per_page}`,
      {},
    );
  },
  handleAction: (id, action, message) => {
    const params = {action: action}
    if (action !== 'approve' && message) {
        params['rejection_message'] = message
    }
    return axios.post(
      `${JWT_HOST_API}/user/interested/decision_making/${id}`,
      params,
    );
  },
};

export default prospectService;
