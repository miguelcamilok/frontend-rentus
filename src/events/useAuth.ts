// composables/useAuth.ts
import { ref, computed } from "vue";
import {
  authService,
  type User,
  type LoginData,
  type RegisterData,
} from "../services/auth";

// Estado global del usuario (singleton)
const user = ref<User | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useAuth() {
  const isAuthenticated = computed(
    () => !!user.value && authService.isAuthenticated()
  );

  const clearError = () => {
    error.value = null;
  };

  const login = async (credentials: LoginData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);
      user.value = response.user || null;
      return response;
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Error desconocido al iniciar sesión";
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData: RegisterData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.register(userData);
      user.value = response.user || null;
      return response;
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Error desconocido en el registro";
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;

    try {
      await authService.logout();
      user.value = null;
      error.value = null;
    } catch (err: unknown) {
      console.error("Error en logout:", err);
      // Limpiar de todas formas
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUser = async () => {
    if (!authService.isAuthenticated()) {
      user.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const userData = await authService.getMe();
      user.value = userData;
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Error al obtener usuario";
      }
      // Token probablemente expirado
      await logout();
    } finally {
      isLoading.value = false;
    }
  };

  const refreshToken = async () => {
    try {
      await authService.refreshToken();
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Error al refrescar token";
      }
      await logout();
      throw err;
    }
  };

  // Cargar usuario automáticamente si hay token
  if (authService.isAuthenticated() && !user.value) {
    fetchUser();
  }

  return {
    user: computed(() => user.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    login,
    register,
    logout,
    fetchUser,
    refreshToken,
    clearError,
  };
}