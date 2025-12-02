// services/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://api.rentus/api",
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Variable para evitar loops infinitos en refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Función para obtener el token del storage correcto
const getToken = (): string | null => {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
};

// Función para guardar el token en el storage correcto
const saveToken = (token: string, remember: boolean = false) => {
  if (remember || localStorage.getItem("auth_token")) {
    localStorage.setItem("auth_token", token);
    sessionStorage.removeItem("auth_token");
  } else {
    sessionStorage.setItem("auth_token", token);
    localStorage.removeItem("auth_token");
  }
};

// Función para limpiar el storage
const clearStorage = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("user");
};

// Interceptor de REQUEST: agrega el token automáticamente
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de RESPONSE: maneja tokens expirados y refresh automático
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si es error 401 y no hemos intentado refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si la petición es al endpoint de login o refresh, no intentar refrescar
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/register')) {
        return Promise.reject(error);
      }

      // Si ya estamos refrescando, agregar a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar refrescar el token
        const response = await api.post('/auth/refresh');
        const newToken = response.data.token;

        if (newToken) {
          // Determinar si está en localStorage o sessionStorage
          const isRemembered = !!localStorage.getItem("auth_token");
          saveToken(newToken, isRemembered);

          // Procesar la cola de peticiones fallidas
          processQueue(null, newToken);

          // Actualizar el header de la petición original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // Reintentar la petición original
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar todo y redirigir
        processQueue(refreshError, null);
        clearStorage();
        
        // Solo redirigir si no estamos ya en login
        if (window.location.pathname !== '/login') {
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Manejar error 403 (Forbidden)
    if (error.response?.status === 403) {
      console.error('Acceso denegado: No tienes permisos para esta acción');
    }

    return Promise.reject(error);
  }
);

// API de Google Maps (sin cambios)
const googleApi = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api",
  timeout: 10000,
});

export { api, googleApi };
export default api;