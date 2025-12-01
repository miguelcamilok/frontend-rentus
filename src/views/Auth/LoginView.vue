<template>
  <div class="auth-container">
    <!-- Panel Izquierdo - Hero Section -->
    <div class="hero-panel">
      <div class="hero-content">
        <!-- Logo y Título -->
        <div class="brand-section">
          <div class="logo-wrapper">
            <img
              src="../../assets/logo-black.png"
              alt="Logo RentUs"
              class="logo-icon"
            />
            <h1 class="brand-name">
              <span class="brand-rent">Rent</span>
              <span class="brand-us">Us</span>
            </h1>
          </div>
          <p class="brand-tagline">Tu hogar ideal te está esperando</p>
        </div>

        <!-- Mensajes Dinámicos -->
        <div class="welcome-section">
          <transition name="slide-fade" mode="out-in">
            <div :key="currentMessageIndex" class="dynamic-message">
              <h2 class="welcome-title">{{ currentMessage.title }}</h2>
              <p class="welcome-text">{{ currentMessage.text }}</p>
            </div>
          </transition>

          <!-- Indicadores de mensaje -->
          <div class="message-indicators">
            <button 
              v-for="(_, index) in messages" 
              :key="index"
              @click="currentMessageIndex = index"
              class="indicator-dot"
              :class="{ active: currentMessageIndex === index }"
            ></button>
          </div>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div class="hero-decoration">
        <div class="deco-circle deco-1"></div>
        <div class="deco-circle deco-2"></div>
        <div class="deco-circle deco-3"></div>
      </div>
    </div>

    <!-- Panel Derecho - Form Section -->
    <div class="form-panel">
      <div class="form-container">
        <!-- Back Button -->
        <button @click="goBack" class="btn-back">
          <span class="back-icon">←</span>
          <span class="back-text">Volver</span>
        </button>

        <!-- Tabs -->
        <div class="tabs-container">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'login' }"
            @click="setTab('login')"
          >
            Iniciar Sesión
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'register' }"
            @click="setTab('register')"
          >
            Registrarse
          </button>
        </div>

        <!-- Form Header -->
        <div class="form-header">
          <h2 class="form-title">Accede a tu cuenta</h2>
          <p class="form-subtitle">Ingresa tus credenciales para continuar</p>
        </div>

        <!-- Error Message -->
        <transition name="fade">
          <div v-if="errorMessage" class="alert-error">
            <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span class="alert-text">{{ errorMessage }}</span>
          </div>
        </transition>

        <!-- Login Form -->
        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email" class="form-label">Correo electrónico</label>
            <div class="input-wrapper">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                class="form-input"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <div class="input-wrapper">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-wrapper">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkbox-label">Recordarme</span>
            </label>
            <a href="#" class="link-forgot">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" class="btn-submit" :disabled="isLoading">
            <span v-if="!isLoading" class="btn-content">
              <span class="btn-text">Iniciar Sesión</span>
              <svg class="btn-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
            <span v-else class="btn-loader">
              <div class="spinner"></div>
              <span>Iniciando...</span>
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">O continúa con</span>
          <span class="divider-line"></span>
        </div>

        <!-- Social Login -->
        <div class="social-buttons">
          <button class="social-btn" @click="socialLogin('google')">
            <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" />
            <span>Google</span>
          </button>
          <button class="social-btn" @click="socialLogin('facebook')">
            <img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook" />
            <span>Facebook</span>
          </button>
          <button class="social-btn" @click="socialLogin('apple')">
            <img src="https://img.icons8.com/ios-filled/50/mac-os.png" alt="Apple" />
            <span>Apple</span>
          </button>
        </div>

        <!-- Footer Text -->
        <p class="form-footer">
          ¿No tienes una cuenta?
          <button @click="setTab('register')" class="link-register">
            Regístrate gratis
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useAuth } from "../../events/useAuth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);
const isLoading = ref(false);
const activeTab = ref("login");
const router = useRouter();
const { login } = useAuth();

// Mensajes dinámicos
const currentMessageIndex = ref(0);
const messages = [
  {
    title: "Bienvenido de nuevo",
    text: "Retoma tu búsqueda donde la dejaste y sigue construyendo tu futuro hogar."
  },
  {
    title: "Encuentra tu hogar ideal",
    text: "Accede a miles de propiedades disponibles en tu ciudad y comienza tu búsqueda hoy mismo."
  },
  {
    title: "Transacciones seguras",
    text: "Tu seguridad es nuestra prioridad. Realiza todas tus gestiones con total confianza."
  },
  {
    title: "Búsqueda inteligente",
    text: "Usa nuestros filtros avanzados para encontrar exactamente lo que necesitas en segundos."
  }
];

const currentMessage = computed(() => messages[currentMessageIndex.value]);

let messageInterval: number | null = null;

onMounted(() => {
  // Cambiar mensaje cada 5 segundos
  messageInterval = window.setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length;
  }, 5000);
});

