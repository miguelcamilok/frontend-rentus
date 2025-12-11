<template>
  <div class="container">
    <!-- Partículas de fondo animadas -->
    <div class="particles-background">
      <div class="particle" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></div>
    </div>

    <!-- Hero Section Moderna -->
    <section class="modern-hero">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <div class="hero-content-wrapper">
        <div class="hero-text-section" data-aos="fade-right">
          <div class="hero-badge">
            <font-awesome-icon :icon="['fas', 'star']" class="badge-icon" />
            <span>Tu hogar ideal te espera</span>
          </div>

          <h1 class="hero-title">
            Encuentra el
            <span class="gradient-text"> hogar perfecto</span>
            <br />para tu estilo de vida
          </h1>

          <p class="hero-description">
            Te acompañamos en cada paso para que encuentres una casa que
            encaje con tu vida y tus planes. Descubre propiedades exclusivas.
          </p>

          <!-- Stats en el hero -->
          <div class="hero-stats-inline">
            <div class="stat-inline-item">
              <div class="stat-inline-icon">
                <font-awesome-icon :icon="['fas', 'home']" />
              </div>
              <div class="stat-inline-content">
                <div class="stat-inline-number">
                  <template v-if="loadingProperties">
                    <div class="mini-loader"></div>
                  </template>
                  <template v-else>{{ propertyCount.toLocaleString() }}+</template>
                </div>
                <div class="stat-inline-label">Propiedades</div>
              </div>
            </div>

            <div class="stat-inline-item">
              <div class="stat-inline-icon">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
              </div>
              <div class="stat-inline-content">
                <div class="stat-inline-number">
                  <template v-if="loadingProperties">
                    <div class="mini-loader"></div>
                  </template>
                  <template v-else>{{ activeClientsCount.toLocaleString() }}+</template>
                </div>
                <div class="stat-inline-label">Clientes Felices</div>
              </div>
            </div>

            <div class="stat-inline-item">
              <div class="stat-inline-icon">
                <font-awesome-icon :icon="['fas', 'star']" />
              </div>
              <div class="stat-inline-content">
                <div class="stat-inline-number">1+</div>
                <div class="stat-inline-label">Años de Experiencia</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Imagen decorativa con efecto -->
        <div class="hero-image-section" data-aos="fade-left">
          <div class="floating-card card-1">
            <font-awesome-icon :icon="['fas', 'home']" class="card-icon" />
            <div class="card-text">Propiedades Verificadas</div>
          </div>
          <div class="floating-card card-2">
            <font-awesome-icon :icon="['fas', 'star']" class="card-icon" />
            <div class="card-text">Mejor Valoradas</div>
          </div>
          <div class="hero-image-placeholder">
            <div class="image-grid">
              <div class="grid-item item-1"></div>
              <div class="grid-item item-2"></div>
              <div class="grid-item item-3"></div>
              <div class="grid-item item-4"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Buscador Moderno Flotante -->
    <section class="modern-search-section" data-aos="fade-up">
      <div class="search-container">
        <div class="search-header">
          <font-awesome-icon :icon="['fas', 'home']" class="search-header-icon" />
          <h3>Encuentra tu próximo hogar</h3>
        </div>

        <div class="search-grid">
          <!-- En la sección de búsqueda, cambia: -->

          <!-- Campo de búsqueda general (reemplaza el campo de título) -->
          <div class="search-field">
            <label class="search-label">
              <font-awesome-icon :icon="['fas', 'search']" />
              Buscar
            </label>
            <input type="text" placeholder="Buscar por título, descripción o ubicación..." v-model="filters.search"
              @input="applyFilters" />
          </div>

          <!-- Campo de ubicación -->
          <div class="search-field">
            <label class="search-label">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              Ubicación
            </label>
            <div class="input-wrapper">
              <input type="text" placeholder="¿Dónde quieres vivir?" v-model="filters.city"
                @focus="filters.city.length > 2 ? showSuggestions = true : null" @blur="hideSuggestions"
                @input="applyFilters" />

              <!-- Sugerencias de ubicación -->
              <div v-if="showSuggestions && locationSuggestions.length > 0" class="suggestions-dropdown">
                <div v-for="suggestion in locationSuggestions" :key="suggestion.place_id" class="suggestion-item"
                  @mousedown="selectLocationSuggestion(suggestion)">
                  <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="suggestion-icon" />
                  <span class="suggestion-text">{{ suggestion.description }}</span>
                </div>
              </div>

              <div v-if="loadingSuggestions" class="suggestions-loading">
                <div class="mini-loader"></div>
                Buscando ubicaciones...
              </div>
            </div>
          </div>

          <!-- Campo de tipo -->
          <div class="search-field">
            <label class="search-label">
              <font-awesome-icon :icon="['fas', 'home']" />
              Tipo de Propiedad
            </label>
            <select v-model="filters.type" @change="applyFilters">
              <option value="">Todos los tipos</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="local">Local Comercial</option>
              <option value="finca">Finca</option>
            </select>
          </div>

          <!-- Campo de precio -->
          <div class="search-field">
            <label class="search-label">
              <font-awesome-icon :icon="['fas', 'calendar']" />
              Presupuesto Máximo
            </label>
            <input type="number" placeholder="Ej: 2,000,000" v-model.number="filters.maxPrice" @input="applyFilters" />
          </div>

          <!-- Botón de búsqueda -->
          <div class="search-field">
            <button class="search-btn-modern" @click="applyFilters">
              <span>Buscar</span>
              <font-awesome-icon :icon="['fas', 'arrow-right']" class="btn-arrow" />
            </button>
          </div>

          <!-- Active Filters Tags (ya está correcto con la nueva estructura) -->
          <transition name="slide-fade">
            <div v-if="hasActiveFilters" class="active-filters-bar">
              <span class="filters-label">Filtros Activos:</span>
              <div class="filters-chips">
                <div v-if="filters.search" class="filter-chip">
                  <span class="chip-icon">🔍</span>
                  <span class="chip-value">{{ filters.search }}</span>
                  <button @click="filters.search = ''" class="chip-close">✕</button>
                </div>
                <div v-if="filters.city" class="filter-chip">
                  <span class="chip-icon">📍</span>
                  <span class="chip-value">{{ filters.city }}</span>
                  <button @click="filters.city = ''" class="chip-close">✕</button>
                </div>
                <div v-if="filters.type" class="filter-chip">
                  <span class="chip-icon">🏠</span>
                  <span class="chip-value">{{ filters.type }}</span>
                  <button @click="filters.type = ''" class="chip-close">✕</button>
                </div>
                <div v-if="filters.maxPrice" class="filter-chip">
                  <span class="chip-icon">💰</span>
                  <span class="chip-value">{{ formatPrice(filters.maxPrice) }}</span>
                  <button @click="filters.maxPrice = null" class="chip-close">✕</button>
                </div>
              </div>
              <button @click="clearFilters" class="btn-clear-all-inline">
                <span class="icon">↻</span>
                <span>Limpiar</span>
              </button>
            </div>
          </transition>

        </div>
      </div>
    </section>

    <!-- Propiedades Section -->
    <section class="properties-modern-section">
      <div class="properties-container">
        <div class="section-header-modern" data-aos="fade-up">
          <div class="header-content">
            <span class="section-subtitle-badge">
              <font-awesome-icon :icon="['fas', 'star']" />
              Propiedades Destacadas
            </span>
            <h2 class="section-title-modern">
              Descubre Nuestras
              <span class="gradient-text">Mejores Opciones</span>
            </h2>
            <p class="section-description">
              Propiedades cuidadosamente seleccionadas para ti
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingProperties" class="loading-modern" data-aos="fade-up">
          <div class="loading-spinner-modern"></div>
          <p>Cargando propiedades increíbles...</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorProperties" class="error-modern" data-aos="fade-up">
          <font-awesome-icon :icon="['fas', 'times-circle']" class="error-icon" />
          <p>{{ errorProperties }}</p>
          <button @click="fetchAllData" class="retry-btn-modern">
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
            Intentar de nuevo
          </button>
        </div>

        <!-- Grid de propiedades moderno -->
        <div v-else-if="displayedProperties.length > 0" class="properties-grid">
          <article v-for="(property, index) in displayedProperties" :key="property.id" class="property-card"
            :style="{ animationDelay: (index * 0.1) + 's' }" :data-aos="'fade-up'" :data-aos-delay="index * 100"
            @click="viewPropertyDetails(property)">
            <!-- Card Glow Effect -->
            <div class="card-glow"></div>

            <!-- Image Section -->
            <div class="card-image-section">
              <div class="image-wrapper">
                <img :src="property.image_url || DEFAULT_PROPERTY_IMAGE" :alt="property.title" class="property-img"
                  @error="onImgError" />
                <div class="image-gradient"></div>
              </div>

              <!-- Status Badge -->
              <div class="status-badge" :class="property.status">
                <span class="status-pulse"></span>
                <span class="status-text">{{ getStatusText(property.status) }}</span>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <button class="action-btn fav-btn" @click.stop="toggleFavorite(property)"
                  :class="{ 'active': property.is_favorite }" title="Favorito">
                  <span class="btn-icon">
                    <font-awesome-icon :icon="['fas', 'star']" />
                  </span>
                  <div class="btn-bg"></div>
                </button>
                <button class="action-btn share-btn" @click.stop="shareProperty(property)" title="Compartir">
                  <span class="btn-icon">
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </span>
                  <div class="btn-bg"></div>
                </button>
              </div>

              <!-- Type Tag -->
              <div class="type-tag">
                <font-awesome-icon :icon="['fas', getTypeIcon(property.title)]" />
                <span class="type-text">{{ detectType(property.title) }}</span>
              </div>
            </div>

            <!-- Card Content -->
            <div class="card-content">
              <!-- Header -->
              <div class="card-header">
                <div class="card-header-left">
                  <h3 class="card-title">{{ property.title || 'Propiedad exclusiva' }}</h3>
                  <div class="card-location">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                    <span class="location-text">{{ property.city }}</span>
                  </div>
                </div>
                <div class="card-header-right">
                  <span class="price-label-small">Precio Mensual</span>
                  <span class="price-value-header">
                    {{ formatPrice(property.monthly_price) }}
                  </span>
                  <span class="price-period-small">/mes</span>
                </div>
              </div>

              <!-- Features -->
              <div class="features-container">
                <div class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">Área</span>
                    <span class="feature-value">{{ property.area_m2 }} m²</span>
                  </div>
                </div>
                <div v-if="property.num_bedrooms" class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'bed']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">Habitaciones</span>
                    <span class="feature-value">{{ property.num_bedrooms }}</span>
                  </div>
                </div>
                <div v-if="property.num_bathrooms" class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'bath']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">Baños</span>
                    <span class="feature-value">{{ property.num_bathrooms }}</span>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="card-description">
                {{ truncateDescription(property.description) }}
              </p>

              <!-- Card Footer -->
              <div class="card-footer">
                <button class="btn-view-details" @click.stop="viewPropertyDetails(property)">
                  <span class="btn-text">Ver Detalles</span>
                  <span class="btn-arrow">→</span>
                  <div class="btn-hover-effect"></div>
                </button>
              </div>
            </div>

            <!-- Card Border Effect -->
            <div class="card-border-effect"></div>
          </article>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state-modern" data-aos="fade-up">
          <font-awesome-icon :icon="['fas', 'home']" class="empty-icon-modern" />
          <h3>No encontramos propiedades</h3>
          <p>Intenta ajustar tus criterios de búsqueda</p>
          <button @click="clearFilters" class="clear-filters-btn-modern">
            <font-awesome-icon :icon="['fas', 'times']" />
            Limpiar filtros
          </button>
        </div>

        <!-- Ver más -->
        <div v-if="!loadingProperties && filteredProperties.length > PROPERTIES_LIMIT" class="view-more-modern"
          data-aos="fade-up">
          <div class="view-more-info">
            <p>
              Mostrando <strong>{{ displayedProperties.length }}</strong> de
              <strong>{{ filteredProperties.length }}</strong> propiedades
            </p>
          </div>
          <button @click="goToProperties" class="view-all-btn-modern">
            <span>Explorar Todas las Propiedades</span>
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
          </button>
        </div>
      </div>
    </section>

    <!-- CTA Section Moderna -->
    <section class="cta-modern-section" data-aos="fade-up">
      <div class="cta-background">
        <div class="cta-orb cta-orb-1"></div>
        <div class="cta-orb cta-orb-2"></div>
      </div>
      <div class="cta-content">
        <font-awesome-icon :icon="['fas', 'star']" class="cta-icon" />
        <h2>¿Listo para encontrar tu hogar ideal?</h2>
        <p>Contáctanos y te ayudaremos a encontrar la propiedad perfecta para ti</p>
        <div class="cta-buttons">
          <button class="cta-btn primary" @click="goToProperties">
            <span>Ver Propiedades</span>
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
          </button>
          <button class="cta-btn secondary">
            <font-awesome-icon :icon="['fas', 'phone']" />
            <span>Contactar</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Modal (mantén tu modal existente) -->
    <Transition name="modal">
      <div v-if="modalOpen && selectedProperty" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-box" @click.stop>
          <button class="modal-close" @click="closeModal" type="button">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>

          <div class="modal-header">
            <div class="property-status-badge" :class="selectedProperty.status || 'available'">
              <span class="status-dot" :class="selectedProperty.status || 'available'"></span>
              {{ friendlyStatus(selectedProperty.status) }}
            </div>
            <h2 class="modal-title">{{ selectedProperty.title || 'Propiedad' }}</h2>
            <div class="property-price-highlight">
              <span class="price-amount">{{ formatPrice(selectedProperty.monthly_price) }}</span>
              <span class="price-period">/mes</span>
            </div>
          </div>

          <div class="modal-gallery">
            <img :src="selectedProperty.image_url || DEFAULT_PROPERTY_IMAGE" class="modal-main-image"
              :alt="selectedProperty.title" @error="onImgError" />
            <div class="image-badge">
              <font-awesome-icon :icon="['fas', 'camera']" class="badge-icon" />
              <span class="badge-text">Galería</span>
            </div>
          </div>

          <div class="modal-details-grid">
            <div class="detail-card location-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              </div>
              <div class="card-content">
                <h3 class="card-title">Ubicación</h3>
                <p class="card-text">{{ selectedProperty.address || 'No disponible' }}</p>
                <p class="card-subtext">{{ selectedProperty.city || '' }}</p>
              </div>
            </div>

            <div class="detail-card features-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'ruler-combined']" />
              </div>
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

            <div class="detail-card services-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
              </div>
              <div class="card-content">
                <h3 class="card-title">Servicios Incluidos</h3>
                <div class="services-tags" v-if="getServicesArray(selectedProperty.included_services).length > 0">
                  <span v-for="service in getServicesArray(selectedProperty.included_services)" :key="service"
                    class="service-tag">
                    {{ service.trim() }}
                  </span>
                </div>
                <p v-else class="no-services">No hay servicios incluidos</p>
              </div>
            </div>

            <div class="detail-card publication-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'calendar']" />
              </div>
              <div class="card-content">
                <h3 class="card-title">Publicación</h3>
                <p class="card-text">{{ formatModalDate(selectedProperty.publication_date) }}</p>
                <p class="card-subtext">Publicado hace {{ timeAgo(selectedProperty.publication_date) }}</p>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h3 class="section-title">Descripción</h3>
            <p class="description-text">{{ selectedProperty.description || 'Sin descripción disponible' }}</p>
          </div>

          <div v-if="selectedProperty.lat && selectedProperty.lng" class="location-section">
            <div class="section-header">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                Ubicación Exacta
              </h3>
              <button class="btn-map-preview" @click="viewOnMap(selectedProperty)" type="button">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="btn-icon" />
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
            <div class="no-location-icon">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
            </div>
            <p class="no-location-text">Esta propiedad aún no tiene ubicación registrada</p>
          </div>

          <div class="modal-actions">
            <button v-if="selectedProperty.status === 'available'" class="btn-request-visit"
              @click="openRequestVisitModal(selectedProperty)" type="button">
              <font-awesome-icon :icon="['fas', 'calendar']" class="btn-icon" />
              <span class="btn-text">Solicitar Cita de Visita</span>
            </button>

            <div v-else class="unavailable-notice">
              <div class="notice-icon">
                <font-awesome-icon :icon="['fas', 'times-circle']" />
              </div>
              <div class="notice-content">
                <h4>Propiedad No Disponible</h4>
                <p>Actualmente esta propiedad no está disponible para visitas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <RequestVisitModal :open="showRequestModal" :property="propertyForRequest" @close="showRequestModal = false"
      @success="handleVisitRequestSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import RequestVisitModal from "../components/modals/ModalRequest/RequestVisitModal.vue";
