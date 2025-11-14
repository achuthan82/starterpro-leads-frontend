import axios from "axios";
import { JWT_HOST_API, REQUEST_CONFIG } from "configs/auth.config";

const axiosPublic = axios.create({
  baseURL: JWT_HOST_API,
  ...REQUEST_CONFIG,
});

// PUBLIC RESPONSE ERROR HANDLING
axiosPublic.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error("Bad request:", data?.message || "Invalid request");
          break;

        case 401:
          console.warn("Unauthorized:", data?.message || "Invalid login credentials");
          break;

        case 403:
          console.error("Forbidden:", data?.message || "Access denied");
          break;

        case 404:
          console.error("Not found:", data?.message || "API endpoint not found");
          break;

        case 422:
          console.error("Validation error:", data?.errors || data?.message);
          break;

        case 429:
          console.error("Too many requests:", data?.message || "Rate limit exceeded");
          break;

        case 500:
          console.error("Server error:", data?.message || "Internal server error");
          break;

        default:
          console.error("API Error:", data?.message || "Something went wrong");
      }

      return Promise.reject(data || error.response);
    }

    // Network error
    if (error.request) {
      console.error("Network error:", error.request);
      return Promise.reject({ message: "Network error. Please check your connection." });
    }

    // Other errors
    console.error("Unexpected Error:", error.message);
    return Promise.reject({ message: error.message || "Unexpected error occurred" });
  }
);

export default axiosPublic;
