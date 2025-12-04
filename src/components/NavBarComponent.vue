<template>
  <header class="property-header">
    <div class="logo" @click="goHome" style="cursor: pointer">
      <img src="../assets/logo-white.png" alt="Logo" />
      <div class="logo-text"><strong>Rent</strong><span>Us</span></div>
    </div>

    <!-- Hamburger menu button -->
    <button 
      class="hamburger-btn" 
      @click="toggleMobileMenu"
      :class="{ active: showMobileMenu }"
      aria-label="Menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Barra de navegación con menú móvil -->
    <nav class="navigation-section" :class="{ 'mobile-active': showMobileMenu }">
      <div class="nav-links">
        
        <!-- LINK INICIO -->
        <router-link 
          to="/" 
          class="nav-link"
          :class="{ active: isActive('/') }"
          @click="closeMobileMenu"
        >
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Inicio</span>
        </router-link>

        <!-- LINK PROPIEDADES -->
        <router-link 
          to="/propiedades" 
          class="nav-link"
          :class="{ active: isActive('/propiedades') }"
          @click="closeMobileMenu"
        >
          <span class="nav-icon">🏢</span>
          <span class="nav-text">Propiedades</span>
        </router-link>

        <!-- LINK NOSOTROS -->
        <router-link 
          to="/sobre-nosotros" 
          class="nav-link"
          :class="{ active: isActive('/sobre-nosotros') }"
          @click="closeMobileMenu"
        >
          <span class="nav-icon">👥</span>
          <span class="nav-text">Nosotros</span>
        </router-link>
      </div>

      <!-- Login button en menú móvil -->
      <button 
        v-if="!isLoggedIn" 
        @click="goLogin" 
        class="login-btn mobile-login-btn" 
        type="button"
      >
        Iniciar Sesión
      </button>
    </nav>

    <!-- Login button desktop -->
    <button 
      v-if="!isLoggedIn" 
      @click="goLogin" 
      class="login-btn desktop-login-btn" 
      type="button"
    >
      Iniciar Sesión
    </button>

    <!-- DROPDOWN USUARIO -->
    <div v-else class="user-profile" id="userToggle" @click="toggleUserDropdown">
      <div class="user-avatar">
        <img v-if="profilePhoto" :src="profilePhoto" alt="Usuario" class="avatar-img" />
        <img v-else src="/img/default.webp" alt="Usuario" class="avatar-img" />
        <div class="status-indicator"></div>
      </div>
      
      <div class="user-details">
        <div class="user-greeting">Hola, {{ firstName }}</div>
        <div class="user-role"></div>
      </div>
      
      <div class="dropdown-arrow" :class="{ rotated: showDropdown }">
        <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
          <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Dropdown Menu -->
      <transition name="dropdown-fade">
        <div v-if="showDropdown" class="user-dropdown-menu" @click.stop>
          <div class="dropdown-header">
            <button 
              class="dropdown-close-btn" 
              @click="closeDropdown"
              aria-label="Cerrar menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-linecap="round"/>
              </svg>
            </button>
            
            <div class="dropdown-avatar">
              <img v-if="profilePhoto" :src="profilePhoto" alt="Usuario" />
              <img v-else src="/img/default.webp" alt="Usuario" />
            </div>
            <div class="dropdown-user-info">
              <div class="dropdown-name">{{ fullName }}</div>
              <div class="dropdown-email">{{ userEmail }}</div>
            </div>
          </div>
          
          <div class="dropdown-divider"></div>
          
          <div class="dropdown-items">
            <div @click="goPerfil" class="dropdown-item">
              <div class="item-icon">👤</div>
              <div class="item-text">Mi Perfil</div>
            </div>
            
            <div @click="openNotificaciones" class="dropdown-item">
              <div class="item-icon">🔔</div>
              <div class="item-text">Notificaciones</div>
              <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
            </div>
            
            <div @click="goContratos" class="dropdown-item">
              <div class="item-icon">📄</div>
              <div class="item-text">Contratos</div>
            </div>
            
            <div @click="goPagos" class="dropdown-item">
              <div class="item-icon">💳</div>
              <div class="item-text">Pagos</div>
            </div>
            
            <div class="dropdown-section-divider">Solicitudes</div>
            
            <div @click="openMaintenanceModal" class="dropdown-item">
              <div class="item-icon">🔧</div>
              <div class="item-text">Mantenimiento</div>
            </div>
            
            <div @click="openSolicitudesModal" class="dropdown-item">
              <div class="item-icon">📋</div>
              <div class="item-text">Solicitudes (Dueño)</div>
            </div>
            
            <div @click="openMyRequestsModalFn" class="dropdown-item">
              <div class="item-icon">📅</div>
              <div class="item-text">Mis Solicitudes</div>
            </div>
            
            <div class="dropdown-section-divider">Configuración</div>
            
            <div @click="goAjustes" class="dropdown-item">
              <div class="item-icon">⚙️</div>
              <div class="item-text">Ajustes</div>
            </div>
            
            <div @click="handleLogout" class="dropdown-item logout-item">
              <div class="item-icon">🚪</div>
              <div class="item-text">Cerrar Sesión</div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </header>

  <div 
    class="dropdown-backdrop" 
    :class="{ active: showDropdown }"
    @click="closeDropdown"
  ></div>

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <MaintenanceModal 
    :is-visible="showMaintenanceModal" 
    @close="showMaintenanceModal = false"
    @submitted="handleMaintenanceSubmitted" 
  />

  <RequestsView 
    :open="showRequestModal" 
    @close="showRequestModal = false" 
  />

  <NotificationsView 
    :open="showNotificaciontModal" 
    @close="showNotificaciontModal = false" 
  />

  <MyRequestsModal 
    :open="showMyRequestsModal" 
    @close="showMyRequestsModal = false" 
  />
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "../services/auth";
import type { User } from "../services/auth";
import { notificationService } from "../services/notificationService";
import MaintenanceModal from '../components/modals/Maintenance/MaintenanceModal.vue';
import RequestsView from "../components/modals/ModalRequest/RequestsView.vue";
import NotificationsView from "../components/modals/Notifications/NotificationsView.vue";
import MyRequestsModal from "../components/modals/ModalRequest/MyRequestsModal.vue";
import { eventBus, EVENTS } from '../events/eventBus';