import { useRouter } from "vue-router";
import { mapsService } from "../services/mapsService";
import api from "../services/api";

const DEFAULT_PROPERTY_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+";

function onImgError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img && img.src !== DEFAULT_PROPERTY_IMAGE) {
    img.src = DEFAULT_PROPERTY_IMAGE;
    img.onerror = null;
  }
}

const router = useRouter();

const properties = ref<any[]>([]);
const selectedProperty = ref<any>(null);
const propertyForRequest = ref<any>(null);
const showRequestModal = ref(false);
const loadingProperties = ref(false);
const errorProperties = ref<string | null>(null);
const activeClientsCount = ref(0);
const propertyCount = ref(0);
const PROPERTIES_LIMIT = 4;
const modalOpen = ref(false);
const locationSuggestions = ref<any[]>([]);
const showSuggestions = ref(false);
const loadingSuggestions = ref(false);

// ESTRUCTURA DE FILTROS COMO EN EL SEGUNDO EJEMPLO
const filters = ref({
  search: "",
  city: "",
  type: "",
  maxPrice: null as number | null,
});

// Computed: Propiedades filtradas (igual que en el segundo ejemplo)
const filteredProperties = computed(() => {
  return properties.value.filter((p) => {
    const typeFromTitle = detectType(p.title).toLowerCase();

    const matchSearch =
      !filters.value.search ||
      p.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      p.description.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      p.city.toLowerCase().includes(filters.value.search.toLowerCase());

    const matchCity =
      !filters.value.city ||
      p.city.toLowerCase().includes(filters.value.city.toLowerCase());

    const matchType =
      !filters.value.type || filters.value.type === typeFromTitle;

    const rawMax = filters.value.maxPrice;
    const matchPrice = !rawMax || Number(p.monthly_price) <= rawMax;

    return matchSearch && matchCity && matchType && matchPrice;
  });
});

