<script setup lang="ts">
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, onUnmounted, defineProps, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api"; // Importación por defecto
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Configurar iconos de Leaflet
L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const props = defineProps<{ id: number | string }>();
const router = useRouter();

const propertyId = Number(props.id);
const isLoading = ref(false);

let map: L.Map;
let userMarker: L.Marker | null = null;
let accuracyCircle: L.Circle | null = null;

// Coordenadas exactas de Popayán, Cauca, Colombia
const POPAYAN_CENTER = { lat: 2.4448, lng: -76.6147 };
const GOOD_ACCURACY = 100; // metros
const MAX_ACCEPTABLE_ACCURACY = 5000; // 5km - rechazar si es peor

// Validar que las coordenadas estén en Colombia (aproximadamente)
function isInColombia(lat: number, lng: number): boolean {
  // Colombia está aproximadamente entre:
  // Latitud: -4° a 13° Norte
  // Longitud: -79° a -66° Oeste
  return lat >= -5 && lat <= 14 && lng >= -80 && lng <= -65;
}

// Función para guardar la ubicación
async function savePropertyPoint(propId: number, lat: number, lng: number) {
  try {
    isLoading.value = true;
    
    console.log(`📤 Guardando ubicación - ID: ${propId}, Lat: ${lat}, Lng: ${lng}`);
    
    // Verificar que hay token
    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ No estás autenticado. Por favor inicia sesión.');
      throw new Error('No token found');
    }
    
    console.log(`🔑 Token presente: ${token.substring(0, 20)}...`);
    
    // Usar el endpoint específico para guardar puntos
    const response = await api.post(`/properties/${propId}/point`, { 
      lat: lat, 
      lng: lng 
    });
    
    console.log(`✅ Respuesta completa del servidor:`, response);
    console.log(`✅ Data de respuesta:`, response.data);
    console.log(`✓ Ubicación guardada exitosamente`);
    
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("❌ Error completo guardando ubicación:", error);
    console.error("❌ Respuesta del error:", error.response);
    console.error("❌ Data del error:", error.response?.data);
    console.error("❌ Status:", error.response?.status);
    console.error("❌ Headers:", error.response?.headers);
    
    // Mensajes específicos por código de error
    let errorMsg = "Error desconocido";
    
    if (error.response?.status === 403) {
      errorMsg = "No tienes permiso para actualizar esta propiedad.\nSolo el dueño puede modificar la ubicación.";
    } else if (error.response?.status === 401) {
      errorMsg = "Tu sesión expiró. Por favor inicia sesión nuevamente.";
    } else if (error.response?.status === 404) {
      errorMsg = "Propiedad no encontrada.";
    } else if (error.response?.status === 422) {
      errorMsg = `Error de validación:\n${JSON.stringify(error.response?.data?.errors || error.response?.data?.message)}`;
    } else {
      errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
    }
    
    alert(`❌ Error al guardar ubicación:\n\n${errorMsg}`);
    
    throw error;
  } finally {
    isLoading.value = false;
  }
}

// Función para obtener una propiedad
async function getPropertyById(propId: number) {
  try {
    return await api.get(`/properties/${propId}`);
  } catch (error) {
    console.error("Error obteniendo propiedad:", error);
    throw error;
  }
}

