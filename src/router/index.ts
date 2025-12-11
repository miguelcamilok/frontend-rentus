// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import MainLayout from '../layouts/MainLayout.vue';
import HomeView from '../views/HomeView.vue';
import MapView from '../components/modals/Maps/MapView.vue';
import PropertyDetail from '../views/Property/PropertyDetail.vue';
import LoginView from '../views/Auth/LoginView.vue';
import { authService } from "../services/auth";
import RegisterView from "../views/Auth/RegisterView.vue";
import ProfileView from "../views/Dropdown/ProfileView.vue";
import PropertyView from "../views/Property/PropertyView.vue";
import AboutUsView from "../views/AboutUsView.vue";
import ContractView from "../views/Dropdown/ContractView.vue";
import SettingsView from "../views/Dropdown/SettingsView.vue";

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: HomeView, meta: { title: 'Inicio' } },
      { path: 'properties/:id', name: 'PropertyDetail', component: PropertyDetail, meta: { title: 'Detalle de Propiedad' } },
      { path: '/perfil', name: 'ProfileView', component: ProfileView, meta: { title: 'Perfil'}},
      { path: '/propiedades', name: 'PropertyView', component: PropertyView, meta: { title: 'Propiedades'}},
      { path: '/sobre-nosotros', name: 'AboutUsView', component: AboutUsView, meta: { title: 'Sobre Nosotros'}},
      { path: '/contratos', name: 'ContractView', component: ContractView, meta: { title: 'Contratos'}},
      { path: '/ajustes', name: 'SettingsView', component: SettingsView, meta: { title: 'Ajustes de Cuenta'}},
    ]
  },

  {
    path: "/map/:id",
    name: "MapView",
    component: MapView,
    props: true,
    meta: { title: 'Mapa de Propiedad' }
  },

  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { title: 'Iniciar Sesión' }
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
    meta: { title: 'Registro' }
  },
  // Rutas sin layout (para que no muestren navbar ni footer)
  //{ path: "/login", name: "Login", component: LoginView },
  // { path: "/register", name: "Register", component: RegisterView },
  // { path: "/register/success", name: "RegisterSuccess", component: RegisterSuccessView },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Comportamiento de scroll: siempre ir al inicio en cada navegación
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  },
});

router.beforeEach(async (to, from, next) => {
  console.log(`🧭 Navegando de ${from.path} → ${to.path}`);

  // Actualizar título de la página
  if (to.meta.title) {
    document.title = `${to.meta.title} | RentUs`;
  } else {
    document.title = 'RentUs - Encuentra tu hogar ideal';
  }

  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const hideForAuth = to.matched.some(record => record.meta.hideForAuth);

  // ==================== CASO 1: Ruta requiere autenticación ====================
  if (requiresAuth && !isAuthenticated) {
    console.log('🔒 Ruta protegida, redirigiendo a login');

    // Guardar la ruta a la que intentaba acceder
    localStorage.setItem('redirectAfterLogin', to.fullPath);

    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    });
    return;
  }

  // ==================== CASO 2: Usuario autenticado intenta acceder a login/register ====================
  if (hideForAuth && isAuthenticated) {
    console.log('👤 Usuario autenticado, redirigiendo a inicio');
    next({ name: 'home' });
    return;
  }

  // ==================== CASO 3: Verificar validez del token en rutas protegidas ====================
  if (isAuthenticated && requiresAuth) {
    try {
      // Intentar obtener el usuario para validar el token
      await authService.getMe();
      console.log('✅ Token válido, permitiendo acceso');
      next();
    } catch (error) {
      console.error('❌ Token inválido:', error);

      // Token inválido, limpiar y redirigir a login
      await authService.logout();
      localStorage.setItem('redirectAfterLogin', to.fullPath);

      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      });
    }
    return;
  }

  // ==================== CASO 4: Permitir navegación ====================
  console.log('✅ Navegación permitida');
  next();
});

// ==================== Guard después de cada navegación ====================
router.afterEach((to, from) => {
  // Log para debugging en desarrollo
  if (import.meta.env.DEV) {
    console.log(`📍 Navegación completada: ${from.path} → ${to.path}`);
  }

  // Aquí puedes agregar analytics, tracking, etc.
  // Ejemplo: trackPageView(to.path);
});

// ==================== Manejo de errores de navegación ====================
router.onError((error) => {
  console.error('❌ Error en navegación:', error);

  // Puedes mostrar un mensaje al usuario o registrar el error
  // Ejemplo: notifyError('Error al cargar la página');
});

export default router;