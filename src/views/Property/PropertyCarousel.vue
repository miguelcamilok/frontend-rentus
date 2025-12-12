<template>
  <div class="modern-carousel" v-if="carouselProperties.length > 0">
    <!-- Slide Principal -->
    <div class="carousel-main">
      <transition name="slide-fade" mode="out-in">
        <div 
          :key="currentIndex" 
          class="carousel-slide"
          @click="goToProperty(currentProperty)"
        >
          <!-- Imagen de fondo con parallax -->
          <div 
            class="slide-background"
            :style="{ backgroundImage: `url(${currentImage})` }"
          ></div>

          <!-- Overlay con gradiente animado -->
          <div class="slide-overlay"></div>

          <!-- Partículas decorativas -->
          <div class="particles">
            <span class="particle" v-for="n in 6" :key="n"></span>
          </div>

          <!-- Contenido de la propiedad -->
          <div class="slide-content">
            <!-- Badge de destacado -->
            <div class="featured-badge">
              <font-awesome-icon :icon="['fas', 'star']" class="badge-icon" />
              <span>Propiedad Destacada</span>
              <div class="badge-glow"></div>
            </div>

            <!-- Información principal -->
            <div class="property-main-info">
              <h2 class="property-title">{{ currentProperty.title }}</h2>
              
              <!-- Características principales -->
              <div class="property-features">
                <div class="feature-chip" v-if="currentProperty.city">
                  <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                  <span>{{ currentProperty.city }}</span>
                </div>
                <div class="feature-chip price-chip">
                  <font-awesome-icon :icon="['fas', 'dollar-sign']" />
                  <span>{{ formatPrice(currentProperty.monthly_price) }}</span>
                </div>
                <div class="feature-chip" v-if="currentProperty.area_m2">
                  <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                  <span>{{ currentProperty.area_m2 }} m²</span>
                </div>
              </div>

              <!-- Detalles adicionales -->
              <div class="property-details" v-if="hasRoomDetails">
                <div class="detail-item" v-if="currentProperty.num_bedrooms">
                  <font-awesome-icon :icon="['fas', 'bed']" />
                  <span>{{ currentProperty.num_bedrooms }} Hab.</span>
                </div>
                <div class="detail-item" v-if="currentProperty.num_bathrooms">
                  <font-awesome-icon :icon="['fas', 'bath']" />
                  <span>{{ currentProperty.num_bathrooms }} Baños</span>
                </div>
                <div class="detail-item" v-if="currentProperty.num_parking">
                  <font-awesome-icon :icon="['fas', 'car']" />
                  <span>{{ currentProperty.num_parking }} Parqueos</span>
                </div>
              </div>

              <!-- Botón de acción -->
              <button class="view-details-btn" @click.stop="goToProperty(currentProperty)">
                <span>Ver Detalles</span>
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="btn-icon" />
                <div class="btn-glow"></div>
              </button>
            </div>

            <!-- Contador de propiedades -->
            <div class="properties-counter">
              <span class="counter-current">{{ currentIndex + 1 }}</span>
              <span class="counter-separator">/</span>
              <span class="counter-total">{{ carouselProperties.length }}</span>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="progress-container">
            <div 
              class="progress-bar" 
              :style="{ width: progressWidth + '%' }"
            ></div>
          </div>
        </div>
      </transition>

      <!-- Controles de navegación -->
      <button 
        class="nav-btn prev-btn" 
        @click.stop="prevSlide"
        @mouseenter="pauseAutoplay"
        @mouseleave="resumeAutoplay"
        v-if="carouselProperties.length > 1"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" />
      </button>
      
      <button 
        class="nav-btn next-btn" 
        @click.stop="nextSlide"
        @mouseenter="pauseAutoplay"
        @mouseleave="resumeAutoplay"
        v-if="carouselProperties.length > 1"
      >
        <font-awesome-icon :icon="['fas', 'chevron-right']" />
      </button>

      <!-- Indicadores de navegación -->
      <div class="nav-indicators" v-if="carouselProperties.length > 1">
        <button
          v-for="(property, index) in carouselProperties"
          :key="property.id"
          class="indicator"
          :class="{ active: index === currentIndex }"
          @click.stop="goToSlide(index)"
          @mouseenter="pauseAutoplay"
          @mouseleave="resumeAutoplay"
        >
          <span class="indicator-line"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  properties: {
    type: Array,
    default: () => []
  }
})

