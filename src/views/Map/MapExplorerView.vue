<template>
  <div class="explorer-root">

    <!-- ══════════════════════════════════════
         SIDEBAR
    ══════════════════════════════════════ -->
    <aside class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }">

      <!-- Header -->
      <div class="sidebar-header">
        <div class="sidebar-header__top">
          <button class="back-btn" @click="goBack" title="Volver">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="sidebar-header__titles">
            <h1 class="sidebar-title">Explorar propiedades</h1>
            <span class="sidebar-count">
              <template v-if="isLoading">Cargando…</template>
              <template v-else>
                {{ filteredProperties.length }}
                {{ filteredProperties.length === 1 ? 'propiedad' : 'propiedades' }}
                <span v-if="hasActiveFilters" class="active-filter-dot" title="Filtros activos"></span>
              </template>
            </span>
          </div>
          <!-- Toggle sidebar -->
          <button class="collapse-btn" @click="sidebarCollapsed = true" title="Colapsar panel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-panel">
        <div class="filter-group">
          <label class="filter-label">Ciudad</label>
          <input
            v-model="filters.city"
            type="text"
            placeholder="Ej: Popayán, Bogotá…"
            class="filter-input"
            @input="debouncedApplyFilters"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Estado</label>
          <select v-model="filters.status" class="filter-select" @change="applyFilters">
            <option value="">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="rented">Arrendada</option>
            <option value="maintenance">En mantenimiento</option>
          </select>
        </div>

        <div class="filter-group filter-group--row">
          <div class="filter-sub">
            <label class="filter-label">Precio mín.</label>
            <input
              v-model.number="filters.min_price"
              type="number"
              placeholder="$ 0"
              class="filter-input filter-input--price"
              min="0"
              @input="debouncedApplyFilters"
            />
          </div>
          <div class="filter-sub">
            <label class="filter-label">Precio máx.</label>
            <input
              v-model.number="filters.max_price"
              type="number"
              placeholder="Sin límite"
              class="filter-input filter-input--price"
              min="0"
              @input="debouncedApplyFilters"
            />
          </div>
        </div>

        <button
          v-if="hasActiveFilters"
          class="clear-filters-btn"
          @click="clearFilters"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
          Limpiar filtros
        </button>
      </div>

      <!-- Property list -->
      <div class="property-list">
        <div v-if="isLoading" class="list-state list-state--loading">
          <div class="list-spinner"></div>
          <span>Cargando propiedades…</span>
        </div>

        <div v-else-if="filteredProperties.length === 0" class="list-state list-state--empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <p>No hay propiedades<br>con esos filtros</p>
          <button class="clear-filters-btn" @click="clearFilters">Limpiar filtros</button>
        </div>

        <div v-else class="property-cards">
          <div
            v-for="property in filteredProperties"
            :key="property.id"
            class="property-card"
            :class="{ 'property-card--selected': selectedPropertyId === property.id }"
          >
            <!-- Área principal: selecciona en el mapa -->
            <div class="property-card__image" @click="selectProperty(property)">
              <img
                :src="getPropertyImage(property)"
                :alt="property.title"
                loading="lazy"
              />
              <span
                class="property-card__status"
                :class="`property-card__status--${property.status}`"
              >{{ statusLabel(property.status) }}</span>
            </div>

            <div class="property-card__info" @click="selectProperty(property)">
              <h3 class="property-card__title">{{ property.title }}</h3>
              <p class="property-card__city">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {{ property.city || property.address }}
              </p>
              <div class="property-card__meta">
                <span v-if="property.num_bedrooms" class="meta-chip">
                  🛏 {{ property.num_bedrooms }}
                </span>
                <span v-if="property.num_bathrooms" class="meta-chip">
                  🚿 {{ property.num_bathrooms }}
                </span>
                <span v-if="property.area_m2" class="meta-chip">
                  📐 {{ property.area_m2 }} m²
                </span>
              </div>
              <div class="property-card__footer-row">
                <div class="property-card__price">{{ formatPriceFull(property.monthly_price) }}/mes</div>
                <!-- Botón "Ver" que redirige directamente al detalle -->
                <button
                  class="property-card__detail-btn"
                  @click.stop="goToDetail(property.id)"
                  title="Ver propiedad"
                >
                  Ver
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
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

      <!-- ✅ FIX: Botón para abrir sidebar, ahora dentro del map-area con posición correcta -->
      <Transition name="fade">
        <button
          v-if="sidebarCollapsed"
          class="sidebar-open-btn"
          @click="sidebarCollapsed = false"
          title="Abrir panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M9 18l6-6-6-6"/>
          </svg>
          Panel
        </button>
      </Transition>

      <div ref="mapEl" class="map-canvas"></div>

      <!-- Loading overlay -->
      <Transition name="fade">
        <div v-if="isLoading" class="map-loading">
          <div class="map-loading__spinner"></div>
          <span>Cargando propiedades…</span>
        </div>
      </Transition>

      <!-- Map controls info -->
      <div class="map-hint" v-if="!isLoading && filteredProperties.length > 0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>
        {{ visibleCount }} visible{{ visibleCount !== 1 ? 's' : '' }} en esta zona
      </div>

      <!-- Debug info (quitar en producción) -->
      <div v-if="!isLoading" class="debug-info">
        Total: {{ allProperties.length }} | Filtradas: {{ filteredProperties.length }} | Con coords: {{ propertiesWithCoords }}
      </div>

      <!-- ══════ PROPERTY PREVIEW CARD (bottom of map) ══════ -->
      <Transition name="slide-up">
        <div v-if="selectedProperty" class="preview-card">
          <button class="preview-card__close" @click="closePreview">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div class="preview-card__inner">
            <div class="preview-card__image">
              <img
                :src="getPropertyImage(selectedProperty)"
                :alt="selectedProperty.title"
              />
            </div>

            <div class="preview-card__content">
              <span
                class="preview-card__status"
                :class="`preview-card__status--${selectedProperty.status}`"
              >{{ statusLabel(selectedProperty.status) }}</span>
              <h3 class="preview-card__title">{{ selectedProperty.title }}</h3>
              <p class="preview-card__city">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {{ selectedProperty.city || selectedProperty.address }}
              </p>

              <div class="preview-card__meta">
                <span v-if="selectedProperty.num_bedrooms">🛏 {{ selectedProperty.num_bedrooms }} hab.</span>
                <span v-if="selectedProperty.num_bathrooms">🚿 {{ selectedProperty.num_bathrooms }} baños</span>
                <span v-if="selectedProperty.area_m2">📐 {{ selectedProperty.area_m2 }} m²</span>
              </div>

              <div class="preview-card__footer">
                <div class="preview-card__price">{{ formatPriceFull(selectedProperty.monthly_price) }}<small>/mes</small></div>
                <button class="preview-card__cta" @click="goToDetail(selectedProperty.id)">
                  Ver detalle
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

  </div>
