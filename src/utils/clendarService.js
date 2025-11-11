import axios from './axios'; // Using the project's configured axios instance
import { JWT_HOST_API } from 'configs/auth.config';
const calendarService = {
    getAppointments: (start_date, end_date, time_zone) => {
        return axios.get(`${JWT_HOST_API}/appointment/list?start_date=${start_date}&end_date=${end_date}&timezone=${time_zone}`);
    },
};

export default calendarService; 