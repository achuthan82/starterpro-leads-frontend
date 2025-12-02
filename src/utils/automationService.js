// Import Dependencies
import axios from './axios'; // Using the project's configured axios instance
import { JWT_HOST_API } from 'configs/auth.config';

// ----------------------------------------------------------------------

const automationService = {
  getAutomationDetails: (agency_id) => {
    return axios.get(`${JWT_HOST_API}/agency/get-agency-settings/${agency_id}`);
  },
  toggleLeadAutomation: (agency_id, payload) => {
    return axios.patch(`${JWT_HOST_API}/sms-automation/enable-disable-agency-sms-automation/${agency_id}`, payload);
  },
  toggleAppointmentAutomation: (agency_id, payload) => {
    return axios.patch(`${JWT_HOST_API}/agency/update-agency-appointment-notification/${agency_id}`, payload);
  },
  toggleLeadManagementAutomation: (id, payload) => {
    return axios.patch(`${JWT_HOST_API}/sms-automation/enable-disable-lead-sms-automation/${id}`, payload);
  },
};

export default automationService; 