function placeMarker(lat: number, lng: number, accuracy: number) {
  // Validar coordenadas
  if (!isInColombia(lat, lng)) {
    console.warn(`⚠️ Coordenadas fuera de Colombia detectadas: ${lat}, ${lng}`);
    alert("⚠️ Las coordenadas obtenidas no están en Colombia.\nUsando centro de Popayán.");
    lat = POPAYAN_CENTER.lat;
    lng = POPAYAN_CENTER.lng;
    accuracy = 999;
  }

  // Rechazar si la precisión es demasiado mala (más de 5km)
  if (accuracy > MAX_ACCEPTABLE_ACCURACY) {
    console.warn(`⚠️ Precisión GPS muy mala: ${Math.round(accuracy)}m`);
    alert(`⚠️ La precisión GPS es muy mala (${Math.round(accuracy/1000)}km).\n\nPor favor:\n• Ve a un lugar abierto\n• Activa el GPS de alta precisión\n• Asegúrate de tener buena señal\n\nUsaremos el centro de Popayán como referencia.`);
    lat = POPAYAN_CENTER.lat;
    lng = POPAYAN_CENTER.lng;
    accuracy = 999;
  }

  // Remover marcadores previos
  if (userMarker) map.removeLayer(userMarker);
  if (accuracyCircle) map.removeLayer(accuracyCircle);

  // Crear marcador draggable
  userMarker = L.marker([lat, lng], { draggable: true }).addTo(map);

  // Círculo de precisión
  accuracyCircle = L.circle([lat, lng], {
    radius: accuracy,
    color: "#3498db",
    fillColor: "#3498db",
    fillOpacity: 0.15,
    weight: 2
  }).addTo(map);

  // Centrar mapa con animación
  map.flyTo([lat, lng], 18, {
    duration: 1.5
  });

  const isAccurate = accuracy <= GOOD_ACCURACY;

  const popupHtml = `
    <div style="min-width: 250px; font-family: Arial, sans-serif;">
      <div style="border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-bottom: 10px;">
        <strong style="color: #2c3e50; font-size: 14px;">📍 Ubicación de la Propiedad</strong>
      </div>
      
      <div style="margin-bottom: 10px;">
        <strong style="color: #7f8c8d;">Precisión GPS:</strong> 
        <span style="font-weight: 700; color: ${isAccurate ? '#27ae60' : accuracy > 1000 ? '#e74c3c' : '#f39c12'};">
          ${accuracy > 1000 ? `${(accuracy/1000).toFixed(1)} km` : `${Math.round(accuracy)} m`}
        </span>
      </div>

      <div style="background: #ecf0f1; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 12px;">
        <strong>Lat:</strong> ${lat.toFixed(6)}<br>
        <strong>Lng:</strong> ${lng.toFixed(6)}
      </div>
      
      ${
        !isAccurate
          ? `<div style="background: ${accuracy > 1000 ? '#f8d7da' : '#fff3cd'}; color: ${accuracy > 1000 ? '#721c24' : '#856404'}; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 12px;">
              ${accuracy > 1000 ? '❌ Precisión muy mala' : '⚠️ Precisión baja'} - Arrastra el marcador manualmente
             </div>`
          : `<div style="background: #d4edda; color: #155724; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 12px;">
              ✓ Buena precisión GPS
             </div>`
      }

      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button id="savePointBtn" style="
          flex: 1;
          background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        ">
          💾 Guardar
        </button>
        <button id="retryPointBtn" style="
          flex: 1;
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        ">
          🔄 Recentrar
        </button>
      </div>
    </div>
  `;

  userMarker.bindPopup(popupHtml, { maxWidth: 350 }).openPopup();

  // Event listeners
  userMarker.on("popupopen", () => {
    const saveBtn = document.getElementById("savePointBtn");
    const retryBtn = document.getElementById("retryPointBtn");

    if (saveBtn) {
      L.DomEvent.addListener(saveBtn, "click", async () => {
        const pos = userMarker!.getLatLng();
        
        if (!isInColombia(pos.lat, pos.lng)) {
          alert("❌ Error: La ubicación debe estar en Colombia.\nPor favor, ajusta el marcador.");
          return;
        }

        try {
          await savePropertyPoint(propertyId, pos.lat, pos.lng);
          userMarker!.bindPopup(`
            <div style="text-align: center; padding: 15px; font-family: Arial, sans-serif;">
              <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
              <strong style="color: #27ae60; font-size: 16px;">¡Ubicación Guardada!</strong>
              <div style="margin-top: 10px; font-size: 12px; color: #7f8c8d;">
                Lat: ${pos.lat.toFixed(6)}<br>
                Lng: ${pos.lng.toFixed(6)}
              </div>
              <button id="backBtn" style="
                margin-top: 12px;
                background: #3498db;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
              ">
                ← Volver a propiedades
              </button>
            </div>
          `).openPopup();

          // Agregar listener al botón de volver
          setTimeout(() => {
            const backBtn = document.getElementById("backBtn");
            if (backBtn) {
              L.DomEvent.addListener(backBtn, "click", () => {
                router.push('/propiedades');
              });
            }
          }, 100);

        } catch (error) {
          alert("❌ Error al guardar la ubicación. Por favor, intenta de nuevo.");
        }
      });
    }

    if (retryBtn) {
      L.DomEvent.addListener(retryBtn, "click", async () => {
        const loc = await getPreciseLocation();
        if (loc) {
          placeMarker(loc.lat, loc.lng, loc.acc);
        } else {
          alert("❌ No se pudo obtener tu ubicación actual.");
        }
      });
    }
  });

  // Actualizar al arrastrar
  userMarker.on("dragend", () => {
    const pos = userMarker!.getLatLng();
    
    if (!isInColombia(pos.lat, pos.lng)) {
      alert("⚠️ Ubicación fuera de Colombia. El marcador se reposicionará.");
      placeMarker(POPAYAN_CENTER.lat, POPAYAN_CENTER.lng, 50);
      return;
    }
    
    placeMarker(pos.lat, pos.lng, 10);
  });
}

