<template>
  <div class="carousel-container">
    <!-- Carrusel Principal - Solo se muestra si hay propiedades con imagen -->
    <div class="carousel-wrapper" v-if="carouselProperties.length > 0">
      <!-- Imagen Actual con efecto de transición -->
      <transition name="fade" mode="out-in">
        <div 
          :key="currentIndex" 
          class="carousel-slide"
          :style="{ backgroundImage: `url(${currentImage})` }"
          @click="goToProperty(currentProperty)"
        >
          <!-- Overlay con gradiente -->
          <div class="carousel-overlay"></div>
          
          <!-- Información de la propiedad -->
          <div class="carousel-info">
            <div class="property-badge">
              <span class="badge-icon">⭐</span>
              <span>Propiedad Destacada</span>
            </div>
            <h2 class="carousel-title">{{ currentProperty.title }}</h2>
            <div class="carousel-details">
              <span class="detail-item">
                <span class="icon">📍</span>
                {{ currentProperty.city }}
              </span>
              <span class="detail-item">
                <span class="icon">💰</span>
                {{ formatPrice(currentProperty.monthly_price) }}
              </span>
              <span class="detail-item" v-if="currentProperty.area_m2">
                <span class="icon">📐</span>
                {{ currentProperty.area_m2 }} m²
              </span>
            </div>
          </div>

          <!-- Indicador de progreso -->
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressWidth + '%' }"
            ></div>
          </div>
        </div>
      </transition>

      <!-- Botones de navegación -->
      <button 
        class="carousel-btn prev-btn" 
        @click.stop="prevSlide"
        @mouseenter="pauseAutoplay"
        @mouseleave="resumeAutoplay"
        aria-label="Anterior"
        v-if="carouselProperties.length > 1"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <button 
        class="carousel-btn next-btn" 
        @click.stop="nextSlide"
        @mouseenter="pauseAutoplay"
        @mouseleave="resumeAutoplay"
        aria-label="Siguiente"
        v-if="carouselProperties.length > 1"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Indicadores de puntos -->
      <div class="carousel-dots" v-if="carouselProperties.length > 1">
        <button
          v-for="(property, index) in carouselProperties"
          :key="property.id"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click.stop="goToSlide(index)"
          @mouseenter="pauseAutoplay"
          @mouseleave="resumeAutoplay"
          :aria-label="`Ir a propiedad ${index + 1}`"
        ></button>
      </div>
    </div>

    <!-- Miniaturas -->
    <div class="thumbnails-wrapper" v-if="carouselProperties.length > 1">
      <div class="thumbnails-track" :style="{ transform: `translateX(-${thumbnailOffset}px)` }">
        <div
          v-for="(property, index) in carouselProperties"
          :key="property.id"
          class="thumbnail"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
          @mouseenter="pauseAutoplay"
          @mouseleave="resumeAutoplay"
        >
          <img :src="property.image_url || defaultImage" :alt="property.title" @error="onImgError" />
          <div class="thumbnail-overlay">
            <span class="thumbnail-number">{{ index + 1 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Props para recibir las propiedades desde el componente padre
const props = defineProps({
  properties: {
    type: Array,
    default: () => []
  },
  loadingProperties: {
    type: Boolean,
    default: false
  }
});

const DEFAULT_PROPERTY_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+";

const defaultImage = ref(DEFAULT_PROPERTY_IMAGE);

// Manejar error de imagen
function onImgError(event) {
  const img = event.target;
  if (img && img.src !== DEFAULT_PROPERTY_IMAGE) {
    img.src = DEFAULT_PROPERTY_IMAGE;
    img.onerror = null;
  }
}

const currentIndex = ref(0);
const autoplayInterval = ref(null);
const progressWidth = ref(0);
const progressInterval = ref(null);
const thumbnailOffset = ref(0);
const isPaused = ref(false);

// Clave única para guardar el índice en sessionStorage
const CAROUSEL_INDEX_KEY = 'carousel_current_index';

// Filtrar propiedades que tengan imagen
const carouselProperties = computed(() => {
  return props.properties.filter(p => p.image_url && p.image_url.trim() !== '');
});

const currentProperty = computed(() => {
  if (carouselProperties.value.length === 0) return {};
  return carouselProperties.value[currentIndex.value] || {};
});

const currentImage = computed(() => {
  if (carouselProperties.value.length === 0) return DEFAULT_PROPERTY_IMAGE;
  return carouselProperties.value[currentIndex.value]?.image_url || DEFAULT_PROPERTY_IMAGE;
});

// Formatear precio
const formatPrice = (price) => {
  if (!price) return 'Consultar precio';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

// Navegación
const nextSlide = () => {
  if (carouselProperties.value.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % carouselProperties.value.length;
  saveCurrentIndex();
  resetProgress();
  updateThumbnailPosition();
};

const prevSlide = () => {
  if (carouselProperties.value.length === 0) return;
  currentIndex.value = currentIndex.value === 0 
    ? carouselProperties.value.length - 1 
    : currentIndex.value - 1;
  saveCurrentIndex();
  resetProgress();
  updateThumbnailPosition();
};

const goToSlide = (index) => {
  if (carouselProperties.value.length === 0) return;
  currentIndex.value = index;
  saveCurrentIndex();
  resetProgress();
  updateThumbnailPosition();
};

// Guardar índice actual en sessionStorage
const saveCurrentIndex = () => {
  sessionStorage.setItem(CAROUSEL_INDEX_KEY, currentIndex.value.toString());
};

// Restaurar índice guardado
const restoreCurrentIndex = () => {
  const savedIndex = sessionStorage.getItem(CAROUSEL_INDEX_KEY);
  if (savedIndex !== null && carouselProperties.value.length > 0) {
    const index = parseInt(savedIndex, 10);
    if (index >= 0 && index < carouselProperties.value.length) {
      currentIndex.value = index;
      updateThumbnailPosition();
    }
  }
};

// Navegar a la propiedad
const goToProperty = (property) => {
  if (!property || !property.id) return;
  router.push(`/propiedades/${property.id}`);
};

// Actualizar posición de miniaturas
const updateThumbnailPosition = () => {
  const thumbnailWidth = 120; // ancho + gap
  const visibleThumbnails = 5;
  const centerPosition = Math.floor(visibleThumbnails / 2);
  
  if (currentIndex.value >= centerPosition) {
    thumbnailOffset.value = (currentIndex.value - centerPosition) * thumbnailWidth;
  } else {
    thumbnailOffset.value = 0;
  }
};

// Barra de progreso
const startProgress = () => {
  progressWidth.value = 0;
  const duration = 5000; // 5 segundos
  const interval = 50;
  const increment = (interval / duration) * 100;

  progressInterval.value = setInterval(() => {
    progressWidth.value += increment;
    if (progressWidth.value >= 100) {
      clearInterval(progressInterval.value);
    }
  }, interval);
};

const resetProgress = () => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value);
  }
  startProgress();
};

// Autoplay
const startAutoplay = () => {
  if (carouselProperties.value.length <= 1 || isPaused.value) return;
  
  stopAutoplay(); // Limpiar cualquier intervalo existente
  
  autoplayInterval.value = setInterval(() => {
    if (!isPaused.value) {
      nextSlide();
    }
  }, 5000);
};

const stopAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
  }
};

