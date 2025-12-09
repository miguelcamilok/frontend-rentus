<template>
  <div class="property-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando detalles de la propiedad...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>No pudimos cargar la propiedad</h2>
      <p>{{ error }}</p>
      <button @click="router.push('/')" class="btn-back">Volver al inicio</button>
    </div>

    <!-- Property Content -->
    <div v-else-if="property" class="property-detail-content">
      <!-- Header with breadcrumb -->
      <div class="property-breadcrumb">
        <router-link to="/" class="breadcrumb-link">Inicio</router-link>
        <span class="breadcrumb-separator">›</span>
        <router-link to="/propiedades" class="breadcrumb-link">Propiedades</router-link>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">{{ property.title }}</span>
      </div>

      <!-- Image Carousel -->
      <div class="image-carousel-section">
        <div class="carousel-container">
          <!-- Main Image -->
          <div class="carousel-main-image">
            <img :src="currentImage" :alt="property.title" @error="onImgError" class="main-image" />

            <!-- Navigation Arrows -->
            <button v-if="propertyImages.length > 1" @click="previousImage" class="carousel-arrow carousel-arrow-left"
              :disabled="currentImageIndex === 0">
              ‹
            </button>
            <button v-if="propertyImages.length > 1" @click="nextImage" class="carousel-arrow carousel-arrow-right"
              :disabled="currentImageIndex === propertyImages.length - 1">
              ›
            </button>

            <!-- Image Counter -->
            <div class="image-counter">
              {{ currentImageIndex + 1 }} / {{ propertyImages.length }}
            </div>

            <!-- Status Badge -->
            <div class="carousel-status-badge" :class="property.status">
              {{ getStatusText(property.status) }}
            </div>
          </div>

          <!-- Thumbnails -->
          <div v-if="propertyImages.length > 1" class="carousel-thumbnails">
            <div v-for="(image, index) in propertyImages" :key="index" @click="currentImageIndex = index"
              class="thumbnail" :class="{ active: currentImageIndex === index }">
              <img :src="image" :alt="`Vista ${index + 1}`" @error="onImgError" />
            </div>
          </div>
        </div>
      </div>

      <!-- Property Information Grid -->
      <div class="property-info-grid">
        <!-- Left Column - Main Info -->
        <div class="main-info-column">
          <!-- Title and Price -->
          <div class="property-header-info">
            <div class="header-top">
              <h1 class="property-title">{{ property.title }}</h1>
              <div class="property-tags">
                <span class="type-tag">{{ getTypeText(property.type) }}</span>
                <span v-if="property.featured" class="featured-tag">⭐ Destacada</span>
                <span v-if="property.new_construction" class="new-tag">🏗️ Nueva</span>
                <span v-if="property.pet_friendly" class="pet-tag">🐾 Mascotas</span>
              </div>
            </div>
            <div class="price-section">
              <div class="price-main">
                <span class="price-amount">{{ formatPrice(property.monthly_price) }}</span>
                <span class="price-period">/mes</span>
              </div>
              <div class="price-details" v-if="property.deposit_amount">
                <span class="deposit-label">Depósito:</span>
                <span class="deposit-amount">{{ formatPrice(property.deposit_amount) }}</span>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="info-card location-card">
            <div class="card-header">
              <span class="card-icon">📍</span>
              <h2 class="card-title">Ubicación</h2>
            </div>
            <div class="card-content">
              <p class="location-address">{{ property.address }}</p>
              <p class="location-city">
                {{ property.city }}, {{ property.state || 'Risaralda' }}
              </p>

              <!-- Mostrar mapa automáticamente si hay coordenadas -->
              <div v-if="property.lat && property.lng" class="location-map-section">
                <!-- En PropertyDetail.vue, donde usas el MapView -->
                <MapView :id="property.id" :lat="property.lat" :lng="property.lng" :owner-id="property.user_id" />


                <div class="coordinates-info">
                  <span class="coord-label">Coordenadas:</span>
                  <span class="coord-value">
                    {{ Number(property.lat).toFixed(6) }},
                    {{ Number(property.lng).toFixed(6) }}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <!-- Description -->
          <div class="info-card description-card">
            <div class="card-header">
              <span class="card-icon">📝</span>
              <h2 class="card-title">Descripción</h2>
            </div>
            <div class="card-content">
              <p class="description-text">{{ property.description || 'Sin descripción disponible' }}</p>
            </div>
          </div>

          <!-- Features -->
          <div class="info-card features-card">
            <div class="card-header">
              <span class="card-icon">✨</span>
              <h2 class="card-title">Características</h2>
            </div>
            <div class="card-content">
              <div class="features-grid">
                <div class="feature-item" v-if="property.area_m2">
                  <span class="feature-icon">📐</span>
                  <div class="feature-info">
                    <span class="feature-label">Área</span>
                    <span class="feature-value">{{ property.area_m2 }} m²</span>
                  </div>
                </div>
                <div class="feature-item" v-if="property.num_bedrooms">
                  <span class="feature-icon">🛏️</span>
                  <div class="feature-info">
                    <span class="feature-label">Habitaciones</span>
                    <span class="feature-value">{{ property.num_bedrooms }}</span>
                  </div>
                </div>
                <div class="feature-item" v-if="property.num_bathrooms">
                  <span class="feature-icon">🛁</span>
                  <div class="feature-info">
                    <span class="feature-label">Baños</span>
                    <span class="feature-value">{{ property.num_bathrooms }}</span>
                  </div>
                </div>
                <div class="feature-item" v-if="property.parking_spaces">
                  <span class="feature-icon">🚗</span>
                  <div class="feature-info">
                    <span class="feature-label">Parqueaderos</span>
                    <span class="feature-value">{{ property.parking_spaces }}</span>
                  </div>
                </div>
                <div class="feature-item" v-if="property.floor_number">
                  <span class="feature-icon">🏢</span>
                  <div class="feature-info">
                    <span class="feature-label">Piso</span>
                    <span class="feature-value">{{ property.floor_number }}</span>
                  </div>
                </div>
                <div class="feature-item" v-if="property.year_built">
                  <span class="feature-icon">📅</span>
                  <div class="feature-info">
                    <span class="feature-label">Año construcción</span>
                    <span class="feature-value">{{ property.year_built }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Services -->
          <div class="info-card services-card" v-if="getServicesArray(property.included_services).length > 0">
            <div class="card-header">
              <span class="card-icon">🛠️</span>
              <h2 class="card-title">Servicios Incluidos</h2>
            </div>
            <div class="card-content">
              <div class="services-list">
                <span v-for="service in getServicesArray(property.included_services)" :key="service"
                  class="service-badge">
                  {{ getServiceWithIcon(service) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Contact & Actions -->
        <div class="sidebar-column">
          <!-- Contact Card -->
          <div class="contact-card sticky-card">
            <h3 class="contact-title">¿Te interesa esta propiedad?</h3>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button v-if="authUser?.id && property?.user_id && authUser.id === property.user_id"
                class="btn-owner btn-full" :disabled="true">
                <span class="btn-icon">👑</span>
                <span class="btn-text">Esta es tu propiedad</span>
              </button>

              <button v-else-if="property?.status === 'available' && isAuthenticated" @click="openRequestVisitModal"
                class="btn-primary btn-full">
                <span class="btn-icon">📅</span>
                <span class="btn-text">Solicitar Visita</span>
              </button>

              <button v-else-if="property?.status === 'available' && !isAuthenticated" @click="openRequestVisitModal"
                class="btn-login btn-full">
                <span class="btn-icon">🔐</span>
                <span class="btn-text">Iniciar Sesión para Solicitar Visita</span>
              </button>

              <div v-else class="unavailable-message">
                <span class="unavailable-icon">⏸️</span>
                <div class="unavailable-text">
                  <strong>No Disponible</strong>
                  <p>Esta propiedad no está disponible actualmente</p>
                </div>
              </div>



              <button @click="contactAgent" class="btn-secondary btn-full">
                <span class="btn-icon">📞</span>
                <span class="btn-text">Contactar Agente</span>
              </button>

              <div class="contact-actions-row">
                <button @click="toggleFavorite" class="btn-icon-action" :class="{ active: isFavorite }">
                  <span>{{ isFavorite ? '❤️' : '🤍' }}</span>
                  <span class="action-label">Favorito</span>
                </button>
                <button @click="shareProperty" class="btn-icon-action">
                  <span>📤</span>
                  <span class="action-label">Compartir</span>
                </button>
              </div>
            </div>

            <!-- Property Meta -->
            <div class="property-meta-info">
              <div class="meta-item">
                <span class="meta-icon">🕒</span>
                <span class="meta-text">Publicado {{ timeAgo(property.publication_date) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">👁️</span>
                <span class="meta-text">{{ property.views || 0 }} visitas</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🆔</span>
                <span class="meta-text">ID: {{ property.id }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Visit Modal -->
    <RequestVisitModal :open="showRequestModal" :property="property" @close="showRequestModal = false"
      @success="handleVisitRequestSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import RequestVisitModal from '../../components/modals/ModalRequest/RequestVisitModal.vue';
import api from '../../services/api';
import MapView from '../../components/modals/Maps/MapView.vue';

const router = useRouter();
const route = useRoute();

// State
const property = ref(null);
const loading = ref(true);
const error = ref(null);
const currentImageIndex = ref(0);
const isFavorite = ref(false);
const showRequestModal = ref(false);

// Usuario autenticado - Obtener del localStorage o store
const authUser = ref(null);

const DEFAULT_PROPERTY_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=";

// Computed
const isAuthenticated = computed(() => {
  return !!localStorage.getItem("auth_token") || !!sessionStorage.getItem("auth_token");
});

const propertyImages = computed(() => {
  if (!property.value) return [DEFAULT_PROPERTY_IMAGE];

  const images = [];

  // Agregar imagen principal
  if (property.value.image_url) {
    images.push(property.value.image_url);
  }

  // Agregar imágenes adicionales si existen
  if (property.value.additional_images && Array.isArray(property.value.additional_images)) {
    images.push(...property.value.additional_images);
  }

  return images.length > 0 ? images : [DEFAULT_PROPERTY_IMAGE];
});

const currentImage = computed(() => {
  return propertyImages.value[currentImageIndex.value] || DEFAULT_PROPERTY_IMAGE;
});

// Methods
function checkAuthentication() {
  // Intentar cargar desde localStorage
  let userStr = localStorage.getItem('user');

  // Si no está, intentar cargar desde sessionStorage
  if (!userStr) {
    userStr = sessionStorage.getItem('user');
  }

  if (userStr) {
    try {
      authUser.value = JSON.parse(userStr);
    } catch (e) {
      authUser.value = null;
    }
  }
}


async function fetchProperty() {
  const propertyId = route.params.id;
  loading.value = true;
  error.value = null;

  try {
    const response = await api.get(`/properties/${propertyId}`);
    property.value = response.data;

    // Incrementar contador de visitas (opcional)
    await api.post(`/properties/${propertyId}/view`);
  } catch (err) {
    console.error('Error al cargar la propiedad:', err);
    error.value = err.response?.data?.message || 'No se pudo cargar la propiedad';
  } finally {
    loading.value = false;
  }
}

function onImgError(event) {
  event.target.src = DEFAULT_PROPERTY_IMAGE;
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
}

function nextImage() {
  if (currentImageIndex.value < propertyImages.value.length - 1) {
    currentImageIndex.value++;
  }
}

function viewOnMap() {
  if (property.value?.id) {
    router.push({ name: 'MapView', params: { id: property.value.id } });
  }
}

function openRequestVisitModal() {
  if (!isAuthenticated.value) {
    // Redirigir al login si no está autenticado
    const confirmLogin = confirm('Debes iniciar sesión para solicitar una visita. ¿Deseas ir a iniciar sesión?');
    if (confirmLogin) {
      // Guardar la URL actual para volver después del login
      localStorage.setItem('redirectAfterLogin', route.fullPath);
      router.push({ name: 'Login' });
    }
    return;
  }
  showRequestModal.value = true;
}

function handleVisitRequestSuccess() {
  showRequestModal.value = false;
  // Mostrar notificación de éxito
  alert('¡Solicitud de visita enviada con éxito!');
}

function contactAgent() {
  // Implementar lógica de contacto
  alert('Función de contacto - Implementar con WhatsApp, Email, etc.');
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value;
  // Aquí puedes guardar en localStorage o hacer una petición al backend
}

function shareProperty() {
  if (navigator.share && property.value) {
    navigator.share({
      title: property.value.title,
      text: `Mira esta propiedad: ${property.value.title}`,
      url: window.location.href,
    }).catch(err => console.log('Error al compartir:', err));
  } else {
    // Fallback: copiar URL al portapapeles
    navigator.clipboard.writeText(window.location.href);
    alert('¡Enlace copiado al portapapeles!');
  }
}

function getServicesArray(services) {
  if (!services) return [];
  if (Array.isArray(services)) return services;
  if (typeof services === 'string') {
    return services.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}

function getServiceWithIcon(service) {
  const serviceIcons = {
    'agua': '💧',
    'luz': '💡',
    'internet': '🌐',
    'gas': '🔥',
    'tv': '📺',
    'cable': '📺',
    'seguridad': '🔒',
    'parqueadero': '🚗',
    'gimnasio': '💪',
    'piscina': '🏊',
    'aseo': '🧹',
  };

  const serviceLower = service.toLowerCase();
  const icon = Object.keys(serviceIcons).find(key => serviceLower.includes(key));
  return icon ? `${serviceIcons[icon]} ${service}` : `✓ ${service}`;
}

function formatPrice(price) {
  if (!price) return 'Consultar precio';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
}

function getStatusText(status) {
  const statusMap = {
    available: 'Disponible',
    rented: 'Rentada',
    reserved: 'Reservada',
    sold: 'Vendida',
    maintenance: 'En mantenimiento',
  };
  return statusMap[status] || 'Disponible';
}

function getTypeText(type) {
  const typeMap = {
    casa: 'Casa',
    apartamento: 'Apartamento',
    local: 'Local Comercial',
    finca: 'Finca',
  };
  return typeMap[type] || 'Propiedad';
}

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'hoy';
  if (diffInDays === 1) return 'ayer';
  if (diffInDays < 7) return `hace ${diffInDays} días`;
  if (diffInDays < 30) return `hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `hace ${Math.floor(diffInDays / 30)} meses`;
  return `hace ${Math.floor(diffInDays / 365)} años`;
}

// Lifecycle
onMounted(() => {
  // Scroll al inicio de la página
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Verificar autenticación
  checkAuthentication();

  // Cargar propiedad
  fetchProperty();
});
</script>

<style scoped>
@import '../../assets/css/Properties/PropertyDetail.css';
</style>