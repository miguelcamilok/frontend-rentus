<template>
  <div class="map-container">
    <div id="map"></div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Guardando ubicación...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../../../services/api";
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

const props = defineProps<{
  id?: number | string;
  lat?: number | string;
  lng?: number | string;
  readonly?: boolean;
  ownerId?: number | string;
  owner_id?: number | string;
  user_id?: number | string;
}>();

const router = useRouter();

const propertyId = props.id ? Number(props.id) : null;
const isLoading = ref(false);
const mapReady = ref(false);
const currentUserId = ref<number | null>(null);
const propertyAccuracy = ref<number>(10);

let map: L.Map;
let userMarker: L.Marker | null = null;
let accuracyCircle: L.Circle | null = null;
let watchId: number | null = null;

const POPAYAN_CENTER = { lat: 2.4448, lng: -76.6147 };
const GOOD_ACCURACY = 100;
const MAX_ACCEPTABLE_ACCURACY = 5000;

// 🔧 FIX: Consolidar owner_id de todas las fuentes posibles
const propOwnerId = computed<number | null>(() => {
  const raw = props.ownerId ?? props.owner_id ?? props.user_id ?? null;
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
});

const isOwner = computed(() => {
  if (!currentUserId.value || propOwnerId.value === null) return false;
  return Number(currentUserId.value) === Number(propOwnerId.value);
});

// 🔧 FIX: canEdit ahora NO depende de tener propertyId
const canEdit = computed(() => {
  return !props.readonly && isOwner.value;
});

function isInColombia(lat: number, lng: number): boolean {
  return lat >= -5 && lat <= 14 && lng >= -80 && lng <= -65;
}