const DEFAULT_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4="

// Refs
const currentIndex = ref(0)
const progressWidth = ref(0)
const isPaused = ref(false)

let autoplayInterval = null
let progressInterval = null

const defaultImage = ref(DEFAULT_IMAGE)

// Computed
const carouselProperties = computed(() => {
  return props.properties.filter(p => p.image_url && p.image_url.trim() !== '')
})

const currentProperty = computed(() => {
  if (carouselProperties.value.length === 0) return {}
  return carouselProperties.value[currentIndex.value] || {}
})

const currentImage = computed(() => {
  return currentProperty.value?.image_url || DEFAULT_IMAGE
})

const hasRoomDetails = computed(() => {
  const prop = currentProperty.value
  return prop.num_bedrooms || prop.num_bathrooms || prop.num_parking
})

// Methods
const onImgError = (event) => {
  const img = event.target
  if (img && img.src !== DEFAULT_IMAGE) {
    img.src = DEFAULT_IMAGE
    img.onerror = null
  }
}

const formatPrice = (price) => {
  if (!price) return 'Consultar precio'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price)
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const nextSlide = () => {
  if (carouselProperties.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % carouselProperties.value.length
  resetProgress()
}

const prevSlide = () => {
  if (carouselProperties.value.length === 0) return
  currentIndex.value = currentIndex.value === 0 
    ? carouselProperties.value.length - 1 
    : currentIndex.value - 1
  resetProgress()
}

const goToSlide = (index) => {
  if (carouselProperties.value.length === 0) return
  currentIndex.value = index
  resetProgress()
}

const goToProperty = (property) => {
  if (!property || !property.id) return
  router.push(`/properties/${property.id}`)
}

// Progress bar
const startProgress = () => {
  progressWidth.value = 0
  const duration = 10000
  const interval = 50
  const increment = (interval / duration) * 100

  progressInterval = setInterval(() => {
    if (!isPaused.value) {
      progressWidth.value += increment
      if (progressWidth.value >= 100) {
        clearInterval(progressInterval)
      }
    }
  }, interval)
}

const resetProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  startProgress()
}

// Autoplay
const startAutoplay = () => {
  if (carouselProperties.value.length <= 1) return
  
  stopAutoplay()
  
  autoplayInterval = setInterval(() => {
    if (!isPaused.value) {
      nextSlide()
    }
  }, 10000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

const pauseAutoplay = () => {
  isPaused.value = true
}

const resumeAutoplay = () => {
  isPaused.value = false
}

// Watchers
watch(() => props.properties, () => {
  stopAutoplay()
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  
  currentIndex.value = 0
  
  if (carouselProperties.value.length > 1) {
    startAutoplay()
    startProgress()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  if (carouselProperties.value.length > 1) {
    startAutoplay()
    startProgress()
  }
})

onUnmounted(() => {
  stopAutoplay()
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
})
</script>

<style scoped>
/* ==================== ANIMACIONES ==================== */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes glow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== ESTRUCTURA PRINCIPAL ==================== */
.modern-carousel {
  width: 100%;
  background: linear-gradient(135deg, #1a0e0a 0%, #2e1d17 50%, #3b2416 100%);
  position: relative;
  overflow: hidden;
}

.modern-carousel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("https://i.pinimg.com/1200x/e2/d2/b7/e2d2b7877ffb88a68d6b72e5ea0bd965.jpg") center center / cover no-repeat;
  opacity: 0.1;
  filter: blur(8px);
  z-index: 0;
}

/* ==================== SLIDE PRINCIPAL ==================== */
.carousel-main {
  position: relative;
  width: 100%;
  height: 85vh;
  min-height: 600px;
  max-height: 900px;
  z-index: 1;
}

.carousel-slide {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.slide-background {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.carousel-slide:hover .slide-background {
  transform: scale(1.05);
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(26, 14, 10, 0.95) 0%,
    rgba(46, 29, 23, 0.85) 50%,
    rgba(59, 36, 22, 0.75) 100%
  );
  z-index: 1;
}

/* ==================== PARTÍCULAS DECORATIVAS ==================== */
.particles {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #da9c5f;
  border-radius: 50%;
  opacity: 0.3;
  animation: float 15s infinite ease-in-out;
  box-shadow: 0 0 10px #da9c5f;
}

.particle:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.particle:nth-child(2) { top: 40%; left: 80%; animation-delay: 2s; }
.particle:nth-child(3) { top: 60%; left: 30%; animation-delay: 4s; }
.particle:nth-child(4) { top: 80%; left: 70%; animation-delay: 1s; }
.particle:nth-child(5) { top: 30%; left: 50%; animation-delay: 3s; }
.particle:nth-child(6) { top: 70%; left: 90%; animation-delay: 5s; }

/* ==================== CONTENIDO DEL SLIDE ==================== */
.slide-content {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 8%;
  max-width: 1400px;
  margin: 0 auto;
}

.featured-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(218, 156, 95, 0.3), rgba(200, 169, 126, 0.3));
  backdrop-filter: blur(20px);
  padding: 12px 24px;
  border-radius: 50px;
  border: 1px solid rgba(218, 156, 95, 0.5);
  font-size: 14px;
  font-weight: 700;
  color: #da9c5f;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 30px;
  width: fit-content;
  position: relative;
  overflow: hidden;
  animation: slideIn 0.6s ease 0.2s backwards;
  box-shadow: 0 8px 25px rgba(218, 156, 95, 0.3);
}

.badge-icon {
  font-size: 16px;
  animation: glow 2s infinite;
}

.badge-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(218, 156, 95, 0.5), transparent);
  animation: shimmer 3s infinite;
}