</template>

<script setup lang="ts">
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  propertyMapService,
  clusterProperties,
  formatPriceShort,
  formatPriceFull,
  type MapProperty
} from '../../services/propertyMapService';
import { getPropertyImage as getPropertyImageUtil } from '../../utils/propertyUtils';

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────
const COLOMBIA_CENTER = { lat: 2.4448, lng: -76.6147 };
const DEFAULT_ZOOM = 15;
const DEBOUNCE_DELAY = 400;
const DEFAULT_IMAGE = '/img/default.webp'; // Fallback image

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

const filters = ref({
  city: '',
  status: '',
  min_price: undefined as number | undefined,
  max_price: undefined as number | undefined
});

// ──────────────────────────────────────────────
// LEAFLET INSTANCES
// ──────────────────────────────────────────────
let map: L.Map | null = null;
let markersLayerGroup: L.LayerGroup | null = null;
const activeMarkers = new Map<string, L.Marker | L.CircleMarker>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// ──────────────────────────────────────────────
// COMPUTED
// ──────────────────────────────────────────────
const filteredProperties = computed<MapProperty[]>(() => {
  return allProperties.value.filter(p => {
    if (filters.value.city && !p.city?.toLowerCase().includes(filters.value.city.toLowerCase())) {
      return false;
    }
    if (filters.value.status && p.status !== filters.value.status) return false;
    if (filters.value.min_price !== undefined && p.monthly_price < filters.value.min_price) return false;
    if (filters.value.max_price !== undefined && p.monthly_price > filters.value.max_price) return false;
    return true;
  });
});

const selectedProperty = computed<MapProperty | null>(() =>
  selectedPropertyId.value !== null
    ? allProperties.value.find(p => p.id === selectedPropertyId.value) ?? null
    : null
);

const hasActiveFilters = computed(() =>
  !!(filters.value.city || filters.value.status || filters.value.min_price !== undefined || filters.value.max_price !== undefined)
);

