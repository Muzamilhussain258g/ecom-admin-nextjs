
import axios from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 15000,
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //     "ngrok-skip-browser-warning": "true",
    //   },
});

apiClient.interceptors.request.use((config) => {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        throw new Error("Configure API_BASE_URL to connect to the login API.");
    }
    return config;
});

apiClient.interceptors.response.use(
    // (response) => response.data.data,
    (error: unknown) => {
        // if (axios.isAxiosError(error)) {
        //     console.error("API Error:", {
        //         status: error.response?.status,
        //         message: error.message,
        //     });
        // }

        return Promise.reject(error);
    },
);
