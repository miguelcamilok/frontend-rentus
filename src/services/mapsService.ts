// mapsService.ts - Servicio de mapas con soporte para barrios y lugares

const GOOGLE_API_KEY = 'AIzaSyA8zYrIvk6sgeP0EHHPeq5TPfTOheAregM'

// ============================================================
// Barrios colombianos locales por ciudad (para búsqueda offline)
// ============================================================
const NEIGHBORHOODS_BY_CITY: Record<string, Array<{ name: string; lat: number; lng: number }>> = {
  'popayán': [
    { name: 'Centro Histórico', lat: 2.4413, lng: -76.6053 },
    { name: 'El Bolívar', lat: 2.4412, lng: -76.6089 },
    { name: 'La Esmeralda', lat: 2.4562, lng: -76.6203 },
    { name: 'Pandiguando', lat: 2.4478, lng: -76.6234 },
    { name: 'Alfonso López', lat: 2.4389, lng: -76.6312 },
    { name: 'La Paz', lat: 2.4501, lng: -76.6178 },
    { name: 'Lomas de Granada', lat: 2.4523, lng: -76.6145 },
    { name: 'El Recuerdo', lat: 2.4456, lng: -76.6267 },
    { name: 'Camilo Torres', lat: 2.4434, lng: -76.6198 },
    { name: 'Las Palmas', lat: 2.4478, lng: -76.6101 },
    { name: 'El Portal', lat: 2.4534, lng: -76.6089 },
    { name: 'Las Américas', lat: 2.4398, lng: -76.6156 },
    { name: 'El Cadillal', lat: 2.4567, lng: -76.6312 },
    { name: 'Antonio Nariño', lat: 2.4345, lng: -76.6234 },
    { name: 'Los Comuneros', lat: 2.4612, lng: -76.6189 },
    { name: 'Urbanización Valencia', lat: 2.4489, lng: -76.6167 },
    { name: 'Santa Helena', lat: 2.4423, lng: -76.6278 },
    { name: 'El Uvo', lat: 2.4378, lng: -76.6345 },
    { name: 'Seminario', lat: 2.4401, lng: -76.6123 },
    { name: 'La Pamba', lat: 2.4467, lng: -76.6056 },
  ],
  'bogotá': [
    { name: 'Chapinero', lat: 4.6486, lng: -74.0613 },
    { name: 'Usaquén', lat: 4.7010, lng: -74.0317 },
    { name: 'Suba', lat: 4.7423, lng: -74.0814 },
    { name: 'Engativá', lat: 4.7041, lng: -74.1122 },
    { name: 'Kennedy', lat: 4.6278, lng: -74.1345 },
    { name: 'Bosa', lat: 4.5978, lng: -74.1867 },
    { name: 'Fontibón', lat: 4.6734, lng: -74.1198 },
    { name: 'Puente Aranda', lat: 4.6201, lng: -74.1045 },
    { name: 'Teusaquillo', lat: 4.6512, lng: -74.0923 },
    { name: 'Los Mártires', lat: 4.6089, lng: -74.0823 },
    { name: 'Santa Fe', lat: 4.6012, lng: -74.0645 },
    { name: 'La Candelaria', lat: 4.5978, lng: -74.0756 },
  ],
  'medellín': [
    { name: 'El Poblado', lat: 6.2006, lng: -75.5661 },
    { name: 'Laureles', lat: 6.2367, lng: -75.5923 },
    { name: 'Envigado', lat: 6.1751, lng: -75.5920 },
    { name: 'Belén', lat: 6.2301, lng: -75.6042 },
    { name: 'Robledo', lat: 6.2934, lng: -75.5889 },
    { name: 'Aranjuez', lat: 6.2678, lng: -75.5534 },
    { name: 'Manrique', lat: 6.2712, lng: -75.5423 },
    { name: 'Buenos Aires', lat: 6.2389, lng: -75.5567 },
    { name: 'La América', lat: 6.2423, lng: -75.5812 },
    { name: 'Castilla', lat: 6.2834, lng: -75.5712 },
  ],
  'cali': [
    { name: 'El Peñón', lat: 3.4389, lng: -76.5423 },
    { name: 'Ciudad Jardín', lat: 3.3978, lng: -76.5445 },
    { name: 'Granada', lat: 3.4456, lng: -76.5367 },
    { name: 'San Fernando', lat: 3.4201, lng: -76.5534 },
    { name: 'Aguablanca', lat: 3.3834, lng: -76.4945 },
    { name: 'Siloé', lat: 3.4378, lng: -76.5612 },
    { name: 'Chipichape', lat: 3.4812, lng: -76.5178 },
    { name: 'Los Álamos', lat: 3.4623, lng: -76.5312 },
  ],
}