.property-main-info {
  max-width: 800px;
}

.property-title {
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 800;
  color: #f0e5db;
  margin-bottom: 30px;
  line-height: 1.2;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.6s ease 0.3s backwards;
}

.property-features {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  animation: slideIn 0.6s ease 0.4s backwards;
}

.feature-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  padding: 14px 22px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f0e5db;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.feature-chip:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.price-chip {
  background: linear-gradient(135deg, rgba(218, 156, 95, 0.3), rgba(200, 169, 126, 0.3));
  border-color: rgba(218, 156, 95, 0.5);
  color: #da9c5f;
}

.property-details {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  animation: slideIn 0.6s ease 0.5s backwards;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  font-weight: 500;
}

.view-details-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #da9c5f, #b8791f);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(218, 156, 95, 0.4);
  animation: slideIn 0.6s ease 0.6s backwards;
}

.view-details-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(218, 156, 95, 0.5);
}

.btn-icon {
  transition: transform 0.3s ease;
}

.view-details-btn:hover .btn-icon {
  transform: translateX(5px);
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

.properties-counter {
  position: absolute;
  bottom: 100px;
  right: 8%;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 16px 24px;
  border-radius: 50px;
  border: 1px solid rgba(218, 156, 95, 0.3);
  font-size: 18px;
  font-weight: 700;
  color: #f0e5db;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.counter-current {
  font-size: 28px;
  color: #da9c5f;
}

.counter-separator {
  color: rgba(255, 255, 255, 0.5);
}

.counter-total {
  color: rgba(255, 255, 255, 0.7);
}

/* ==================== BARRA DE PROGRESO ==================== */
.progress-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #da9c5f, #b8791f);
  transition: width 0.05s linear;
  box-shadow: 0 0 10px rgba(218, 156, 95, 0.5);
}

/* ==================== CONTROLES DE NAVEGACIÓN ==================== */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(218, 156, 95, 0.3);
  border-radius: 50%;
  color: #da9c5f;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: rgba(218, 156, 95, 0.3);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 8px 25px rgba(218, 156, 95, 0.4);
}

.prev-btn {
  left: 40px;
}

.next-btn {
  right: 40px;
}

