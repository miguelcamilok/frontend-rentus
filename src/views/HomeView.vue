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
            <span>{{ $t('home.hero.badge') }}</span>
          </div>

          <h1 class="hero-title">
            {{ $t('home.hero.title') }}
            <span class="gradient-text"> {{ $t('home.hero.titleHighlight') }}</span>
            <br />{{ $t('home.hero.titleEnd') }}
          </h1>

          <p class="hero-description">
            {{ $t('home.hero.description') }}
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
                <div class="stat-inline-label">{{ $t('home.hero.stats.properties') }}</div>
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
                <div class="stat-inline-label">{{ $t('home.hero.stats.clients') }}</div>
              </div>
            </div>

            <div class="stat-inline-item">
              <div class="stat-inline-icon">
                <font-awesome-icon :icon="['fas', 'star']" />
              </div>
              <div class="stat-inline-content">
                <div class="stat-inline-number">1+</div>
                <div class="stat-inline-label">{{ $t('home.hero.stats.experience') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Imagen decorativa con mapa integrado -->
        <div class="hero-image-section" data-aos="fade-left">
          <div class="floating-card card-1">
            <font-awesome-icon :icon="['fas', 'home']" class="card-icon" />
            <div class="card-text">{{ $t('home.hero.floatingCards.verified') }}</div>
          </div>
          <div class="floating-card card-2">
            <font-awesome-icon :icon="['fas', 'star']" class="card-icon" />
            <div class="card-text">{{ $t('home.hero.floatingCards.rated') }}</div>
          </div>

            <!-- Mini Mapa Preview -->
            <div class="hero-image-placeholder map-preview-wrapper" @click="handleMapClick">
              <div ref="miniMapEl" class="mini-map"></div>

              <!-- Mini Card Preview (Visible al cargar) -->
              <!-- <Transition name="fade-up">
                <div v-if="selectedMiniProperty" class="map-mini-card" @click.stop="viewPropertyDetails(selectedMiniProperty)">
                  <div class="mini-card-img">
                    <img :src="getPropertyImage(selectedMiniProperty)" :alt="selectedMiniProperty.title" />
                  </div>
                  <div class="mini-card-content">
                    <div class="mini-card-price">{{ formatPrice(selectedMiniProperty.monthly_price) }}</div>
                    <div class="mini-card-title">{{ truncateDescription(selectedMiniProperty.title, 35) }}</div>
                    <div class="mini-card-city">
                      <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                      {{ selectedMiniProperty.city }}
                    </div>
                  </div>
                  <button class="mini-card-btn">
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </button>
                </div>
              </Transition> -->

              <!-- Overlay con CTA -->
              <div class="map-overlay">
                <div class="map-overlay-content">
                  <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="map-overlay-icon" />
                  <span>
                    {{ $t('home.hero.map.explore') || 'Explorar en mapa' }}
                  </span>
                </div>
              </div>

              <!-- Pulse animado en esquina -->
              <div class="map-live-badge">
                <span class="live-dot"></span>
                <span class="live-text">En vivo</span>
              </div>
            </div>
        </div>
      </div>
    </section>

    <!-- Buscador Moderno Flotante -->
    <PropertySearch v-model="filters" />

    <!-- Propiedades Section -->
    <section class="properties-modern-section">
      <div class="properties-container">
        <div class="section-header-modern" data-aos="fade-up">
          <div class="header-content">
            <span class="section-subtitle-badge">
              <font-awesome-icon :icon="['fas', 'star']" />
              {{ $t('home.properties.badge') }}
            </span>
            <h2 class="section-title-modern">
              {{ $t('home.properties.title') }}
              <span class="gradient-text">{{ $t('home.properties.titleHighlight') }}</span>
            </h2>
            <p class="section-description">
              {{ $t('home.properties.description') }}
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingProperties" class="loading-modern" data-aos="fade-up">
          <div class="loading-spinner-modern"></div>
          <p>{{ $t('home.properties.loading') }}</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorProperties" class="error-modern" data-aos="fade-up">
          <font-awesome-icon :icon="['fas', 'times-circle']" class="error-icon" />
          <p>{{ errorProperties }}</p>
          <button @click="fetchAllData" class="retry-btn-modern">
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
            {{ $t('home.properties.retry') }}
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
                <img :src="getPropertyImage(property)" :alt="property.title" class="property-img"
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
                  :class="{ 'active': property.is_favorite }" :title="$t('home.properties.card.favorite')">
                  <span class="btn-icon">
                    <font-awesome-icon :icon="['fas', 'star']" />
                  </span>
                  <div class="btn-bg"></div>
                </button>
                <button class="action-btn share-btn" @click.stop="shareProperty(property)" :title="$t('home.properties.card.share')">
                  <span class="btn-icon">
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </span>
                  <div class="btn-bg"></div>
                </button>
              </div>

              <!-- Type Tag -->
              <div class="type-tag">
                <font-awesome-icon :icon="['fas', getTypeIcon(property.title)]" />
                <span class="type-text">{{ detectTypeTranslated(property.title) }}</span>
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
                  <span class="price-label-small">{{ $t('home.properties.card.priceLabel') }}</span>
                  <span class="price-value-header">
                    {{ formatPrice(property.monthly_price) }}
                  </span>
                  <span class="price-period-small">{{ $t('home.properties.card.perMonth') }}</span>
                </div>
              </div>

              <!-- Features -->
              <div class="features-container">
                <div class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">{{ $t('home.properties.card.features.area') }}</span>
                    <span class="feature-value">{{ property.area_m2 }} m²</span>
                  </div>
                </div>
                <div v-if="property.num_bedrooms" class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'bed']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">{{ $t('home.properties.card.features.bedrooms') }}</span>
                    <span class="feature-value">{{ property.num_bedrooms }}</span>
                  </div>
                </div>
                <div v-if="property.num_bathrooms" class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'bath']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">{{ $t('home.properties.card.features.bathrooms') }}</span>
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
                  <span class="btn-text">{{ $t('home.properties.card.viewDetails') }}</span>
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
          <h3>{{ $t('home.properties.empty.title') }}</h3>
          <p>{{ $t('home.properties.empty.description') }}</p>
          <button @click="clearFilters" class="clear-filters-btn-modern">
            <font-awesome-icon :icon="['fas', 'times']" />
            {{ $t('home.properties.empty.clearFilters') }}
          </button>
        </div>

        <!-- Ver más -->
        <div v-if="!loadingProperties && filteredProperties.length > PROPERTIES_LIMIT" class="view-more-modern"
          data-aos="fade-up">
          <div class="view-more-info">
            <p>
              {{ $t('home.properties.viewMore.showing') }} <strong>{{ displayedProperties.length }}</strong> {{ $t('home.properties.viewMore.of') }}
              <strong>{{ filteredProperties.length }}</strong> {{ $t('home.properties.viewMore.properties') }}
            </p>
          </div>
          <button @click="goToProperties" class="view-all-btn-modern">
            <span>{{ $t('home.properties.viewMore.button') }}</span>
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
        <h2>{{ $t('home.cta.title') }}</h2>
        <p>{{ $t('home.cta.description') }}</p>
        <div class="cta-buttons">
          <button class="cta-btn primary" @click="goToProperties">
            <span>{{ $t('home.cta.viewProperties') }}</span>
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
          </button>
          <button class="cta-btn secondary">
            <font-awesome-icon :icon="['fas', 'phone']" />
            <span>{{ $t('home.cta.contact') }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Modal -->
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
              <span class="price-period">{{ $t('home.properties.card.perMonth') }}</span>
            </div>
          </div>

          <div class="modal-gallery">
            <img :src="getPropertyImage(selectedProperty)" class="modal-main-image"
              :alt="selectedProperty.title" @error="onImgError" />
            <div class="image-badge">
              <font-awesome-icon :icon="['fas', 'camera']" class="badge-icon" />
              <span class="badge-text">{{ $t('home.modal.gallery') }}</span>
            </div>
          </div>

          <div class="modal-details-grid">
            <div class="detail-card location-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ $t('home.modal.sections.location.title') }}</h3>
                <p class="card-text">{{ selectedProperty.address || $t('home.modal.sections.location.notAvailable') }}</p>
                <p class="card-subtext">{{ selectedProperty.city || '' }}</p>
              </div>
            </div>

            <div class="detail-card features-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'ruler-combined']" />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ $t('home.modal.sections.features.title') }}</h3>
                <div class="features-list">
                  <div class="feature">
                    <span class="feature-label">{{ $t('home.modal.sections.features.area') }}</span>
                    <span class="feature-value">{{ selectedProperty.area_m2 || 0 }} m²</span>
                  </div>
                  <div class="feature" v-if="selectedProperty.num_bedrooms">
                    <span class="feature-label">{{ $t('home.modal.sections.features.bedrooms') }}</span>
                    <span class="feature-value">{{ selectedProperty.num_bedrooms }}</span>
                  </div>
                  <div class="feature" v-if="selectedProperty.num_bathrooms">
                    <span class="feature-label">{{ $t('home.modal.sections.features.bathrooms') }}</span>
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
                <h3 class="card-title">{{ $t('home.modal.sections.services.title') }}</h3>
                <div class="services-tags" v-if="getServicesArray(selectedProperty.included_services).length > 0">
                  <span v-for="service in getServicesArray(selectedProperty.included_services)" :key="service"
                    class="service-tag">
                    {{ service.trim() }}
                  </span>
                </div>
                <p v-else class="no-services">{{ $t('home.modal.sections.services.none') }}</p>
              </div>
            </div>

            <div class="detail-card publication-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'calendar']" />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ $t('home.modal.sections.publication.title') }}</h3>
                <p class="card-text">{{ formatModalDate(selectedProperty.publication_date) }}</p>
                <p class="card-subtext">{{ $t('home.modal.sections.publication.publishedAgo') }} {{ timeAgo(selectedProperty.publication_date) }}</p>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h3 class="section-title">{{ $t('home.modal.sections.description.title') }}</h3>
            <p class="description-text">{{ selectedProperty.description || $t('home.modal.sections.description.notAvailable') }}</p>
          </div>

          <div v-if="selectedProperty.lat && selectedProperty.lng" class="location-section">
            <div class="section-header">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                {{ $t('home.modal.sections.map.title') }}
              </h3>
              <button class="btn-map-preview" @click="viewOnMap(selectedProperty)" type="button">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="btn-icon" />
                <span class="btn-text">{{ $t('home.modal.sections.map.viewFullMap') }}</span>
              </button>
            </div>
            <div class="coordinates-display">
              <div class="coordinate">
                <span class="coordinate-label">{{ $t('home.modal.sections.map.latitude') }}</span>
                <span class="coordinate-value">{{ Number(selectedProperty.lat).toFixed(6) }}</span>
              </div>
              <div class="coordinate">
                <span class="coordinate-label">{{ $t('home.modal.sections.map.longitude') }}</span>
                <span class="coordinate-value">{{ Number(selectedProperty.lng).toFixed(6) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="no-location-section">
            <div class="no-location-icon">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
            </div>
            <p class="no-location-text">{{ $t('home.modal.sections.map.notRegistered') }}</p>
          </div>

          <div class="modal-actions">
            <button v-if="selectedProperty.status === 'available'" class="btn-request-visit"
              @click="openRequestVisitModal(selectedProperty)" type="button">
              <font-awesome-icon :icon="['fas', 'calendar']" class="btn-icon" />
              <span class="btn-text">{{ $t('home.modal.sections.actions.requestVisit') }}</span>
            </button>

            <div v-else class="unavailable-notice">
              <div class="notice-icon">
                <font-awesome-icon :icon="['fas', 'times-circle']" />
              </div>
              <div class="notice-content">
                <h4>{{ $t('home.modal.sections.actions.unavailable.title') }}</h4>
                <p>{{ $t('home.modal.sections.actions.unavailable.description') }}</p>
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
import { ref, shallowRef, onMounted, onUnmounted, computed, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RequestVisitModal from "../components/modals/ModalRequest/RequestVisitModal.vue";
import PropertySearch from '../components/search/PropertySearch.vue';
import { usePropertyTypes } from '../types/usePropertyTypes';
import api from "../services/api";
import { getPropertyImage as getPropertyImageUtil } from "../utils/propertyUtils";

const DEFAULT_PROPERTY_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=";

// ==================== Composables ====================
const { t } = useI18n();
const router = useRouter();
const {
  detectTypeNormalized,
  detectTypeTranslated,
  getTypeIcon
} = usePropertyTypes();

// ==================== State ====================
const properties = ref<any[]>([]);
const selectedProperty = ref<any>(null);
const selectedMiniProperty = ref<any>(null);
const propertyForRequest = ref<any>(null);
const showRequestModal = ref(false);
const loadingProperties = ref(false);
const errorProperties = ref<string | null>(null);
const activeClientsCount = ref(0);
const propertyCount = ref(0);
const modalOpen = ref(false);

const miniMapEl = ref<HTMLElement | null>(null);

const miniMap = shallowRef<L.Map | null>(null);
const miniMarkersAdded = ref(false);

const PROPERTIES_LIMIT = 4;

const filters = ref({
  search: '',
  city: '',
  type: '',
  maxPrice: null as number | null
});

// ==================== Computed ====================
const filteredProperties = computed(() => {
  return properties.value.filter((p) => {
    const typeFromTitle = detectTypeNormalized(p.title);

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

const displayedProperties = computed(() => {
  const featured = filteredProperties.value.filter(p => p.featured);
  const regular = filteredProperties.value.filter(p => !p.featured);
  return [...featured, ...regular].slice(0, PROPERTIES_LIMIT);
});

// ==================== Mini Mapa ====================
function handleMapClick() {
  router.push({ name: 'MapExplorer' });
}

function initMiniMap() {
  if (!miniMapEl.value) return;

  miniMap.value = L.map(miniMapEl.value, {
    center: [4.5709, -74.2973],
    zoom: 6,
    zoomControl: false,
    dragging: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    attributionControl: false,
    touchZoom: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(miniMap.value);
}

// Agregar marcadores al mini mapa cuando las propiedades estén listas
watchEffect(() => {
  const map = miniMap.value;
  if (map && properties.value.length > 0 && !miniMarkersAdded.value) {
    console.log("📍 Inicializando marcadores en mini-mapa...", properties.value.length);
    miniMarkersAdded.value = true;
    
    // Asegurar que el mapa conoce su tamaño real
    map.invalidateSize();

    // 📍 Lógica de ranking: Ciudad con más propiedades
    const cityCounts: Record<string, number> = {};
    properties.value.forEach(p => {
      if (p.city) cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
    });

    const sortedCities = Object.entries(cityCounts).sort((a,b) => b[1] - a[1]);
    const topCity = sortedCities[0]?.[0];

    if (topCity) {
      const bestProp = properties.value.find(p => 
        p.city === topCity && 
        p.lat && p.lng && 
        !isNaN(parseFloat(p.lat)) && parseFloat(p.lat) !== 0
      );
      
      if (bestProp) {
        console.log(`🏠 Propiedad elegida para preview en ${topCity}:`, bestProp.title);
        selectedMiniProperty.value = bestProp;
        map.setView([parseFloat(bestProp.lat), parseFloat(bestProp.lng)], 13);
      }
    }

    properties.value
      .filter(p => p.lat && p.lng && !isNaN(parseFloat(p.lat)) && parseFloat(p.lat) !== 0)
      .slice(0, 30)
      .forEach(p => {
        const isSelected = selectedMiniProperty.value?.id === p.id;
        
        const marker = L.circleMarker([parseFloat(p.lat), parseFloat(p.lng)], {
          radius: isSelected ? 10 : 7,
          fillColor: isSelected ? '#3b82f6' : '#1e40af',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85
        }).addTo(map);

        marker.on('click', (e) => {
          // @ts-ignore
          L.DomEvent.stopPropagation(e);
          selectedMiniProperty.value = p;
          map.flyTo([parseFloat(p.lat), parseFloat(p.lng)], 14);
        });
      });
  }
});

// ==================== Methods ====================
function onImgError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img && img.src !== DEFAULT_PROPERTY_IMAGE) {
    img.src = DEFAULT_PROPERTY_IMAGE;
    img.onerror = null;
  }
}

const clearFilters = () => {
  filters.value = {
    search: "",
    city: "",
    type: "",
    maxPrice: null,
  };
};

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
  if (!s) return t('home.properties.card.status.available');
  const statusKey = s.toString().trim().toLowerCase();

  const statusMap: Record<string, string> = {
    available: t('home.properties.card.status.available'),
    rented: t('home.properties.card.status.rented'),
    reserved: t('home.properties.card.status.reserved'),
    sold: t('home.properties.card.status.sold'),
    maintenance: t('home.properties.card.status.maintenance'),
  };

  return statusMap[statusKey] || t('home.properties.card.status.available');
};

const formatModalDate = (dateString: string) => {
  if (!dateString) return t('home.modal.sections.location.notAvailable');
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
    const propRes = await api.get("/properties");

    if (propRes.data && Array.isArray(propRes.data)) {
      properties.value = propRes.data;
    } else if (propRes.data && propRes.data.data && Array.isArray(propRes.data.data)) {
      properties.value = propRes.data.data;
    } else {
      properties.value = [];
    }

    propertyCount.value = properties.value.length;
    activeClientsCount.value = 150; // Mocked or removed if not used

  } catch (error) {
    console.error("Error cargando datos:", error);
    errorProperties.value = t('home.properties.error');
    propertyCount.value = 0;
    activeClientsCount.value = 0;
  } finally {
    loadingProperties.value = false;
  }
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
  if (!description) return t('home.modal.sections.description.notAvailable');
  return description.length > maxLength
    ? description.substring(0, maxLength) + "..."
    : description;
}

function getStatusText(status: string) {
  if (!status) return t('home.properties.card.status.available');
  const key = status.toString().trim().toLowerCase();

  const map: Record<string, string> = {
    "disponible": t('home.properties.card.status.available'),
    "ocupado": t('home.properties.card.status.reserved'),
    "en mantenimiento": t('home.properties.card.status.maintenance'),
    "vendido": t('home.properties.card.status.sold'),
    "arrendada": t('home.properties.card.status.rented'),
    "available": t('home.properties.card.status.available'),
    "reserved": t('home.properties.card.status.reserved'),
    "sold": t('home.properties.card.status.sold'),
    "rented": t('home.properties.card.status.rented'),
    "maintenance": t('home.properties.card.status.maintenance')
  };

  return map[key] || t('home.properties.card.status.available');
}

function getServicesArray(services: any) {
  if (!services) return [];
  if (Array.isArray(services)) return services;
  if (typeof services === 'string') {
    return services.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}

function getPropertyImage(property: any) {
  return getPropertyImageUtil(property, DEFAULT_PROPERTY_IMAGE);
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

// ==================== Lifecycle ====================
onMounted(() => {
  fetchAllData();
  initMiniMap();
});

onUnmounted(() => {
  if (miniMap.value) {
    miniMap.value.remove();
    miniMap.value = null;
  }
  miniMarkersAdded.value = false;
});
</script>

<style scoped>
@import "../assets/css/HomeView.css";

/* ── Mini Mapa Hero ── */
.map-preview-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.22);
  min-height: 320px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.map-preview-wrapper:hover {
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.32);
  transform: translateY(-4px);
}

.mini-map {
  width: 100%;
  height: 100%;
  min-height: 320px;
  border-radius: 18px;
  display: block;
}

/* Mini Card Preview UI */
.map-mini-card {
  position: absolute;
  top: 14px;
  left: 14px;
  width: calc(100% - 28px);
  max-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 10px;
  display: flex;
  gap: 12px;
  z-index: 20;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: slide-in-top 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.map-mini-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  background: #ffffff;
}

.mini-card-img {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.mini-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mini-card-price {
  font-size: 15px;
  font-weight: 800;
  color: #1e40af;
  margin-bottom: 2px;
}

.mini-card-title {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.mini-card-city {
  font-size: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-card-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  align-self: center;
  transition: all 0.2s;
}

.map-mini-card:hover .mini-card-btn {
  background: #3b82f6;
  color: white;
}

@keyframes slide-in-top {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Overlay degradado + CTA */
.map-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 35%,
    rgba(10, 20, 50, 0.6) 100%
  );
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 28px;
  border-radius: 18px;
  transition: background 0.3s ease;
}

.map-preview-wrapper:hover .map-overlay {
  background: linear-gradient(
    to bottom,
    rgba(10, 20, 50, 0.08) 0%,
    rgba(10, 20, 50, 0.72) 100%
  );
}

.map-overlay-content {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 22px;
  border-radius: 50px;
  letter-spacing: 0.02em;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.map-preview-wrapper:hover .map-overlay-content {
  background: rgba(255, 255, 255, 0.24);
  transform: scale(1.04);
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.3);
}

.map-overlay-icon {
  font-size: 15px;
}

/* Badge "En vivo" */
.map-live-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50px;
  padding: 5px 12px;
  z-index: 10;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
  animation: live-pulse 2s ease-in-out infinite;
}

.live-text {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

@keyframes live-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
  50%  { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* Asegurar que Leaflet no tape los floating cards */
:deep(.leaflet-pane),
:deep(.leaflet-tile-pane) {
  z-index: 1 !important;
}
</style>