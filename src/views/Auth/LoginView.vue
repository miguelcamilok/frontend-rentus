<template>
  <div class="background-layer" aria-hidden="true">
    <!-- gradiente + luces por CSS -->
    <canvas ref="canvasEl" class="bg-canvas"></canvas>
  </div>

  <div class="auth-container">
    <!-- Fondo con imagen/gradiente -->

    <!-- Contenido sobre el fondo -->
    <div class="content-wrapper">
      <div class="brand-section">
        <div class="logo-wrapper">
          <img src="../../assets/logo-black.png" alt="Logo RentUs" class="logo-icon" />
          <h1 class="brand-name">
            <span class="brand-rent">Rent</span>
            <span class="brand-us">Us</span>
          </h1>
        </div>
      </div>
      <!-- Texto dinámico en la parte inferior -->
      <div class="dynamic-text-section">
        <transition name="slide-fade" mode="out-in">
          <div :key="currentMessageIndex" class="dynamic-message">
            <h2 class="welcome-title">{{ currentMessage.title }}</h2>
            <p class="welcome-text">{{ currentMessage.text }}</p>
          </div>
        </transition>

        <div class="message-indicators">
          <button v-for="(_, index) in messages" :key="index" @click="currentMessageIndex = index" class="indicator-dot"
            :class="{ active: currentMessageIndex === index }"></button>
        </div>
      </div>

      <!-- Modal flotante del formulario -->
      <div class="floating-form-modal">
        <div class="form-container">
          <!-- Back Button -->
          <button @click="goBack" class="btn-back">
            <span class="back-icon">←</span>
            <span class="back-text">Volver</span>
          </button>

          <!-- Tabs -->
          <div class="tabs-container">
            <button class="tab-btn" :class="{ active: activeTab === 'login' }" @click="setTab('login')">
              Iniciar Sesión
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'register' }" @click="setTab('register')">
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
              <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span class="alert-text">{{ errorMessage }}</span>
            </div>
          </transition>

          <!-- Login Form -->
          <form class="login-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email" class="form-label">Correo electrónico</label>
              <div class="input-wrapper">
                <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 7 10-7" />
                </svg>
                <input id="email" v-model="email" type="email" class="form-input" placeholder="tu@email.com" required />
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Contraseña</label>
              <div class="input-wrapper">
                <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" class="form-input"
                  placeholder="••••••••" required />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
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
                <svg class="btn-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
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
  </div>
</template>

<script setup lang="ts">
/* -------------------- TU SCRIPT ORIGINAL -------------------- */
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
  { title: "Bienvenido de nuevo", text: "Retoma tu búsqueda donde la dejaste y sigue construyendo tu futuro hogar." },
  { title: "Encuentra tu hogar ideal", text: "Accede a miles de propiedades disponibles en tu ciudad y comienza tu búsqueda hoy mismo." },
  { title: "Transacciones seguras", text: "Tu seguridad es nuestra prioridad. Realiza todas tus gestiones con total confianza." },
  { title: "Búsqueda inteligente", text: "Usa nuestros filtros avanzados para encontrar exactamente lo que necesitas en segundos." }
];
const currentMessage = computed(() => messages[currentMessageIndex.value]);

let messageInterval: number | null = null;

onMounted(() => {
  messageInterval = window.setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length;
  }, 5000);
});

onUnmounted(() => {
  if (messageInterval) clearInterval(messageInterval);
});

const handleLogin = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    const response = await login({ email: email.value, password: password.value });
    if (response?.token && response?.user) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify({ name: response.user.name }));
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      redirectUrl ? (localStorage.removeItem('redirectAfterLogin'), router.push(redirectUrl)) : router.push("/");
    } else {
      errorMessage.value = "Correo o contraseña incorrectos.";
    }
  } catch {
    errorMessage.value = "Error al iniciar sesión. Intenta nuevamente.";
  } finally {
    isLoading.value = false;
  }
};

const setTab = (tab: string) => {
  activeTab.value = tab;
  tab === "register" && router.push("/register");
  tab === "login" && router.push("/login");
};

const goBack = () => router.push("/");
const socialLogin = (provider: string) => console.log(`Login con ${provider}`);

/* -------------------- ANIMACIÓN DE FONDO CON CANVAS -------------------- */
const canvasEl = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let particles: any[] = [];
const PARTICLE_COUNT = 45;