// ✅ DEBUG: contar propiedades con coordenadas válidas
const propertiesWithCoords = computed(() =>
  allProperties.value.filter(p => !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0 && p.lng !== 0).length
);

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function getPropertyImage(property: MapProperty): string {
  return getPropertyImageUtil(property, DEFAULT_IMAGE);
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Disponible',
    rented: 'Arrendada',
    maintenance: 'Mantenimiento'
  };
  return labels[status] ?? status;
}

// ──────────────────────────────────────────────
// MARKER FACTORIES
// ──────────────────────────────────────────────
function createPriceMarker(property: MapProperty, isSelected: boolean): L.DivIcon {
  const price = formatPriceShort(property.monthly_price);
  const statusColors: Record<string, string> = {
    available: isSelected ? '#0f172a' : '#1e40af',
    rented: '#6b7280',
    maintenance: '#b45309'
  };
  const bg = statusColors[property.status] ?? '#1e40af';

  // SVG de casa inline
  const houseIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;opacity:0.9">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>`;

  return L.divIcon({
    className: '',
    html: `<div class="price-marker ${isSelected ? 'price-marker--selected' : ''}" style="background:${bg}">
             ${houseIcon}
             <span>${price}</span>
           </div>`,
    iconAnchor: [40, 18],
    iconSize: [80, 34]
  });
}

function createClusterMarker(count: number, avgPrice: number): L.DivIcon {
  const size = count > 100 ? 52 : count > 20 ? 44 : 36;
  const price = formatPriceShort(avgPrice);
  return L.divIcon({
    className: '',
    html: `<div class="cluster-marker" style="width:${size}px;height:${size}px;line-height:${size}px">
             <span class="cluster-count">${count}</span>
             <span class="cluster-avg">${price}</span>
           </div>`,
    iconAnchor: [size / 2, size / 2],
    iconSize: [size, size]
  });
}

// ──────────────────────────────────────────────
// ✅ FIX: Renderizar TODOS los marcadores sin restricción de viewport
// cuando el zoom es bajo (vista de Colombia completa)
// ──────────────────────────────────────────────
function renderMarkersForCurrentView() {
  if (!map || !markersLayerGroup) return;

  const zoom = map.getZoom();
  const bounds = map.getBounds();

  // ✅ A zoom bajo, renderizar TODAS las propiedades filtradas (sin filtro de viewport)
  // A zoom alto, solo las del viewport + padding para performance
  let inViewport: MapProperty[];
  if (zoom <= 8) {
    // Vista amplia: mostrar todo
    inViewport = filteredProperties.value;
  } else {
    const extendedBounds = bounds.pad(0.3);
    inViewport = filteredProperties.value.filter(p =>
      extendedBounds.contains(L.latLng(p.lat, p.lng))
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
      if (isSingle && property) {
        const existingMarker = activeMarkers.get(key) as L.Marker;
        const isSelected = selectedPropertyId.value === property.id;
        existingMarker.setIcon(createPriceMarker(property, isSelected));
      }
      continue;
    }

    if (isSingle && property) {
      const isSelected = selectedPropertyId.value === property.id;
      const marker = L.marker([cluster.lat, cluster.lng], {
        icon: createPriceMarker(property, isSelected),
        zIndexOffset: isSelected ? 1000 : 0
      });

      marker.on('click', () => selectProperty(property));
      marker.addTo(markersLayerGroup!);
      activeMarkers.set(key, marker);

    } else {
      const marker = L.marker([cluster.lat, cluster.lng], {
        icon: createClusterMarker(cluster.count, cluster.avgPrice)
      });

      marker.on('click', () => {
        const currentZoom = map!.getZoom();
        map!.flyTo([cluster.lat, cluster.lng], Math.min(currentZoom + 3, 16), { duration: 0.8 });
      });

      marker.addTo(markersLayerGroup!);
      activeMarkers.set(key, marker);
    }
  }

  // Eliminar marcadores fuera de vista
  for (const [key, marker] of activeMarkers.entries()) {
    if (!newKeys.has(key)) {
      markersLayerGroup!.removeLayer(marker);
      activeMarkers.delete(key);
    }
  }
}

