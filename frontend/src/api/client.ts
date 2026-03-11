import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000
});

client.interceptors.request.use((config) => {
  const headers = config.headers ?? {};
  headers["X-Client-Request-ID"] = Math.random().toString(16).slice(2, 10);
  config.headers = headers;
  return config;
});

export default client;
