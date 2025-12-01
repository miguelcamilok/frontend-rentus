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
        <router-link 
          to="/" 
          class="nav-link" 
          active-class="active" 
          exact
          @click="closeMobileMenu"
        >
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Inicio</span>
        </router-link>
        <router-link 
          to="/propiedades" 
          class="nav-link" 
          active-class="active"
          @click="closeMobileMenu"
        >
          <span class="nav-icon">🏢</span>
          <span class="nav-text">Propiedades</span>
        </router-link>
        <router-link 
          to="/sobre-nosotros" 
          class="nav-link" 
          active-class="active"
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

    <!-- Si está logueado - Dropdown -->
    <div v-else class="user-profile" id="userToggle" @click="toggleUserDropdown">
      <div class="user-avatar">
        <img v-if="profilePhoto" :src="profilePhoto" alt="Usuario" class="avatar-img" />
        <img v-else src="/img/default.webp" alt="Usuario" class="avatar-img" />
        <div class="status-indicator"></div>
      </div>
      
      <div class="user-details">
        <div class="user-greeting">Hola, {{ firstName }}</div>
        <div class="user-role">Inquilino</div>
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
            <div class="dropdown-avatar">
              <img v-if="profilePhoto" :src="profilePhoto" alt="Usuario" />
              <img v-else src="/img/default.webp" alt="Usuario" />
            </div>
            <div class="dropdown-user-info">
              <div class="dropdown-name">{{ fullName }}</div>
              <div class="dropdown-email">usuario@ejemplo.com</div>
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
            
            <div @click="logout" class="dropdown-item logout-item">
              <div class="item-icon">🚪</div>
              <div class="item-text">Cerrar Sesión</div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </header>

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <!-- MODAL DE MANTENIMIENTO -->
  <MaintenanceModal :is-visible="showMaintenanceModal" @close="showMaintenanceModal = false"
    @submitted="handleMaintenanceSubmitted" />

  <!-- MODAL DE SOLICITUDES -->
  <RequestsView :open="showRequestModal" @close="showRequestModal = false" />

  <NotificationsView :open="showNotificaciontModal" @close="showNotificaciontModal = false" />

  <MyRequestsModal :open="showMyRequestsModal" @close="showMyRequestsModal = false" />

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import { notificationService } from "../services/notificationService";
import MaintenanceModal from '../components/modals/Maintenance/MaintenanceModal.vue'
import RequestsView from "../components/modals/ModalRequest/RequestsView.vue";
import NotificationsView from "../components/modals/Notifications/NotificationsView.vue";
import MyRequestsModal from "../components/modals/ModalRequest/MyRequestsModal.vue";
import { eventBus, EVENTS } from '../events/eventBus';

const router = useRouter();
const isLoggedIn = ref(false);
const showDropdown = ref(false);
const showMobileMenu = ref(false);
const fullName = ref("Usuario");
const firstName = ref("Usuario");
const profilePhoto = ref("");
const showMaintenanceModal = ref(false)
const showRequestModal = ref(false)
const showNotificaciontModal = ref(false)
const showMyRequestsModal = ref(false)
const unreadCount = ref(0)

// Toggle mobile menu
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

// Cargar contador de notificaciones
const loadUnreadCount = async () => {
  try {
    const response = await notificationService.getUnreadCount();
    unreadCount.value = response.count;
  } catch (error) {
    console.error("Error cargando contador:", error);
  }
};

// Manejar actualizaciones desde el modal de notificaciones
const handleNotificationUpdate = (event) => {
  if (event.action === "refresh_count") {
    loadUnreadCount();
  } else if (event.action === "open_requests") {
    showRequestModal.value = true;
  } else if (event.action === "open_my_requests") {
    showMyRequestsModal.value = true;
  }
};

const openMaintenanceModal = () => {
  showMaintenanceModal.value = true
  showDropdown.value = false
}

const handleMaintenanceSubmitted = (data) => {
  console.log('Solicitud de mantenimiento enviada:', data)
}

const openSolicitudesModal = () => {
  showRequestModal.value = true
  showDropdown.value = false
}

const openMyRequestsModalFn = () => {
  showMyRequestsModal.value = true
  showDropdown.value = false
}

const openNotificaciones = () => {
  showNotificaciontModal.value = true
  showDropdown.value = false
}

// Funciones de API
async function fetchUserData() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      isLoggedIn.value = false;
      return;
    }
    isLoggedIn.value = true;

    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = response.data;
    fullName.value = user.name || "Usuario";
    firstName.value = fullName.value.split(" ")[0];

    if (firstName.value.length > 10) {
      firstName.value = firstName.value.slice(0, 10) + "...";
    }

    profilePhoto.value = user.photo || "";
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    logout();
  }
}

// Funciones de navegación
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
  showDropdown.value = false;
};

const goContratos = () => {
  router.push("/contratos");
  showDropdown.value = false;
};

const goPagos = () => {
  router.push("/pagos");
  showDropdown.value = false;
};

const goAjustes = () => {
  router.push("/ajustes");
  showDropdown.value = false;
};

const toggleUserDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  isLoggedIn.value = false;
  showDropdown.value = false;
  router.push("/login");
};

// Event handlers
function handleClickOutsideDropdown(event) {
  const userMenu = document.getElementById("userToggle");
  const dropdown = document.querySelector(".user-dropdown-menu");
  const hamburger = document.querySelector(".hamburger-btn");
  const mobileNav = document.querySelector(".navigation-section");

  if (!userMenu || !dropdown) return;

  if (
    !userMenu.contains(event.target) &&
    !dropdown.contains(event.target) &&
    showDropdown.value
  ) {
    showDropdown.value = false;
  }

  // Cerrar menú móvil al hacer clic fuera
  if (
    hamburger &&
    mobileNav &&
    !hamburger.contains(event.target) &&
    !mobileNav.contains(event.target) &&
    showMobileMenu.value
  ) {
    showMobileMenu.value = false;
  }
}

const handlePhotoUpdate = (newPhoto) => {
  profilePhoto.value = newPhoto;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  user.photo = newPhoto;
  localStorage.setItem("user", JSON.stringify(user));
};

// Lifecycle hooks
onMounted(async () => {
  await fetchUserData();
  await loadUnreadCount();
  document.addEventListener("click", handleClickOutsideDropdown);

  eventBus.on(EVENTS.PROFILE_PHOTO_UPDATED, handlePhotoUpdate);

  // Actualizar contador cada 30 segundos
  setInterval(() => {
    if (isLoggedIn.value) {
      loadUnreadCount();
    }
  }, 30000);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutsideDropdown);
  eventBus.off(EVENTS.PROFILE_PHOTO_UPDATED, handlePhotoUpdate);
});
</script>

<style scoped>
@import "../assets/css/navbar.css";
</style>