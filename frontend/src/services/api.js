// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://sistema-belleza.onrender.com/api", // Ajusta si el backend está en otra URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Agregar token automáticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo de expiración de token
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);

export default API;
