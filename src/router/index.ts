// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { authService } from "@/services/auth";
import logger from "@/utils/logger";

// ── Eager-loaded routes (critical path) ──────────────────────────────────
import MainLayout from "@/layouts/MainLayout.vue";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/Auth/LoginView.vue";

// ── Lazy-loaded routes ────────────────────────────────────────────────────
const RegisterView = () => import("@/views/Auth/RegisterView.vue");
const ConfirmEmailView = () => import("@/views/Auth/ConfirmEmailView.vue");
const ResetPasswordView = () => import("@/views/Auth/ResetPasswordView.vue");
const PropertyDetail = () => import("@/views/Property/PropertyDetail.vue");
const ProfileView = () => import("@/views/Dropdown/ProfileView.vue");
const PropertyView = () => import("@/views/Property/PropertyView.vue");
const PropertyCreate = () => import("@/views/Property/PropertyCreate.vue");
const PropertyEdit = () => import("@/views/Property/PropertyEdit.vue");
const AboutUsView = () => import("@/views/AboutUsView.vue");
const ContractView = () => import("@/views/Dropdown/ContractView.vue");
const PaymentsView = () => import("@/views/Dropdown/PaymentsView.vue");
const MaintenancesView = () => import("@/views/Dropdown/MaintenancesView.vue");
const ReportsView = () => import("@/views/Dropdown/ReportsView.vue");
const SettingsView = () => import("@/views/Dropdown/SettingsView.vue");
const MapExplorerView = () => import("@/views/Map/MapExplorerView.vue");
const MapView = () => import("@/components/modals/Maps/MapView.vue");
const NotFoundView = () => import("@/views/NotFoundView.vue");

// ── Admin routes ──────────────────────────────────────────────────────────
import { adminRoutes } from "@/admin/router/admin.routes";

// ── Route definitions ─────────────────────────────────────────────────────
const routes: RouteRecordRaw[] = [
  // Routes with main layout
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomeView,
        meta: { title: "Inicio" },
      },
      {
        path: "properties/:id",
        name: "PropertyDetail",
        component: PropertyDetail,
        meta: { title: "Detalle de Propiedad" },
      },
      {
        path: "/perfil",
        name: "ProfileView",
        component: ProfileView,
        meta: { title: "Perfil", requiresAuth: true },
      },
      {
        path: "/propiedades",
        name: "PropertyView",
        component: PropertyView,
        meta: { title: "Propiedades" },
      },
      {
        path: "/properties/create",
        name: "PropertyCreate",
        component: PropertyCreate,
        meta: { title: "Crear Propiedad", requiresAuth: true },
      },
      {
        path: "/propiedades/:id/editar",
        name: "PropertyEdit",
        component: PropertyEdit,
        meta: { title: "Editar Propiedad", requiresAuth: true },
      },
      {
        path: "/sobre-nosotros",
        name: "AboutUsView",
        component: AboutUsView,
        meta: { title: "Sobre Nosotros" },
      },
      {
        path: "/contratos",
        name: "ContractView",
        component: ContractView,
        meta: { title: "Contratos", requiresAuth: true },
      },
      {
        path: "/pagos",
        name: "PaymentsView",
        component: PaymentsView,
        meta: { title: "Mis Pagos", requiresAuth: true },
      },
      {
        path: "/mantenimiento",
        name: "MaintenancesView",
        component: MaintenancesView,
        meta: { title: "Mantenimiento", requiresAuth: true },
      },
      {
        path: "/reportes",
        name: "ReportsView",
        component: ReportsView,
        meta: { title: "Mis Reportes", requiresAuth: true },
      },
      {
        path: "/ajustes",
        name: "SettingsView",
        component: SettingsView,
        meta: { title: "Ajustes de Cuenta", requiresAuth: true },
      },
    ],
  },

  // Admin panel
  ...adminRoutes,

  // Map views (no layout)
  {
    path: "/mapa",
    name: "MapExplorer",
    component: MapExplorerView,
    meta: { title: "Explorar en Mapa" },
  },
  {
    path: "/map/:id",
    name: "MapView",
    component: MapView,
    props: true,
    meta: { title: "Mapa de Propiedad" },
  },

  // Auth views (no layout)
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { title: "Iniciar Sesión", hideForAuth: true },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
    meta: { title: "Registro", hideForAuth: true },
  },
  {
    path: "/confirm-email",
    name: "ConfirmEmail",
    component: ConfirmEmailView,
    meta: { title: "Confirmar Email" },
    beforeEnter: (to, _from, next) => {
      const token =
        typeof to.query.token === "string" ? to.query.token : undefined;
      if (!token) {
        next({ name: "home" });
        return;
      }
      next();
    },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ResetPasswordView,
    meta: { title: "Recuperar Contraseña", hideForAuth: true },
  },

  // 404 — dedicated page instead of silent redirect
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundView,
    meta: { title: "Página no encontrada" },
  },
];

// ── Router instance ───────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0, behavior: "smooth" };
  },
});

// ── Navigation guard ──────────────────────────────────────────────────────
router.beforeEach(async (to, _from, next) => {
  // Update document title
  document.title = to.meta.title
    ? `${to.meta.title} | RentUs`
    : "RentUs — Encuentra tu hogar ideal";

  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  const hideForAuth = to.matched.some((r) => r.meta.hideForAuth);
  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin);
  const requiresRole = to.meta.requiresRole as string | undefined;

  // 1. Protected route, no session
  if (requiresAuth && !isAuthenticated) {
    localStorage.setItem("redirectAfterLogin", to.fullPath);
    next({ name: "Login", query: { redirect: to.fullPath } });
    return;
  }

  // 2. Authenticated user tries to visit login/register
  if (hideForAuth && isAuthenticated) {
    try {
      const user = await authService.getMe();
      if (user.role === "admin" || user.role === "support") {
        next({ name: "admin-dashboard" });
      } else {
        next({ name: "home" });
      }
    } catch {
      next({ name: "home" });
    }
    return;
  }

  // 3. Validate token on protected routes + check admin role
  if (isAuthenticated && requiresAuth) {
    try {
      const user = await authService.getMe();

      if (requiresAdmin) {
        const role = user.role;
        if (role !== "admin" && role !== "support") {
          logger.warn("Access denied — admin role required.");
          next({ name: "home", query: { error: "unauthorized" } });
          return;
        }
        if (requiresRole && role !== requiresRole) {
          logger.warn(
            `Access denied — requires role "${requiresRole}", has "${role}".`
          );
          next({
            name: "admin-dashboard",
            query: { error: "insufficient_permissions" },
          });
          return;
        }
      }

      next();
    } catch {
      await authService.logout();
      localStorage.setItem("redirectAfterLogin", to.fullPath);
      next({ name: "Login", query: { redirect: to.fullPath } });
    }
    return;
  }

  // 4. Admin route without any session
  if (requiresAdmin && !isAuthenticated) {
    localStorage.setItem("redirectAfterLogin", to.fullPath);
    next({ name: "Login", query: { redirect: to.fullPath } });
    return;
  }

  next();
});

// ── Error handler ─────────────────────────────────────────────────────────
router.onError((error) => {
  logger.error("Navigation error:", error);
});

export default router;