// Computed: Propiedades a mostrar (con límite)
const displayedProperties = computed(() => {
  const featured = filteredProperties.value.filter(p => p.featured);
  const regular = filteredProperties.value.filter(p => !p.featured);
  return [...featured, ...regular].slice(0, PROPERTIES_LIMIT);
});

// Computed: ¿Hay filtros activos?
const hasActiveFilters = computed(() => {
  return filters.value.search || filters.value.city || filters.value.type || filters.value.maxPrice;
});

// Métodos
const detectType = (title: string): string => {
  if (!title) return "Propiedad";
  const t = title.toLowerCase();
  if (t.includes("casa")) return "Casa";
  if (t.includes("apartamento") || t.includes("apto")) return "Apartamento";
  if (t.includes("local")) return "Local";
  if (t.includes("finca")) return "Finca";
  return "Propiedad";
};

const getTypeIcon = (title: string): string => {
  if (!title) return "home";
  const t = title.toLowerCase();
  if (t.includes("casa")) return "home";
  if (t.includes("apartamento") || t.includes("apto")) return "building";
  if (t.includes("local")) return "store";
  if (t.includes("finca")) return "tree";
  return "home";
};

// MÉTODO PARA APLICAR FILTROS
const applyFilters = () => {
  // Los filtros se aplican automáticamente a través de computed
  console.log("Filtros aplicados:", filters.value);
};