class Particle {
  constructor(public w: number, public h: number, public dpr: number) { this.reset(); }
  reset() {
    this.x = Math.random() * this.w;
    this.y = Math.random() * this.h;
    this.vx = (Math.random() - 0.5) * 0.18;
    this.vy = (Math.random() - 0.5) * 0.25 - 0.08;
    this.radius = (Math.random() * 10 + 4) * this.dpr;
    this.alpha = Math.random() * 0.4 + 0.05;
    this.phase = Math.random() * Math.PI * 2;
    this.speedPhase = 0.002 + Math.random() * 0.003;
  }
  update(delta: number) {
    this.phase += this.speedPhase * delta;
    this.x += this.vx * delta;
    this.y += this.vy * delta + Math.sin(this.phase * 1.2) * 0.02 * delta;
    if (this.x < -50) this.x = this.w + 50;
    if (this.x > this.w + 50) this.x = -50;
    if (this.y < -60) this.y = this.h + 60;
    if (this.y > this.h + 60) this.y = -60;
  }
  draw() {
    if (!ctx) return;
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 1.5);
    g.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
    g.addColorStop(0.3, `rgba(255,255,255,${this.alpha * 0.3})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.fillStyle = g;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function resize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w: rect.width, h: rect.height, dpr };
}

onMounted(() => {
  const canvas = canvasEl.value;
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  let { w, h, dpr } = resize(canvas);

  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle(w, h, dpr));
  const onResize = () => {
    const r = resize(canvas);
    w = r.w; h = r.h; dpr = r.dpr;
    particles.forEach(p => p.reset());
  };
  window.addEventListener("resize", onResize);

  let last = performance.now();
  const animate = (now: number) => {
    const delta = Math.min(50, now - last);
    last = now;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => (p.update(delta), p.draw()));
    animationId = requestAnimationFrame(animate);
  };
  animationId = requestAnimationFrame(animate);

  onUnmounted(() => {
    cancelAnimationFrame(animationId!);
    window.removeEventListener("resize", onResize);
  });
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

.background-layer {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #DED5C4 0%, #C4B5A0 50%, #B8A890 100%);
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-layer::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.12) 0%, transparent 55%),
    radial-gradient(circle at 80% 80%, rgba(77, 47, 36, 0.1) 0%, transparent 55%);
  animation: breathe 8s ease-in-out infinite;
  opacity: 0.9;
  z-index: 1;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.02); opacity: 1; }
}

.bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

/* contenedor de login (debes adaptar a tu UI real) */
.auth-container {
  position: relative;
  z-index: 10;
  color: #272727;
}
.error { color: red; margin-top: 5px; }


/* Contenedor principal */
.content-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: start;
  justify-content: space-between;
  padding: 3rem;
  z-index: 1;
}

/* Texto dinámico en la parte inferior izquierda */
.dynamic-text-section {
  position: absolute;
  bottom: 4rem;
  left: 4rem;
  max-width: 600px;
  z-index: 2;
}

.brand-section {
  margin-bottom: 2rem;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  width: 56px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
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

.dynamic-message {
  min-height: 160px;
}

.welcome-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.1;
  text-shadow: 0 2px 20px rgba(255, 255, 255, 0.3);
}

.welcome-text {
  font-size: 1.3rem;
  color: #4D2F24;
  line-height: 1.7;
  max-width: 550px;
  opacity: 0.95;
  text-shadow: 0 1px 4px rgba(255, 255, 255, 0.3);
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
  box-shadow: 0 0 12px rgba(77, 47, 36, 0.5);
}

.indicator-dot:hover {
  background: rgba(77, 47, 36, 0.6);
}

/* Modal flotante del formulario */
.floating-form-modal {
  position: relative;
  margin-left: auto;
  margin-right: 4rem;
  width: 100%;
  max-width: 700px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  z-index: 10;
  animation: modalFloat 0.6s ease-out;
}

@keyframes modalFloat {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.form-container {
  padding: 2.5rem;
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
  margin-bottom: 1.5rem;
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
  margin-bottom: 2rem;
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
  margin-bottom: 1.5rem;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
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
  gap: 1.25rem;
  margin-bottom: 1.5rem;
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
  to {
    transform: rotate(360deg);
  }
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
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
  grid-template-columns: repeat(1, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.social-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem;
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

/* Transiciones para mensajes */
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

/* ========== RESPONSIVE ========== */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    justify-content: flex-start;
    padding: 2rem;
  }

  .dynamic-text-section {
    position: relative;
    bottom: auto;
    left: auto;
    margin-bottom: 2rem;
    max-width: 100%;
  }

  .floating-form-modal {
    margin: 0 auto;
    max-width: 480px;
  }

  .welcome-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 640px) {
  .content-wrapper {
    padding: 1.5rem;
  }

  .dynamic-text-section {
    bottom: 2rem;
    left: 1.5rem;
    right: 1.5rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .welcome-text {
    font-size: 1rem;
  }

  .floating-form-modal {
    margin-right: 0;
    border-radius: 20px;
  }

  .form-container {
    padding: 2rem 1.5rem;
  }

  .social-buttons {
    grid-template-columns: 1fr;
  }
}
</style>