// ──────────────────────────────────────────────
// SELECCIÓN DE PROPIEDAD
// ──────────────────────────────────────────────
function selectProperty(property: MapProperty) {
  const previousId = selectedPropertyId.value;
  selectedPropertyId.value = property.id;

  if (map) {
    const currentZoom = map.getZoom();
    const targetZoom = Math.max(currentZoom, 15);
    map.flyTo([property.lat, property.lng], targetZoom, { duration: 0.8 });
  }

  if (previousId !== null) {
    const prevKey = `prop-${previousId}`;
    const prevMarker = activeMarkers.get(prevKey) as L.Marker | undefined;
    const prevProp = allProperties.value.find(p => p.id === previousId);
    if (prevMarker && prevProp) {
      prevMarker.setIcon(createPriceMarker(prevProp, false));
      prevMarker.setZIndexOffset(0);
    }
  }

  const newKey = `prop-${property.id}`;
  const newMarker = activeMarkers.get(newKey) as L.Marker | undefined;
  if (newMarker) {
    newMarker.setIcon(createPriceMarker(property, true));
    newMarker.setZIndexOffset(1000);
  }
}

function closePreview() {
  if (selectedPropertyId.value !== null) {
    const key = `prop-${selectedPropertyId.value}`;
    const marker = activeMarkers.get(key) as L.Marker | undefined;
    const prop = allProperties.value.find(p => p.id === selectedPropertyId.value);
    if (marker && prop) {
      marker.setIcon(createPriceMarker(prop, false));
      marker.setZIndexOffset(0);
    }
  }
  selectedPropertyId.value = null;
}

// ──────────────────────────────────────────────
// NAVEGACIÓN
// ──────────────────────────────────────────────
function goToDetail(propertyId: number) {
  if (!map) return;
  const center = map.getCenter();
  const zoom = map.getZoom();

  router.push({
    name: 'PropertyDetail',
    params: { id: propertyId },
    query: {
      fromMap: '1',
      mapLat: center.lat.toFixed(6),
      mapLng: center.lng.toFixed(6),
      mapZoom: zoom.toString()
    }
  });
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'home' });
  }
}

// ──────────────────────────────────────────────
// FILTROS
// ──────────────────────────────────────────────
function applyFilters() {
  if (markersLayerGroup) {
    markersLayerGroup.clearLayers();
    activeMarkers.clear();
  }
  selectedPropertyId.value = null;
  renderMarkersForCurrentView();
}

function debouncedApplyFilters() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilters, DEBOUNCE_DELAY);
}

function clearFilters() {
  filters.value = { city: '', status: '', min_price: undefined, max_price: undefined };
  applyFilters();
}

// ──────────────────────────────────────────────
// MAP INITIALIZATION
// ──────────────────────────────────────────────
async function initMap() {
  if (!mapEl.value) return;

  const savedLat = route.query.mapLat ? parseFloat(route.query.mapLat as string) : null;
  const savedLng = route.query.mapLng ? parseFloat(route.query.mapLng as string) : null;
  const savedZoom = route.query.mapZoom ? parseInt(route.query.mapZoom as string) : null;

  const initialCenter = (savedLat && savedLng && !isNaN(savedLat) && !isNaN(savedLng))
    ? { lat: savedLat, lng: savedLng }
    : COLOMBIA_CENTER;
  const initialZoom = (savedZoom && !isNaN(savedZoom)) ? savedZoom : DEFAULT_ZOOM;

  map = L.map(mapEl.value, {
    center: [initialCenter.lat, initialCenter.lng],
    zoom: initialZoom,
    zoomControl: true,
    preferCanvas: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
  }).addTo(map);

  markersLayerGroup = L.layerGroup().addTo(map);

  let mapMoveTimer: ReturnType<typeof setTimeout> | null = null;
  const onMapChange = () => {
    if (mapMoveTimer) clearTimeout(mapMoveTimer);
    mapMoveTimer = setTimeout(renderMarkersForCurrentView, 200);
  };

  map.on('moveend', onMapChange);
  map.on('zoomend', onMapChange);

  map.on('click', (e) => {
    const target = e.originalEvent.target as HTMLElement;
    if (!target.closest('.price-marker') && !target.closest('.cluster-marker')) {
      closePreview();
    }
  });
}