.nav-indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.indicator {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.indicator-line {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #da9c5f, #b8791f);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.indicator.active .indicator-line {
  transform: scaleX(1);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* ==================== SECCIÓN DE MINIATURAS ==================== */
.thumbnails-section {
  position: relative;
  padding: 60px 8%;
  background: linear-gradient(180deg, rgba(26, 14, 10, 0.5), rgba(26, 14, 10, 0.8));
  border-top: 1px solid rgba(218, 156, 95, 0.2);
}

.thumbnails-title {
  font-size: 24px;
  font-weight: 700;
  color: #f0e5db;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.thumbnails-title svg {
  color: #da9c5f;
  font-size: 28px;
}

.thumbnails-container {
  position: relative;
}

.thumbnails-wrapper {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 10px 0;
  scrollbar-width: thin;
  scrollbar-color: #da9c5f rgba(255, 255, 255, 0.1);
}

.thumbnails-wrapper::-webkit-scrollbar {
  height: 8px;
}

.thumbnails-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.thumbnails-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #da9c5f, #b8791f);
  border-radius: 4px;
}

.thumbnail-card {
  flex: 0 0 280px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(218, 156, 95, 0.2);
  position: relative;
}

.thumbnail-card:hover {
  transform: translateY(-8px);
  border-color: #da9c5f;
  box-shadow: 0 15px 40px rgba(218, 156, 95, 0.3);
}

.thumbnail-card.active {
  border-color: #da9c5f;
  box-shadow: 0 0 0 4px rgba(218, 156, 95, 0.2), 0 15px 40px rgba(218, 156, 95, 0.4);
}

.thumbnail-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.thumbnail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.thumbnail-card:hover .thumbnail-image img {
  transform: scale(1.1);
}

.thumbnail-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 24px;
}

.thumbnail-card:hover .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-info {
  padding: 16px;
}

.thumbnail-title {
  font-size: 15px;
  font-weight: 600;
  color: #f0e5db;
  margin-bottom: 8px;
  line-height: 1.3;
}

.thumbnail-price {
  font-size: 16px;
  font-weight: 700;
  color: #da9c5f;
}

.thumbnail-index {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #da9c5f, #b8791f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.thumbnail-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(218, 156, 95, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(218, 156, 95, 0.5);
  border-radius: 50%;
  color: #da9c5f;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-nav-btn:hover {
  background: rgba(218, 156, 95, 0.5);
  transform: translateY(-50%) scale(1.1);
}

.thumbnail-nav-btn.prev {
  left: -20px;
}

.thumbnail-nav-btn.next {
  right: -20px;
}

/* ==================== TRANSICIONES ==================== */
.slide-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 1200px) {
  .slide-content {
    padding: 0 5%;
  }

  .properties-counter {
    right: 5%;
  }
}

@media (max-width: 768px) {
  .carousel-main {
    height: 70vh;
    min-height: 500px;
  }

  .slide-content {
    padding: 0 6%;
  }

  .property-title {
    font-size: 28px;
  }

  .featured-badge {
    font-size: 12px;
    padding: 10px 20px;
  }

  .property-features {
    gap: 12px;
  }

  .feature-chip {
    padding: 12px 18px;
    font-size: 14px;
  }

  .property-details {
    flex-wrap: wrap;
    gap: 12px;
  }

  .view-details-btn {
    padding: 14px 28px;
    font-size: 14px;
  }

  .properties-counter {
    bottom: 80px;
    right: 6%;
    padding: 12px 20px;
    font-size: 16px;
  }

  .counter-current {
    font-size: 24px;
  }

  .nav-btn {
    width: 50px;
    height: 50px;
    font-size: 18px;
  }

  .prev-btn {
    left: 20px;
  }

  .next-btn {
    right: 20px;
  }
}

@media (max-width: 480px) {
  .carousel-main {
    height: 60vh;
    min-height: 450px;
  }

  .property-title {
    font-size: 24px;
  }

  .property-features {
    flex-direction: column;
    gap: 10px;
  }

  .feature-chip {
    width: 100%;
    justify-content: center;
  }

  .property-details {
    flex-direction: column;
    gap: 10px;
  }

  .properties-counter {
    position: static;
    margin-top: 20px;
    width: fit-content;
    padding: 10px 18px;
  }

  .nav-btn {
    width: 44px;
    height: 44px;
    font-size: 16px;
  }

  .prev-btn {
    left: 15px;
  }

  .next-btn {
    right: 15px;
  }

  .nav-indicators {
    bottom: 20px;
    gap: 8px;
  }

  .indicator {
    width: 30px;
  }
}
</style>