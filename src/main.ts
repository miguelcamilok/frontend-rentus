// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App);

// 1️⃣ Crear Pinia
const pinia = createPinia();
app.use(pinia);

// 2️⃣ Usar router
app.use(router);

// 3️⃣ Montar la app
app.mount('#app');

// --- Código para título dinámico y favicon ---
function setFavicon() {
  const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) return;

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  // Contraste: tema oscuro → logo blanco, tema claro → logo negro
  link.href = isDark ? '/src/assets/logo-white.png' : '/src/assets/logo-black.png';
}

// Ejecutar al cargar la app
setFavicon();

// Escuchar cambios en el tema del sistema
window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', setFavicon);

// Actualizar título de la pestaña según la ruta
router.afterEach((to) => {
  document.title = `RentUs - ${to.meta.title || ''}`;
});
