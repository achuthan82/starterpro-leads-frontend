// Import Dependencies
import axios from './axios'; // Using the project's configured axios instance
import { JWT_HOST_API } from 'configs/auth.config';

// ----------------------------------------------------------------------

const automationService = {
  toggleLeadAutomation: (agency_id, payload) => {
    return axios.patch(`${JWT_HOST_API}/sms-automation/enable-disable-agency-sms-automation/${agency_id}`, payload);
  },
  
};

export default automationService; 