// ============================================================
// Función de búsqueda local de barrios
// ============================================================
function searchLocalNeighborhoods(
  query: string,
  city?: string
): Array<{ description: string; lat: number; lng: number; type: 'neighborhood' }> {
  const q = query.toLowerCase()
  const results: Array<{ description: string; lat: number; lng: number; type: 'neighborhood' }> = []

  const cityKey = city ? normalizeCity(city) : null

  // Si hay ciudad específica, buscar primero ahí
  if (cityKey && NEIGHBORHOODS_BY_CITY[cityKey]) {
    NEIGHBORHOODS_BY_CITY[cityKey]
      .filter(n => n.name.toLowerCase().includes(q))
      .forEach(n => results.push({
        description: `${n.name}, ${city}`,
        lat: n.lat,
        lng: n.lng,
        type: 'neighborhood'
      }))
  }

  // Si no hay suficientes resultados, buscar en todas las ciudades
  if (results.length < 3) {
    Object.entries(NEIGHBORHOODS_BY_CITY).forEach(([cityNorm, neighborhoods]) => {
      if (cityNorm === cityKey) return // ya se buscó
      neighborhoods
        .filter(n => n.name.toLowerCase().includes(q))
        .slice(0, 2)
        .forEach(n => results.push({
          description: `${n.name}, ${capitalize(cityNorm)}`,
          lat: n.lat,
          lng: n.lng,
          type: 'neighborhood'
        }))
    })
  }

  return results.slice(0, 5)
}

