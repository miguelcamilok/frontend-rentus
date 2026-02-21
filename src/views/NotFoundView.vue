<template>
  <main class="not-found">
    <div class="not-found__container">
      <div class="not-found__code" aria-hidden="true">404</div>

      <div class="not-found__content">
        <h1 class="not-found__title">Página no encontrada</h1>
        <p class="not-found__description">
          Lo sentimos, la página que buscas no existe o fue movida.
        </p>

        <div class="not-found__actions">
          <RouterLink to="/" class="btn btn--primary">
            <font-awesome-icon icon="home" aria-hidden="true" />
            Ir al inicio
          </RouterLink>
          <button class="btn btn--ghost" type="button" @click="goBack">
            <font-awesome-icon icon="arrow-left" aria-hidden="true" />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useHead } from '@unhead/vue';

useHead({
  title: '404 — Página no encontrada | RentUs',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

const router = useRouter();
const goBack = () => router.go(-1);
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
}

.not-found__container {
  text-align: center;
  max-width: 480px;
}

.not-found__code {
  font-size: clamp(6rem, 20vw, 10rem);
  font-weight: 900;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 1.5rem;
}

.not-found__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e1b4b;
  margin-bottom: 0.75rem;
}

.not-found__description {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.not-found__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  text-decoration: none;
}

.btn--primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #ffffff;
}
.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
}

.btn--ghost {
  background: transparent;
  color: #4f46e5;
  border-color: #4f46e5;
}
.btn--ghost:hover {
  background: #f0f4ff;
}
</style>