onUnmounted(() => {
  if (messageInterval) {
    clearInterval(messageInterval);
  }
});

const handleLogin = async () => {
  errorMessage.value = "";
  isLoading.value = true;

  try {
    const response = await login({
      email: email.value,
      password: password.value,
    });

    if (response?.token && response?.user) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify({ name: response.user.name }));
      
      // Verificar si hay una URL de redirección guardada
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectUrl);
      } else {
        router.push("/");
      }
    } else {
      errorMessage.value = "Correo o contraseña incorrectos.";
    }
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    errorMessage.value = "Error al iniciar sesión. Intenta nuevamente.";
  } finally {
    isLoading.value = false;
  }
};

const setTab = (tab: string) => {
  activeTab.value = tab;
  if (tab === "register") router.push("/register");
  if (tab === "login") router.push("/login");
};

const goBack = () => {
  router.push("/");
};

const socialLogin = (provider: string) => {
  console.log(`Login con ${provider}`);
  // Implementar lógica de login social
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* ========== HERO PANEL ========== */
.hero-panel {
  flex: 1;
  background: linear-gradient(135deg, #DED5C4 0%, #C4B5A0 100%);
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.brand-section {
  margin-bottom: 4rem;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo-icon {
  width: 56px;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.brand-name {
  font-size: 2.5rem;
  font-weight: 900;
  display: flex;
  margin: 0;
  letter-spacing: -0.5px;
}

.brand-rent {
  color: #000;
}

.brand-us {
  color: #4D2F24;
}

.brand-tagline {
  color: #4D2F24;
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
  margin-left: 72px;
}

.welcome-section {
  margin-top: 3rem;
}

.welcome-title {
  font-size: 3rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.welcome-text {
  font-size: 1.2rem;
  color: #4D2F24;
  line-height: 1.7;
  max-width: 500px;
  opacity: 0.9;
}

.dynamic-message {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.message-indicators {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(77, 47, 36, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.indicator-dot.active {
  background: #4D2F24;
  transform: scale(1.3);
}

.indicator-dot:hover {
  background: rgba(77, 47, 36, 0.6);
}

/* Transiciones para mensajes dinámicos */
.slide-fade-enter-active {
  transition: all 0.4s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Decorative Elements */
.hero-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.deco-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -50px;
}

.deco-2 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  left: -50px;
}

.deco-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 15%;
}

/* ========== FORM PANEL ========== */
.form-panel {
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.form-container {
  width: 100%;
  max-width: 480px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.btn-back:hover {
  color: #4D2F24;
  transform: translateX(-5px);
}

.back-icon {
  font-size: 1.4rem;
  font-weight: 300;
}

.tabs-container {
  display: flex;
  gap: 0.5rem;
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 16px;
  margin-bottom: 2.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: white;
  color: #4D2F24;
  box-shadow: 0 4px 12px rgba(77, 47, 36, 0.15);
}

.form-header {
  margin-bottom: 2rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

/* Alert */
.alert-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fee2e2;
  border-left: 4px solid #ef4444;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.alert-icon {
  flex-shrink: 0;
  color: #991b1b;
}

.alert-text {
  color: #991b1b;
  font-size: 0.9rem;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: #4D2F24;
  background: white;
  box-shadow: 0 0 0 4px rgba(77, 47, 36, 0.1);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.toggle-password:hover {
  color: #4D2F24;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.5rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4D2F24;
}

.checkbox-label {
  font-size: 0.9rem;
  color: #6b7280;
  user-select: none;
}

.link-forgot {
  font-size: 0.9rem;
  color: #4D2F24;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.3s;
}

.link-forgot:hover {
  opacity: 0.8;
}

.btn-submit {
  width: 100%;
  padding: 1.125rem;
  background: linear-gradient(135deg, #4D2F24 0%, #3a2219 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(77, 47, 36, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(77, 47, 36, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.btn-submit:hover:not(:disabled) .btn-arrow {
  transform: translateX(5px);
}

.btn-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Social Buttons */
.social-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: white;
  border-color: #4D2F24;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-btn img {
  width: 28px;
  height: 28px;
}

.social-btn span {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
}

/* Footer */
.form-footer {
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
}

.link-register {
  background: transparent;
  border: none;
  color: #4D2F24;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.25rem;
}

.link-register:hover {
  opacity: 0.8;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 1024px) {
  .auth-container {
    flex-direction: column;
  }

  .hero-panel {
    min-height: 40vh;
    padding: 3rem 2rem;
  }

  .welcome-title {
    font-size: 2.5rem;
  }

  .form-panel {
    padding: 3rem 2rem;
  }
}

@media (max-width: 640px) {
  .hero-panel {
    padding: 2rem 1.5rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .welcome-text {
    font-size: 1rem;
  }

  .form-container {
    max-width: 100%;
  }

  .social-buttons {
    grid-template-columns: 1fr;
  }
}
</style>