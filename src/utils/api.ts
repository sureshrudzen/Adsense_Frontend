import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Vite ke liye

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // agar cookies bhi use ho rahi hain
});

// 🔹 Interceptor: Har request me token lagana
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // login ke baad store kiya hoga
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
