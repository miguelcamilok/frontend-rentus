// services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://api.rentus/api",
});

// Interceptor: agrega el token automáticamente en todas las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// API de Google Maps
const googleApi = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api",
  timeout: 10000,
});

export { api, googleApi };
export default api;
