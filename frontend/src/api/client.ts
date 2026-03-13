import axios from "axios";
import { clearAuthToken, getAuthToken } from "../auth/tokenStorage";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000
});

client.interceptors.request.use((config) => {
  const headers = config.headers ?? {};
  headers["X-Client-Request-ID"] = Math.random().toString(16).slice(2, 10);
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  config.headers = headers;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
