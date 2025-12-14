<template>
  <div class="property-detail-page">
    <!-- Background decorativo -->
    <div class="page-background"></div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <font-awesome-icon :icon="['fas', 'spinner']" spin />
      </div>
      <p class="loading-text">Cargando detalles de la propiedad...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
      </div>
      <h2>Propiedad no encontrada</h2>
      <p>{{ error }}</p>
      <button @click="router.push('/')" class="btn-back">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        Volver al inicio
      </button>
    </div>

    <!-- Property Content -->
    <div v-else-if="property" class="property-content">
      <!-- Hero Section con imagen -->
      <div class="hero-section">
        <div class="hero-overlay"></div>

        <!-- Navegación de breadcrumb flotante -->
        <div class="breadcrumb-floating">
          <router-link to="/" class="breadcrumb-item">
            <font-awesome-icon :icon="['fas', 'home']" />
          </router-link>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="breadcrumb-separator" />
          <router-link to="/propiedades" class="breadcrumb-item">Propiedades</router-link>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="breadcrumb-separator" />
          <span class="breadcrumb-current">{{ property.title }}</span>
        </div>

        <!-- Galería de imágenes -->
        <div class="hero-gallery">
          <transition name="fade" mode="out-in">
            <img :key="currentImageIndex" :src="currentImage" :alt="property.title" @error="onImgError"
              class="hero-image" />
          </transition>

          <!-- Controles de galería -->
          <div class="gallery-controls" v-if="propertyImages.length > 1">
            <button @click="previousImage" class="gallery-btn prev" :disabled="currentImageIndex === 0">
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <button @click="nextImage" class="gallery-btn next"
              :disabled="currentImageIndex === propertyImages.length - 1">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>

          <!-- Contador de imágenes -->
          <div class="image-counter">
            <font-awesome-icon :icon="['fas', 'images']" />
            <span>{{ currentImageIndex + 1 }} / {{ propertyImages.length }}</span>
          </div>

          <!-- Badge de estado -->
          <div class="status-badge" :class="`status-${property.status}`">
            <font-awesome-icon :icon="getStatusIcon(property.status)" />
            <span>{{ getStatusText(property.status) }}</span>
          </div>

          <!-- Thumbnails -->
          <div class="thumbnails-bar" v-if="propertyImages.length > 1">
            <div v-for="(image, index) in propertyImages" :key="index" @click="currentImageIndex = index"
              class="thumbnail-item" :class="{ active: currentImageIndex === index }">
              <img :src="image" :alt="`Vista ${index + 1}`" @error="onImgError" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <div class="content-grid">
          <!-- Columna Principal -->
          <div class="main-column">
            <!-- Header de la propiedad -->
            <div class="property-header">
              <div class="header-tags">
                <span class="tag tag-type">
                  <font-awesome-icon :icon="['fas', getTypeIcon(property.title)]" />
                  <span class="type-text">{{ detectType(property.title) }}</span>
                </span>
                <span v-if="property.featured" class="tag tag-featured">
                  <font-awesome-icon :icon="['fas', 'star']" />
                  Destacada
                </span>
                <span v-if="property.new_construction" class="tag tag-new">
                  <font-awesome-icon :icon="['fas', 'hard-hat']" />
                  Nueva
                </span>
                <span v-if="property.pet_friendly" class="tag tag-pet">
                  <font-awesome-icon :icon="['fas', 'paw']" />
                  Mascotas
                </span>
              </div>

              <h1 class="property-title">{{ property.title }}</h1>

              <div class="property-location">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="location-icon" />
                <span>{{ property.address }}, {{ property.city }}</span>
              </div>

              <div class="property-price-banner">
                <div class="price-main">
                  <span class="price-label">Precio mensual</span>
                  <span class="price-amount">{{ formatPrice(property.monthly_price) }}</span>
                </div>
                <div class="price-deposit" v-if="property.deposit_amount">
                  <span class="deposit-label">Depósito</span>
                  <span class="deposit-amount">{{ formatPrice(property.deposit_amount) }}</span>
                </div>
              </div>
            </div>

            <!-- Características principales -->
            <div class="features-showcase">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'list-check']" />
                Características Principales
              </h2>
              <div class="features-grid-main">
                <div class="feature-card" v-if="property.area_m2">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ property.area_m2 }}</span>
                    <span class="feature-label">m² de área</span>
                  </div>
                </div>
                <div class="feature-card" v-if="property.num_bedrooms">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'bed']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ property.num_bedrooms }}</span>
                    <span class="feature-label">Habitaciones</span>
                  </div>
                </div>
                <div class="feature-card" v-if="property.num_bathrooms">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'bath']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ property.num_bathrooms }}</span>
                    <span class="feature-label">Baños</span>
                  </div>
                </div>
                <div class="feature-card" v-if="property.parking_spaces">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'car']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ property.parking_spaces }}</span>
                    <span class="feature-label">Parqueaderos</span>
                  </div>
                </div>
                <div class="feature-card" v-if="property.floor_number">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'building']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">Piso {{ property.floor_number }}</span>
                    <span class="feature-label">Ubicación</span>
                  </div>
                </div>
                <div class="feature-card" v-if="property.year_built">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'calendar']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ property.year_built }}</span>
                    <span class="feature-label">Año</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Descripción -->
            <div class="description-section">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'file-alt']" />
                Descripción
              </h2>
              <div class="description-content">
                <p>{{ property.description || 'Sin descripción disponible' }}</p>
              </div>
            </div>

            <!-- Servicios incluidos -->
            <div class="services-section" v-if="getServicesArray(property.included_services).length > 0">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
                Servicios Incluidos
              </h2>
              <div class="services-grid">
                <div v-for="service in getServicesArray(property.included_services)" :key="service"
                  class="service-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="service-icon" />
                  <span>{{ service }}</span>
                </div>
              </div>
            </div>

            <!-- Mapa -->
            <div class="map-section" v-if="property.lat && property.lng">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'map']" />
                Ubicación en el Mapa
              </h2>
              <div class="map-container">
                <MapView :id="property.id" :lat="property.lat" :lng="property.lng" :owner-id="property.user_id" />
              </div>
              <div class="map-coordinates">
                <font-awesome-icon :icon="['fas', 'location-dot']" />
                <span>{{ Number(property.lat).toFixed(6) }}, {{ Number(property.lng).toFixed(6) }}</span>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="sidebar-column">
            <!-- Card de contacto -->
            <div class="contact-card">
              <div class="contact-header">
                <h3>¿Te interesa?</h3>
                <p>Solicita más información</p>
              </div>

              <div class="contact-actions">
                <!-- Si es dueño -->
                <button v-if="authUser?.id && property?.user_id && authUser.id === property.user_id"
                  class="btn-action btn-owner" disabled>
                  <font-awesome-icon :icon="['fas', 'crown']" />
                  <span>Esta es tu propiedad</span>
                </button>

                <!-- Si está disponible y autenticado -->
                <button v-else-if="property?.status === 'available' && isAuthenticated" @click="openRequestVisitModal"
                  class="btn-action btn-primary">
                  <font-awesome-icon :icon="['fas', 'calendar-check']" />
                  <span>Solicitar Visita</span>
                </button>

                <!-- Si está disponible pero no autenticado -->
                <button v-else-if="property?.status === 'available' && !isAuthenticated" @click="openRequestVisitModal"
                  class="btn-action btn-login">
                  <font-awesome-icon :icon="['fas', 'sign-in-alt']" />
                  <span>Iniciar Sesión</span>
                </button>

                <!-- Si no está disponible -->
                <div v-else class="unavailable-alert">
                  <font-awesome-icon :icon="['fas', 'ban']" />
                  <div>
                    <strong>No Disponible</strong>
                    <p>Esta propiedad no está disponible</p>
                  </div>
                </div>

                <!-- Botón de contacto -->
                <button @click="contactAgent" class="btn-action btn-secondary">
                  <font-awesome-icon :icon="['fas', 'phone']" />
                  <span>Contactar Agente</span>
                </button>

                <!-- Acciones secundarias -->
                <div class="secondary-actions">
                  <button @click="toggleFavorite" class="btn-icon-action" :class="{ active: isFavorite }">
                    <font-awesome-icon :icon="isFavorite ? ['fas', 'heart'] : ['far', 'heart']" />
                    <span>{{ isFavorite ? 'Guardado' : 'Guardar' }}</span>
                  </button>
                  <button @click="shareProperty" class="btn-icon-action">
                    <font-awesome-icon :icon="['fas', 'share-alt']" />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>

              <!-- Información adicional -->
              <div class="property-meta">
                <div class="meta-row">
                  <font-awesome-icon :icon="['fas', 'clock']" />
                  <span>Publicado {{ timeAgo(property.publication_date) }}</span>
                </div>
                <div class="meta-row">
                  <font-awesome-icon :icon="['fas', 'eye']" />
                  <span>{{ property.views || 0 }} visitas</span>
                </div>
                <div class="meta-row">
                  <font-awesome-icon :icon="['fas', 'hashtag']" />
                  <span>ID: {{ property.id }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de solicitud de visita -->
    <RequestVisitModal :open="showRequestModal" :property="property" @close="showRequestModal = false"
      @success="handleVisitRequestSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import RequestVisitModal from '../../components/modals/ModalRequest/RequestVisitModal.vue'
import MapView from '../../components/modals/Maps/MapView.vue'
import api from '../../services/api'

const router = useRouter()
const route = useRoute()

// State
const property = ref(null)
const loading = ref(true)
const error = ref(null)
const currentImageIndex = ref(0)
const isFavorite = ref(false)
const showRequestModal = ref(false)
const authUser = ref(null)

const DEFAULT_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4="

// Computed
const isAuthenticated = computed(() => {
  return !!localStorage.getItem("auth_token") || !!sessionStorage.getItem("auth_token")
})

const propertyImages = computed(() => {
  if (!property.value) return [DEFAULT_IMAGE]

  const images = []
  if (property.value.image_url) images.push(property.value.image_url)
  if (property.value.additional_images && Array.isArray(property.value.additional_images)) {
    images.push(...property.value.additional_images)
  }

  return images.length > 0 ? images : [DEFAULT_IMAGE]
})

const currentImage = computed(() => {
  return propertyImages.value[currentImageIndex.value] || DEFAULT_IMAGE
})

// Methods
function checkAuthentication() {
  let userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
  if (userStr) {
    try {
      authUser.value = JSON.parse(userStr)
    } catch (e) {
      authUser.value = null
    }
  }
}

async function fetchProperty() {
  const propertyId = route.params.id
  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/properties/${propertyId}`)
    property.value = response.data
    await api.post(`/properties/${propertyId}/view`)
  } catch (err) {
    console.error('Error al cargar la propiedad:', err)
    error.value = err.response?.data?.message || 'No se pudo cargar la propiedad'
  } finally {
    loading.value = false
  }
}

function onImgError(event) {
  event.target.src = DEFAULT_IMAGE
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

function nextImage() {
  if (currentImageIndex.value < propertyImages.value.length - 1) {
    currentImageIndex.value++
  }
}

function openRequestVisitModal() {
  if (!isAuthenticated.value) {
    const confirmLogin = confirm('Debes iniciar sesión para solicitar una visita. ¿Deseas ir a iniciar sesión?')
    if (confirmLogin) {
      localStorage.setItem('redirectAfterLogin', route.fullPath)
      router.push({ name: 'Login' })
    }
    return
  }
  showRequestModal.value = true
}

const detectType = (title) => {
  const t = title.toLowerCase();
  if (t.includes("casa")) return "Casa";
  if (t.includes("apartamento") || t.includes("apto")) return "Apartamento";
  if (t.includes("local")) return "Local";
  if (t.includes("finca")) return "Finca";
  return "Propiedad";
};

const getTypeIcon = (title) => {
  const t = title.toLowerCase();

  if (t.includes("casa")) return "home";
  if (t.includes("apartamento") || t.includes("apto")) return "building";
  if (t.includes("local")) return "store";
  if (t.includes("finca")) return "tree";

  return "home";
};

function handleVisitRequestSuccess() {
  showRequestModal.value = false
  alert('¡Solicitud de visita enviada con éxito!')
}

function contactAgent() {
  alert('Función de contacto - Implementar con WhatsApp, Email, etc.')
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
}

function shareProperty() {
  if (navigator.share && property.value) {
    navigator.share({
      title: property.value.title,
      text: `Mira esta propiedad: ${property.value.title}`,
      url: window.location.href,
    }).catch(err => console.log('Error al compartir:', err))
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('¡Enlace copiado al portapapeles!')
  }
}

function getServicesArray(services) {
  if (!services) return []
  if (Array.isArray(services)) return services
  if (typeof services === 'string') {
    return services.split(',').map(s => s.trim()).filter(s => s.length > 0)
  }
  return []
}

function formatPrice(price) {
  if (!price) return 'Consultar precio'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price)
}

function getStatusText(status) {
  const statusMap = {
    available: 'Disponible',
    rented: 'Rentada',
    reserved: 'Reservada',
    sold: 'Vendida',
    maintenance: 'Mantenimiento',
  }
  return statusMap[status] || 'Disponible'
}

function getStatusIcon(status) {
  const iconMap = {
    available: ['fas', 'check-circle'],
    rented: ['fas', 'times-circle'],
    reserved: ['fas', 'clock'],
    sold: ['fas', 'lock'],
    maintenance: ['fas', 'tools'],
  }
  return iconMap[status] || ['fas', 'info-circle']
}

function getTypeText(type) {
  const typeMap = {
    casa: 'Casa',
    apartamento: 'Apartamento',
    local: 'Local Comercial',
    finca: 'Finca',
  }
  return typeMap[type] || 'Propiedad'
}

function timeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now - date
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'hoy'
  if (diffInDays === 1) return 'ayer'
  if (diffInDays < 7) return `hace ${diffInDays} días`
  if (diffInDays < 30) return `hace ${Math.floor(diffInDays / 7)} semanas`
  if (diffInDays < 365) return `hace ${Math.floor(diffInDays / 30)} meses`
  return `hace ${Math.floor(diffInDays / 365)} años`
}

// Lifecycle
onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  checkAuthentication()
  fetchProperty()
})
</script>

<style scoped>
@import "../../assets/css/Properties/PropertyDetail.css";
</style>