async function savePropertyPoint(propId: number, lat: number, lng: number, accuracy: number) {
  try {
    isLoading.value = true;

    console.log(`📤 Guardando ubicación - ID: ${propId}, Lat: ${lat}, Lng: ${lng}, Precisión: ${accuracy}m`);


    const response = await api.post(`/properties/${propId}/point`, {
      lat: lat,
      lng: lng,
      accuracy: accuracy
    });

    console.log(`✅ Ubicación guardada exitosamente`);
    propertyAccuracy.value = accuracy;
    return { success: true, data: response.data };

  } catch (error: any) {
    console.error("❌ Error guardando ubicación:", error);

    let errorMsg = "Error desconocido";

    if (error.response?.status === 403) {
      errorMsg = "⛔ No tienes permiso para actualizar esta propiedad.\n\n🔒 Solo el dueño puede modificar la ubicación.";
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

function getPreciseLocation(): Promise<{ lat: number; lng: number; acc: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("❌ Geolocalización no disponible");
      resolve(null);
      return;
    }

    console.log("🔍 Obteniendo ubicación GPS de alta precisión...");

    let bestLocation: { lat: number; lng: number; acc: number } | null = null;
    let attempts = 0;
    const maxAttempts = 5;
    const targetAccuracy = 50;
    let timeoutId: NodeJS.Timeout;

    const stopWatching = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    timeoutId = setTimeout(() => {
      stopWatching();

      if (bestLocation && bestLocation.acc < MAX_ACCEPTABLE_ACCURACY) {
        console.log(`⏱️ Timeout alcanzado. Usando mejor ubicación: ${Math.round(bestLocation.acc)}m`);
        resolve(bestLocation);
      } else {
        console.warn("⏱️ Timeout sin ubicación válida");
        resolve(null);
      }
    }, 30000);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        attempts++;
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log(`📍 Intento ${attempts}: Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}, Precisión ${Math.round(accuracy)}m`);

        if (!isInColombia(lat, lng)) {
          console.warn(`⚠️ Ubicación fuera de Colombia en intento ${attempts}`);
          if (attempts >= maxAttempts) {
            stopWatching();
            resolve(null);
          }
          return;
        }

        if (accuracy > MAX_ACCEPTABLE_ACCURACY) {
          console.warn(`⚠️ Precisión muy mala: ${Math.round(accuracy)}m`);
          if (attempts >= maxAttempts) {
            stopWatching();
            resolve(bestLocation && bestLocation.acc < MAX_ACCEPTABLE_ACCURACY ? bestLocation : null);
          }
          return;
        }

        if (!bestLocation || accuracy < bestLocation.acc) {
          bestLocation = { lat, lng, acc: accuracy };
          console.log(`✨ Nueva mejor ubicación: ${Math.round(accuracy)}m`);
        }

        if (accuracy <= targetAccuracy) {
          console.log(`✅ Precisión objetivo alcanzada: ${Math.round(accuracy)}m`);
          stopWatching();
          resolve(bestLocation);
          return;
        }

        if (attempts >= maxAttempts) {
          stopWatching();
          console.log(`✓ Usando mejor ubicación después de ${maxAttempts} intentos: ${Math.round(bestLocation.acc)}m`);
          resolve(bestLocation);
        }
      },
      (error) => {
        console.error(`❌ Error GPS (intento ${attempts + 1}):`, error.message);
        attempts++;

        if (attempts >= maxAttempts) {
          stopWatching();
          resolve(bestLocation && bestLocation.acc < MAX_ACCEPTABLE_ACCURACY ? bestLocation : null);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// 🔧 FIX: placeMarker ahora respeta canEdit incluso cuando fromProps=true
function placeMarker(lat: number, lng: number, accuracy: number, fromProps: boolean = false) {
  lat = Number(lat);
  lng = Number(lng);
  accuracy = Number(accuracy);

  if (isNaN(lat) || isNaN(lng)) {
    console.error("❌ Coordenadas inválidas:", { lat, lng });
    lat = POPAYAN_CENTER.lat;
    lng = POPAYAN_CENTER.lng;
    accuracy = 999;
  }

  if (!isInColombia(lat, lng)) {
    console.warn(`⚠️ Coordenadas fuera de Colombia: ${lat}, ${lng}`);
    if (!fromProps) {
      lat = POPAYAN_CENTER.lat;
      lng = POPAYAN_CENTER.lng;
      accuracy = 999;
    }
  }

  if (fromProps) {
    propertyAccuracy.value = accuracy;
  }

  // Remover marcadores previos
  if (userMarker) {
    try { map.removeLayer(userMarker); } catch (e) { /* ignore */ }
    userMarker = null;
  }
  if (accuracyCircle) {
    try { map.removeLayer(accuracyCircle); } catch (e) { /* ignore */ }
    accuracyCircle = null;
  }

  // 🔧 FIX: Usar canEdit.value directamente
  const isDraggable = canEdit.value;
  console.log("🔍 placeMarker -> canEdit:", canEdit.value, "isOwner:", isOwner.value, "propOwnerId:", propOwnerId.value, "currentUserId:", currentUserId.value, "fromProps:", fromProps, "draggable:", isDraggable);

  userMarker = L.marker([lat, lng], {
    draggable: isDraggable,
    autoPan: true
  }).addTo(map);

  // Forzar dragging
  if (isDraggable && userMarker.dragging) {
    try {
      userMarker.dragging.enable();
      console.log("✅ Dragging habilitado en marker");
    } catch (e) {
      console.warn("⚠️ No se pudo enable drag:", e);
    }
  } else if (!isDraggable && userMarker.dragging) {
    try { userMarker.dragging.disable(); } catch (e) { /* ignore */ }
  }

  // Asegurar pointer-events
  setTimeout(() => {
    try {
      const el = userMarker?.getElement?.();
      if (el) {
        el.style.pointerEvents = "auto";
        el.style.cursor = isDraggable ? "grab" : "default";
        el.querySelectorAll?.("img").forEach((img: any) => {
          img.style.pointerEvents = "auto";
        });
        console.log("✅ Estilos DOM aplicados al marker");
      } else {
        console.warn("⚠️ No se obtuvo elemento DOM del marker");
      }
    } catch (err) {
      console.warn("⚠️ Error ajustando marker DOM:", err);
    }
  }, 50);

  // Círculo de precisión
  const circleColor = accuracy <= GOOD_ACCURACY ? "#27ae60" : accuracy > 1000 ? "#e74c3c" : "#f39c12";

  accuracyCircle = L.circle([lat, lng], {
    radius: accuracy,
    color: circleColor,
    fillColor: circleColor,
    fillOpacity: 0.15,
    weight: 2
  }).addTo(map);

  map.flyTo([lat, lng], accuracy <= GOOD_ACCURACY ? 18 : 16, {
    duration: 1
  });

  // Popup según permisos
  if (canEdit.value) {
    createEditablePopup(lat, lng, accuracy);
  } else {
    createReadonlyPopup(lat, lng, accuracy);
  }

  // Event listener para arrastrar
  if (isDraggable) {
    userMarker.off?.("dragend");
    userMarker.on("dragend", () => {
      const pos = userMarker!.getLatLng();

      if (!isInColombia(pos.lat, pos.lng)) {
        alert("⚠️ Ubicación fuera de Colombia. El marcador se reposicionará.");
        placeMarker(POPAYAN_CENTER.lat, POPAYAN_CENTER.lng, propertyAccuracy.value || 50);
        return;
      }

      const newAccuracy = propertyAccuracy.value || 10;
      console.log("📍 marker.dragend -> new pos:", pos, "accuracy(prev):", newAccuracy);

      // 🔧 FIX: Actualizar las coordenadas sin recrear el popup
      if (accuracyCircle) {
        accuracyCircle.setLatLng([pos.lat, pos.lng]);
      }

      // Actualizar popup con las nuevas coordenadas
      updatePopupCoordinates(pos.lat, pos.lng, newAccuracy);
    });
  }
}



// 🔧 Nueva función para actualizar solo las coordenadas del popup
function updatePopupCoordinates(lat: number, lng: number, accuracy: number) {
  if (!userMarker) return;

  const coordsEl = document.querySelector('.popup-coordinates');
  const precisionEl = document.querySelector('.popup-precision');

  if (coordsEl) {
    coordsEl.innerHTML = `<strong>Lat:</strong> ${lat.toFixed(6)}<br><strong>Lng:</strong> ${lng.toFixed(6)}`;
  }

  if (precisionEl) {
    const isAccurate = accuracy <= GOOD_ACCURACY;
    const color = isAccurate ? '#27ae60' : accuracy > 1000 ? '#e74c3c' : '#f39c12';
    precisionEl.innerHTML = `<span style="font-weight: 700; color: ${color};">±${accuracy > 1000 ? `${(accuracy / 1000).toFixed(1)} km` : `${Math.round(accuracy)} m`}</span>`;
  }

  console.log("📝 Popup actualizado con nuevas coordenadas:", lat.toFixed(6), lng.toFixed(6));
}

function createEditablePopup(lat: number, lng: number, accuracy: number) {
  const isAccurate = accuracy <= GOOD_ACCURACY;

  const popupHtml = `
    <div style="min-width: 250px; font-family: Arial, sans-serif;">
      <div style="border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-bottom: 10px;">
        <strong style="color: #2c3e50; font-size: 14px;">📍 Ubicación de la Propiedad</strong>
        <div style="font-size: 11px; color: #7f8c8d; margin-top: 4px;">
          🔓 Modo Edición (Dueño)
        </div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <strong style="color: #7f8c8d;">Radio de Precisión:</strong> 
        <span class="popup-precision" style="font-weight: 700; color: ${isAccurate ? '#27ae60' : accuracy > 1000 ? '#e74c3c' : '#f39c12'};">
          ±${accuracy > 1000 ? `${(accuracy / 1000).toFixed(1)} km` : `${Math.round(accuracy)} m`}
        </span>
      </div>

      <div class="popup-coordinates" style="background: #ecf0f1; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 12px;">
        <strong>Lat:</strong> ${lat.toFixed(6)}<br>
        <strong>Lng:</strong> ${lng.toFixed(6)}
      </div>
      
      ${!isAccurate
      ? `<div style="background: ${accuracy > 1000 ? '#f8d7da' : '#fff3cd'}; color: ${accuracy > 1000 ? '#721c24' : '#856404'}; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 12px;">
              ${accuracy > 1000 ? '❌ Precisión muy baja' : '⚠️ Precisión media'}<br>
              <small>El círculo muestra el área de incertidumbre</small>
             </div>`
      : `<div style="background: #d4edda; color: #155724; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 12px;">
              ✓ Excelente precisión GPS<br>
              <small>La ubicación es muy exacta</small>
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
          🔄 Actualizar GPS
        </button>
      </div>
      
      <div style="margin-top: 10px; font-size: 11px; color: #7f8c8d; text-align: center;">
        💡 Arrastra el marcador para ajustar manualmente
      </div>
    </div>
  `;

  userMarker!.bindPopup(popupHtml, { maxWidth: 350 }).openPopup();

  // 🔧 FIX: Remover listeners previos y añadir nuevos cada vez que se abre
  userMarker!.off("popupopen");
  userMarker!.on("popupopen", () => {
    console.log("🔄 Popup abierto - Añadiendo event listeners");

    const saveBtn = document.getElementById("savePointBtn");
    const retryBtn = document.getElementById("retryPointBtn");

    if (saveBtn) {
      // Remover listeners previos si existen
      const newSaveBtn = saveBtn.cloneNode(true) as HTMLElement;
      saveBtn.parentNode?.replaceChild(newSaveBtn, saveBtn);

      L.DomEvent.addListener(newSaveBtn, "click", async () => {
        if (!propertyId) {
          alert("❌ Error: No hay ID de propiedad para guardar");
          return;
        }

        const pos = userMarker!.getLatLng();

        if (!isInColombia(pos.lat, pos.lng)) {
          alert("❌ Error: La ubicación debe estar en Colombia.");
          return;
        }

        try {
          await savePropertyPoint(propertyId, pos.lat, pos.lng, accuracy);

          const successPopup = `
    <div style="text-align: center; padding: 15px; font-family: Arial, sans-serif;">
      <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
      <strong style="color: #27ae60; font-size: 16px;">¡Ubicación Guardada!</strong>
      <div style="margin-top: 10px; font-size: 12px; color: #7f8c8d;">
        <strong>Coordenadas:</strong><br>
        Lat: ${pos.lat.toFixed(6)}<br>
        Lng: ${pos.lng.toFixed(6)}<br><br>
        <strong>Precisión:</strong> ±${accuracy > 1000 ? `${(accuracy / 1000).toFixed(1)} km` : `${Math.round(accuracy)} m`}
      </div>
    </div>
  `;

          userMarker!.bindPopup(successPopup, { maxWidth: 280 }).openPopup();

          // Después de guardar, restaurar automáticamente el popup editable
          setTimeout(() => {
            const popup = userMarker?.getPopup();
            const popupContent = popup ? popup.getContent() : null;

            if (typeof popupContent === "string" && popupContent.includes("Ubicación Guardada")) {
              const mPos = userMarker!.getLatLng();
              createEditablePopup(mPos.lat, mPos.lng, accuracy);
              userMarker!.openPopup();
            }
          }, 3000);


        } catch (error) {
          console.error("Error al guardar:", error);
        }


      });
    }

    if (retryBtn instanceof HTMLButtonElement) {
      // Remover listeners previos si existen
      const newRetryBtn = retryBtn.cloneNode(true) as HTMLElement;
      retryBtn.parentNode?.replaceChild(newRetryBtn, retryBtn);

      const button = newRetryBtn as HTMLButtonElement;

      L.DomEvent.addListener(button, "click", async () => {
        console.log("🔄 Botón Actualizar GPS clickeado");
        button.disabled = true;
        button.innerHTML = "⏳";

        const loc = await getPreciseLocation();

        button.disabled = false;
        button.innerHTML = "🔄 Actualizar GPS";

        if (loc) {
          placeMarker(loc.lat, loc.lng, loc.acc);
        } else {
          alert("❌ No se pudo obtener tu ubicación actual.");
        }
      });
    }

  });
}

function createReadonlyPopup(lat: number, lng: number, accuracy: number) {
  const isAccurate = accuracy <= GOOD_ACCURACY;
  const canEditMsg = !isOwner.value && propertyId ? '<div style="background: #fff3cd; color: #856404; padding: 6px; border-radius: 4px; margin-top: 8px; font-size: 11px;">🔒 Solo el dueño puede editar la ubicación</div>' : '';

  const popupHtml = `
    <div style="min-width: 220px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 10px;">
        <div style="font-size: 30px; margin-bottom: 8px;">📍</div>
        <strong style="color: #2c3e50; font-size: 14px;">Ubicación de la Propiedad</strong>
      </div>
      
      <div style="background: ${isAccurate ? '#d4edda' : accuracy > 1000 ? '#f8d7da' : '#fff3cd'}; color: ${isAccurate ? '#155724' : accuracy > 1000 ? '#721c24' : '#856404'}; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 12px; text-align: center;">
        <strong>Radio de Precisión:</strong><br>
        <span style="font-size: 16px; font-weight: 700;">
          ±${accuracy > 1000 ? `${(accuracy / 1000).toFixed(1)} km` : `${Math.round(accuracy)} m`}
        </span><br>
        <small style="font-size: 10px;">
          ${isAccurate ? '✓ Ubicación muy exacta' : accuracy > 1000 ? '⚠️ Área aproximada' : '⚠️ Precisión media'}
        </small>
      </div>
      
      <div style="background: #ecf0f1; padding: 8px; border-radius: 6px; font-size: 11px; text-align: center;">
        <strong>Coordenadas:</strong><br>
        ${lat.toFixed(6)}, ${lng.toFixed(6)}
      </div>
      
      ${canEditMsg}
      
      <div style="margin-top: 8px; font-size: 10px; color: #7f8c8d; text-align: center;">
        💡 El círculo muestra el área de precisión
      </div>
    </div>
  `;

  userMarker!.bindPopup(popupHtml, { maxWidth: 280 }).openPopup();
}

function addLocateButton() {
  if (!canEdit.value) return;

  const control = L.control({ position: "topleft" });

  control.onAdd = () => {
    const btn = L.DomUtil.create("button", "locate-btn");
    btn.innerHTML = "🎯";
    btn.title = "Actualizar mi ubicación GPS";

    L.DomEvent.disableClickPropagation(btn);

    btn.onclick = async () => {
      btn.disabled = true;
      btn.innerHTML = "⏳";

      const loc = await getPreciseLocation();

      btn.disabled = false;
      btn.innerHTML = "🎯";

      if (loc) {
        placeMarker(loc.lat, loc.lng, loc.acc);
      } else {
        alert("❌ No se pudo obtener tu ubicación. Intenta:\n• Activar GPS de alta precisión\n• Ir a un lugar abierto\n• Verificar permisos de ubicación");
        placeMarker(POPAYAN_CENTER.lat, POPAYAN_CENTER.lng, 999);
      }
    };

    return btn;
  };

  control.addTo(map);
}

function addBackButton() {
  const control = L.control({ position: "topright" });

  control.addTo(map);
}

async function initializeMap() {
  // Obtener usuario actual
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      currentUserId.value = user.id ?? user.user_id ?? null;
      console.log(`👤 Usuario actual: ${user.name || user.email} (ID: ${currentUserId.value})`);
    } catch (e) {
      console.warn("⚠️ No se pudo parsear usuario");
    }
  }

  console.log("🔍 DEBUG props owner forms:", {
    ownerId: props.ownerId,
    owner_id: props.owner_id,
    user_id: props.user_id,
    propOwnerId: propOwnerId.value,
    currentUserId: currentUserId.value,
    isOwner: isOwner.value,
    canEdit: canEdit.value
  });

  // Inicializar mapa
  map = L.map("map", {
    zoomControl: true,
    attributionControl: true,
    center: [POPAYAN_CENTER.lat, POPAYAN_CENTER.lng],
    zoom: 14
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  mapReady.value = true;
  console.log("🗺️ Mapa inicializado");

  // 🔧 FIX: Si hay coordenadas en props, mostrarlas (pero respetar permisos)
  if (props.lat !== undefined && props.lng !== undefined) {
    console.log("📍 Mostrando ubicación desde props");
    const lat = Number(props.lat);
    const lng = Number(props.lng);

    if (!isNaN(lat) && !isNaN(lng)) {
      placeMarker(lat, lng, 50, true);

      return;
    } else {
      console.error("❌ Coordenadas inválidas en props");
    }
  }

  // Si puede editar y no hay coords, obtener GPS
  if (canEdit.value) {
    console.log("🔍 Obteniendo ubicación GPS inicial...");
    const loc = await getPreciseLocation();

    if (loc) {
      placeMarker(loc.lat, loc.lng, loc.acc);
    } else {
      console.warn("⚠️ No se pudo obtener GPS, usando centro de Popayán");
      placeMarker(POPAYAN_CENTER.lat, POPAYAN_CENTER.lng, 999);
    }
  } else {
    console.log("🔒 Usuario no es dueño, mostrando ubicación por defecto");
    placeMarker(POPAYAN_CENTER.lat, POPAYAN_CENTER.lng, 999);
  }
}


// Watch para cambios en props
watch(() => [props.lat, props.lng], ([newLat, newLng]) => {
  if (mapReady.value && newLat !== undefined && newLng !== undefined) {
    const lat = Number(newLat);
    const lng = Number(newLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      placeMarker(lat, lng, 50, true);
    }
  }
});

onMounted(async () => {
  await initializeMap();
  addLocateButton();
  addBackButton();

  // Obtener ubicación inicial al cargar la vista
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const acc = position.coords.accuracy;

      console.log("📌 getCurrentPosition inicial:", lat, lng, acc);

      // Colocar marcador
      placeMarker(lat, lng, acc);
    },
    (error) => {
      console.warn("⚠️ Error al obtener ubicación inicial:", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
});

onUnmounted(() => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }


  if (map) {
    map.remove();
  }
});
</script>

<style scoped>
@import "../../../assets/css/components/MapView.css";
</style>