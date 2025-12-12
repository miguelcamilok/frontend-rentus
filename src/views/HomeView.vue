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
              <font-awesome-icon icon="dollar-sign" class="chip-icon" />
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
        </div>
        <!-- Active Filters Tags -->
        <transition name="slide-fade">
          <div v-if="hasActiveFilters" class="active-filters-bar">
            <span class="filters-label">Filtros Activos:</span>
            <div class="filters-chips">
              <div v-if="filters.search" class="filter-chip">
                <font-awesome-icon icon="search" class="chip-icon" />
                <span class="chip-value">{{ filters.search }}</span>
                <button @click="filters.search = ''" class="chip-close">
                  <font-awesome-icon icon="times" />
                </button>
              </div>

              <div v-if="filters.city" class="filter-chip">
                <font-awesome-icon icon="map-marker-alt" class="chip-icon" />
                <span class="chip-value">{{ filters.city }}</span>
                <button @click="filters.city = ''" class="chip-close">
                  <font-awesome-icon icon="times" />
                </button>
              </div>

              <div v-if="filters.type" class="filter-chip">
                <font-awesome-icon icon="home" class="chip-icon" />
                <span class="chip-value">{{ filters.type }}</span>
                <button @click="filters.type = ''" class="chip-close">
                  <font-awesome-icon icon="times" />
                </button>
              </div>

              <div v-if="filters.maxPrice" class="filter-chip">
                <font-awesome-icon icon="dollar-sign" class="chip-icon" />
                <span class="chip-value">{{ formatPrice(filters.maxPrice) }}</span>
                <button @click="filters.maxPrice = null" class="chip-close">
                  <font-awesome-icon icon="times" />
                </button>
              </div>

            </div>
            <button @click="clearFilters" class="btn-clear-all-inline">
              <span class="icon">↻</span>
              <span>Limpiar</span>
            </button>
          </div>
        </transition>
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

function getParticleStyle(_n: number) {
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
</style>