// Método para limpiar filtros
const clearFilters = () => {
  filters.value = {
    search: "",
    city: "",
    type: "",
    maxPrice: null,
  };
  locationSuggestions.value = [];
  showSuggestions.value = false;
};

// Watcher para sugerencias de ubicación
watch(
  () => filters.value.city,
  async (newVal) => {
    if (newVal.length > 2) {
      await fetchLocationSuggestions(newVal);
    } else {
      locationSuggestions.value = [];
      showSuggestions.value = false;
    }
  },
  { immediate: false }
);

// Resto de tus métodos permanecen igual...
const openRequestVisitModal = (property: any) => {
  if (!property) return;
  propertyForRequest.value = property;
  showRequestModal.value = true;
  closeModal();
};

const handleVisitRequestSuccess = () => {
  showRequestModal.value = false;
  console.log('Solicitud de visita enviada con éxito');
};

const closeModal = () => {
  modalOpen.value = false;
  selectedProperty.value = null;
  document.body.classList.remove("modal-open");
};

const viewOnMap = (property: any) => {
  closeModal();
  router.push({ name: 'MapView', params: { id: property.id } });
};

const friendlyStatus = (s: string) => {
  const statusMap: Record<string, string> = {
    available: "Disponible",
    rented: "Rentada",
    reserved: "Reservada",
    sold: "Vendida",
    maintenance: "En mantenimiento",
  };
  return statusMap[s] || s || "Disponible";
};

