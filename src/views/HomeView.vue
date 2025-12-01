<template>
  <div class="container">
    <section class="property-hero">
      <div class="property-hero-content">
        <section class="hero">
          <div class="hero-text">
            <h1>El hogar ideal existe, y te ayudamos a encontrarlo</h1>
            <p>
              Te acompañamos en cada paso para que encuentres una casa que
              encaje con tu vida y tus planes.
            </p>
          </div>
        </section>

        <!-- Estadísticas -->
        <div class="property-hero-stats">
          <div class="stat-item">
            <span class="stat-number">
              <template v-if="loadingProperties">
                <div class="circle-loader"></div>
              </template>
              <template v-else>{{ propertyCount.toLocaleString() }}</template>
            </span>
            <span class="stat-label">Propiedades</span>
          </div>

          <div class="stat-item">
            <span class="stat-number">
              <template v-if="loadingProperties">
                <div class="circle-loader"></div>
              </template>
              <template v-else>{{ activeClientsCount.toLocaleString() }}</template>
            </span>
            <span class="stat-label">Clientes Activos</span>
          </div>

          <div class="stat-item">
            <span class="stat-number">1+</span>
            <span class="stat-label">Años de experiencia</span>
          </div>
        </div>
      </div>

      <div class="hero-gradient-overlay"></div>
    </section>

    <!-- Buscador -->
    <section class="search-section">
      <div class="search-wrapper">
        <p class="search-title">Encuentra tu propiedad ideal</p>
        <div class="search-bar">
          <div class="search-input location-input">
            <input type="text" placeholder="¿Dónde quieres vivir?" v-model="searchFilters.location"
              @focus="searchFilters.location.length > 2 ? showSuggestions = true : null" @blur="hideSuggestions" />
            <span class="search-icon">🏠</span>

            <div v-if="showSuggestions && locationSuggestions.length > 0" class="suggestions-dropdown">
              <div v-for="suggestion in locationSuggestions" :key="suggestion.place_id" class="suggestion-item"
                @mousedown="selectLocationSuggestion(suggestion)">
                <span class="suggestion-icon">📍</span>
                <span class="suggestion-text">{{ suggestion.description }}</span>
              </div>
            </div>

            <div v-if="loadingSuggestions" class="suggestions-loading">
              🔍 Buscando ubicaciones...
            </div>
          </div>

          <div class="search-input">
            <select v-model="searchFilters.type" @change="filterProperties">
              <option value="">Tipo de propiedad</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="local">Local Comercial</option>
              <option value="finca">Finca</option>
            </select>
          </div>

          <div class="search-input">
            <input type="number" placeholder="Presupuesto máximo" v-model="searchFilters.maxPrice"
              @input="filterProperties" />
            <span class="search-icon">💰</span>
          </div>

          <button class="search-btn" @click="filterProperties">
            <span class="btn-text">Buscar Propiedades</span>
            <span class="btn-icon">🔍</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Propiedades -->
    <section class="properties-section">
      <div class="properties-container">
        <div class="section-header">
          <h2 class="section-title">Propiedades Exclusivas</h2>
          <p class="section-subtitle">Descubre nuestras mejores opciones seleccionadas para ti</p>
        </div>

        <!-- Loading -->
        <div v-if="loadingProperties" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando propiedades...</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorProperties" class="error-container">
          <p>¡Ups! Algo salió mal: {{ errorProperties }}</p>
          <button @click="fetchAllData" class="retry-btn">Intentar de nuevo</button>
        </div>

        <!-- Grid de propiedades -->
        <div v-else-if="displayedProperties.length > 0" class="properties-grid">
          <div v-for="property in displayedProperties" :key="property.id" class="property-card"
            :class="{ 'featured-card': property.featured }">
            <!-- Badge de estado -->
            <div class="property-status-badge" :class="property.status">
              {{ getStatusText(property.status) }}
            </div>

            <!-- Badge destacado -->
            <div v-if="property.featured" class="property-badge">
              ⭐ Propiedad Exclusiva
            </div>

            <!-- Imagen de la propiedad -->
            <div class="property-image-container">
              <img v-if="property.image_url" :src="property.image_url" alt="Imagen propiedad" class="property-image"
                @error="onImgError" />
              <div v-else class="image-placeholder">
                <div class="placeholder-icon">🏠</div>
                <div class="placeholder-text">Imagen de la propiedad</div>
                <div class="placeholder-subtext">{{ property.title }}</div>
              </div>

              <!-- Overlay de acciones -->
              <div class="property-overlay">
                <div class="property-actions">
                  <button class="action-btn fav-btn" @click.stop="toggleFavorite(property)"
                    :class="{ active: property.is_favorite }"
                    :title="property.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'">
                    ❤️
                  </button>
                  <button class="action-btn compare-btn" @click.stop="addToCompare(property)"
                    title="Comparar propiedad">⚖️</button>
                  <button class="action-btn share-btn" @click.stop="shareProperty(property)"
                    title="Compartir propiedad">📤</button>
                </div>
              </div>
            </div>

            <!-- Contenido de la propiedad -->
            <div class="property-content">
              <div class="property-header">
                <h3 class="property-title">{{ property.title || 'Propiedad exclusiva' }}</h3>
                <div class="property-price">
                  {{ formatPrice(property.monthly_price) }}
                  <span class="price-period">/mes</span>
                </div>
              </div>

              <div class="property-location">
                📍 {{ property.address }}, {{ property.city }}
              </div>

              <div class="property-features">
                <div class="feature-item" v-if="property.num_bedrooms">
                  <span class="feature-icon">🛏</span>
                  <span class="feature-text">{{ property.num_bedrooms }} Habitaciones</span>
                </div>
                <div class="feature-item" v-if="property.num_bathrooms">
                  <span class="feature-icon">🛁</span>
                  <span class="feature-text">{{ property.num_bathrooms }} Baños</span>
                </div>
                <div class="feature-item" v-if="property.area_m2">
                  <span class="feature-icon">📐</span>
                  <span class="feature-text">{{ property.area_m2 }} m²</span>
                </div>
                <div class="feature-item" v-if="property.parking_spaces">
                  <span class="feature-icon">🚗</span>
                  <span class="feature-text">{{ property.parking_spaces }} Parqueaderos</span>
                </div>
              </div>

              <div class="property-description">
                {{ truncateDescription(property.description) }}
              </div>

              <div class="property-tags">
                <span class="property-type-tag">{{ getTypeText(property.type) }}</span>
                <span v-if="property.new_construction" class="property-new-tag">Nueva Construcción</span>
                <span v-if="property.pet_friendly" class="property-pet-tag">🐾 Mascotas</span>
              </div>

              <div class="property-footer">
                <button class="details-btn" @click.stop="viewPropertyDetails(property)">
                  <span class="btn-text">Ver Detalles</span>
                  <span class="btn-arrow">→</span>
                </button>
                <button class="contact-btn" @click.stop="contactAgent(property)">📞 Contactar</button>
              </div>

              <div class="property-meta">
                <span class="meta-item">🕒 Publicado: {{ formatDate(property.created_at) }}</span>
                <span class="meta-item">👁️ {{ property.views || 0 }} visitas</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="empty-state">
          <div class="empty-icon">🏡</div>
          <h3>No encontramos propiedades con esos filtros</h3>
          <p>Intenta ajustar tus criterios de búsqueda o revisa todas nuestras propiedades disponibles</p>
          <button @click="clearFilters" class="clear-filters-btn">🔄 Limpiar filtros de búsqueda</button>
        </div>

        <!-- Ver más propiedades -->
        <div v-if="!loadingProperties && filteredProperties.length > PROPERTIES_LIMIT" class="view-more-section">
          <div class="results-info">
            <p class="properties-count">
              Visualizando <strong>{{ displayedProperties.length }}</strong> de
              <strong>{{ filteredProperties.length }}</strong> propiedades encontradas
            </p>
            <p class="results-note">¿No encuentras lo que buscas?</p>
          </div>
          <button @click="goToProperties" class="view-more-btn">
            <span class="btn-text">Explorar Todas las Propiedades</span>
            <span class="btn-icon">🔍</span>
          </button>
        </div>
      </div>
    </section>

    <!-- MODAL DE DETALLES MEJORADO -->
    <Transition name="modal">
      <div v-if="modalOpen && selectedProperty" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-box" @click.stop>

          <button class="modal-close" @click="closeModal" type="button">
            <span class="close-icon">✕</span>
          </button>

          <!-- Encabezado del modal -->
          <div class="modal-header">
            <div class="property-status-badge" :class="selectedProperty.status || 'available'">
              <span class="status-dot" :class="selectedProperty.status || 'available'"></span>
              {{ friendlyStatus(selectedProperty.status) }}
            </div>
            <h2 class="modal-title">{{ selectedProperty.title || 'Propiedad' }}</h2>
            <div class="property-price-highlight">
              <span class="price-amount">${{ (selectedProperty.monthly_price || 0).toLocaleString() }}</span>
              <span class="price-period">/mes</span>
            </div>
          </div>

          <!-- Galería de imágenes -->
          <div class="modal-gallery">
            <img 
              :src="selectedProperty.image_url || DEFAULT_PROPERTY_IMAGE" 
              class="modal-main-image"
              :alt="selectedProperty.title"
              @error="onImgError" 
            />
            <div class="image-badge">
              <span class="badge-icon">📸</span>
              <span class="badge-text">Galería</span>
            </div>
          </div>

          <!-- Información principal en tarjetas -->
          <div class="modal-details-grid">
            <!-- Tarjeta de ubicación -->
            <div class="detail-card location-card">
              <div class="card-icon">📍</div>
              <div class="card-content">
                <h3 class="card-title">Ubicación</h3>
                <p class="card-text">{{ selectedProperty.address || 'No disponible' }}</p>
                <p class="card-subtext">{{ selectedProperty.city || '' }}</p>
              </div>
            </div>

            <!-- Tarjeta de características -->
            <div class="detail-card features-card">
              <div class="card-icon">📐</div>
              <div class="card-content">
                <h3 class="card-title">Características</h3>
                <div class="features-list">
                  <div class="feature">
                    <span class="feature-label">Área:</span>
                    <span class="feature-value">{{ selectedProperty.area_m2 || 0 }} m²</span>
                  </div>
                  <div class="feature" v-if="selectedProperty.num_bedrooms">
                    <span class="feature-label">Habitaciones:</span>
                    <span class="feature-value">{{ selectedProperty.num_bedrooms }}</span>
                  </div>
                  <div class="feature" v-if="selectedProperty.num_bathrooms">
                    <span class="feature-label">Baños:</span>
                    <span class="feature-value">{{ selectedProperty.num_bathrooms }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tarjeta de servicios -->
            <div class="detail-card services-card">
              <div class="card-icon">🛠️</div>
              <div class="card-content">
                <h3 class="card-title">Servicios Incluidos</h3>
                <div class="services-tags" v-if="getServicesArray(selectedProperty.included_services).length > 0">
                  <span v-for="service in getServicesArray(selectedProperty.included_services)" :key="service" class="service-tag">
                    {{ service.trim() }}
                  </span>
                </div>
                <p v-else class="no-services">No hay servicios incluidos</p>
              </div>
            </div>

            <!-- Tarjeta de publicación -->
            <div class="detail-card publication-card">
              <div class="card-icon">📅</div>
              <div class="card-content">
                <h3 class="card-title">Publicación</h3>
                <p class="card-text">{{ formatModalDate(selectedProperty.publication_date) }}</p>
                <p class="card-subtext">Publicado hace {{ timeAgo(selectedProperty.publication_date) }}</p>
              </div>
            </div>
          </div>

          <!-- Descripción expandida -->
          <div class="description-section">
            <h3 class="section-title">Descripción</h3>
            <p class="description-text">{{ selectedProperty.description || 'Sin descripción disponible' }}</p>
          </div>

          <!-- Ubicación en mapa -->
          <div v-if="selectedProperty.lat && selectedProperty.lng" class="location-section">
            <div class="section-header">
              <h3 class="section-title">📍 Ubicación Exacta</h3>
              <button class="btn-map-preview" @click="viewOnMap(selectedProperty)" type="button">
                <span class="btn-icon">🗺️</span>
                <span class="btn-text">Ver en Mapa Completo</span>
              </button>
            </div>
            <div class="coordinates-display">
              <div class="coordinate">
                <span class="coordinate-label">Latitud:</span>
                <span class="coordinate-value">{{ Number(selectedProperty.lat).toFixed(6) }}</span>
              </div>
              <div class="coordinate">
                <span class="coordinate-label">Longitud:</span>
                <span class="coordinate-value">{{ Number(selectedProperty.lng).toFixed(6) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="no-location-section">
            <div class="no-location-icon">🗺️</div>
            <p class="no-location-text">Esta propiedad aún no tiene ubicación registrada</p>
          </div>

          <!-- Acciones del modal -->
          <div class="modal-actions">
            <!-- Botón para solicitar visita -->
            <button 
              v-if="selectedProperty.status === 'available'"
              class="btn-request-visit" 
              @click="openRequestVisitModal(selectedProperty)"
              type="button"
            >
              <span class="btn-icon">📅</span>
              <span class="btn-text">Solicitar Cita de Visita</span>
            </button>

            <!-- Si no está disponible -->
            <div v-else class="unavailable-notice">
              <div class="notice-icon">⏸️</div>
              <div class="notice-content">
                <h4>Propiedad No Disponible</h4>
                <p>Actualmente esta propiedad no está disponible para visitas</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <RequestVisitModal 
      :open="showRequestModal" 
      :property="propertyForRequest" 
      @close="showRequestModal = false"
      @success="handleVisitRequestSuccess" 
    />

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import RequestVisitModal from "../components/modals/ModalRequest/RequestVisitModal.vue";
import { useRouter } from "vue-router";
import { mapsService } from "../services/mapsService";
import api from "../services/api";

const DEFAULT_PROPERTY_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+";

function onImgError(event) {
  const img = event.target;
  if (img && img.src !== DEFAULT_PROPERTY_IMAGE) {
    img.src = DEFAULT_PROPERTY_IMAGE;
    img.onerror = null;
  }
}

const router = useRouter();

// Estados
const properties = ref([]);
const selectedProperty = ref(null);

// Para la solicitud de visitas
const propertyForRequest = ref(null);
const showRequestModal = ref(false);

const openRequestVisitModal = (property) => {
  if (!property) return;
  propertyForRequest.value = property;
  showRequestModal.value = true;
  closeModal();
};

const handleVisitRequestSuccess = () => {
  showRequestModal.value = false;
  // Aquí puedes agregar lógica adicional si es necesario
  console.log('Solicitud de visita enviada con éxito');
};

const loadingProperties = ref(false);
const errorProperties = ref(null);
const activeClientsCount = ref(0);
const propertyCount = ref(0);
const PROPERTIES_LIMIT = 4;

// Estados para el modal
const modalOpen = ref(false);

// Filtros y búsqueda
const searchFilters = ref({ location: "", type: "", maxPrice: null });
const locationSuggestions = ref([]);
const showSuggestions = ref(false);
const loadingSuggestions = ref(false);

// Computed
const filteredProperties = computed(() => {
  let filtered = properties.value;

  if (searchFilters.value.location) {
    filtered = filtered.filter(
      p =>
        p.address?.toLowerCase().includes(searchFilters.value.location.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchFilters.value.location.toLowerCase())
    );
  }
  if (searchFilters.value.type) {
    filtered = filtered.filter(p => p.type?.toLowerCase() === searchFilters.value.type.toLowerCase());
  }
  if (searchFilters.value.maxPrice) {
    filtered = filtered.filter(p => p.monthly_price <= searchFilters.value.maxPrice);
  }
  return filtered;
});

const displayedProperties = computed(() => {
  const featured = filteredProperties.value.filter(p => p.featured);
  const regular = filteredProperties.value.filter(p => !p.featured);
  return [...featured, ...regular].slice(0, PROPERTIES_LIMIT);
});

// Funciones del Modal
const openModal = (property) => {
  if (!property) return;
  selectedProperty.value = { ...property };
  modalOpen.value = true;
  document.body.classList.add("modal-open");
};

const closeModal = () => {
  modalOpen.value = false;
  selectedProperty.value = null;
  document.body.classList.remove("modal-open");
};

// Función para ver en el mapa
const viewOnMap = (property) => {
  closeModal();
  // Navegar a la vista de MapView con el id de la propiedad
  router.push({ name: 'MapView', params: { id: property.id } });
};

// MAPEAR STATUS A TEXTO
const friendlyStatus = (s) => {
  const statusMap = {
    available: "Disponible",
    rented: "Rentada",
    reserved: "Reservada",
    sold: "Vendida",
    maintenance: "En mantenimiento",
  };
  return statusMap[s] || s || "Disponible";
};

// Función para formatear fecha para el modal
const formatModalDate = (dateString) => {
  if (!dateString) return 'No disponible';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para calcular tiempo transcurrido
const timeAgo = (dateString) => {
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
};

// Funciones principales
async function fetchAllData() {
  loadingProperties.value = true;
  errorProperties.value = null;

  try {
    const [propRes, usersRes] = await Promise.all([api.get("/properties"), api.get("/users")]);
    properties.value = propRes.data;
    propertyCount.value = properties.value.length;
    activeClientsCount.value = usersRes.data.length;
  } catch (error) {
    console.error(error);
    errorProperties.value = "No pudimos cargar los datos en este momento";
    propertyCount.value = 0;
    activeClientsCount.value = 0;
  } finally {
    loadingProperties.value = false;
  }
}

// Autocompletado
async function fetchLocationSuggestions(input) {
  if (!input.trim()) return;
  loadingSuggestions.value = true;
  try {
    const suggestions = await mapsService.autocompletePlace(input);
    locationSuggestions.value = suggestions;
    showSuggestions.value = suggestions.length > 0;
  } catch (error) {
    console.error(error);
    locationSuggestions.value = [];
  } finally {
    loadingSuggestions.value = false;
  }
}

function selectLocationSuggestion(suggestion) {
  searchFilters.value.location = suggestion.description;
  showSuggestions.value = false;
  locationSuggestions.value = [];
}

function hideSuggestions() {
  setTimeout(() => (showSuggestions.value = false), 200);
}

// Utilidades
function formatPrice(price) {
  if (!price) return "Consultar precio";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
}

function truncateDescription(description, maxLength = 120) {
  if (!description) return "Descripción no disponible";
  return description.length > maxLength ? description.substring(0, maxLength) + "..." : description;
}

function formatDate(dateString) {
  if (!dateString) return "Reciente";
  const options = { day: "numeric", month: "long", year: "numeric" };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}

function getStatusText(status) {
  if (!status) return "Disponible";

  const key = status.toString().trim().toLowerCase();

  const map = {
    "disponible": "Disponible",
    "ocupado": "Ocupado",
    "en mantenimiento": "En mantenimiento",
    "vendido": "Vendido",
    "arrendada": "Arrendada",
    "available": "Disponible",
    "reserved": "Ocupado",
    "sold": "Vendido",
    "rented": "Arrendada",
    "maintenance": "En mantenimiento"
  };

  return map[key] || "Disponible";
}

function getTypeText(type) {
  const map = { 
    casa: "Casa", 
    apartamento: "Apartamento", 
    local: "Local Comercial", 
    finca: "Finca" 
  };
  return map[type] || "Propiedad";
}

// Función para convertir servicios de string a array
function getServicesArray(services) {
  if (!services) return [];
  
  // Si ya es un array, devolverlo
  if (Array.isArray(services)) {
    return services;
  }
  
  // Si es un string, dividirlo por comas
  if (typeof services === 'string') {
    return services.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  
  return [];
}

// Interacciones
function filterProperties() {
  console.log("Filtros aplicados:", searchFilters.value);
}

function viewPropertyDetails(property) {
  router.push({ name: 'PropertyDetail', params: { id: property.id } });
}

function clearFilters() { 
  searchFilters.value = { location: "", type: "", maxPrice: null }; 
}

function goToProperties() { 
  router.push("/propiedades"); 
}

function toggleFavorite(property) { 
  property.is_favorite = !property.is_favorite; 
}

function addToCompare(property) { 
  console.log("Comparar", property.title); 
}

function shareProperty(property) { 
  console.log("Compartir", property.title); 
}

function contactAgent(property) {
  console.log("Contactar", property.title);
  closeModal();
}

// Watchers
watch(() => searchFilters.value.location, async (val) => {
  if (val.length > 2) await fetchLocationSuggestions(val);
  else locationSuggestions.value = [];
});

// Lifecycle
onMounted(fetchAllData);
</script>

<style scoped>
@import "../assets/css/HomeView.css";
</style>