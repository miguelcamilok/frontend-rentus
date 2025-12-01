// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import MainLayout from '../layouts/MainLayout.vue';
import HomeView from '../views/HomeView.vue';
import MapView from '../components/MapView.vue';
import PropertyDetail from '../views/Property/PropertyDetail.vue';
import LoginView from '../views/Auth/LoginView.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: HomeView, meta: { title: 'Inicio' } },
      { path: 'properties/:id', name: 'PropertyDetail', component: PropertyDetail, meta: { title: 'Detalle de Propiedad' } },
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

export default router;