// services/auth.ts
import api from "./api";
import { AxiosError } from "axios";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  id_documento: string;
  status: string;
  photo?: string;
  bio?: string;
  department?: string;
  city?: string;
}

export interface RegisterData {
  name: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  id_documento: string;
  status?: string;
}

export interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token: string;
  message?: string;
  expires_in?: number;
  token_type?: string;
  remember?: boolean;
}

// Interfaz para errores de validación de Laravel
interface ValidationErrors {
  [key: string]: string[];
}

interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: ValidationErrors;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Buscar token en localStorage o sessionStorage
    this.token = this.getToken();
    if (this.token) {
      this.setAuthHeader(this.token);
    }
  }

  private setAuthHeader(token: string) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  private removeAuthHeader() {
    delete api.defaults.headers.common["Authorization"];
  }

  /**
   * Obtener token del storage correcto
   */
  getToken(): string | null {
    return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  }

  /**
   * Guardar token según preferencia de "Recordarme"
   */
  private saveToken(token: string, remember: boolean = false) {
    this.token = token;
    if (remember) {
      localStorage.setItem("auth_token", token);
      sessionStorage.removeItem("auth_token");
    } else {
      sessionStorage.setItem("auth_token", token);
      localStorage.removeItem("auth_token");
    }
    this.setAuthHeader(token);
  }

  /**
   * Guardar usuario en storage
   */
  private saveUser(user: User, remember: boolean = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(user));
  }

  /**
   * Obtener usuario del storage
   */
  getUser(): User | null {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Limpiar todo el storage
   */
  private clearStorage() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user");
    this.token = null;
    this.removeAuthHeader();
  }

  /**
   * Registrar nuevo usuario
   */
async register(userData: RegisterData): Promise<AuthResponse> {
  try {
    console.log('📤 Enviando registro:', userData);
    
    const response = await api.post<AuthResponse>("/auth/register", {
      ...userData,
      email: userData.email.trim().toLowerCase(),
      status: userData.status || 'active'
    });

    // Caso 1: registro exitoso con token (login automático)
    if (response.data.success && response.data.token && response.data.user) {
      this.saveToken(response.data.token, false);
      this.saveUser(response.data.user, false);
      console.log('✅ Registro y login exitoso:', response.data.user);
      return response.data;
    }

    // Caso 2: registro exitoso pero solo envío de correo
    if (response.data.success && !response.data.token) {
      console.log('✅ Registro exitoso, por favor verifica tu correo:', response.data.message);
      // Guardar email pendiente para verificación
      localStorage.setItem("pending_email", userData.email.trim().toLowerCase());
      return response.data;
    }

    // Caso 3: error real
    throw new Error(response.data.message || "Error en el registro");
    
  } catch (error: unknown) {
    console.error('❌ Error en registro:', error);
    
    if (error instanceof AxiosError) {
      const responseData = error.response?.data as ErrorResponse;
      
      // Manejar errores de validación 422
      if (error.response?.status === 422 && responseData?.errors) {
        const validationErrors = responseData.errors;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => {
            const fieldName = this.translateFieldName(field);
            return `${fieldName}: ${messages.join(', ')}`;
          })
          .join('\n');
        
        throw new Error(`Errores de validación:\n${errorMessages}`);
      }
      
      // Otros errores del backend
      throw new Error(
        responseData?.message || "Error en el registro"
      );
    }
    
    throw new Error("Error desconocido en el registro");
  }
}


  /**
   * Iniciar sesión
   */
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      console.log('📤 Intentando login...');
      
      const response = await api.post<AuthResponse>("/auth/login", {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        remember: credentials.remember || false
      });

      if (response.data.success && response.data.token) {
        const remember = credentials.remember || false;
        this.saveToken(response.data.token, remember);
        
        // Si el backend devuelve el usuario directamente
        if (response.data.user) {
          this.saveUser(response.data.user, remember);
          console.log('✅ Login exitoso:', response.data.user);
          return response.data;
        }
        
        // Si no, obtener el usuario con el token
        const user = await this.getMe();
        this.saveUser(user, remember);
        
        console.log('✅ Login exitoso:', user);
        return { ...response.data, user };
      }

      throw new Error(response.data.message || "Error en el login");
      
    } catch (error: unknown) {
      console.error('❌ Error en login:', error);
      
      if (error instanceof AxiosError) {
        const responseData = error.response?.data as ErrorResponse;
        
        // Manejar error 401 (credenciales inválidas)
        if (error.response?.status === 401) {
          throw new Error(responseData?.message || "Correo o contraseña incorrectos");
        }
        
        // Manejar error 403 (cuenta inactiva)
        if (error.response?.status === 403) {
          throw new Error(responseData?.message || "Tu cuenta está inactiva");
        }
        
        throw new Error(responseData?.message || "Error en el login");
      }
      
      throw new Error("Error de conexión. Verifica tu internet");
    }
  }

  /**
   * Obtener usuario autenticado
   */
  async getMe(): Promise<User> {
    try {
      const response = await api.get<{ success: boolean; user: User }>("/auth/me");
      
      if (response.data.success && response.data.user) {
        return response.data.user;
      }
      
      throw new Error("No se pudo obtener la información del usuario");
      
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const responseData = error.response?.data as ErrorResponse;
        
        // Si el token es inválido, limpiar storage
        if (error.response?.status === 401) {
          this.clearStorage();
        }
        
        throw new Error(
          responseData?.message || "Error al obtener usuario"
        );
      }
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.warn("Error al hacer logout en el servidor:", error);
    } finally {
      this.clearStorage();
    }
  }

  /**
   * Refrescar token (llamado automáticamente por el interceptor)
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await api.post<{ success: boolean; token: string }>("/auth/refresh");
      
      if (response.data.success && response.data.token) {
        const isRemembered = !!localStorage.getItem("auth_token");
        this.saveToken(response.data.token, isRemembered);
        console.log('✅ Token refrescado');
        return response.data.token;
      }
      
      throw new Error("No se pudo refrescar el token");
      
    } catch (error: unknown) {
      console.error('❌ Error al refrescar token:', error);
      await this.logout();
      throw new Error("Sesión expirada");
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Traducir nombres de campos para mensajes de error
   */
  private translateFieldName(field: string): string {
    const translations: { [key: string]: string } = {
      name: "Nombre",
      email: "Correo electrónico",
      phone: "Teléfono",
      password: "Contraseña",
      address: "Dirección",
      id_documento: "Documento de identidad",
      status: "Estado"
    };
    return translations[field] || field;
  }
}

export const authService = new AuthService();