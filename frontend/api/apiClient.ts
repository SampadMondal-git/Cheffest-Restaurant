import axios from "axios";

const getStoredToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
};

const apiBaseUrl = (import.meta as unknown as {
  env: { VITE_API_URL: string };
}).env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