function normalizeCity(city: string): string {
  return city.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u')
    .trim()
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ============================================================
// Búsqueda via Nominatim (OpenStreetMap) - sin CORS issues
// ============================================================
async function searchNominatim(
  query: string,
  city?: string
): Promise<Array<{ description: string; lat: number; lng: number; type: 'place' | 'neighborhood' }>> {
  try {
    const fullQuery = city ? `${query} ${city} Colombia` : `${query} Colombia`
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(fullQuery)}&format=json&limit=5&countrycodes=co&addressdetails=1&accept-language=es`

    const response = await fetch(url, {
      headers: { 'Accept-Language': 'es' }
    })

    if (!response.ok) return []

    const data = await response.json()

    return data.map((r: any) => {
      const addr = r.address || {}
      const isNeighborhood = !!(addr.neighbourhood || addr.suburb || addr.quarter)
      const placeName = addr.neighbourhood || addr.suburb || addr.quarter ||
        addr.road || addr.amenity || r.display_name.split(',')[0]
      const cityPart = addr.city || addr.town || addr.municipality || addr.county || ''
      const description = cityPart ? `${placeName}, ${cityPart}` : placeName

      return {
        description,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        type: (isNeighborhood ? 'neighborhood' : 'place') as 'place' | 'neighborhood'
      }
    })
  } catch (err) {
    console.warn('Error en Nominatim:', err)
    return []
  }
}

// ============================================================
// Búsqueda via Google Places (con proxy CORS)
// ============================================================
async function searchGooglePlaces(
  query: string
): Promise<Array<{ description: string; place_id: string }>> {
  try {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
      `input=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&language=es&components=country:co`

    const response = await fetch(proxyUrl + apiUrl)
    if (!response.ok) return []

    const data = await response.json()
    return data.predictions || []
  } catch {
    return []
  }
}

// ============================================================
// EXPORT PRINCIPAL: mapsService
// ============================================================
export interface SearchResult {
  description: string
  lat?: number
  lng?: number
  place_id?: string
  type: 'place' | 'neighborhood'
}

export const mapsService = {
  /**
   * Búsqueda combinada: barrios locales + Nominatim + Google Places
   * @param query - texto a buscar
   * @param city - ciudad para contextualizar la búsqueda
   */
  searchPlaces: async (query: string, city?: string): Promise<SearchResult[]> => {
    if (query.length < 2) return []

    const results: SearchResult[] = []

    // 1. Barrios locales (instantáneo, sin red)
    const localNeighborhoods = searchLocalNeighborhoods(query, city)
    localNeighborhoods.forEach(n => results.push({
      description: n.description,
      lat: n.lat,
      lng: n.lng,
      type: 'neighborhood'
    }))

    // 2. Nominatim (OpenStreetMap, sin CORS)
    try {
      const nominatimResults = await searchNominatim(query, city)
      nominatimResults.forEach(r => {
        // Evitar duplicados
        if (!results.find(existing =>
          existing.description.toLowerCase() === r.description.toLowerCase()
        )) {
          results.push({ ...r, place_id: undefined })
        }
      })
    } catch { /* ignorar */ }

    return results.slice(0, 8)
  },

  /**
   * Autocompletado de ciudades (compatible con versión anterior)
   */
  autocompletePlace: async (input: string): Promise<Array<{ place_id: string; description: string }>> => {
    if (input.length < 2) return getFallbackSuggestions(input)

    try {
      const googleResults = await searchGooglePlaces(input)
      if (googleResults.length > 0) return googleResults
    } catch { /* ignorar */ }

    return getFallbackSuggestions(input)
  },

  /**
   * Geocodificación: dirección → coordenadas (usa Nominatim)
   */
  geocode: async (address: string, city?: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const query = city ? `${address}, ${city}, Colombia` : `${address}, Colombia`
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=co`
      const res = await fetch(url)
      if (!res.ok) return null
      const data = await res.json()
      if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    } catch { /* ignorar */ }
    return null
  },

  /**
   * Obtener barrios de una ciudad específica
   */
  getNeighborhoods: (city: string): Array<{ name: string; lat: number; lng: number }> => {
    const cityKey = normalizeCity(city)
    return NEIGHBORHOODS_BY_CITY[cityKey] || []
  }
}

// ============================================================
// Fallback para ciudades (compatibilidad anterior)
// ============================================================
function getFallbackSuggestions(input: string): Array<{ place_id: string; description: string }> {
  const allCities = [
    { place_id: '1', description: 'Popayán, Cauca, Colombia' },
    { place_id: '2', description: 'Medellín, Antioquia, Colombia' },
    { place_id: '3', description: 'Bogotá, Colombia' },
    { place_id: '4', description: 'Cali, Valle del Cauca, Colombia' },
    { place_id: '5', description: 'Barranquilla, Atlántico, Colombia' },
    { place_id: '6', description: 'Cartagena, Bolívar, Colombia' },
    { place_id: '7', description: 'Cúcuta, Norte de Santander, Colombia' },
    { place_id: '8', description: 'Bucaramanga, Santander, Colombia' },
    { place_id: '9', description: 'Pereira, Risaralda, Colombia' },
    { place_id: '10', description: 'Santa Marta, Magdalena, Colombia' },
    { place_id: '11', description: 'Manizales, Caldas, Colombia' },
    { place_id: '12', description: 'Buenos Aires, Argentina' },
    { place_id: '13', description: 'Ciudad de México, México' },
    { place_id: '14', description: 'Lima, Perú' },
    { place_id: '15', description: 'Santiago, Chile' },
  ]
  return allCities.filter(c =>
    c.description.toLowerCase().includes(input.toLowerCase())
  )
}