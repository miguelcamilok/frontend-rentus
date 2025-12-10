// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

library.add(faDownload)

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(router);
app.component('font-awesome-icon', FontAwesomeIcon)

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