function getPreciseLocation(): Promise<{ lat: number; lng: number; acc: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("❌ Geolocalización no disponible");
      alert("Tu navegador no soporta geolocalización.\nUsaremos el centro de Popayán.");
      return resolve(null);
    }

    console.log("🔍 Obteniendo tu ubicación GPS...");

    let bestLocation: { lat: number; lng: number; acc: number } | null = null;
    let attemptCount = 0;
    const maxAttempts = 3;

    const tryGetLocation = () => {
      attemptCount++;
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          console.log(`📍 Intento ${attemptCount}: Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}, Precisión ${Math.round(accuracy)}m`);

          // Validar que esté en Colombia
          if (!isInColombia(lat, lng)) {
            console.warn(`⚠️ Ubicación fuera de Colombia detectada en intento ${attemptCount}`);
            
            if (attemptCount >= maxAttempts) {
              console.error("❌ No se obtuvo ubicación válida en Colombia");
              alert("⚠️ Tu GPS indica que estás fuera de Colombia.\n\nSi estás en Popayán, esto puede deberse a:\n• Precisión GPS muy mala\n• GPS desactivado\n• Ubicación por WiFi/Red móvil en lugar de GPS\n\nActiva el GPS de alta precisión y reintenta.");
              resolve(null);
            } else {
              setTimeout(tryGetLocation, 1500);
            }
            return;
          }

          // Rechazar si la precisión es muy mala (más de 5km)
          if (accuracy > MAX_ACCEPTABLE_ACCURACY) {
            console.warn(`⚠️ Precisión GPS demasiado mala: ${Math.round(accuracy)}m (${(accuracy/1000).toFixed(1)}km)`);
            
            if (attemptCount >= maxAttempts) {
              console.warn(`⚠️ Mejor precisión obtenida: ${bestLocation ? Math.round(bestLocation.acc) : 'N/A'}m`);
              // Si obtuvimos algo, usarlo aunque no sea ideal
              if (bestLocation && bestLocation.acc < MAX_ACCEPTABLE_ACCURACY) {
                resolve(bestLocation);
              } else {
                alert(`⚠️ No se logró obtener buena precisión GPS.\n\nÚltima precisión: ${Math.round(accuracy/1000)}km\n\nPuedes:\n• Mover el marcador manualmente\n• Ir a un lugar abierto y reintentar`);
                resolve(null);
              }
            } else {
              setTimeout(tryGetLocation, 2000);
            }
            return;
          }

          // Guardar la mejor ubicación
          if (!bestLocation || accuracy < bestLocation.acc) {
            bestLocation = { lat, lng, acc: accuracy };
          }

          // Resolver si es suficientemente preciso o agotamos intentos
          if (accuracy <= 200 || attemptCount >= maxAttempts) {
            console.log(`✅ Ubicación obtenida: ${bestLocation.lat.toFixed(6)}, ${bestLocation.lng.toFixed(6)} (${Math.round(bestLocation.acc)}m)`);
            resolve(bestLocation);
          } else {
            console.log(`⚠️ Precisión ${Math.round(accuracy)}m. Reintentando para mejorar...`);
            setTimeout(tryGetLocation, 1500);
          }
        },
        (error) => {
          console.error(`❌ Error GPS (intento ${attemptCount}):`, error.message);
          
          if (attemptCount < maxAttempts) {
            console.log("🔄 Reintentando...");
            setTimeout(tryGetLocation, 2000);
          } else {
            console.error("❌ No se pudo obtener ubicación GPS");
            
            // Si tenemos alguna ubicación guardada, usarla
            if (bestLocation) {
              console.log("✓ Usando la mejor ubicación obtenida");
              resolve(bestLocation);
            } else {
              alert("❌ No se pudo acceder al GPS.\n\nVerifica:\n• Permisos de ubicación\n• GPS activado\n• Conexión a internet");
              resolve(null);
            }
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,  // 30 segundos
          maximumAge: 0,
        }
      );
    };

    tryGetLocation();
  });
}