// ──────────────────────────────────────────────
// ✅ FIX: DATA LOADING — esperar a que el mapa esté listo
// ──────────────────────────────────────────────
async function loadProperties() {
  try {
    isLoading.value = true;
    console.log('📡 Cargando propiedades del mapa...');

    allProperties.value = await propertyMapService.getAllForMap();

    console.log(`✅ ${allProperties.value.length} propiedades cargadas`);
    console.log('📍 Con coordenadas válidas:', allProperties.value.filter(p =>
      !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0 && p.lng !== 0
    ).length);

    // ✅ FIX: Esperar al siguiente tick + pequeño delay para que el mapa
    // haya terminado de renderizar y tenga bounds válidos
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    if (map) {
      // ✅ FIX: Invalidar el tamaño del mapa por si el contenedor cambió
      map.invalidateSize();
      
      // 📍 Lógica de ubicación por defecto dinámica (Ranking de ciudades)
      const hasSavedCoords = route.query.mapLat && route.query.mapLng;
      
      if (!hasSavedCoords && allProperties.value.length > 0) {
        // Calcular ciudad con más propiedades
        const cityCounts: Record<string, number> = {};
        allProperties.value.forEach(p => {
          if (p.city) {
            cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
          }
        });

        const sortedCities = Object.entries(cityCounts).sort((a,b) => b[1] - a[1]);
        const topCity = sortedCities[0]?.[0];

        if (topCity) {
          const firstProp = allProperties.value.find(p => p.city === topCity);
          if (firstProp) {
            console.log(`📍 Centrando mapa en ${topCity} (Ciudad con más propiedades: ${sortedCities[0][1]})`);
            map.setView([firstProp.lat, firstProp.lng], 13);
            selectProperty(firstProp);
          }
        }
      } else {
        renderMarkersForCurrentView();
      }
    }

  } catch (error) {
    console.error('❌ Error cargando propiedades para el mapa:', error);
  } finally {
    isLoading.value = false;
  }
}

// ──────────────────────────────────────────────
// WATCHERS
// ──────────────────────────────────────────────
watch(filteredProperties, () => {
  if (map && !isLoading.value) {
    if (markersLayerGroup) {
      markersLayerGroup.clearLayers();
      activeMarkers.clear();
    }
    renderMarkersForCurrentView();
  }
});

// ✅ FIX: Invalidar tamaño del mapa al expandir/colapsar sidebar
watch(sidebarCollapsed, async () => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 310)); // esperar transición CSS
  if (map) {
    map.invalidateSize();
  }
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
  if (map) {
    map.remove();
    map = null;
  }
  markersLayerGroup = null;
  activeMarkers.clear();
});
</script>

<style scoped>
/* ══════════════════════════════════════════
   LAYOUT ROOT
══════════════════════════════════════════ */
.explorer-root {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #f1f5f9;
}

