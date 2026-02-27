<template>
  <div class="full-page-wrapper">
    <NavBarComponent />
    <main class="explorer-root">

      <!-- ══════════════════════════════════════
         SIDEBAR
    ══════════════════════════════════════ -->
      <aside class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }">

        <!-- Header -->
        <div class="sidebar-header">
          <div class="sidebar-header__top">
            <button class="back-btn" @click="goBack" title="Volver">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="sidebar-header__titles">
              <h1 class="sidebar-title">
                Explorar Propiedades
              </h1>
              <span class="sidebar-count">
                <template v-if="isLoading">
                  <span class="loading-dots">Sincronizando<span>.</span><span>.</span><span>.</span></span>
                </template>
                <template v-else>
                  <span class="count-number">{{ filteredProperties.length }}</span>
                  {{ filteredProperties.length === 1 ? 'disponible' : 'disponibles' }}
                  <span v-if="hasActiveFilters" class="active-filter-dot" title="Filtros activos"></span>
                </template>
              </span>
            </div>
            <button class="collapse-btn" @click="sidebarCollapsed = true" title="Cerrar panel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Filters Panel -->
        <div class="filters-panel">
          <div class="filters-scroll-area">
            <div class="filters-section-title">
              <font-awesome-icon icon="sliders-h" />
              Búsqueda Geográfica
            </div>

            <!-- DIRECCIÓN / BÚSQUEDA -->
            <div class="filter-group relative">
              <label class="filter-label">Dirección específica</label>
              <div class="search-input-wrapper">
                <input v-model="filters.address" type="text" placeholder="Ej: Calle 10 #5-2..."
                  class="filter-input search-input" @input="onAddressInput" @keyup.enter="searchAddressOnMap"
                  @blur="hideSuggestionsWithDelay" @focus="showSuggestions = true" />
                <button class="search-map-btn" :class="{ 'searching': searchState === 'searching' }"
                  @click="searchAddressOnMap" title="Buscar en el mapa">
                  <font-awesome-icon v-if="searchState !== 'searching'" icon="search-location" />
                  <div v-else class="btn-spinner"></div>
                </button>
              </div>

              <!-- Autocomplete Suggestions -->
              <Transition name="fade">
                <div v-if="showSuggestions && addressSuggestions.length > 0" class="suggestions-dropdown">
                  <div v-for="(sug, idx) in addressSuggestions" :key="idx" class="suggestion-item"
                    @click="selectSuggestion(sug)">
                    <font-awesome-icon icon="map-marker-alt" class="sug-icon" />
                    <span class="sug-text">{{ sug.display_name }}</span>
                  </div>
                </div>
              </Transition>

              <p v-if="searchState === 'error'" class="search-error-msg">
                No encontramos esa dirección exacta.
                <button @click="exploreNearMe" class="text-link">Ver lo más cercano</button>
              </p>
              <p v-else class="filter-hint">Presiona Enter para buscar en el mapa</p>
            </div>

            <!-- Nearest Property Banner -->
            <Transition name="slide-up">
              <div v-if="userLatLng && nearestProperty" class="proximity-banner" @click="exploreNearMe">
                <div class="proximity-icon">
                  <font-awesome-icon icon="route" />
                </div>
                <div class="proximity-content">
                  <div class="proximity-title">
                    <font-awesome-icon icon="location-arrow" class="text-brand-light mr-1" />
                    {{ userCity ? `Estás al ${getPointZone(userLatLng.lat, userLatLng.lng, userCity)} de ${userCity}` :
                    'Ubicación detectada' }}
                  </div>
                  <div class="proximity-dist" v-if="nearestProperty">
                    La propiedad más cercana a ti está a <strong>{{ nearestProperty.distance.toFixed(1) }} km</strong>
                    y ubicada al <strong>{{ getPointZone(nearestProperty.lat, nearestProperty.lng, nearestProperty.city)
                      }}</strong>
                    de <strong>{{ nearestProperty.city }}</strong>
                  </div>
                </div>
                <button class="proximity-go">
                  Ir <font-awesome-icon icon="chevron-right" />
                </button>
              </div>
            </Transition>

            <!-- DEPARTAMENTO -->
            <div class="filter-group">
              <label class="filter-label">Departamento</label>
              <div class="select-wrapper">
                <select v-model="filters.department" class="filter-select" @change="onDepartmentChange">
                  <option value="">Selecciona Departamento</option>
                  <option v-for="dep in departmentList" :key="dep" :value="dep">{{ dep }}</option>
                </select>
                <font-awesome-icon icon="chevron-down" class="select-arrow-fa" />
              </div>
            </div>

            <!-- CIUDAD -->
            <Transition name="filter-slide">
              <div v-if="filters.department" class="filter-group">
                <label class="filter-label">Ciudad</label>
                <div class="select-wrapper">
                  <select v-model="filters.city" class="filter-select" @change="onCityChange">
                    <option value="">Todas las ciudades</option>
                    <option v-for="city in cityList" :key="city" :value="city">{{ city }}</option>
                  </select>
                  <font-awesome-icon icon="chevron-down" class="select-arrow-fa" />
                </div>
              </div>
            </Transition>

            <!-- ZONA (Norte, Sur, etc) -->
            <Transition name="filter-slide">
              <div v-if="filters.city" class="filter-group">
                <label class="filter-label">Zona / Sector</label>
                <div class="select-wrapper">
                  <select v-model="filters.zone" class="filter-select" @change="debouncedApplyFilters">
                    <option value="">Todas las zonas</option>
                    <option value="Norte">Norte</option>
                    <option value="Sur">Sur</option>
                    <option value="Centro">Centro</option>
                    <option value="Este">Este / Oriente</option>
                    <option value="Oeste">Oeste / Occidente</option>
                  </select>
                  <font-awesome-icon icon="compass" class="select-arrow-fa" />
                </div>
              </div>
            </Transition>

            <!-- BARRIO -->
            <Transition name="filter-slide">
              <div v-if="filters.city && neighborhoodList.length > 0" class="filter-group">
                <label class="filter-label">Barrio / Sector</label>
                <div class="select-wrapper">
                  <select v-model="filters.neighborhood" class="filter-select" @change="applyFilters">
                    <option value="">Todos los barrios</option>
                    <option v-for="nb in neighborhoodList" :key="nb" :value="nb">{{ nb }}</option>
                  </select>
                  <font-awesome-icon icon="chevron-down" class="select-arrow-fa" />
                </div>
              </div>
            </Transition>

            <div class="filters-section-title mt-4">
              <font-awesome-icon icon="adjust" />
              Preferencias
            </div>

            <!-- ESTADO -->
            <div class="filter-group">
              <label class="filter-label">Estado de la propiedad</label>
              <div class="status-pills">
                <button v-for="s in statusOptions" :key="s.value" class="status-pill"
                  :class="{ 'status-pill--active': filters.status === s.value, [`status-pill--${s.value}`]: true }"
                  @click="toggleStatus(s.value)">
                  <span class="pill-dot"></span>
                  {{ s.label }}
                </button>
              </div>
            </div>

            <!-- PRECIO -->
            <div class="filter-group">
              <label class="filter-label">Precio Mensual (COP)</label>
              <div class="price-range-row">
                <div class="price-input-wrap">
                  <span class="price-sign">$</span>
                  <input v-model.number="filters.min_price" type="number" placeholder="Min" class="filter-input" min="0"
                    @input="debouncedApplyFilters" />
                </div>
                <div class="price-input-wrap">
                  <span class="price-sign">$</span>
                  <input v-model.number="filters.max_price" type="number" placeholder="Max" class="filter-input" min="0"
                    @input="debouncedApplyFilters" />
                </div>
              </div>
            </div>
          </div>

          <!-- Active filters footer -->
          <div v-if="hasActiveFilters" class="active-filters-footer">
            <button class="clear-all-btn" @click="clearFilters">
              <font-awesome-icon icon="trash-alt" />
              Restablecer filtros
            </button>
          </div>
        </div>

        <!-- Property List -->
        <div class="property-list">
          <div v-if="isLoading" class="list-state list-state--loading">
            <div class="brand-spinner">
              <div class="spinner-ring"></div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#4D2F24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
            </div>
            <span>Cargando propiedades…</span>
          </div>

          <div v-else-if="filteredProperties.length === 0" class="list-state list-state--empty">
            <div v-if="nearbyProperties.length > 0" class="nearby-suggestion">
              <div class="nearby-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
                <span>No hay resultados exactos</span>
              </div>
              <p>Pero encontramos estas cerca de ti:</p>

              <div class="property-cards property-cards--mini">
                <div v-for="property in nearbyProperties" :key="property.id" class="property-card"
                  @click="selectProperty(property)">
                  <div class="property-card__image-wrap">
                    <img :src="getPropertyImage(property)" alt="" />
                    <span class="distance-badge">{{ (property as any)._distance.toFixed(1) }} km</span>
                  </div>
                  <div class="property-card__body">
                    <h3 class="property-card__title">{{ property.title }}</h3>
                    <div class="prop-price">
                      <span class="price-amount">{{ formatPriceShort(property.monthly_price) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="empty-icon">🏠</div>
              <p>No hay propiedades<br>con esos filtros</p>
              <button class="clear-filters-btn" @click="clearFilters">Limpiar filtros</button>
            </div>
          </div>

          <div v-else class="property-cards">
            <div v-for="property in filteredProperties" :key="property.id" class="property-card"
              :class="{ 'property-card--selected': selectedPropertyId === property.id }"
              @click="selectProperty(property)">
              <div class="property-card__image-wrap">
                <img :src="getPropertyImage(property)" :alt="property.title" loading="lazy"
                  @error="handleImgError($event)" />
                <span class="property-card__status" :class="`status--${property.status}`">
                  <span class="s-dot"></span>
                  {{ statusLabel(property.status) }}
                </span>
              </div>
              <div class="property-card__body">
                <div class="property-card__main-info">
                  <h3 class="property-card__title">{{ property.title }}</h3>
                  <p class="property-card__location">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    </svg>
                    {{ getPointZone(property.lat, property.lng, property.city) ? `Propiedad al
                    ${getPointZone(property.lat,
                      property.lng, property.city)}: ` : '' }}
                    {{ property.city || property.address }}
                  </p>
                </div>
                <div class="property-card__chips">
                  <span v-if="property.num_bedrooms" class="prop-chip">🛏 {{ property.num_bedrooms }}</span>
                  <span v-if="property.num_bathrooms" class="prop-chip">🚿 {{ property.num_bathrooms }}</span>
                  <span v-if="property.area_m2" class="prop-chip">📐 {{ property.area_m2 }}m²</span>
                </div>
                <div class="property-card__bottom">
                  <div class="prop-price">
                    <span class="price-amount">{{ formatPriceFull(property.monthly_price) }}</span>
                    <span class="price-period">/mes</span>
                  </div>
                  <button class="detail-btn" @click.stop="goToDetail(property.id)">
                    Ver
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ══════════════════════════════════════
         MAP AREA
    ══════════════════════════════════════ -->
      <div class="map-area">

        <!-- Open sidebar btn -->
        <Transition name="fade">
          <button v-if="sidebarCollapsed" class="sidebar-open-btn" @click="sidebarCollapsed = false"
            title="Abrir panel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
            Panel
          </button>
        </Transition>

        <!-- Geolocation button -->
        <button class="geolocate-btn"
          :class="{ 'geolocate-btn--active': isLocating, 'geolocate-btn--located': userLocationMarker !== null }"
          @click="locateUser" :title="isLocating ? 'Obteniendo ubicación...' : 'Mi ubicación'">
          <svg v-if="!isLocating" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" opacity=".3" />
          </svg>
          <div v-else class="geo-spinner"></div>
          <span>{{ isLocating ? 'Ubicando…' : 'Mi ubicación' }}</span>
        </button>

        <!-- Stats bar -->
        <div class="map-stats-bar" v-if="!isLoading">
          <div class="stat-item">
            <span class="stat-num">{{ filteredProperties.length }}</span>
            <span class="stat-lbl">total</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num available-num">{{ countByStatus('available') }}</span>
            <span class="stat-lbl">disponibles</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num rented-num">{{ countByStatus('rented') }}</span>
            <span class="stat-lbl">arrendadas</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num visible-num">{{ visibleCount }}</span>
            <span class="stat-lbl">en vista</span>
          </div>
        </div>

        <div ref="mapEl" class="map-canvas"></div>

        <!-- Loading overlay -->
        <Transition name="fade">
          <div v-if="isLoading" class="map-loading">
            <div class="brand-spinner large">
              <div class="spinner-ring"></div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#4D2F24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
            </div>
            <span>Cargando mapa de propiedades…</span>
          </div>
        </Transition>

        <!-- Geo accuracy indicator -->
        <Transition name="fade">
          <div v-if="geoAccuracy !== null" class="geo-accuracy-badge" :class="geoAccuracyClass">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            Precisión: ±{{ Math.round(geoAccuracy) }}m
          </div>
        </Transition>

        <!-- Property Preview Card -->
        <Transition name="slide-up">
          <div v-if="selectedProperty" class="preview-card">
            <button class="preview-card__close" @click="closePreview">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div class="preview-card__inner">
              <div class="preview-card__img-section">
                <img :src="getPropertyImage(selectedProperty)" :alt="selectedProperty.title"
                  @error="handleImgError($event)" />
                <div class="preview-card__img-overlay"></div>
                <span class="preview-card__status-badge" :class="`status--${selectedProperty.status}`">
                  <span class="s-dot"></span>
                  {{ statusLabel(selectedProperty.status) }}
                </span>
              </div>

              <div class="preview-card__content">
                <h3 class="preview-card__title">{{ selectedProperty.title }}</h3>
                <p class="preview-card__city">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </svg>
                  {{ selectedProperty.city || selectedProperty.address }}
                </p>
                <div class="preview-card__features">
                  <span v-if="selectedProperty.num_bedrooms">🛏 {{ selectedProperty.num_bedrooms }} hab.</span>
                  <span v-if="selectedProperty.num_bathrooms">🚿 {{ selectedProperty.num_bathrooms }}</span>
                  <span v-if="selectedProperty.area_m2">📐 {{ selectedProperty.area_m2 }}m²</span>
                </div>
                <div class="preview-card__footer">
                  <div class="preview-price">
                    <span>{{ formatPriceFull(selectedProperty.monthly_price) }}</span>
                    <small>/mes</small>
                  </div>
                  <button class="preview-cta" @click="goToDetail(selectedProperty.id)">
                    Ver detalle
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </main>
    <FooterComponent />
  </div>
</template>

<script setup lang="ts">
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NavBarComponent from '../../components/NavBarComponent.vue';
import FooterComponent from '../../components/FooterComponent.vue';
import {
  propertyMapService,
  clusterProperties,
  formatPriceShort,
  formatPriceFull,
  type MapProperty
} from '../../services/propertyMapService';
import { getPropertyImage as getPropertyImageUtil } from '../../utils/propertyUtils';

// ──────────────────────────────────────────────
// COLOMBIA GEO DATA
// ──────────────────────────────────────────────
const COLOMBIA_GEO: Record<string, Record<string, string[]>> = {
  'Amazonas': {
    'Leticia': ['Centro', 'La Playa', 'El Progreso', 'Castañal', 'Zaragoza'],
    'Puerto Nariño': ['Centro', 'Naranjales', 'San Francisco'],
  },
  'Antioquia': {
    'Medellín': ['El Poblado', 'Laureles', 'Belén', 'Robledo', 'Aranjuez', 'Buenos Aires', 'Castilla', 'Manrique', 'San Javier', 'Villa Hermosa', 'La Candelaria', 'Guayabal', 'Altavista', 'Santa Cruz', 'Doce de Octubre', 'La América', 'Palmitas', 'San Cristóbal', 'San Antonio de Prado', 'Santa Elena'],
    'Bello': ['Centro', 'Niquía', 'Zamora', 'Madera', 'La Camila', 'Fontidueño', 'El Trapiche', 'Cabañas'],
    'Envigado': ['El Dorado', 'La Magnolia', 'Loma del Escobero', 'Primavera', 'Las Vegas', 'San Marcos', 'Zuñiga', 'Alcalá'],
    'Itagüí': ['Centro', 'Ditaires', 'Santa María', 'San Pío X', 'Yarumito', 'El Rosario'],
    'Sabaneta': ['Aves María', 'La Doctora', 'San José', 'Calle Larga', 'Calle del Banco'],
    'Rionegro': ['Centro', 'Las Vegas', 'El Carmen', 'Abreito', 'Llanogrande', 'San Antonio'],
    'La Estrella': ['Centro', 'La Tablaza', 'Pueblo Viejo'],
    'Caldas': ['Centro', 'La Variante'],
    'Apartadó': ['Centro', 'La Chinita', 'Zungo', 'Horizonte'],
    'Turbo': ['Centro', 'El Dos', 'Nueva Colonia'],
    'Caucasia': ['Centro', 'La Unión'],
  },
  'Arauca': {
    'Arauca': ['Centro', 'El Catorce', 'La Esmeralda', 'Primero de Enero'],
    'Arauquita': ['Centro', 'El Triunfo'],
    'Tame': ['Centro', 'La Reforma'],
  },
  'Atlántico': {
    'Barranquilla': ['El Prado', 'Alto Prado', 'Boston', 'El Limoncito', 'Bella Vista', 'Los Alpes', 'Riomar', 'Ciudad Jardín', 'Modelo', 'La Victoria', 'Recreo', 'Las Delicias', 'El Porvenir', 'La Manga', 'Los Andes', 'Betania', 'Barranquillita', 'El Silencio', 'El Tabor', 'Miramar', 'Villa Santos', 'Buenavista'],
    'Soledad': ['Centro', 'Los Girasoles', 'Villa Estadio', 'Ciudadela Metropolitana', 'Costa Hermosa'],
    'Puerto Colombia': ['Pradomar', 'Sabanilla', 'Centro'],
    'Malambo': ['Centro', 'El Campito'],
    'Sabanalarga': ['Centro', 'La Esperanza'],
  },
  'Bogotá D.C.': {
    'Bogotá': ['Usaquén', 'Chapinero', 'Santa Fe', 'San Cristóbal', 'Usme', 'Tunjuelito', 'Bosa', 'Kennedy', 'Fontibón', 'Engativá', 'Suba', 'Barrios Unidos', 'Teusaquillo', 'Los Mártires', 'Antonio Nariño', 'Puente Aranda', 'La Candelaria', 'Rafael Uribe', 'Ciudad Bolívar', 'Sumapaz', 'El Chico', 'Cedritos', 'Niza', 'Santa Bárbara', 'Modelia', 'Hayuelos', 'Bello Horizonte', 'El Tintal', 'Las Ferias', 'Salitre', 'Nicolás de Federmán', 'La Castellana', 'Rosales', 'Mazurén', 'Colina Campestre'],
  },
  'Bolívar': {
    'Cartagena': ['Bocagrande', 'Castillogrande', 'El Laguito', 'Manga', 'Pie de Popa', 'El Centro Histórico', 'Getsemaní', 'Crespo', 'El Cabrero', 'Chambacú', 'San Diego', 'Torices', 'Ternera', 'El Recreo', 'Villa Sandra', 'Los Caracoles', 'La Boquilla', 'Zona Norte', 'Mamonal'],
    'Magangué': ['Centro', 'La Esperanza', 'El Yucal'],
    'Mompox': ['Centro', 'San Agustín'],
  },
  'Boyacá': {
    'Tunja': ['Centro', 'San Ignacio', 'El Dorado', 'Las Quintas', 'El Libertador', 'La Colonia', 'Mutis', 'Santa Inés', 'La Florida'],
    'Duitama': ['Centro', 'Santa Bárbara', 'Boyacá Real'],
    'Sogamoso': ['Centro', 'Malpaso', 'La Plazuela'],
    'Chiquinquirá': ['Centro', 'El Triunfo'],
    'Villa de Leyva': ['Centro', 'Vereda El Roble'],
  },
  'Caldas': {
    'Manizales': ['Centro', 'La Enea', 'Chipre', 'Palermo', 'Versalles', 'El Campín', 'Los Agustinos', 'Villamaría', 'Palogrande', 'La Estrella', 'Milán', 'Aranjuez', 'El Nevado', 'Alta Suiza'],
    'Chinchiná': ['Centro', 'El Bosque'],
    'La Dorada': ['Centro', 'Villa del Río'],
  },
  'Caquetá': {
    'Florencia': ['Centro', 'El Arca', 'Las Brisas', 'Villa del Río', 'Sinaí'],
    'San Vicente del Caguán': ['Centro', 'La Palestina'],
  },
  'Casanare': {
    'Yopal': ['Centro', 'El Remanso', 'Ciudad Reyes', 'Los Laureles', 'Unicentro'],
    'Aguazul': ['Centro', 'Los Olivos'],
    'Villanueva': ['Centro', 'La Orquídea'],
  },
  'Cauca': {
    'Popayán': ['Centro Histórico', 'La Esmeralda', 'El Libertador', 'Bolívar', 'Los Comuneros', 'La Colina', 'La Paz', 'Pubenza', 'Pandiguando', 'Las Palmas', 'El Lago', 'Yanaconas', 'Camilo Torres', 'El Uvo', 'La Estancia', 'Pomona', 'Alfonso López', 'Lomas de Pomona', 'El Recuerdo'],
    'Santander de Quilichao': ['Centro', 'La Primavera', 'El Palmar'],
    'Puerto Tejada': ['Centro', 'Villa Rica'],
    'Silvia': ['Centro', 'El Cacique'],
    'Corinto': ['Centro', 'El Descanso'],
  },
  'Cesar': {
    'Valledupar': ['Centro', 'El Banco', 'El Prado', 'Los Músicos', 'Siete de Agosto', 'El Parque', 'Las Vegas', 'San José', 'La Nevada', 'Los Cortijos'],
    'Aguachica': ['Centro', 'La Unión'],
    'La Paz': ['Centro', 'El Porvenir'],
  },
  'Chocó': {
    'Quibdó': ['Centro', 'La Yesca', 'Obrero', 'La Playita', 'Kennedy'],
    'Istmina': ['Centro', 'La Orilla'],
  },
  'Córdoba': {
    'Montería': ['Centro', 'La Granja', 'La Coquera', 'Cantaclaro', 'El Dorado', 'Boston', 'Buenavista', 'Las Américas', 'La Castellana', 'Alfonso López', 'El Recreo'],
    'Lorica': ['Centro', 'El Pilón'],
    'Montelíbano': ['Centro', 'La Ilusión'],
  },
  'Cundinamarca': {
    'Soacha': ['Centro', 'Ciudad Verde', 'Cazucá', 'San Mateo', 'La Despensa', 'Compartir'],
    'Facatativá': ['Centro', 'La Paz', 'Villa Natalia'],
    'Zipaquirá': ['Centro', 'San Isidro'],
    'Fusagasugá': ['Centro', 'La Palma', 'El Bosque'],
    'Chía': ['Centro', 'La Balsa', 'Bojacá', 'Sindamanoy'],
    'Cajicá': ['Centro', 'Vereda Canelón'],
    'Tabio': ['Centro'],
    'Tenjo': ['Centro'],
    'Mosquera': ['Centro', 'La Florida'],
    'Madrid': ['Centro', 'El Carmen'],
    'Girardot': ['Centro', 'El Nilo', 'San Juan'],
  },
  'Guainía': {
    'Inírida': ['Centro', 'La Primavera', 'El Coco'],
  },
  'Guaviare': {
    'San José del Guaviare': ['Centro', 'Urbanización Los Fundadores', 'La Paz'],
  },
  'Huila': {
    'Neiva': ['Centro', 'Timanco', 'La Gaitana', 'Los Ángeles', 'Motilon', 'Las Américas', 'Ceinar', 'El Conjunto', 'La Serranía', 'Ipanema'],
    'Pitalito': ['Centro', 'La Paz', 'Villa Colombia'],
    'Garzón': ['Centro', 'Los Andes'],
  },
  'La Guajira': {
    'Riohacha': ['Centro', 'El Paraíso', 'El Aeropuerto', 'Villa Fátima'],
    'Maicao': ['Centro', 'La Manga', 'Villa del Rosario'],
    'Uribia': ['Centro', 'Los Flamencos'],
  },
  'Magdalena': {
    'Santa Marta': ['El Rodadero', 'Bello Horizonte', 'Taganga', 'Centro', 'Gaira', 'Mamatoco', 'El Pando', 'María Eugenia', 'Las Américas', 'Pozos Colorados'],
    'Ciénaga': ['Centro', 'La Ye'],
    'Fundación': ['Centro', 'Los Ciruelos'],
  },
  'Meta': {
    'Villavicencio': ['Centro', 'El Barzal', 'Porvenir', 'Jardines de Villavicencio', 'La Rosita', 'Siete de Agosto', 'La Ceiba', 'San Isidro', 'Buenos Aires', 'El Recreo', 'La Esperanza'],
    'Acacías': ['Centro', 'El Emporio'],
    'Granada': ['Centro', 'La Paz'],
  },
  'Nariño': {
    'Pasto': ['Centro', 'Torobajo', 'San Ignacio', 'La Mermejal', 'Bachué', 'Las Cuadras', 'Mijitayo', 'Lorenzo', 'Obrero', 'Nariño', 'Corazón de Jesús', 'El Rosario'],
    'Tumaco': ['Centro', 'La Ciudadela', 'Nuevo Milenio'],
    'Ipiales': ['Centro', 'La Victoria', 'Obrero'],
  },
  'Norte de Santander': {
    'Cúcuta': ['Centro', 'Atalaya', 'La Playa', 'Bolívar', 'Los Patios', 'El Llano', 'Las Américas', 'Blanco', 'Quinta Orientale', 'Caobos', 'La Libertad', 'Lleras'],
    'Ocaña': ['Centro', 'El Llano'],
    'Pamplona': ['Centro', 'Los Álamos'],
  },
  'Putumayo': {
    'Mocoa': ['Centro', 'Villa del Río', 'La Tebaida'],
    'Puerto Asís': ['Centro', 'La Esmeralda'],
  },
  'Quindío': {
    'Armenia': ['Centro', 'El Bosque', 'La Castellana', 'Santa Rita', 'Urbanización Santander', 'Pinares de Combia', 'Bello Horizonte', 'El Paraíso', 'Norte'],
    'Calarcá': ['Centro', 'El Brillante'],
    'Montenegro': ['Centro', 'Los Pinos'],
  },
  'Risaralda': {
    'Pereira': ['Centro', 'Pinares', 'Circunvalar', 'Cuba', 'El Jardín', 'Álamos', 'Villa del Prado', 'Los Alpes', 'La Julita', 'El Estadio', 'Risaralda', 'El Otoño', 'Dosquebradas'],
    'Dosquebradas': ['Centro', 'La Romelia', 'El Sinaí'],
    'Santa Rosa de Cabal': ['Centro', 'El Billar'],
  },
  'San Andrés y Providencia': {
    'San Andrés': ['North End', 'San Luis', 'La Loma', 'Hill', 'Sound Bay', 'Cove', 'El Cove'],
    'Providencia': ['Santa Isabel', 'Aguamansa', 'Southwest Bay'],
  },
  'Santander': {
    'Bucaramanga': ['Centro', 'Cabecera del Llano', 'El Prado', 'Floridablanca', 'Lagos del Cacique', 'La Aurora', 'Mejoras Públicas', 'Mutis', 'Sotomayor', 'Estadio', 'El Rincón', 'Provenza', 'Pan de Azúcar'],
    'Floridablanca': ['Centro', 'La Cumbre', 'Cañaveral', 'El Pinar', 'Lagos'],
    'Girón': ['Centro', 'La Paz', 'Acapulco'],
    'Barrancabermeja': ['Centro', 'El Campín', 'La Esperanza'],
  },
  'Sucre': {
    'Sincelejo': ['Centro', 'Las Vegas', 'El Cortijo', 'Villa Mady', 'Aranjuez', 'La Floresta'],
    'Corozal': ['Centro', 'El Jardín'],
    'Sampués': ['Centro', 'El Recreo'],
  },
  'Tolima': {
    'Ibagué': ['Centro', 'El Jardín', 'La Granja', 'El Salado', 'Boquemonte', 'Malabar', 'Ambala', 'La Pola', 'Jordán Séptima Etapa', 'La Florida', 'Cádiz'],
    'Espinal': ['Centro', 'El Arenal'],
    'Melgar': ['Centro', 'Brisas del Río'],
  },
  'Valle del Cauca': {
    'Cali': ['El Peñón', 'Granada', 'San Antonio', 'El Ingenio', 'Chipichape', 'Ciudad Jardín', 'Juanambú', 'La Flora', 'Meléndez', 'Altos de Menga', 'Bretaña', 'Prados del Norte', 'San Fernando', 'Villa del Lago', 'Nuevo Versalles', 'Alfonso López', 'Siloé', 'Aguablanca', 'Buenaventura', 'Univalle', 'La Buitrera', 'Pance', 'San Cayetano'],
    'Buenaventura': ['Centro', 'El Cristal', 'La Playita', 'Punta del Este'],
    'Palmira': ['Centro', 'El Jardín', 'La Emilia', 'Versalles'],
    'Tulúa': ['Centro', 'El Jardín', 'La Union'],
    'Buga': ['Centro', 'El Dorado'],
    'Cartago': ['Centro', 'El Prado'],
    'Jamundí': ['Centro', 'Alfaguara'],
  },
  'Vaupés': {
    'Mitú': ['Centro', 'La Paz', 'Villa Nueva'],
  },
  'Vichada': {
    'Puerto Carreño': ['Centro', 'El Porvenir', 'La Primavera'],
  },
};

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────
const COLOMBIA_CENTER = { lat: 4.5709, lng: -74.2973 }; // Center point of Colombia
const DEFAULT_ZOOM = 6;
const DEBOUNCE_DELAY = 400;
const DEFAULT_IMAGE = '/img/default.webp';
const GPS_SETTLE_TIME = 12000; // 12 seconds

// ──────────────────────────────────────────────
// ROUTER
// ──────────────────────────────────────────────
const router = useRouter();
const route = useRoute();

// ──────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────
const mapEl = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const sidebarCollapsed = ref(false);
const allProperties = ref<MapProperty[]>([]);
const selectedPropertyId = ref<number | null>(null);
const visibleCount = ref(0);
const isLocating = ref(false);
const geoAccuracy = ref<number | null>(null);
const userLocationMarker = ref<L.Marker | L.CircleMarker | null>(null);
const userAccuracyCircle = ref<L.Circle | null>(null);
const userLatLng = ref<L.LatLng | null>(null);
const userCity = ref<string>('');
const addressSuggestions = ref<any[]>([]);
const showSuggestions = ref(false);
const searchState = ref<'idle' | 'searching' | 'error' | 'success'>('idle');
let suggestionTimer: any = null;

const filters = ref({
  department: '',
  city: '',
  neighborhood: '',
  zone: '',
  address: '',
  status: '',
  min_price: undefined as number | undefined,
  max_price: undefined as number | undefined,
});

const statusOptions = [
  { value: 'available', label: 'Disponible' },
  { value: 'rented', label: 'Arrendada' },
  { value: 'maintenance', label: 'Mantenimiento' },
];

// ──────────────────────────────────────────────
// LEAFLET
// ──────────────────────────────────────────────
let map: L.Map | null = null;
let markersLayerGroup: L.LayerGroup | null = null;
const activeMarkers = new Map<string, L.Marker | L.CircleMarker>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// ──────────────────────────────────────────────
// HELPERS — String Normalization & Distance
// ──────────────────────────────────────────────
function normalize(str: string): string {
  if (!str) return '';
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ──────────────────────────────────────────────
// COMPUTED — Geo cascading lists
// ──────────────────────────────────────────────
const departmentList = computed<string[]>(() =>
  Object.keys(COLOMBIA_GEO).sort()
);

const cityList = computed<string[]>(() => {
  if (!filters.value.department) return [];
  return Object.keys(COLOMBIA_GEO[filters.value.department] || {}).sort();
});

const neighborhoodList = computed<string[]>(() => {
  if (!filters.value.department || !filters.value.city) return [];
  return COLOMBIA_GEO[filters.value.department]?.[filters.value.city] ?? [];
});

const filteredProperties = computed<MapProperty[]>(() => {
  return allProperties.value.filter(p => {
    // 1. Dirección (text search)
    if (filters.value.address) {
      const search = normalize(filters.value.address);
      const propAddr = normalize(p.address || '');
      const propTitle = normalize(p.title || '');
      if (!propAddr.includes(search) && !propTitle.includes(search)) return false;
    }
    // 2. Barrio (highest precision)
    if (filters.value.neighborhood) {
      const nb = normalize(filters.value.neighborhood);
      const propAddr = normalize(p.address || '');
      const propCity = normalize(p.city || '');
      if (!propAddr.includes(nb) && !propCity.includes(nb)) return false;
    }
    // 2. City
    else if (filters.value.city) {
      const targetCity = normalize(filters.value.city);
      const propCity = normalize(p.city || '');
      const propAddr = normalize(p.address || '');
      if (!propCity.includes(targetCity) && !propAddr.includes(targetCity)) return false;
    }

    // 2.5 Zone
    if (filters.value.zone) {
      const z = filters.value.zone.toLowerCase();
      const propZone = (p as any).zone ? (p as any).zone.toLowerCase() : '';
      const propAddr = normalize(p.address || '');
      // If data has explicit zone, use it. Otherwise, look for the word in address
      if (!propZone.includes(z) && !propAddr.includes(z)) return false;
    }

    // 3. Department
    else if (filters.value.department) {
      const deptCities = Object.keys(COLOMBIA_GEO[filters.value.department] || {}).map(c => normalize(c));
      const propCity = normalize(p.city || '');
      if (!deptCities.some(dc => propCity.includes(dc))) return false;
    }

    if (filters.value.status && p.status !== filters.value.status) return false;
    if (filters.value.min_price !== undefined && p.monthly_price < filters.value.min_price) return false;
    if (filters.value.max_price !== undefined && p.monthly_price > filters.value.max_price) return false;
    return true;
  });
});

// Proximity search: If no exact matches, show nearest properties
const nearbyProperties = computed<MapProperty[]>(() => {
  if (filteredProperties.value.length > 0 || !hasActiveFilters.value) return [];

  let refLat = 0, refLng = 0;

  if (userLatLng.value) {
    refLat = userLatLng.value.lat;
    refLng = userLatLng.value.lng;
  } else if (filters.value.city) {
    // Find first property in city to get typical center if possible
    const inCity = allProperties.value.find(p => normalize(p.city || '').includes(normalize(filters.value.city)));
    if (inCity) { refLat = inCity.lat; refLng = inCity.lng; }
  }

  if (refLat === 0) return [];

  return [...allProperties.value]
    .map(p => ({ ...p, _distance: getDistance(refLat, refLng, p.lat, p.lng) }))
    .sort((a, b) => (a as any)._distance - (b as any)._distance)
    .slice(0, 5);
});

const selectedProperty = computed<MapProperty | null>(() =>
  selectedPropertyId.value !== null
    ? allProperties.value.find(p => p.id === selectedPropertyId.value) ?? null
    : null
);

const hasActiveFilters = computed(() =>
  !!(filters.value.department || filters.value.city || filters.value.neighborhood ||
    filters.value.status || filters.value.min_price !== undefined || filters.value.max_price !== undefined)
);

const propertiesWithCoords = computed(() =>
  allProperties.value.filter(p => !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0 && p.lng !== 0).length
);

const geoAccuracyClass = computed(() => {
  if (geoAccuracy.value === null) return '';
  if (geoAccuracy.value <= 10) return 'geo-accuracy--excellent';
  if (geoAccuracy.value <= 30) return 'geo-accuracy--good';
  if (geoAccuracy.value <= 80) return 'geo-accuracy--fair';
  return 'geo-accuracy--poor';
});

const nearestProperty = computed(() => {
  if (!userLatLng.value || allProperties.value.length === 0) return null;
  let minD = Infinity;
  let closest: any = null;
  allProperties.value.forEach(p => {
    const d = getDistance(userLatLng.value!.lat, userLatLng.value!.lng, p.lat, p.lng);
    if (d < minD) { minD = d; closest = p; }
  });
  return closest ? { ...closest, distance: minD } : null;
});

const cityCenters = computed(() => {
  const centers: Record<string, { lat: number, lng: number, count: number }> = {};
  allProperties.value.forEach(p => {
    const city = p.city || 'Unknown';
    if (!centers[city]) centers[city] = { lat: 0, lng: 0, count: 0 };
    centers[city].lat += p.lat;
    centers[city].lng += p.lng;
    centers[city].count++;
  });
  Object.keys(centers).forEach(city => {
    centers[city].lat /= centers[city].count;
    centers[city].lng /= centers[city].count;
  });
  return centers;
});

/**
 * Reverse geocodes the user's lat/lng to get the city name
 */
async function reverseGeocodeUser(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
    const data = await res.json();
    if (data.address) {
      userCity.value = data.address.city || data.address.town || data.address.village || data.address.municipality || '';
    }
  } catch (e) {
    console.error('Error in reverse geocoding:', e);
  }
}


// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function getPropertyImage(property: MapProperty): string {
  return getPropertyImageUtil(property, DEFAULT_IMAGE);
}

function handleImgError(e: Event) {
  (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Disponible',
    rented: 'Arrendada',
    maintenance: 'Mantenimiento',
  };
  return labels[status] ?? status;
}

/**
 * Heuristic to determine the zone of a point within a city
 */
function getPointZone(lat: number, lng: number, city?: string): string {
  if (!city || !cityCenters.value[city]) return '';
  const center = cityCenters.value[city];
  const dLat = lat - center.lat;
  const dLng = lng - center.lng;

  // Small threshold for "Centro"
  const threshold = 0.006;
  if (Math.abs(dLat) < threshold && Math.abs(dLng) < threshold) return 'Centro';

  if (Math.abs(dLat) > Math.abs(dLng)) {
    return dLat > 0 ? 'Norte' : 'Sur';
  } else {
    return dLng > 0 ? 'Este' : 'Oeste';
  }
}

function countByStatus(status: string): number {
  return filteredProperties.value.filter(p => p.status === status).length;
}

// ──────────────────────────────────────────────
// FILTER HANDLERS
// ──────────────────────────────────────────────
function onDepartmentChange() {
  filters.value.city = '';
  filters.value.neighborhood = '';
  applyFilters();

  // Fly to department center if we have data
  if (filters.value.department && map) {
    const deptCities = Object.keys(COLOMBIA_GEO[filters.value.department] || {});
    const firstMatch = allProperties.value.find(p =>
      deptCities.some(c => (p.city || '').toLowerCase().includes(c.toLowerCase()))
    );
    if (firstMatch) {
      map.flyTo([firstMatch.lat, firstMatch.lng], 11, { duration: 1.2 });
    }
  }
}

function onCityChange() {
  filters.value.neighborhood = '';
  filters.value.zone = '';
  applyFilters();

  // Fly to city
  if (filters.value.city && map) {
    const cityLower = filters.value.city.toLowerCase();
    const firstMatch = allProperties.value.find(p =>
      (p.city || '').toLowerCase().includes(cityLower)
    );
    if (firstMatch) {
      map.flyTo([firstMatch.lat, firstMatch.lng], 13, { duration: 1.2 });
    }
  }
}

function toggleStatus(val: string) {
  filters.value.status = filters.value.status === val ? '' : val;
  applyFilters();
}

function onAddressInput() {
  debouncedApplyFilters();
  autoAssociateFilters();
  if (suggestionTimer) clearTimeout(suggestionTimer);
  suggestionTimer = setTimeout(fetchSuggestions, 600);
}

/**
 * Smart Parser: Automatically updates dropdown filters if they are mentioned 
 * in the search text area.
 */
function autoAssociateFilters() {
  const text = normalize(filters.value.address);
  if (text.length < 3) return;

  // 1. Check Department
  for (const dep of departmentList.value) {
    if (text.includes(normalize(dep)) && filters.value.department !== dep) {
      filters.value.department = dep;
      // We don't clear city here to allow full string parsing in one go
    }
  }

  // 2. Check City within current or detected department
  if (filters.value.department) {
    const cities = Object.keys(COLOMBIA_GEO[filters.value.department] || {});
    for (const city of cities) {
      if (text.includes(normalize(city)) && filters.value.city !== city) {
        filters.value.city = city;
      }
    }
  }

  // 2.5 Check Zone
  const zones = ['norte', 'sur', 'centro', 'este', 'oriente', 'oeste', 'occidente'];
  for (const z of zones) {
    if (text.includes(z)) {
      if (z === 'oriente') filters.value.zone = 'Este';
      else if (z === 'occidente') filters.value.zone = 'Oeste';
      else filters.value.zone = z.charAt(0).toUpperCase() + z.slice(1);
    }
  }

  // 3. Check Neighborhood within detected city
  if (filters.value.city) {
    const neighborhoods = neighborhoodList.value;
    for (const nb of neighborhoods) {
      if (text.includes(normalize(nb)) && filters.value.neighborhood !== nb) {
        filters.value.neighborhood = nb;
      }
    }
  }
}

async function fetchSuggestions() {
  if (!filters.value.address || filters.value.address.length < 3) {
    addressSuggestions.value = [];
    return;
  }
  try {
    // Inject context into Suggestions
    const context = `${filters.value.city ? filters.value.city + ',' : ''} ${filters.value.department ? filters.value.department + ',' : ''} Colombia`;
    const q = `${filters.value.address}, ${context}`;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=co`);
    addressSuggestions.value = await res.json();
    showSuggestions.value = true;
  } catch (e) { console.error(e); }
}

function selectSuggestion(sug: any) {
  filters.value.address = sug.display_name;
  showSuggestions.value = false;
  searchAddressOnMap();
}

function hideSuggestionsWithDelay() {
  setTimeout(() => { showSuggestions.value = false; }, 250);
}

/**
 * Searches for a physical address on the map (Geocoding)
 */
async function searchAddressOnMap() {
  if (!filters.value.address || !map) return;

  // Vague Search Protection
  const isVague = filters.value.address.length < 10 && !filters.value.city;
  const commonTerms = ['calle', 'carrera', 'avenida', 'cl', 'cr', 'av', 'diag', 'dg', 'trans'];
  const hasCommon = commonTerms.some(t => filters.value.address.toLowerCase().includes(t));

  if (isVague && hasCommon) {
    searchState.value = 'error';
    alert('La búsqueda es muy general. Por favor, selecciona una ciudad o sé más específico (Ej: Calle 13, Popayán).');
    return;
  }

  searchState.value = 'searching';
  showSuggestions.value = false;

  try {
    // Priority 1: Full context query
    const query = `${filters.value.address}, ${filters.value.neighborhood || ''} ${filters.value.city || ''} ${filters.value.department || ''}, Colombia`;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=co`);
    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      map.flyTo([parseFloat(lat), parseFloat(lon)], 17, { duration: 1.5 });
      searchState.value = 'success';
    } else {
      // Priority 2: Try just the input if context failed
      const simpleRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(filters.value.address)}&limit=1&countrycodes=co`);
      const simpleData = await simpleRes.json();
      if (simpleData && simpleData.length > 0) {
        map.flyTo([parseFloat(simpleData[0].lat), parseFloat(simpleData[0].lon)], 17, { duration: 1.5 });
        searchState.value = 'success';
      } else {
        searchState.value = 'error';
        setTimeout(exploreNearMe, 1500);
      }
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    searchState.value = 'error';
  }
}

function exploreNearMe() {
  if (!userLatLng.value && !isLocating.value) {
    locateUser();
    return;
  }
  if (nearestProperty.value && map) {
    selectProperty(nearestProperty.value);
  }
}

function clearFilters() {
  filters.value = { department: '', city: '', neighborhood: '', zone: '', address: '', status: '', min_price: undefined, max_price: undefined };
  applyFilters();
}

// ──────────────────────────────────────────────
// GEOLOCATION — High accuracy
// ──────────────────────────────────────────────
function locateUser() {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización.');
    return;
  }
  if (!map) return;

  isLocating.value = true;
  geoAccuracy.value = null;
  userCity.value = ''; // Clear previous city

  let watchId: number | null = null;
  let hasLocked = false;
  let bestAccuracy = Infinity;
  let bestPoint: { lat: number, lng: number } | null = null;
  let startTime = Date.now();
  let pointsCount = 0;

  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  };

  const finalize = (finalPoint: { lat: number, lng: number } | null) => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    isLocating.value = false;
    setTimeout(() => { geoAccuracy.value = null; }, 5000);
    if (finalPoint) {
      reverseGeocodeUser(finalPoint.lat, finalPoint.lng);
    }
  };

  const updateUI = (pos: GeolocationPosition) => {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;

    geoAccuracy.value = accuracy;
    userLatLng.value = L.latLng(lat, lng);

    if (!map) return;

    // Use current location dot if exists, update it smoothly
    if (userLocationMarker.value && (userLocationMarker.value as L.Marker).setLatLng) {
      (userLocationMarker.value as L.Marker).setLatLng([lat, lng]);
      if (userAccuracyCircle.value) userAccuracyCircle.value.setLatLng([lat, lng]).setRadius(accuracy);
    } else {
      // Create fresh
      if (userLocationMarker.value) map.removeLayer(userLocationMarker.value as unknown as L.Layer);
      if (userAccuracyCircle.value) map.removeLayer(userAccuracyCircle.value as unknown as L.Layer);

      userAccuracyCircle.value = L.circle([lat, lng], {
        radius: accuracy,
        color: '#4D2F24',
        fillColor: '#C8A97E',
        fillOpacity: 0.08,
        weight: 1,
        dashArray: '4,4',
      }).addTo(map);

      const userIcon = L.divIcon({
        className: '',
        html: `<div class="user-location-marker">
                 <div class="user-loc-pulse"></div>
                 <div class="user-loc-dot"></div>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      userLocationMarker.value = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 3000 }).addTo(map);
      userLocationMarker.value.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:6px 8px;min-width:140px;text-align:center">
          <strong style="color:#4D2F24">📍 Tu ubicación</strong><br>
          <span style="font-size:11px;color:#666">Margen de error: ±${Math.round(accuracy)}m</span>
        </div>
      `, { offset: [0, -14], closeButton: false });
    }

    // Centering strategy: 
    // Ignore first hit if it's too fast (likely cached)
    // Only center after the 2nd point OR after 3 seconds, targeting the best accuracy
    if (pointsCount > 1 || (Date.now() - startTime > 3000)) {
      if (!hasLocked || accuracy < (bestAccuracy * 0.9)) {
        let zoomLevel = 17;
        if (accuracy < 20) zoomLevel = 18;
        else if (accuracy > 200) zoomLevel = 14;

        map.flyTo([lat, lng], zoomLevel, { duration: 1.5 });
        hasLocked = true;
        bestPoint = { lat, lng }; // Update bestPoint when we center
      }
    }

    bestAccuracy = Math.min(bestAccuracy, accuracy);
    pointsCount++;
  };

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      updateUI(pos);

      // Wait for ultra-precision OR 10 seconds of signal collection
      if (pos.coords.accuracy < 8 || (Date.now() - startTime > GPS_SETTLE_TIME)) {
        finalize(bestPoint);
      }
    },
    (err) => {
      console.warn('Geo watch error:', err);
      if (!hasLocked) {
        isLocating.value = false;
        const messages: Record<number, string> = {
          1: 'Permiso de ubicación denegado.',
          2: 'Señal de ubicación no disponible.',
          3: 'Tiempo de espera agotado.',
        };
        alert(messages[err.code] || 'Error de ubicación.');
      }
      finalize(bestPoint);
    },
    options
  );

  // Safety global timeout
  setTimeout(() => {
    if (isLocating.value) finalize(bestPoint);
  }, GPS_SETTLE_TIME);
}

// ──────────────────────────────────────────────
// MARKER FACTORIES — Image-based markers
// ──────────────────────────────────────────────
function createImageMarker(property: MapProperty, isSelected: boolean): L.DivIcon {
  const imgSrc = getPropertyImage(property);
  const price = formatPriceShort(property.monthly_price);

  const statusColorMap: Record<string, string> = {
    available: '#10b981', // More vibrant emerald
    rented: '#f43f5e',    // More vibrant rose
    maintenance: '#f59e0b', // Vibrant amber
  };
  const statusColor = statusColorMap[property.status] ?? '#4D2F24';
  const selectedClass = isSelected ? 'vibrant-marker--selected' : '';

  return L.divIcon({
    className: '',
    html: `
      <div class="vibrant-marker ${selectedClass}" style="--accent-color:${statusColor}">
        <div class="vibrant-marker__wrapper">
          <div class="vibrant-marker__photo">
            <img src="${imgSrc}" alt="" onerror="this.src='${DEFAULT_IMAGE}'" />
          </div>
          <div class="vibrant-marker__content">
            <span class="vibrant-marker__price">${price}</span>
          </div>
          <div class="vibrant-marker__indicator" style="background:${statusColor}"></div>
        </div>
        <div class="vibrant-marker__stem"></div>
      </div>`,
    iconAnchor: [50, 58],
    iconSize: [100, 58],
  });
}

function createClusterMarker(count: number, avgPrice: number): L.DivIcon {
  const price = formatPriceShort(avgPrice);
  const size = count > 50 ? 56 : count > 20 ? 48 : 40;
  return L.divIcon({
    className: '',
    html: `<div class="cluster-bubble" style="width:${size}px;height:${size}px">
             <span class="cluster-num">${count}</span>
             <span class="cluster-price">${price}</span>
           </div>`,
    iconAnchor: [size / 2, size / 2],
    iconSize: [size, size],
  });
}

// ──────────────────────────────────────────────
// RENDER MARKERS
// ──────────────────────────────────────────────
function renderMarkersForCurrentView() {
  if (!map || !markersLayerGroup) return;

  const zoom = map.getZoom();
  const bounds = map.getBounds();

  let inViewport: MapProperty[];
  if (zoom <= 8) {
    inViewport = filteredProperties.value;
  } else {
    const ext = bounds.pad(0.3);
    inViewport = filteredProperties.value.filter(p =>
      ext.contains(L.latLng(p.lat, p.lng))
    );
  }

  visibleCount.value = filteredProperties.value.filter(p =>
    bounds.contains(L.latLng(p.lat, p.lng))
  ).length;

  const clusters = clusterProperties(inViewport, zoom);
  const newKeys = new Set<string>();

  for (const cluster of clusters) {
    const isSingle = cluster.count === 1;
    const property = isSingle ? cluster.properties[0] : null;
    const key = isSingle
      ? `prop-${property!.id}`
      : `cluster-${cluster.lat.toFixed(4)}:${cluster.lng.toFixed(4)}`;

    newKeys.add(key);

    if (activeMarkers.has(key)) {
      // Update selection state for single markers
      if (isSingle && property) {
        const existing = activeMarkers.get(key) as L.Marker;
        const sel = selectedPropertyId.value === property.id;
        existing.setIcon(createImageMarker(property, sel));
        existing.setZIndexOffset(sel ? 1000 : 0);
      }
      continue;
    }

    if (isSingle && property) {
      const sel = selectedPropertyId.value === property.id;
      const marker = L.marker([cluster.lat, cluster.lng], {
        icon: createImageMarker(property, sel),
        zIndexOffset: sel ? 1000 : 0,
      });
      marker.on('click', () => selectProperty(property));
      marker.addTo(markersLayerGroup!);
      activeMarkers.set(key, marker);
    } else {
      const marker = L.marker([cluster.lat, cluster.lng], {
        icon: createClusterMarker(cluster.count, cluster.avgPrice),
      });
      marker.on('click', () => {
        const z = map!.getZoom();
        map!.flyTo([cluster.lat, cluster.lng], Math.min(z + 3, 16), { duration: 0.8 });
      });
      marker.addTo(markersLayerGroup!);
      activeMarkers.set(key, marker);
    }
  }

  // Remove out-of-view
  for (const [key, marker] of activeMarkers.entries()) {
    if (!newKeys.has(key)) {
      markersLayerGroup!.removeLayer(marker);
      activeMarkers.delete(key);
    }
  }
}

// ──────────────────────────────────────────────
// SELECTION
// ──────────────────────────────────────────────
function selectProperty(property: MapProperty) {
  const prevId = selectedPropertyId.value;
  selectedPropertyId.value = property.id;

  if (map) {
    const zoom = map.getZoom();
    const target = Math.max(zoom, 15);
    map.flyTo([property.lat, property.lng], target, { duration: 0.8 });
  }

  if (prevId !== null) {
    const prevKey = `prop-${prevId}`;
    const prevMarker = activeMarkers.get(prevKey) as L.Marker | undefined;
    const prevProp = allProperties.value.find(p => p.id === prevId);
    if (prevMarker && prevProp) {
      prevMarker.setIcon(createImageMarker(prevProp, false));
      prevMarker.setZIndexOffset(0);
    }
  }

  const newKey = `prop-${property.id}`;
  const newMarker = activeMarkers.get(newKey) as L.Marker | undefined;
  if (newMarker) {
    newMarker.setIcon(createImageMarker(property, true));
    newMarker.setZIndexOffset(1000);
  }
}

function closePreview() {
  if (selectedPropertyId.value !== null) {
    const key = `prop-${selectedPropertyId.value}`;
    const marker = activeMarkers.get(key) as L.Marker | undefined;
    const prop = allProperties.value.find(p => p.id === selectedPropertyId.value);
    if (marker && prop) {
      marker.setIcon(createImageMarker(prop, false));
      marker.setZIndexOffset(0);
    }
  }
  selectedPropertyId.value = null;
}

// ──────────────────────────────────────────────
// NAVIGATION
// ──────────────────────────────────────────────
function goToDetail(propertyId: number) {
  if (!map) return;
  const center = map.getCenter();
  const zoom = map.getZoom();
  router.push({
    name: 'PropertyDetail',
    params: { id: propertyId },
    query: { fromMap: '1', mapLat: center.lat.toFixed(6), mapLng: center.lng.toFixed(6), mapZoom: zoom.toString() },
  });
}

function goBack() {
  window.history.length > 1 ? router.back() : router.push({ name: 'home' });
}

// ──────────────────────────────────────────────
// FILTERS
// ──────────────────────────────────────────────
function applyFilters() {
  if (markersLayerGroup) { markersLayerGroup.clearLayers(); activeMarkers.clear(); }
  selectedPropertyId.value = null;
  renderMarkersForCurrentView();
}

function debouncedApplyFilters() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilters, DEBOUNCE_DELAY);
}

// ──────────────────────────────────────────────
// MAP INIT
// ──────────────────────────────────────────────
async function initMap() {
  if (!mapEl.value) return;

  const savedLat = route.query.mapLat ? parseFloat(route.query.mapLat as string) : null;
  const savedLng = route.query.mapLng ? parseFloat(route.query.mapLng as string) : null;
  const savedZoom = route.query.mapZoom ? parseInt(route.query.mapZoom as string) : null;

  const center = (savedLat && savedLng && !isNaN(savedLat) && !isNaN(savedLng))
    ? { lat: savedLat, lng: savedLng }
    : COLOMBIA_CENTER;
  const zoom = (savedZoom && !isNaN(savedZoom)) ? savedZoom : DEFAULT_ZOOM;

  map = L.map(mapEl.value, {
    center: [center.lat, center.lng],
    zoom,
    zoomControl: false, // Moved to bottom
    preferCanvas: false,
  });

  // Zoom controls at bottom right
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Custom tile layer (CartoDB Voyager — cleaner look)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
  }).addTo(map);

  markersLayerGroup = L.layerGroup().addTo(map);

  let moveTimer: ReturnType<typeof setTimeout> | null = null;
  const onMapChange = () => {
    if (moveTimer) clearTimeout(moveTimer);
    moveTimer = setTimeout(renderMarkersForCurrentView, 200);
  };
  map.on('moveend', onMapChange);
  map.on('zoomend', onMapChange);
  map.on('click', (e) => {
    const target = e.originalEvent.target as HTMLElement;
    if (!target.closest('.img-marker') && !target.closest('.cluster-bubble')) closePreview();
  });
}

// ──────────────────────────────────────────────
// LOAD PROPERTIES
// ──────────────────────────────────────────────
async function loadProperties() {
  try {
    isLoading.value = true;
    allProperties.value = await propertyMapService.getAllForMap();

    await nextTick();
    await new Promise(r => setTimeout(r, 100));

    if (map) {
      map.invalidateSize();

      const hasSaved = route.query.mapLat && route.query.mapLng;
      if (!hasSaved && allProperties.value.length > 0) {
        const cityCounts: Record<string, number> = {};
        allProperties.value.forEach(p => { if (p.city) cityCounts[p.city] = (cityCounts[p.city] || 0) + 1; });
        const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        const firstProp = allProperties.value.find(p => p.city === topCity);
        if (firstProp) {
          map.setView([firstProp.lat, firstProp.lng], 13);
          selectProperty(firstProp);
        }
      } else {
        renderMarkersForCurrentView();
      }
    }
  } catch (err) {
    console.error('Error cargando propiedades:', err);
  } finally {
    isLoading.value = false;
  }
}

// ──────────────────────────────────────────────
// WATCHERS
// ──────────────────────────────────────────────
watch(filteredProperties, () => {
  if (map && !isLoading.value) {
    if (markersLayerGroup) { markersLayerGroup.clearLayers(); activeMarkers.clear(); }
    renderMarkersForCurrentView();
  }
});

watch(sidebarCollapsed, async () => {
  await nextTick();
  await new Promise(r => setTimeout(r, 310));
  map?.invalidateSize();
});

// ──────────────────────────────────────────────
// LIFECYCLE
// ──────────────────────────────────────────────
onMounted(async () => {
  await initMap();
  await loadProperties();
});

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (map) { map.remove(); map = null; }
  markersLayerGroup = null;
  activeMarkers.clear();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.full-page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f8fafc;
  padding-top: 65px;
  /* Offset for fixed NavBar */
}

.full-page-wrapper::-webkit-scrollbar {
  width: 8px;
}

.full-page-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.full-page-wrapper::-webkit-scrollbar-thumb {
  background: var(--brand-light);
  border-radius: 4px;
}

/* ══════════════════════════════════════════
   ROOT
══════════════════════════════════════════ */
.explorer-root {
  flex: none;
  display: flex;
  height: calc(100vh - 65px);
  /* Matches exact NavBar height */
  width: 100%;
  overflow: hidden;
  position: relative;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
  background: #f1f5f9;
  --brand: #4D2F24;
  --brand-light: #C8A97E;
  --brand-dark: #2e1d17;
  --available: #16a34a;
  --rented: #dc2626;
  --maintenance: #d97706;
}

/* ══════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════ */
.sidebar {
  width: 360px;
  min-width: 360px;
  height: 100%;
  background: #fafaf9;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 20px rgba(77, 47, 36, 0.1);
  z-index: 10;
  transition: all 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border-right: 1px solid #ede8e4;
}

.sidebar--collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
}

/* Header */
.sidebar-header {
  background: linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 100%);
  padding: 16px 18px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header__top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-header__titles {
  flex: 1;
  min-width: 0;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.3;
}

.title-icon {
  color: var(--brand-light);
  flex-shrink: 0;
}

.sidebar-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
  font-weight: 500;
}

.count-number {
  font-weight: 800;
  color: var(--brand-light);
}

.active-filter-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #fbbf24;
  border-radius: 50%;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.loading-dots span {
  animation: blink 1.2s ease-in-out infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {

  0%,
  100% {
    opacity: 0.2;
  }

  50% {
    opacity: 1;
  }
}

.back-btn,
.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}

.back-btn:hover,
.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}

/* ── Filters Panel ── */
.filters-panel {
  flex-shrink: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 450px;
  border-bottom: 2px solid #f1f1f1;
}

.filters-scroll-area {
  padding: 20px 18px;
  overflow-y: auto;
  flex: 1;
}

.filters-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  color: var(--brand);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.filters-section-title i,
.filters-section-title svg {
  color: var(--brand-light);
}

.filter-group {
  margin-bottom: 18px;
}

.filter-hint {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 4px;
  font-style: italic;
}

.search-input-wrapper {
  display: flex;
  gap: 8px;
}

.search-input {
  padding-right: 10px !important;
}

.search-map-btn {
  background: var(--brand);
  color: white;
  border: none;
  border-radius: 9px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.search-map-btn:hover {
  background: var(--brand-dark);
  transform: scale(1.05);
}

.search-map-btn.searching {
  background: #94a3b8;
  cursor: wait;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f8fafc;
}

.sug-icon {
  color: var(--brand-light);
  font-size: 12px;
}

.sug-text {
  font-size: 12px;
  color: #334155;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-error-msg {
  font-size: 11px;
  color: #ef4444;
  margin-top: 6px;
  font-weight: 600;
}

.text-link {
  background: none;
  border: none;
  color: var(--brand);
  text-decoration: underline;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
}

/* Proximity Banner */
.proximity-banner {
  margin: 10px 0 18px;
  background: linear-gradient(135deg, #fef7f0 0%, #fff 100%);
  border: 1.5px solid var(--brand-light);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(200, 169, 126, 0.15);
}

.proximity-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(200, 169, 126, 0.25);
  border-color: var(--brand);
}

.proximity-icon {
  width: 38px;
  height: 38px;
  background: var(--brand-light);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.proximity-content {
  flex: 1;
}

.proximity-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--brand);
}

.proximity-dist {
  font-size: 11px;
  color: #64748b;
}

.proximity-go {
  background: none;
  border: none;
  color: var(--brand-light);
  font-weight: 800;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.filter-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 6px;
}

.select-wrapper {
  position: relative;
}

.select-arrow-fa {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 10px;
  color: var(--brand-light);
}

.filter-select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  background: #f8fafc;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-select:focus {
  outline: none;
  border-color: var(--brand);
  background: white;
  box-shadow: 0 0 0 4px rgba(77, 47, 36, 0.08);
}

/* Status pills */
.status-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid transparent;
  background: #f5f3f0;
  color: #78716c;
  transition: all 0.2s;
  font-family: inherit;
}

.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-pill--available:hover,
.status-pill--available.status-pill--active {
  background: #dcfce7;
  color: var(--available);
  border-color: #bbf7d0;
}

.status-pill--rented:hover,
.status-pill--rented.status-pill--active {
  background: #fee2e2;
  color: var(--rented);
  border-color: #fecaca;
}

.status-pill--maintenance:hover,
.status-pill--maintenance.status-pill--active {
  background: #fef9c3;
  color: var(--maintenance);
  border-color: #fef08a;
}

/* Price range */
.price-range-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input-wrap {
  flex: 1;
  position: relative;
}

.price-sign {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 700;
  color: var(--brand);
  pointer-events: none;
}

.filter-input {
  width: 100%;
  padding: 9px 10px 9px 24px;
  border: 1.5px solid #e7e3e0;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 500;
  color: #1c1917;
  background: #fafaf9;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.filter-input:focus {
  outline: none;
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(77, 47, 36, 0.1);
  background: #fff;
}

.price-separator {
  color: #a8a29e;
  font-weight: 600;
  flex-shrink: 0;
}

.active-filters-footer {
  padding: 12px 18px;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  border-top: 1px solid #e2e8f0;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: #ef4444;
  padding: 8px 16px;
  border-radius: 10px;
  font-family: inherit;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 7px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.clear-filters-btn:hover {
  background: #fee2e2;
}

/* Transition */
.filter-slide-enter-active,
.filter-slide-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.filter-slide-enter-from,
.filter-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

/* ── Property List ── */
.property-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #fafaf9;
  scrollbar-width: thin;
  scrollbar-color: #e7e3e0 transparent;
}

.property-list::-webkit-scrollbar {
  width: 3px;
}

.property-list::-webkit-scrollbar-thumb {
  background: #e7e3e0;
  border-radius: 2px;
}

.list-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  color: #a8a29e;
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
}

.empty-icon {
  font-size: 2.5rem;
}

/* Brand Spinner */
.brand-spinner {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-spinner.large {
  width: 56px;
  height: 56px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid #ede8e4;
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.brand-spinner.large .spinner-ring {
  border-width: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Property Cards */
.property-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.property-card {
  display: flex;
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid #e7e3e0;
  background: #fff;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(77, 47, 36, 0.05);
}

.property-card:hover {
  border-color: var(--brand-light);
  box-shadow: 0 6px 18px rgba(77, 47, 36, 0.12);
  transform: translateY(-1px);
}

.property-card--selected {
  border-color: var(--brand);
  box-shadow: 0 6px 20px rgba(77, 47, 36, 0.2);
}

.property-card__image-wrap {
  width: 88px;
  min-width: 88px;
  height: 88px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.property-card__image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.property-card:hover .property-card__image-wrap img {
  transform: scale(1.05);
}

.property-card__status {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.s-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.status--available {
  background: rgba(220, 252, 231, 0.95);
  color: var(--available);
}

.status--rented {
  background: rgba(254, 226, 226, 0.95);
  color: var(--rented);
}

.status--maintenance {
  background: rgba(254, 249, 195, 0.95);
  color: var(--maintenance);
}

.property-card__body {
  padding: 10px 12px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.property-card__title {
  font-size: 13px;
  font-weight: 700;
  color: #1c1917;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.property-card__location {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #a8a29e;
  margin: 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.property-card__chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 3px;
}

.prop-chip {
  font-size: 10px;
  color: #78716c;
  background: #f5f3f0;
  padding: 2px 6px;
  border-radius: 5px;
  font-weight: 500;
}

.property-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 5px;
}

.prop-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-amount {
  font-size: 12px;
  font-weight: 800;
  color: var(--brand);
}

.price-period {
  font-size: 10px;
  color: #a8a29e;
  font-weight: 500;
}

.detail-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--brand);
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.detail-btn:hover {
  background: var(--brand-dark);
  transform: translateX(2px);
}

/* ══════════════════════════════════════════
   MAP AREA
══════════════════════════════════════════ */
.map-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-canvas {
  width: 100%;
  height: 100%;
}

/* Open sidebar */
.sidebar-open-btn {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 14px;
  background: #fff;
  border: 1.5px solid #e7e3e0;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-dark);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(77, 47, 36, 0.15);
  transition: all 0.2s;
  font-family: inherit;
}

.sidebar-open-btn:hover {
  box-shadow: 0 8px 24px rgba(77, 47, 36, 0.2);
  background: #fef7f0;
}

/* Geolocate button */
.geolocate-btn {
  position: absolute;
  bottom: 120px;
  /* Above zoom controls */
  right: 12px;
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  background: #fff;
  border: 1.5px solid #e7e3e0;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-dark);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transition: all 0.2s;
  font-family: inherit;
}

.geolocate-btn:hover {
  background: #fef7f0;
  border-color: var(--brand-light);
  box-shadow: 0 6px 20px rgba(77, 47, 36, 0.2);
}

.geolocate-btn--active {
  background: #fef7f0;
  border-color: var(--brand-light);
  color: var(--brand);
}

.geolocate-btn--located {
  border-color: var(--brand);
  color: var(--brand);
}

.geo-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #ede8e4;
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

/* Stats bar */
.map-stats-bar {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 400;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  border: 1px solid #e7e3e0;
  border-radius: 12px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(77, 47, 36, 0.08);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.stat-num {
  font-size: 15px;
  font-weight: 800;
  color: var(--brand);
  line-height: 1;
}

.available-num {
  color: var(--available);
}

.rented-num {
  color: var(--rented);
}

.visible-num {
  color: #2563eb;
}

.stat-lbl {
  font-size: 9px;
  font-weight: 600;
  color: #a8a29e;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-divider {
  width: 1px;
  height: 26px;
  background: #e7e3e0;
}

/* Geo accuracy badge */
.geo-accuracy-badge {
  position: absolute;
  bottom: 90px;
  right: 14px;
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.geo-accuracy--excellent {
  background: #dcfce7;
  color: var(--available);
}

.geo-accuracy--good {
  background: #d1fae5;
  color: var(--available);
}

.geo-accuracy--fair {
  background: #fef9c3;
  color: var(--maintenance);
}

.geo-accuracy--poor {
  background: #fee2e2;
  color: var(--rented);
}

/* Loading overlay */
.map-loading {
  position: absolute;
  inset: 0;
  background: rgba(250, 250, 249, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  z-index: 500;
  font-size: 14px;
  font-weight: 600;
  color: var(--brand);
}

/* ══════════════════════════════════════════
   PREVIEW CARD
══════════════════════════════════════════ */
.preview-card {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 400;
  width: 460px;
  max-width: calc(100% - 24px);
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03);
}

.preview-card__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #1a1c1e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-card__close:hover {
  background: #fff;
  transform: scale(1.1);
}

.preview-card__inner {
  display: flex;
  height: 140px;
}

.preview-card__img-section {
  width: 170px;
  min-width: 170px;
  height: 140px;
  position: relative;
  overflow: hidden;
}

.preview-card__img-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-card__img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.2), transparent);
}

.preview-card__status-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  backdrop-filter: blur(8px);
}

.preview-card__content {
  flex: 1;
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 0;
}

.preview-card__title {
  font-size: 16px;
  font-weight: 800;
  color: #1a1c1e;
  margin: 0;
  line-height: 1.2;
}

.preview-card__city {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #a8a29e;
  margin: 0;
  font-weight: 500;
}

.preview-card__features {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.preview-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.preview-price {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.preview-price span {
  font-size: 16px;
  font-weight: 800;
  color: var(--brand);
}

.preview-price small {
  font-size: 11px;
  color: #a8a29e;
  font-weight: 500;
}

.preview-cta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #4D2F24;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(77, 47, 36, 0.2);
  font-family: inherit;
}

.preview-cta:hover {
  transform: translateY(-2px);
  background: #3b251d;
  box-shadow: 0 6px 16px rgba(77, 47, 36, 0.3);
}

/* ══════════════════════════════════════════
   TRANSITIONS
══════════════════════════════════════════ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.32s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(24px);
}

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
@media (max-width: 768px) {
  .full-page-wrapper {
    padding-top: 65px;
  }

  .explorer-root {
    flex-direction: column;
    height: calc(100vh - 65px);
  }

  .sidebar {
    width: 100% !important;
    min-width: 100% !important;
    height: 42vh;
    /* Compact sidebar to let map breathe */
    flex: none;
  }

  .sidebar--collapsed {
    height: 0 !important;
  }

  .map-area {
    flex: 1;
    height: auto;
  }

  .preview-card {
    bottom: 14px;
    width: calc(100% - 24px);
  }

  .sidebar-open-btn {
    top: 14px;
    transform: none;
    left: 10px;
  }

  .geolocate-btn {
    bottom: 80px;
    right: 10px;
  }

  .map-stats-bar {
    top: 10px;
    right: 10px;
    padding: 6px 10px;
    gap: 8px;
    max-width: 80%;
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .full-page-wrapper {
    padding-top: 60px;
  }

  .explorer-root {
    height: calc(100vh - 60px);
  }
}

.sidebar {
  width: 360px;
  min-width: 360px;
  height: 100%;
}

/* ══════════════════════════════════════════
   MARKERS (VIBRANT CAPSULE DESIGN)
══════════════════════════════════════════ */
.vibrant-marker {
  position: relative;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  will-change: transform;
}

.vibrant-marker__wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 3px;
  border-radius: 40px;
  border: 2px solid white;
  width: 90px;
  height: 44px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vibrant-marker__photo {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid #fff;
  flex-shrink: 0;
  background: #f1f1f1;
}

.vibrant-marker__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vibrant-marker__content {
  flex: 1;
  padding: 0 10px 0 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.vibrant-marker__price {
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vibrant-marker__indicator {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.vibrant-marker__stem {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid white;
  margin-top: -1px;
}

/* States */
.vibrant-marker:hover {
  transform: translateY(-6px) scale(1.1);
  z-index: 2000 !important;
}

.vibrant-marker--selected {
  transform: translateY(-10px) scale(1.2);
  z-index: 2100 !important;
}

.vibrant-marker--selected .vibrant-marker__wrapper {
  background: var(--brand);
  border-color: var(--brand);
}

.vibrant-marker--selected .vibrant-marker__price {
  color: white;
}

.vibrant-marker--selected .vibrant-marker__stem {
  border-top-color: var(--brand);
}

.vibrant-marker--selected::after {
  content: '';
  position: absolute;
  top: 22px;
  left: 50%;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  border: 2px solid var(--accent-color);
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
  z-index: -1;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.6);
    opacity: 0.6;
  }

  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

/* ── Cluster Redesign ── */
.cluster-bubble {
  background: white;
  border: 3px solid var(--brand);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  color: var(--brand);
  position: relative;
  transition: all 0.2s ease;
}

.cluster-bubble:hover {
  transform: scale(1.15);
  background: var(--brand);
  color: white;
  box-shadow: 0 10px 25px rgba(77, 47, 36, 0.3);
}

.cluster-num {
  font-weight: 900;
  font-size: 16px;
  line-height: 1;
}

.cluster-price {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}
</style>

<!-- ══════════════════════════════════════════
     GLOBAL STYLES (REQUIRED FOR LEAFLET)
══════════════════════════════════════════ -->
<style>
/* ── Vibrant Capsule Markers ── */
.vibrant-marker {
  display: flex !important;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  cursor: pointer;
  will-change: transform;
}

.vibrant-marker__wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(12px);
  padding: 4px;
  border-radius: 50px;
  border: 1.5px solid white;
  width: 100px;
  height: 48px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.02);
  position: relative;
}

.vibrant-marker__photo {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  max-width: 40px !important;
  max-height: 40px !important;
  border-radius: 50% !important;
  overflow: hidden !important;
  border: 2px solid #fff !important;
  flex-shrink: 0 !important;
  background: #f8f9fa !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.vibrant-marker__photo img {
  width: 40px !important;
  height: 40px !important;
  object-fit: cover !important;
  display: block !important;
  border-radius: 50% !important;
}

.vibrant-marker__content {
  flex: 1;
  padding: 0 12px 0 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.vibrant-marker__price {
  font-size: 13px !important;
  font-weight: 800 !important;
  color: #1a1c1e !important;
  letter-spacing: -0.01em;
  white-space: nowrap;
  line-height: 1;
}

.vibrant-marker__indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.vibrant-marker__stem {
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 12px solid white;
  margin-top: -2px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.05));
}

.vibrant-marker:hover {
  transform: translateY(-8px) scale(1.1);
  z-index: 5000 !important;
}

.vibrant-marker--selected {
  transform: translateY(-12px) scale(1.2);
  z-index: 5100 !important;
}

.vibrant-marker--selected .vibrant-marker__wrapper {
  background: #4D2F24 !important;
  border-color: #4D2F24 !important;
  box-shadow: 0 12px 30px rgba(77, 47, 36, 0.4);
}

.vibrant-marker--selected .vibrant-marker__price {
  color: white !important;
}

.vibrant-marker--selected .vibrant-marker__indicator {
  border-color: #4D2F24 !important;
}

/* ── Clusters ── */
.cluster-bubble {
  background: white !important;
  border: 3px solid #4D2F24 !important;
  border-radius: 50%;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(77, 47, 36, 0.25);
  color: #4D2F24 !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.cluster-bubble:hover {
  transform: scale(1.18);
  background: #4D2F24 !important;
  color: white !important;
  box-shadow: 0 12px 30px rgba(77, 47, 36, 0.35);
}

.cluster-num {
  font-weight: 900 !important;
  font-size: 16px !important;
}

.cluster-price {
  font-size: 9px !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  margin-top: -2px;
}

/* ── User Location ── */
.user-location-marker {
  width: 28px;
  height: 28px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-loc-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: rgba(77, 47, 36, 0.2);
  animation: pulse-user 1.8s ease-out infinite;
}

@keyframes pulse-user {
  0% {
    transform: scale(0.5);
    opacity: 0.8;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.user-loc-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4D2F24 0%, #C8A97E 100%);
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(77, 47, 36, 0.5);
  z-index: 1;
}

/* ── Overrides & Controls ── */
.leaflet-control-zoom {
  border: none !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
  border-radius: 14px !important;
  overflow: hidden;
  margin-bottom: 30px !important;
  margin-right: 20px !important;
}

.leaflet-control-zoom a {
  background: white !important;
  color: #1a1c1e !important;
  width: 40px !important;
  height: 40px !important;
  line-height: 40px !important;
  font-weight: 800 !important;
  border: none !important;
}

.leaflet-control-zoom a:hover {
  background: #f8f9fa !important;
  color: #4D2F24 !important;
}

.leaflet-control-attribution {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(8px);
  font-size: 9px !important;
  border-radius: 8px 0 0 0 !important;
}
</style>