function addLocateButton() {
  const control = L.control({ position: "topleft" });

  control.onAdd = () => {
    const btn = L.DomUtil.create("button", "locate-btn");
    btn.innerHTML = "🎯";
    btn.title = "Centrar en mi ubicación";

    L.DomEvent.disableClickPropagation(btn);

    btn.onclick = async () => {
      btn.disabled = true;
      btn.innerHTML = "⏳";
      btn.title = "Obteniendo ubicación...";

      const loc = await getPreciseLocation();

      btn.disabled = false;
      btn.innerHTML = "🎯";
      btn.title = "Centrar en mi ubicación";

      if (loc) {
        placeMarker(loc.lat, loc.lng, loc.acc);
      } else {
        placeMarker(POPAYAN_CENTER.lat, POPAYAN_CENTER.lng, 999);
      }
    };

    return btn;
  };

  control.addTo(map);
}

// Botón para volver
function addBackButton() {
  const control = L.control({ position: "topright" });

  control.onAdd = () => {
    const btn = L.DomUtil.create("button", "back-btn");
    btn.innerHTML = "← Volver";
    btn.title = "Volver a propiedades";

    L.DomEvent.disableClickPropagation(btn);
    btn.onclick = () => router.push('/propiedades');

    return btn;
  };

  control.addTo(map);
}

onMounted(async () => {
  // Inicializar mapa centrado en Popayán
  map = L.map("map", { 
    zoomControl: true,
    attributionControl: true,
    center: [POPAYAN_CENTER.lat, POPAYAN_CENTER.lng],
    zoom: 14
  });

  // Tiles de OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  console.log("🗺️ Mapa inicializado - Popayán, Cauca, Colombia");

  // Cargar propiedad
  try {
    const { data: property } = await getPropertyById(propertyId);
    
    if (property.lat && property.lng) {
      const lat = Number(property.lat);
      const lng = Number(property.lng);
      
      if (isInColombia(lat, lng)) {
        console.log(`✓ Propiedad con ubicación guardada: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        placeMarker(lat, lng, 10);
      } else {
        console.warn("⚠️ Ubicación guardada está fuera de Colombia");
        const loc = await getPreciseLocation();
        if (loc) {
          placeMarker(loc.lat, loc.lng, loc.acc);
        } else {
          placeMarker(POPAYAN_CENTER.lat, POPAYAN_CENTER.lng, 999);
        }
      }
    } else {
      console.log("⚠️ Propiedad sin ubicación. Obteniendo GPS...");
      const loc = await getPreciseLocation();
      if (loc) {
        placeMarker(loc.lat, loc.lng, loc.acc);
      } else {
        placeMarker(POPAYAN_CENTER.lat, POPAYAN_CENTER.lng, 999);
      }
    }
  } catch (error) {
    console.error("❌ Error cargando propiedad:", error);
    const loc = await getPreciseLocation();
    if (loc) {
      placeMarker(loc.lat, loc.lng, loc.acc);
    } else {
      placeMarker(POPAYAN_CENTER.lat, POPAYAN_CENTER.lng, 999);
    }
  }

  addLocateButton();
  addBackButton();
});

onUnmounted(() => {
  if (map) map.remove();
});
</script>

<template>
  <div class="map-container">
    <div id="map"></div>
    
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Guardando ubicación...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

#map {
  height: 100%;
  width: 100%;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.loading-spinner {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Botón de ubicación */
:deep(.locate-btn) {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 10px;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.4);
  transition: all 0.3s ease;
}

:deep(.locate-btn):hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.6);
}

:deep(.locate-btn):disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Botón de volver */
:deep(.back-btn) {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(231, 76, 60, 0.4);
  transition: all 0.3s ease;
}

:deep(.back-btn):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.6);
}

/* Controles de zoom */
:deep(.leaflet-control-zoom) {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-control-zoom a) {
  width: 38px;
  height: 38px;
  line-height: 38px;
  font-size: 22px;
  font-weight: bold;
}

/* Popups mejorados */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

:deep(.leaflet-popup-content) {
  margin: 15px;
}

:deep(.leaflet-popup-tip) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>