const router = useRouter();
const route = useRoute();

// Estado de autenticación
const isLoggedIn = ref(false);
const currentUser = ref<User | null>(null);
const fullName = ref("Usuario");
const firstName = ref("Usuario");
const userEmail = ref("");
const profilePhoto = ref("");

// Estado de UI
const showDropdown = ref(false);
const showMobileMenu = ref(false);
const showMaintenanceModal = ref(false);
const showRequestModal = ref(false);
const showNotificaciontModal = ref(false);
const showMyRequestsModal = ref(false);
const unreadCount = ref(0);

const isActive = (path: string) => {
  return route.path === path;
};

// ==================== Funciones de autenticación ====================

/**
 * Verificar y cargar datos del usuario
 */
const checkAuthAndLoadUser = async () => {
  try {
    // Verificar si está autenticado
    if (!authService.isAuthenticated()) {
      isLoggedIn.value = false;
      currentUser.value = null;
      return;
    }

    // Obtener usuario del storage primero (más rápido)
    const storedUser = authService.getUser();
    if (storedUser) {
      updateUserData(storedUser);
      isLoggedIn.value = true;
    }

    // Luego verificar con el servidor
    const user = await authService.getMe();
    updateUserData(user);
    currentUser.value = user;
    isLoggedIn.value = true;

    // Cargar notificaciones si está logueado
    await loadUnreadCount();

  } catch (error) {
    console.error("Error verificando autenticación:", error);
    // Si falla, limpiar todo
    await handleLogout();
  }
};

/**
 * Actualizar datos del usuario en la UI
 */
const updateUserData = (user: User) => {
  fullName.value = user.name || "Usuario";
  firstName.value = fullName.value.split(" ")[0];
  userEmail.value = user.email || "";

  // Truncar nombre si es muy largo
  if (firstName.value.length > 10) {
    firstName.value = firstName.value.slice(0, 10) + "...";
  }

  profilePhoto.value = user.photo || "";
};

/**
 * Manejar cierre de sesión
 */
const handleLogout = async () => {
  try {
    await authService.logout();
    console.log('✅ Sesión cerrada exitosamente');
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  } finally {
    // Limpiar estado local
    isLoggedIn.value = false;
    currentUser.value = null;
    fullName.value = "Usuario";
    firstName.value = "Usuario";
    userEmail.value = "";
    profilePhoto.value = "";
    showDropdown.value = false;
    
    // Redirigir a login
    router.push("/login");
  }
};


// ==================== Funciones de navegación ====================

const goHome = () => {
  router.push("/");
  closeMobileMenu();
};

const goLogin = () => {
  router.push("/login");
  closeMobileMenu();
};

const goPerfil = () => {
  router.push('/perfil');
  closeDropdown();
  closeMobileMenu();
};