const formatModalDate = (dateString: string) => {
  if (!dateString) return 'No disponible';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const timeAgo = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'hoy';
  if (diffInDays === 1) return 'ayer';
  if (diffInDays < 7) return `hace ${diffInDays} días`;
  if (diffInDays < 30) return `hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `hace ${Math.floor(diffInDays / 30)} meses`;
  return `hace ${Math.floor(diffInDays / 365)} años`;
};

async function fetchAllData() {
  loadingProperties.value = true;
  errorProperties.value = null;

  try {
    const [propRes, usersRes] = await Promise.all([
      api.get("/properties"),
      api.get("/users")
    ]);
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

async function fetchLocationSuggestions(input: string) {
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

function selectLocationSuggestion(suggestion: any) {
  filters.value.city = suggestion.description;
  showSuggestions.value = false;
  locationSuggestions.value = [];
}

function hideSuggestions() {
  setTimeout(() => {
    if (!document.activeElement?.classList?.contains('suggestion-item')) {
      showSuggestions.value = false;
    }
  }, 200);
}

function formatPrice(price: number) {
  if (!price) return "Consultar precio";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(price);
}

function truncateDescription(description: string, maxLength: number = 120) {
  if (!description) return "Descripción no disponible";
  return description.length > maxLength
    ? description.substring(0, maxLength) + "..."
    : description;
}

function getStatusText(status: string) {
  if (!status) return "Disponible";

  const key = status.toString().trim().toLowerCase();

  const map: Record<string, string> = {
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

function getServicesArray(services: any) {
  if (!services) return [];

  if (Array.isArray(services)) {
    return services;
  }

  if (typeof services === 'string') {
    return services.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  return [];
}

function viewPropertyDetails(property: any) {
  router.push({ name: 'PropertyDetail', params: { id: property.id } });
}

function goToProperties() {
  router.push("/propiedades");
}

function toggleFavorite(property: any) {
  property.is_favorite = !property.is_favorite;
}

function shareProperty(property: any) {
  console.log("Compartir", property.title);
}

function getParticleStyle(n: number) {
  const duration = 15 + Math.random() * 20;
  const delay = Math.random() * 5;
  const size = 4 + Math.random() * 8;

  return {
    left: `${Math.random() * 100}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    width: `${size}px`,
    height: `${size}px`
  };
}

