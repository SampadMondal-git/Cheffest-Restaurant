import axios from "axios";

const getStoredToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
};

export const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    } as any;
  }

  return config;
});

export default apiClient;