const goContratos = () => {
  router.push("/contratos");
  closeDropdown();
  closeMobileMenu();
};

const goPagos = () => {
  router.push("/pagos");
  closeDropdown();
  closeMobileMenu();
};

const goAjustes = () => {
  router.push("/ajustes");
  closeDropdown();
  closeMobileMenu();
};

// ==================== Funciones de UI ====================

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  if (showMobileMenu.value) {
    showDropdown.value = false; // Cerrar dropdown al abrir menú móvil
  }
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

const toggleUserDropdown = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    showMobileMenu.value = false; // Cerrar menú móvil al abrir dropdown
    // Prevenir scroll en mobile
    if (window.innerWidth <= 768) {
      document.body.classList.add('dropdown-open');
    }
  } else {
    document.body.classList.remove('dropdown-open');
  }
};

const closeDropdown = () => {
  showDropdown.value = false;
  document.body.classList.remove('dropdown-open');
};

// ==================== Funciones de modales ====================

const openMaintenanceModal = () => {
  showMaintenanceModal.value = true;
  closeDropdown();
};

const handleMaintenanceSubmitted = (data: any) => {
  console.log('Solicitud de mantenimiento enviada:', data);
  // Aquí puedes agregar lógica adicional
};

const openSolicitudesModal = () => {
  showRequestModal.value = true;
  closeDropdown();
};

const openMyRequestsModalFn = () => {
  showMyRequestsModal.value = true;
  closeDropdown();
};

const openNotificaciones = () => {
  showNotificaciontModal.value = true;
  closeDropdown();
};

// ==================== Funciones de notificaciones ====================

/**
 * Cargar contador de notificaciones no leídas
 */
const loadUnreadCount = async () => {
  try {
    if (!isLoggedIn.value) return;
    
    const response = await notificationService.getUnreadCount();
    unreadCount.value = response.count;
  } catch (error) {
    console.error("Error cargando contador de notificaciones:", error);
  }
};

/**
 * Manejar actualización de foto de perfil
 */
const handlePhotoUpdate = (newPhoto: string) => {
  profilePhoto.value = newPhoto;

  // Actualizar en el storage
  if (currentUser.value) {
    currentUser.value.photo = newPhoto;
    const isRemembered = !!localStorage.getItem("auth_token");
    const storage = isRemembered ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(currentUser.value));
  }
};

// ==================== Event handlers ====================

/**
 * Cerrar dropdown/menú al hacer clic fuera
 */
const handleClickOutside = (event: MouseEvent) => {
  const userMenu = document.getElementById("userToggle");
  const dropdown = document.querySelector(".user-dropdown-menu");
  const hamburger = document.querySelector(".hamburger-btn");
  const mobileNav = document.querySelector(".navigation-section");

  // Cerrar dropdown de usuario
  if (
    userMenu && 
    dropdown && 
    !userMenu.contains(event.target as Node) &&
    !dropdown.contains(event.target as Node) &&
    showDropdown.value
  ) {
    closeDropdown();
  }

  // Cerrar menú móvil
  if (
    hamburger &&
    mobileNav &&
    !hamburger.contains(event.target as Node) &&
    !mobileNav.contains(event.target as Node) &&
    showMobileMenu.value
  ) {
    showMobileMenu.value = false;
  }
};

// ==================== Watchers ====================

/**
 * Observar cambios en la ruta para recargar datos si es necesario
 */
watch(() => route.path, async () => {
  // Verificar autenticación al cambiar de ruta
  if (authService.isAuthenticated() && !isLoggedIn.value) {
    await checkAuthAndLoadUser();
  }
});

// ==================== Lifecycle hooks ====================
let notificationInterval: number | undefined;

onMounted(async () => {
  await checkAuthAndLoadUser();

  document.addEventListener("click", handleClickOutside);
  eventBus.on(EVENTS.PROFILE_PHOTO_UPDATED, handlePhotoUpdate);

  // Inicializar intervalo
  notificationInterval = window.setInterval(() => {
    if (isLoggedIn.value) {
      loadUnreadCount();
    }
  }, 30000);
});

onBeforeUnmount(() => {
  if (notificationInterval) clearInterval(notificationInterval);

  document.removeEventListener("click", handleClickOutside);
  eventBus.off(EVENTS.PROFILE_PHOTO_UPDATED, handlePhotoUpdate);

  document.body.classList.remove("dropdown-open");
  document.body.classList.remove("mobile-menu-open");
});
</script>

<style scoped>
@import "../assets/css/components/navbar.css";
</style>