onMounted(() => {
  fetchAllData();
});
</script>

<style scoped>
@import "../assets/css/HomeView.css";

/* ============= BUSCADOR MODERNO ============= */
.modern-search-section {
  margin-top: -80px;
  padding: 0 7% 80px;
  position: relative;
  z-index: 10;
}

.search-container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  padding: 40px;
  border: 1px solid rgba(59, 37, 29, 0.1);
}

.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.search-header-icon {
  font-size: 1.8rem;
  color: #3b251d;
}

.search-header h3 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: #2c3e50;
}

.search-grid {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr 1fr auto;
  gap: 20px;
  align-items: end;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-wrapper {
  position: relative;
}

.search-field input,
.search-field select {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #f9fafb;
  color: #1f2937;
}

.search-field input:focus,
.search-field select:focus {
  outline: none;
  border-color: #3b251d;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 37, 29, 0.1);
}

.search-btn-modern {
  background: linear-gradient(135deg, #3b251d 0%, #2e1d17 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(59, 37, 29, 0.3);
  white-space: nowrap;
}

.search-btn-modern:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(59, 37, 29, 0.4);
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.search-btn-modern:hover .btn-arrow {
  transform: translateX(5px);
}

/* Sugerencias */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.suggestion-item:hover {
  background: #f9fafb;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-icon {
  color: #e67e22;
  font-size: 0.9rem;
}

.suggestion-text {
  font-size: 0.95rem;
  color: #374151;
}

.suggestions-loading {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #6b7280;
  font-style: italic;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* ============= PROPIEDADES - NUEVO ESTILO ============= */
.properties-modern-section {
  padding: 80px 7%;
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
  position: relative;
}

.section-header-modern {
  text-align: center;
  margin-bottom: 60px;
}

.section-subtitle-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(#4d2f24e6, rgba(77, 47, 36, 0.7));
  color: white;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 16px;
  box-shadow: 0 4px 15px rgba(241, 196, 15, 0.3);
}

.section-title-modern {
  font-size: 3.5rem;
  font-weight: 900;
  margin: 0 0 16px;
  color: #1f2937;
  letter-spacing: -1px;
}

.section-description {
  font-size: 1.2rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 450px), 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Property Card */
.property-card {
  position: relative;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.1);
  animation: card-fade-in 0.6s ease-out both;
  display: flex;
  flex-direction: column;
}

@keyframes card-fade-in {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.property-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 24px 60px rgba(230, 126, 34, 0.15), 0 0 1px rgba(230, 126, 34, 0.1);
}

.card-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #e67e22, #EFE8DD);
  opacity: 0;
  border-radius: 24px;
  transition: opacity 0.4s ease;
  z-index: -1;
  filter: blur(20px);
}

.property-card:hover .card-glow {
  opacity: 0.4;
}

/* Image Section */
.card-image-section {
  position: relative;
  height: 300px;
  overflow: hidden;
  flex-shrink: 0;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.property-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.property-card:hover .property-img {
  transform: scale(1.12);
}

.image-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 30%, rgba(0, 0, 0, 0.75));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.property-card:hover .image-gradient {
  opacity: 1;
}

/* Status Badge */
.status-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.2rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  backdrop-filter: blur(20px);
  z-index: 5;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  animation: badge-appear 0.5s ease 0.2s both;
}

