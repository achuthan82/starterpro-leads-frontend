// Import Dependencies
import axios from './axiosPublic'; // Using the project's configured axios instance

// ----------------------------------------------------------------------

class AppointmentPublicService {
    /**
     * Get appointment settings/details
     * @returns {Promise} Response with availability settings
     */
    async getAppointmentSettings(token) {
        try {
            const response = await axios.get(`/appointment/public/settings/details?token=${token}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment settings:', error);
            throw error;
        }
    }
    async getAppointmentDetails(token) {
        try {
            const response = await axios.get(`/appointment/public/invitation-details?token=${token}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment settings:', error);
            throw error;
        }
    }

    /**
     * Get appointment list for a date range
     * @param {Object} params - Query parameters
     * @param {string} params.start_date - Start date in 'MM-DD-YYYY HH:MM:SS' format
     * @param {string} params.end_date - End date in 'MM-DD-YYYY HH:MM:SS' format
     * @param {string} params.timezone - Timezone (e.g., 'America/New_York')
     * @returns {Promise} Response with appointment list
     */
    async getAppointmentList(params) {
        try {
            const response = await axios.get('/appointment/public/list', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment list:', error);
            throw error;
        }
    }

    /**
     * Create/Schedule an appointment
     * @param {Object} appointmentData - Appointment details
     * @param {string} appointmentData.time_zone - Timezone (e.g., 'America/New_York')
     * @param {number} appointmentData.duration - Duration in minutes
     * @param {Object} appointmentData.payload - Appointment payload
     * @param {string} appointmentData.payload.client_name - Client name
     * @param {string} appointmentData.payload.meeting_datetime - Meeting datetime in 'MM-DD-YYYY HH:MM:SS' format
     * @param {string} appointmentData.payload.phone_number - Phone number
     * @param {string} appointmentData.payload.title - Appointment title
     * @param {string} appointmentData.payload.notes - Optional notes
     * @returns {Promise} Response with created appointment
     */
    async createAppointment(appointmentData, token) {
        try {
            const { time_zone, duration, ...payload } = appointmentData;
            const params = {
                time_zone: time_zone,
                duration: duration,
                token:token
            };
            const response = await axios.post('/appointment/public/create', payload, { params });
            return response.data;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }
     async createPublicAppointment(appointmentData) {
        try {
            const { ...payload } = appointmentData;
            const response = await axios.put('/appointment/send-invitation', payload);
            return response.data;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }
    async editAppointment(appointmentId, appointmentData) {
        try {
            const { time_zone, duration, ...payload } = appointmentData;
            const params = {
                time_zone: time_zone,
                duration: duration
            };

            const response = await axios.put(
                `/appointment/${appointmentId}`,
                payload,
                { params }
            );

            return response.data;
        } catch (error) {
            console.error('Error editing appointment:', error);
            throw error;
        }
    }

    async deleteAppointment(appointmentId) {
        try {
            const response = await axios.delete(
                `/appointment/delete/${appointmentId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }
}

const appointmentPublicService = new AppointmentPublicService();
export default appointmentPublicService;