/* ══════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════ */
.sidebar {
  width: 380px;
  min-width: 380px;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar--collapsed {
  width: 0;
  min-width: 0;
}

/* Header */
.sidebar-header {
  padding: 18px 20px 14px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.sidebar-header__top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-header__titles {
  flex: 1;
  min-width: 0;
}

.sidebar-title {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

.sidebar-count {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}

.active-filter-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.back-btn, .collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover, .collapse-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Filters */
.filters-panel {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group--row {
  flex-direction: row;
  gap: 10px;
}

.filter-sub {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-input,
.filter-select {
  padding: 8px 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  background: #f8fafc;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #fff;
}

.filter-input--price {
  font-size: 12px;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  width: fit-content;
  transition: all 0.2s;
  font-weight: 500;
}

.clear-filters-btn:hover {
  background: #fee2e2;
}

/* Property list */
.property-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.property-list::-webkit-scrollbar { width: 4px; }
.property-list::-webkit-scrollbar-track { background: transparent; }
.property-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

.list-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
}

.list-state--loading { gap: 14px; }

.list-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.property-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Property card */
.property-card {
  display: flex;
  gap: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.property-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12);
  transform: translateY(-1px);
}

.property-card--selected {
  border-color: #1d4ed8;
  box-shadow: 0 4px 16px rgba(29, 78, 216, 0.2);
}

.property-card__image {
  width: 90px;
  min-width: 90px;
  height: 90px;
  position: relative;
  background: #f1f5f9;
  flex-shrink: 0;
}

.property-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.property-card__image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.property-card__status {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.property-card__status--available   { background: #dcfce7; color: #166534; }
.property-card__status--rented      { background: #f1f5f9; color: #475569; }
.property-card__status--maintenance { background: #fef9c3; color: #713f12; }

.property-card__info {
  padding: 10px 12px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.property-card__title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.property-card__city {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.property-card__meta {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.meta-chip {
  font-size: 10px;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 1px 5px;
  border-radius: 4px;
}

.property-card__price {
  font-size: 13px;
  font-weight: 700;
  color: #1d4ed8;
}

.property-card__footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 4px;
}

.property-card__detail-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  white-space: nowrap;
}

.property-card__detail-btn:hover {
  background: #1e40af;
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

/* ✅ FIX: Sidebar open button — dentro de map-area con position absolute correcto */
.sidebar-open-btn {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 14px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.sidebar-open-btn:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background: #f8fafc;
}

/* Map loading overlay */
.map-loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 500;
  font-size: 14px;
  color: #475569;
}

.map-loading__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Map hint */
.map-hint {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 400;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Debug info */
.debug-info {
  position: absolute;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 400;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  pointer-events: none;
}

/* ══════════════════════════════════════════
   PROPERTY PREVIEW CARD
══════════════════════════════════════════ */
.preview-card {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 400;
  width: 480px;
  max-width: calc(100% - 32px);
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  border: 1px solid #e2e8f0;
}

.preview-card__close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.preview-card__close:hover { background: rgba(0, 0, 0, 0.6); }

.preview-card__inner {
  display: flex;
  height: 110px;
}

.preview-card__image {
  width: 140px;
  min-width: 140px;
  height: 110px;
  background: #f1f5f9;
  flex-shrink: 0;
  overflow: hidden;
}

.preview-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-card__image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-card__content {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.preview-card__status {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

.preview-card__status--available   { background: #dcfce7; color: #166534; }
.preview-card__status--rented      { background: #f1f5f9; color: #475569; }
.preview-card__status--maintenance { background: #fef9c3; color: #713f12; }

.preview-card__title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-card__city {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 3px;
}

.preview-card__meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
  flex-wrap: wrap;
}

.preview-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.preview-card__price {
  font-size: 15px;
  font-weight: 800;
  color: #1d4ed8;
  line-height: 1;
}

.preview-card__price small {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
}

.preview-card__cta {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  background: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.preview-card__cta:hover { background: #1e40af; }

/* ══════════════════════════════════════════
   TRANSITIONS
══════════════════════════════════════════ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
@media (max-width: 768px) {
  .explorer-root {
    flex-direction: column;
  }

  .sidebar {
    width: 100% !important;
    min-width: 100% !important;
    height: 45vh;
  }

  .sidebar--collapsed {
    height: 0 !important;
  }

  .map-area {
    height: 55vh;
  }

  .preview-card {
    bottom: 12px;
    width: calc(100% - 24px);
  }

  .sidebar-open-btn {
    top: 12px;
    transform: none;
  }
}
</style>

<!-- GLOBAL: estilos para marcadores Leaflet -->
<style>
.price-marker {
  height: 30px;
  min-width: 70px;
  max-width: 100px;
  padding: 0 10px;
  background: #1e40af;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Segoe UI', system-ui, sans-serif;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255,255,255,0.15);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  border: 2px solid rgba(255, 255, 255, 0.35);
  /* Cola del marcador */
  position: relative;
}

.price-marker::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 7px solid currentColor;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
}

/* Hereda el color de fondo para la cola */
.price-marker[style*="background:#1e40af"]::after { border-top-color: #1e40af; }
.price-marker[style*="background:#6b7280"]::after { border-top-color: #6b7280; }
.price-marker[style*="background:#b45309"]::after { border-top-color: #b45309; }
.price-marker[style*="background:#0f172a"]::after { border-top-color: #0f172a; }

.price-marker:hover {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

.price-marker--selected {
  background: #0f172a !important;
  transform: scale(1.12) translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  border-color: #60a5fa;
}

.cluster-marker {
  background: #ef4444;
  border: 3px solid #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;
  gap: 0;
  overflow: hidden;
}

.cluster-marker:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.5);
}

.cluster-count {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  font-family: 'Segoe UI', system-ui, sans-serif;
  line-height: 1;
}

.cluster-avg {
  font-size: 8px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  font-family: 'Segoe UI', system-ui, sans-serif;
  line-height: 1;
}

.map-canvas .leaflet-control-zoom {
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 10px !important;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.map-canvas .leaflet-control-zoom a {
  width: 36px !important;
  height: 36px !important;
  line-height: 36px !important;
  font-size: 18px !important;
  color: #0f172a !important;
}

.map-canvas .leaflet-control-attribution {
  font-size: 10px !important;
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(4px);
}
</style>