@keyframes badge-appear {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.status-badge.available,
.status-badge.disponible {
  background: rgba(39, 174, 96, 0.95);
  color: white;
}

.status-badge.rented,
.status-badge.arrendada {
  background: rgba(231, 76, 60, 0.95);
  color: white;
}

.status-badge.maintenance,
.status-badge.mantenimiento {
  background: rgba(243, 156, 18, 0.95);
  color: white;
}

.status-badge.reserved,
.status-badge.ocupado {
  background: rgba(241, 196, 15, 0.95);
  color: white;
}

.status-pulse {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: currentColor;
  position: relative;
}

.status-pulse::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid currentColor;
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

/* Action Buttons */
.action-buttons {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.6rem;
  opacity: 0;
  transform: translateX(15px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 5;
}

.property-card:hover .action-buttons {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  overflow: hidden;
}

.action-btn:hover {
  transform: scale(1.2) rotate(5deg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.btn-bg {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fav-btn:hover .btn-bg,
.fav-btn.active .btn-bg {
  background: #e67e22;
  opacity: 1;
}

.fav-btn:hover .btn-icon,
.fav-btn.active .btn-icon {
  color: white;
}

.share-btn:hover .btn-bg {
  background: #3498db;
  opacity: 1;
}

.share-btn:hover .btn-icon {
  color: white;
}

.btn-icon {
  position: relative;
  z-index: 1;
  font-size: 1rem;
  color: #2c3e50;
  transition: color 0.3s ease;
}

/* Type Tag */
/* Type Tag */
.type-tag {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 0.65rem 1.2rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 5;
  animation: tag-appear 0.5s ease 0.3s both;
}

.property-card:hover .type-tag {
  opacity: 1;
  transform: translateY(0);
}

.type-text {
  color: #2c3e50;
}

/* Card Content */
.card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.card-header-left {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.5rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}


.card-header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%);
    padding: 0.8rem 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.price-label-small {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-light);
    font-weight: 700;
}

.price-value-header {
    font-size: 1.4rem;
    font-weight: 900;
    color: var(--success);
    line-height: 1;
    letter-spacing: -0.5px;
    white-space: nowrap;
}

.price-period-small {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-light);
}

.card-location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-light);
    font-size: 0.95rem;
    font-weight: 600;
}

.location-pin {
    font-size: 1.1rem;
    flex-shrink: 0;
}

.location-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Features Container */
.features-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
}

