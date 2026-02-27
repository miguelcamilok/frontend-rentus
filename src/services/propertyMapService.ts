import api from './api';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export interface MapProperty {
  id: number;
  title: string;
  monthly_price: number;
  status: string;
  approval_status: string;
  visibility: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  num_bedrooms: string | number;
  num_bathrooms: string | number;
  area_m2: number;
  image_url: string | null;
  images?: { image_url: string; order: number; is_main: boolean }[];
  user?: { id: number; name: string; email: string; photo?: string };
}

export interface MapFilters {
  status?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
}

export interface PropertyCluster {
  lat: number;
  lng: number;
  count: number;
  properties: MapProperty[];
  avgPrice: number;
}

// ─────────────────────────────────────────────
// CACHÉ EN MEMORIA (TTL 2 minutos)
// ─────────────────────────────────────────────
let cachedProperties: MapProperty[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 2 * 60 * 1000;

// ─────────────────────────────────────────────
// CLUSTERING LADO CLIENTE
// ─────────────────────────────────────────────
export function clusterProperties(
  properties: MapProperty[],
  zoom: number
): PropertyCluster[] {
  const gridSize =
    zoom < 8 ? 4 :
      zoom < 10 ? 2 :
        zoom < 12 ? 0.8 :
          zoom < 13 ? 0.3 : 0;

  if (gridSize === 0) {
    return properties.map(p => ({
      lat: p.lat,
      lng: p.lng,
      count: 1,
      properties: [p],
      avgPrice: p.monthly_price
    }));
  }

  const grid: Record<string, PropertyCluster> = {};

  for (const p of properties) {
    const cellLat = Math.floor(p.lat / gridSize) * gridSize;
    const cellLng = Math.floor(p.lng / gridSize) * gridSize;
    const key = `${cellLat}:${cellLng}`;

    if (!grid[key]) {
      grid[key] = { lat: 0, lng: 0, count: 0, properties: [], avgPrice: 0 };
    }

    grid[key].properties.push(p);
    grid[key].count++;
    grid[key].lat += p.lat;
    grid[key].lng += p.lng;
    grid[key].avgPrice += p.monthly_price;
  }

  return Object.values(grid).map(c => ({
    lat: c.lat / c.count,
    lng: c.lng / c.count,
    count: c.count,
    properties: c.properties,
    avgPrice: c.avgPrice / c.count
  }));
}

// ─────────────────────────────────────────────
// FORMATEO DE PRECIO (COP)
// ─────────────────────────────────────────────
export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${Math.round(price / 1_000)}k`;
  return `$${price}`;
}

export function formatPriceFull(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// ─────────────────────────────────────────────
// SERVICIO PRINCIPAL
// ─────────────────────────────────────────────
export const propertyMapService = {

  /**
   * Obtiene todas las propiedades para el mapa.
   * ✅ No filtra por approval_status — igual que PropertyView.vue
   * Los filtros de ciudad/precio/estado se aplican en el cliente (computed).
   */
  async getAllForMap(filters: MapFilters = {}): Promise<MapProperty[]> {
    const hasFilters = Object.values(filters).some(
      v => v !== undefined && v !== ''
    );
    const now = Date.now();

    // Caché hit (solo cuando no hay filtros activos)
    if (!hasFilters && cachedProperties && (now - cacheTimestamp) < CACHE_TTL_MS) {
      console.log(`📦 Cache hit: ${cachedProperties.length} propiedades`);
      return cachedProperties;
    }

    // ✅ IGUAL que PropertyView.vue: sin approval_status ni visibility
    const params: Record<string, any> = {
      per_page: 500,
    };

    console.log('📡 Fetching properties from API...', params);

    const firstResponse = await api.get('/properties', { params });
    const { data: firstBatch, meta } = firstResponse.data;

    console.log(`📄 Página 1: ${firstBatch?.length} items, total páginas: ${meta?.last_page}`);

    let allItems = [...(firstBatch ?? [])];

    // Si hay más páginas, descargarlas en paralelo
    if (meta?.last_page > 1) {
      const pageNumbers = Array.from(
        { length: meta.last_page - 1 },
        (_, i) => i + 2
      );

      const restResponses = await Promise.all(
        pageNumbers.map(page =>
          api.get('/properties', { params: { ...params, page } })
        )
      );

      restResponses.forEach(r => allItems.push(...(r.data.data ?? [])));
    }

    console.log(`📦 Total items del API: ${allItems.length}`);

    // Parsear lat/lng (guardados como string en DB) y filtrar sin coordenadas
    const withCoords: MapProperty[] = allItems
      .map((p: any) => ({
        ...p,
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng),
        monthly_price: parseFloat(p.monthly_price),
        // Normalizar campos para búsqueda
        _normalizedCity: (p.city || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        _normalizedAddress: (p.address || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      }))
      .filter((p: MapProperty) =>
        !isNaN(p.lat) && !isNaN(p.lng) &&
        p.lat !== 0 && p.lng !== 0
      );

    const withoutCoords = allItems.length - withCoords.length;
    if (withoutCoords > 0) {
      console.warn(`⚠️ ${withoutCoords} propiedades descartadas por no tener coordenadas válidas`);
    }

    console.log(`✅ ${withCoords.length} propiedades con coordenadas cargadas exitosamente`);

    if (withCoords.length === 0) {
      console.error('❌ No se cargaron propiedades con coordenadas. Verifica la base de datos.');
    }

    // Cachear solo sin filtros
    if (!hasFilters) {
      cachedProperties = withCoords;
      cacheTimestamp = now;
    }

    return withCoords;
  },

  clearCache() {
    cachedProperties = null;
    cacheTimestamp = 0;
  }
};