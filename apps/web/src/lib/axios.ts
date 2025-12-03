// src/lib/axios.ts
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 120000,
  withCredentials: true, // THIS IS THE KEY — sends accessToken & refreshToken cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Global error handler (toast, redirect, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url === "/auth/me";
    // ONLY redirect on 401 if we're NOT on public pages
    if (error.response?.status === 401) {
      if (
        window &&
        ![
          "/login",
          "/register",
          "/",
          "/contact",
          "/about",
          "/destination",
          "/package",
        ].includes(window.location.pathname)
      ) {
        window.location.href = "/login";
      }

      // If it's just auth check → be silent
      if (isAuthCheck) {
        return Promise.reject(error); // no toast
      }
    }

    // Optional: Show error toast
    toast.error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong"
    );

    return Promise.reject(error);
  }
);

export default api;