.feature-modern {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4b5563;
  font-size: 0.9rem;
  font-weight: 600;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.feature-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.feature-label {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.feature-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Description */
.card-description {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card Footer */
.card-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 1.3rem;
    border-top: 2px solid #f0f0f0;
    margin-top: auto;
}

.btn-view-details {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: #4D2F24;
    color: rgb(255, 255, 255);
    border: none;
    padding: 1rem 2.5rem;
    border-radius: 14px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(59, 37, 29, 0.25);
    overflow: hidden;
    white-space: nowrap;
}

.btn-view-details:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 24px rgba(59, 37, 29, 0.35);
}

.btn-arrow {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
}

.btn-view-details:hover .btn-arrow {
    transform: translateX(6px);
}

.btn-hover-effect {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
}

.btn-view-details:hover .btn-hover-effect {
    transform: translateX(100%);
}


/* Card Border Effect */
.card-border-effect {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #e67e22, #EFE8DD) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.property-card:hover .card-border-effect {
  opacity: 0.6;
}

/* Loading, Error y Empty States */
.loading-modern,
.error-modern,
.empty-state-modern {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner-modern {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #e67e22;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-modern p,
.error-modern p {
  font-size: 1.2rem;
  color: #6b7280;
  font-weight: 600;
}

.error-icon {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 16px;
}

.retry-btn-modern {
  margin-top: 24px;
  background: linear-gradient(135deg, #3b251d 0%, #2e1d17 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.retry-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 37, 29, 0.3);
}

.empty-icon-modern {
  font-size: 5rem;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-state-modern h3 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 12px;
}

.empty-state-modern p {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0 0 32px;
}

.clear-filters-btn-modern {
  background: linear-gradient(135deg, #3b251d 0%, #2e1d17 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.clear-filters-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 37, 29, 0.3);
}

/* Ver más */
.view-more-modern {
  text-align: center;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid #e5e7eb;
}

.view-more-info p {
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 24px;
  font-weight: 500;
}

.view-all-btn-modern {
  background: linear-gradient(135deg, #3b251d 0%, #2e1d17 100%);
  color: white;
  border: none;
  padding: 16px 40px;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(59, 37, 29, 0.25);
}

.view-all-btn-modern:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(59, 37, 29, 0.35);
}

/* ============= MINI LOADER ============= */
.mini-loader {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Active Filters Bar */
.active-filters-bar {
    margin-top: 1.5rem;
    padding: 1.2rem;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid #e8e2d8;
    flex-grow: 1; /* Ocupa todo el espacio disponible */
    width: 100%;
    box-sizing: border-box;
}

.filters-label {
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.filters-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    flex: 1;
}

.filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #4D2F24;
    color: white;
    padding: 0.6rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 3px 10px rgba(59, 37, 29, 0.2);
    animation: chip-appear 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 250px;
}

@keyframes chip-appear {
    from {
        opacity: 0;
        transform: scale(0.8) translateY(-10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.chip-icon {
    font-size: 1rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    flex-shrink: 0;
}

.chip-value {
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chip-close {
    background: rgba(255, 255, 255, 0.25);
    border: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.7rem;
    color: white;
    transition: all 0.3s ease;
    margin-left: 0.3rem;
    flex-shrink: 0;
}

.chip-close:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: scale(1.2) rotate(90deg);
}

.btn-clear-all-inline {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%);
    color: var(--text-dark);
    border: 1px solid #e0e0e0;
    padding: 0.6rem 1rem;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.btn-clear-all-inline:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-clear-all-inline .icon {
    font-size: 1rem;
}


.image-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 2.5rem;
}

.detail-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.detail-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}



.card-content {
  flex: 1;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.card-text {
  margin: 0;
  font-weight: 600;
  color: #374151;
}

.card-subtext {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.feature-label {
  color: #6b7280;
  font-weight: 500;
}

.feature-value {
  font-weight: 700;
  color: #3b251d;
}

.services-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.service-tag {
  background: #e3f2fd;
  color: #1565c0;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.no-services {
  color: #6b7280;
  font-style: italic;
  margin: 0;
}

.description-section {
  padding: 0 2.5rem 2rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.description-text {
  line-height: 1.7;
  color: #4b5563;
  font-size: 1.05rem;
  margin: 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #3b251d;
}

.location-section {
  padding: 0 2.5rem 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-map-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
  border: none;
  cursor: pointer;
}

.btn-map-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.coordinates-display {
  display: flex;
  gap: 1.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1.5rem;
  border-radius: 16px;
}

.coordinate {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.coordinate-label {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.coordinate-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
}

.no-location-section {
  padding: 2rem 2.5rem;
  text-align: center;
  background: #fef3c7;
  margin: 0 2.5rem 2rem;
  border-radius: 16px;
  border: 1px solid #fcd34d;
}

.no-location-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #f59e0b;
}

.no-location-text {
  font-size: 1.1rem;
  color: #92400e;
  font-weight: 600;
  margin: 0;
}

.modal-actions {
  padding: 0 2.5rem 2.5rem;
}

.btn-request-visit {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.btn-request-visit:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
}

.unavailable-notice {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 16px;
  margin: 0;
  background: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.notice-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.notice-content h4 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.notice-content p {
  margin: 0;
  opacity: 0.9;
}
</style>