const pauseAutoplay = () => {
  isPaused.value = true;
  stopAutoplay();
  if (progressInterval.value) {
    clearInterval(progressInterval.value);
    progressInterval.value = null;
  }
};

const resumeAutoplay = () => {
  isPaused.value = false;
  if (carouselProperties.value.length > 1) {
    startAutoplay();
    startProgress();
  }
};

// Reiniciar cuando cambien las propiedades
watch(() => props.properties, () => {
  stopAutoplay();
  if (progressInterval.value) {
    clearInterval(progressInterval.value);
    progressInterval.value = null;
  }
  
  // Restaurar el índice guardado
  restoreCurrentIndex();
  
  if (carouselProperties.value.length > 1) {
    startAutoplay();
    startProgress();
  }
}, { deep: true });

// Lifecycle
onMounted(() => {
  // Restaurar el índice al montar
  restoreCurrentIndex();
  
  if (carouselProperties.value.length > 1) {
    startAutoplay();
    startProgress();
  }
});

onUnmounted(() => {
  stopAutoplay();
  if (progressInterval.value) {
    clearInterval(progressInterval.value);
    progressInterval.value = null;
  }
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.carousel-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.carousel-slide {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.carousel-slide:hover {
  transform: scale(1.02);
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
}

.carousel-info {
  position: relative;
  z-index: 2;
  padding: 60px;
  color: white;
  max-width: 800px;
}

.property-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-icon {
  font-size: 16px;
}

.carousel-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

.carousel-details {
  display: flex;
  gap: 30px;
  font-size: 18px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.icon {
  font-size: 20px;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-50%) scale(1.1);
}

.prev-btn {
  left: 30px;
}

.next-btn {
  right: 30px;
}

.carousel-dots {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.dot.active {
  background: white;
  width: 32px;
  border-radius: 6px;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.7);
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 5;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.05s linear;
}

/* Miniaturas */
.thumbnails-wrapper {
  margin-top: 20px;
  overflow: hidden;
  padding: 10px 0;
}

.thumbnails-track {
  display: flex;
  gap: 16px;
  transition: transform 0.5s ease;
}

.thumbnail {
  min-width: 104px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.thumbnail.active {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumbnail:hover img {
  transform: scale(1.1);
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.thumbnail:hover .thumbnail-overlay,
.thumbnail.active .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-number {
  color: white;
  font-weight: 700;
  font-size: 18px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Animaciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .carousel-wrapper {
    height: 400px;
    border-radius: 16px;
  }

  .carousel-info {
    padding: 30px;
  }

  .carousel-title {
    font-size: 28px;
  }

  .carousel-details {
    flex-direction: column;
    gap: 12px;
  }

  .carousel-btn {
    width: 44px;
    height: 44px;
  }

  .prev-btn {
    left: 15px;
  }

  .next-btn {
    right: 15px;
  }

  .thumbnail {
    min-width: 80px;
    height: 55px;
  }
}
</style>