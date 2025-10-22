// Import Dependencies
import axios from './axios'; // Using the project's configured axios instance
import { JWT_HOST_API } from 'configs/auth.config';

// ----------------------------------------------------------------------

const stateService = {

  getStates: () => {
    return axios.get(`${JWT_HOST_API}/pricing/usa_states`);
  },  
};

export default stateService; 