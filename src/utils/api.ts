import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Vite ke liye

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
