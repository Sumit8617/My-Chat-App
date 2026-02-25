import axios from "axios";

const BASE =
  import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const axiosInstance = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
  timeout: 15000,
});

// GLOBAL ERROR HANDLING
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network error or server unreachable");
    }
    return Promise.reject(error);
  }
);