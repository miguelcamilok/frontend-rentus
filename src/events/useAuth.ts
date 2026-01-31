// composables/useAuth.ts
import { ref, computed } from "vue";
import {
  authService,
  type User,
  type LoginData,
  type RegisterData,
} from "../services/auth";

// ==================== ESTADO GLOBAL (SINGLETON) ====================
// Este estado se comparte entre todas las instancias del composable
const user = ref<User | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// ==================== COMPOSABLE ====================
export function useAuth() {
  // Estado computado
  const isAuthenticated = computed(
    () => !!user.value && authService.isAuthenticated()
  );

  // ==================== MÉTODOS ====================

  /**
   * Limpiar mensaje de error
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Iniciar sesión
   */
  const login = async (credentials: LoginData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.user) {
        user.value = response.user;
        console.log('✅ Usuario guardado en estado global:', user.value);
        return response;
      }

      throw new Error(response.message || "Error en el inicio de sesión");
    } catch (err: unknown) {
      console.error('❌ Error en login (composable):', err);
      
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

  /**
   * Registrar nuevo usuario
   */
  const register = async (userData: RegisterData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.register(userData);
      
      if (response.success && response.user) {
        user.value = response.user;
        console.log('✅ Usuario registrado y guardado:', user.value);
        return response;
      }

      throw new Error(response.message || "Error en el registro");
    } catch (err: unknown) {
      console.error('❌ Error en register (composable):', err);
      
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

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    isLoading.value = true;

    try {
      await authService.logout();
      user.value = null;
      error.value = null;
      console.log('✅ Sesión cerrada correctamente');
    } catch (err: unknown) {
      console.error('❌ Error en logout:', err);
      // Limpiar de todas formas aunque falle el servidor
      user.value = null;
      error.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Obtener datos del usuario actual
   */
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
      console.log('✅ Usuario obtenido:', user.value);
    } catch (err: unknown) {
      console.error('❌ Error al obtener usuario:', err);
      
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Error al obtener usuario";
      }
      
      // Token probablemente expirado, cerrar sesión
      await logout();
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Refrescar token JWT
   */
  const refreshToken = async () => {
    try {
      await authService.refreshToken();
      console.log('✅ Token refrescado');
    } catch (err: unknown) {
      console.error('❌ Error al refrescar token:', err);
      
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Error al refrescar token";
      }
      
      await logout();
      throw err;
    }
  };

  // ==================== SINCRONIZACIÓN ENTRE TABS ====================
  // Escuchar cambios en localStorage para sincronizar entre pestañas
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_token') {
        if (!event.newValue) {
          // Token eliminado en otra pestaña
          user.value = null;
          console.log('🔄 Token eliminado en otra pestaña');
        } else if (event.oldValue !== event.newValue) {
          // Token actualizado en otra pestaña
          fetchUser();
          console.log('🔄 Token actualizado en otra pestaña');
        }
      }
    });
  }

  // ==================== CARGA AUTOMÁTICA ====================
  // Cargar usuario automáticamente si hay token válido
  if (authService.isAuthenticated() && !user.value) {
    fetchUser();
  }

  // ==================== RETORNAR API PÚBLICA ====================
  return {
    // Estado (computed para reactividad)
    user: computed(() => user.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    
    // Métodos
    login,
    register,
    logout,
    fetchUser,
    refreshToken,
    clearError,
  };
}