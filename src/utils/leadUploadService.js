// Import Dependencies
import axios from "./axios"; // Using the project's configured axios instance
import { JWT_HOST_API } from "configs/auth.config";

// ----------------------------------------------------------------------

const leadUploadService = {
  addTemplate: (data) => {
    return axios.post(`${JWT_HOST_API}/mortgage-file-templates`, data);
  },
  updateTemplate: (data, id) => {
    return axios.put(`${JWT_HOST_API}/mortgage-file-templates/${id}`, data);
  },
  getTemplate: (category = 1, source = 1) => {
    return axios.get(
      `${JWT_HOST_API}/mortgage-file-templates/${category}/${source}`,
    );
  },
  uploadLeads: (source, formData) => {
    return axios.post(
      `${JWT_HOST_API}/files/upload/mailer-with-mortgage?source_id=${source}&category_id=1`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
 
};

export default leadUploadService;
