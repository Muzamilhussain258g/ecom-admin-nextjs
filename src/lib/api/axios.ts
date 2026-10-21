import axios from "axios";

/** Browser client for public/backend calls that need NEXT_PUBLIC_API_BASE_URL. */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("Configure NEXT_PUBLIC_API_BASE_URL for API calls.");
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
);
