<template>
  <transition name="fade">
    <div v-if="open" class="overlay" @click.self="close">
      <transition name="modal">
        <div class="modal">
          <!-- HEADER -->
          <header class="modal-header">
            <div class="title-box">
              <h2>Solicitudes de Arriendo</h2>
              <p class="subtitle">Revisa y gestiona solicitudes pendientes</p>
            </div>
            <button class="btn-close" @click="close">✕</button>
          </header>

          <!-- BODY -->
          <section class="modal-body">
            <!-- LOADING -->
            <div v-if="loading" class="loading">
              <div class="spinner"></div>
              <p>Cargando solicitudes...</p>
            </div>

            <!-- SOLICITUDES -->
            <div v-else-if="solicitudes.length > 0">
              <div class="request-item" v-for="solicitud in solicitudes" :key="solicitud.id">
                <!-- IMAGEN PROPIEDAD -->
                <div class="property-image">
                  <img :src="solicitud.property?.image_url" :alt="solicitud.property?.title" />
                </div>

                <div class="request-details">
                  <!-- INFO PROPIEDAD -->
                  <div class="property-info">
                    <h4>{{ solicitud.property?.title }}</h4>
                    <p class="address">📍 {{ solicitud.property?.address }}</p>
                  </div>

                  <!-- INFO INQUILINO -->
                  <div class="tenant-info">
                    <img :src="solicitud.user?.photo || '/img/default.webp'" class="tenant-avatar"
                      :alt="solicitud.user?.name" />
                    <div class="tenant-details">
                      <p class="tenant-name">{{ solicitud.user?.name }}</p>
                      <div class="rating">
                        ⭐ {{ solicitud.user?.rating || 'Sin calificación' }}
                      </div>
                    </div>
                  </div>

                  <!-- FECHA SOLICITADA -->
                  <div class="date-info">
                    <p class="label">Fecha solicitada:</p>
                    <p class="value">
                      📅 {{ formatDate(solicitud.requested_date) }}
                      🕐 {{ solicitud.requested_time }}
                    </p>
                  </div>

                  <!-- CONTRA-PROPUESTA (si existe) -->
                  <div v-if="solicitud.status === 'counter_proposed' && solicitud.counter_date"
                    class="counter-proposal">
                    <p class="label">🔄 Fecha propuesta (esperando respuesta):</p>
                    <p class="value highlight">
                      📅 {{ formatDate(solicitud.counter_date) }}
                      🕐 {{ solicitud.counter_time }}
                    </p>
                  </div>

                  <!-- ESTADO -->
                  <div class="status-badge" :class="solicitud.status">
                    {{ getStatusText(solicitud.status) }}
                  </div>

                  <!-- ACCIONES SEGÚN ESTADO -->
                  <div class="actions">
                    <!-- PENDIENTE - Mostrar botones de revisión -->
                    <template v-if="solicitud.status === 'pending'">
                      <button class="btn success" @click="openReviewModal(solicitud)">
                        👁️ Revisar
                      </button>
                      <button class="btn danger" @click="rechazarDirecto(solicitud.id)">
                        ✕ Rechazar
                      </button>
                    </template>

                    <!-- ACEPTADA - Verificar si ya pasó la visita -->
                    <template v-else-if="solicitud.status === 'accepted'">
                      <div v-if="isVisitPassed(solicitud)" class="actions">
                        <button class="btn primary" @click="openContractModal(solicitud)">
                          ✅ Seguir proceso
                        </button>
                        <button class="btn danger-outline" @click="finalizarProceso(solicitud.id)">
                          ❌ Finalizar proceso
                        </button>
                      </div>
                      <div v-else class="info-message">
                        ⏳ Visita programada. Esperando fecha: {{ formatDate(solicitud.requested_date) }} {{
                        solicitud.requested_time }}
                      </div>
                    </template>

                    <!-- CONTRA-PROPUESTA ENVIADA -->
                    <template v-else-if="solicitud.status === 'counter_proposed'">
                      <div class="info-message pending">
                        ⏳ Esperando respuesta del inquilino...
                      </div>
                    </template>

                    <!-- RECHAZADA -->
                    <template v-else-if="solicitud.status === 'rejected'">
                      <div class="info-message rejected">
                        ❌ Solicitud rechazada
                      </div>
                    </template>

                    <!-- CONTRATO ENVIADO -->
                    <template v-else-if="solicitud.status === 'contract_sent'">
                      <div class="info-message success">
                        ✅ Contrato enviado - Esperando aceptación del inquilino
                      </div>
                    </template>

                    <!-- VISITA COMPLETADA -->
                    <template v-else-if="solicitud.status === 'visit_completed'">
                      <div class="info-message">
                        ✓ Visita completada
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- VACÍO -->
            <div v-else class="empty">
              <img src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png" />
              <p>No hay solicitudes por ahora</p>
            </div>
          </section>
        </div>
      </transition>

      <!-- MODAL DE REVISIÓN -->
      <transition name="fade">
        <div v-if="showReviewModal" class="overlay" @click.self="closeReviewModal">
          <div class="review-modal">
            <header class="modal-header">
              <h3>Revisar Solicitud</h3>
              <button class="btn-close" @click="closeReviewModal">✕</button>
            </header>

            <div class="review-content" v-if="selectedRequest">
              <div class="review-property">
                <img :src="selectedRequest.property?.image_url" />
                <div>
                  <h4>{{ selectedRequest.property?.title }}</h4>
                  <p>{{ selectedRequest.property?.address }}</p>
                </div>
              </div>

              <div class="review-tenant">
                <img :src="selectedRequest.user?.photo || '/img/default.webp'" />
                <div>
                  <p class="name">{{ selectedRequest.user?.name }}</p>
                  <p class="rating">⭐ {{ selectedRequest.user?.rating || 'N/A' }}</p>
                  <p class="contact">📧 {{ selectedRequest.user?.email }}</p>
                  <p class="contact">📱 {{ selectedRequest.user?.phone }}</p>
                </div>
              </div>

              <div class="review-date">
                <p><strong>Fecha solicitada:</strong></p>
                <p>📅 {{ formatDate(selectedRequest.requested_date) }}</p>
                <p>🕐 {{ selectedRequest.requested_time }}</p>
              </div>

              <div class="review-actions">
                <button class="btn success-full" @click="aceptarSolicitud">
                  ✓ Aceptar solicitud
                </button>
                <button class="btn warning-full" @click="showCounterForm = true">
                  🔄 Proponer otra fecha
                </button>
                <button class="btn danger-full" @click="rechazarSolicitud">
                  ✕ Rechazar solicitud
                </button>
              </div>

              <!-- FORMULARIO CONTRA-PROPUESTA -->
              <div v-if="showCounterForm" class="counter-form">
                <h4>Proponer nueva fecha y hora</h4>
                <div class="form-group">
                  <label>Nueva fecha:</label>
                  <input type="date" v-model="counterDate" :min="getTodayDate()" />
                </div>
                <div class="form-group">
                  <label>Nueva hora:</label>
                  <input type="time" v-model="counterTime" />
                </div>
                <div class="form-actions">
                  <button class="btn primary" @click="enviarContraPropuesta">
                    Enviar propuesta
                  </button>
                  <button class="btn secondary" @click="showCounterForm = false">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL DE CONTRATO -->
      <transition name="fade">
        <div v-if="showContractModal" class="overlay" @click.self="closeContractModal">
          <div class="contract-modal">
            <header class="modal-header">
              <h3>Enviar Términos del Contrato</h3>
              <button class="btn-close" @click="closeContractModal">✕</button>
            </header>

            <div class="contract-content" v-if="selectedRequest">
              <div class="form-group">
                <label>Fecha de inicio:</label>
                <input type="date" v-model="contractData.start_date" :min="getTodayDate()" />
              </div>

              <div class="form-group">
                <label>Fecha de finalización:</label>
                <input type="date" v-model="contractData.end_date" :min="contractData.start_date" />
              </div>

              <div class="form-group">
                <label>Precio mensual ($):</label>
                <input type="number" v-model.number="contractData.monthly_price"
                  :placeholder="selectedRequest.property?.monthly_price" />
              </div>

              <div class="form-group">
                <label>Depósito/Garantía ($):</label>
                <input type="number" v-model.number="contractData.deposit" />
              </div>

              <div class="form-group">
                <label>Día de pago (1-31):</label>
                <input type="number" v-model.number="contractData.payment_day" min="1" max="31" />
              </div>

              <div class="form-group">
                <label>Multa por retraso ($):</label>
                <input type="number" v-model.number="contractData.late_fee" />
              </div>

              <div class="form-group">
                <label>Servicios incluidos (separados por coma):</label>
                <input type="text" v-model="utilitiesInput" placeholder="Agua, Luz, Internet, Gas" />
              </div>

              <div class="form-group">
                <label>Cláusulas del contrato:</label>
                <textarea v-model="clausesInput" rows="4"
                  placeholder="Ejemplo: No se permiten mascotas, No fumar dentro del inmueble, etc."></textarea>
              </div>

              <div class="form-group">
                <label>Condiciones especiales (opcional):</label>
                <textarea v-model="contractData.special_conditions" rows="3"
                  placeholder="Condiciones adicionales..."></textarea>
              </div>

              <div class="form-actions">
                <button class="btn success-full" @click="enviarContrato">
                  📄 Enviar contrato
                </button>
                <button class="btn secondary" @click="closeContractModal">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch} from "vue";
import { rentalRequestService } from "../../../services/rentalRequestService";

const props = defineProps({
  open: Boolean,
});

const emit = defineEmits(["close"]);

// STATE
const solicitudes = ref([]);
const loading = ref(false);
const showReviewModal = ref(false);
const showCounterForm = ref(false);
const showContractModal = ref(false);
const selectedRequest = ref(null);

// CONTRA-PROPUESTA
const counterDate = ref("");
const counterTime = ref("");

// CONTRATO
const contractData = ref({
  start_date: "",
  end_date: "",
  monthly_price: 0,
  deposit: 0,
  payment_day: 1,
  late_fee: 0,
  special_conditions: ""
});
const utilitiesInput = ref("");
const clausesInput = ref("");

// MÉTODOS
const close = () => emit("close");

// Cargar solicitudes cuando se abre el modal
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await loadRequests();
  }
});

const loadRequests = async () => {
  loading.value = true;
  try {
    solicitudes.value = await rentalRequestService.getOwnerRequests();
  } catch (error) {
    console.error("Error cargando solicitudes:", error);
    alert("Error al cargar solicitudes");
  } finally {
    loading.value = false;
  }
};

// Verificar si la visita ya pasó
const isVisitPassed = (solicitud) => {
  if (!solicitud.visit_end_time) return false;

  // Convierte visit_end_time (supongamos UTC en DB) a Date local
  const visitEndUTC = new Date(solicitud.visit_end_time + "Z"); // 'Z' = UTC
  const now = new Date(); // hora local
  return now >= visitEndUTC;
};


// MODAL DE REVISIÓN
const openReviewModal = (solicitud) => {
  selectedRequest.value = solicitud;
  showReviewModal.value = true;
  showCounterForm.value = false;
  counterDate.value = "";
  counterTime.value = "";
};

const closeReviewModal = () => {
  showReviewModal.value = false;
  selectedRequest.value = null;
  showCounterForm.value = false;
};

// ACEPTAR SOLICITUD
const aceptarSolicitud = async () => {
  if (!selectedRequest.value) return;

  try {
    await rentalRequestService.acceptRequest(selectedRequest.value.id);
    alert("Solicitud aceptada correctamente");
    closeReviewModal();
    await loadRequests();
  } catch (error) {
    console.error("Error aceptando solicitud:", error);
    alert("Error al aceptar la solicitud");
  }
};

// RECHAZAR SOLICITUD
const rechazarSolicitud = async () => {
  if (!selectedRequest.value) return;
  if (!confirm("¿Estás seguro de rechazar esta solicitud?")) return;

  try {
    await rentalRequestService.rejectRequest(selectedRequest.value.id);
    alert("Solicitud rechazada");
    closeReviewModal();
    await loadRequests();
  } catch (error) {
    console.error("Error rechazando solicitud:", error);
    alert("Error al rechazar la solicitud");
  }
};

// RECHAZAR DIRECTO (sin abrir modal)
const rechazarDirecto = async (requestId) => {
  if (!confirm("¿Rechazar esta solicitud sin revisarla?")) return;

  try {
    await rentalRequestService.rejectRequest(requestId);
    alert("Solicitud rechazada");
    await loadRequests();
  } catch (error) {
    console.error("Error rechazando solicitud:", error);
    alert("Error al rechazar");
  }
};

// ENVIAR CONTRA-PROPUESTA
const enviarContraPropuesta = async () => {
  if (!counterDate.value || !counterTime.value) {
    alert("Por favor selecciona fecha y hora");
    return;
  }

  try {
    await rentalRequestService.counterPropose(selectedRequest.value.id, {
      counter_date: counterDate.value,
      counter_time: counterTime.value
    });
    alert("Contra-propuesta enviada correctamente");
    closeReviewModal();
    await loadRequests();
  } catch (error) {
    console.error("Error enviando contra-propuesta:", error);
    alert("Error al enviar contra-propuesta");
  }
};

// MODAL DE CONTRATO
// MODAL DE CONTRATO
const openContractModal = (solicitud) => {
  selectedRequest.value = solicitud;

  // Pre-llenar con datos de la propiedad
  contractData.value = {
    start_date: "",
    end_date: "",
    monthly_price: solicitud.property?.monthly_price || 0,
    deposit: (solicitud.property?.monthly_price || 0) * 2,
    payment_day: 1,
    late_fee: 50,
    special_conditions: ""
  };

  utilitiesInput.value = "Agua, Luz, Gas";
  
  // ✅ Pre-llenar cláusulas por defecto
  clausesInput.value = `El arrendatario se compromete a pagar el canon de arrendamiento en la fecha establecida.
El arrendatario debe mantener el inmueble en buen estado.
El arrendador debe garantizar el goce pacífico del inmueble.
Cualquier modificación al contrato debe hacerse por escrito.
El incumplimiento de las obligaciones podrá dar lugar a la terminación del contrato.`;
  
  showContractModal.value = true;
};

const closeContractModal = () => {
  showContractModal.value = false;
  selectedRequest.value = null;
};

// ENVIAR CONTRATO
// ENVIAR CONTRATO
const enviarContrato = async () => {
  if (!contractData.value.start_date || !contractData.value.end_date) {
    alert("Por favor completa las fechas del contrato");
    return;
  }

  if (contractData.value.monthly_price <= 0) {
    alert("El precio mensual debe ser mayor a 0");
    return;
  }

  try {
    // Convertir strings a arrays
    const utilities = utilitiesInput.value
      .split(",")
      .map(u => u.trim())
      .filter(u => u.length > 0);

    // ✅ CORRECCIÓN: Si no hay cláusulas, usar las por defecto
    let clauses = clausesInput.value
      .split("\n")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    // Si el array está vacío, agregar cláusulas por defecto
    if (clauses.length === 0) {
      clauses = [
        "El arrendatario se compromete a pagar el canon de arrendamiento en la fecha establecida.",
        "El arrendatario debe mantener el inmueble en buen estado.",
        "El arrendador debe garantizar el goce pacífico del inmueble.",
        "Cualquier modificación al contrato debe hacerse por escrito.",
        "El incumplimiento de las obligaciones podrá dar lugar a la terminación del contrato."
      ];
    }

    const payload = {
      rental_request_id: selectedRequest.value.id,
      property_id: selectedRequest.value.property_id,
      tenant_id: selectedRequest.value.user_id,
      landlord_id: selectedRequest.value.owner_id,
      start_date: contractData.value.start_date,
      end_date: contractData.value.end_date,
      monthly_price: parseFloat(contractData.value.monthly_price),
      deposit: parseFloat(contractData.value.deposit),
      clauses: clauses, // ✅ Ahora siempre tiene al menos las cláusulas por defecto
      payment_day: parseInt(contractData.value.payment_day),
      late_fee: parseFloat(contractData.value.late_fee),
      utilities_included: utilities,
      special_conditions: contractData.value.special_conditions || ""
    };

    console.log("Payload enviado:", payload); // ← Para debugging

    await rentalRequestService.sendContractTerms(payload);
    alert("Contrato enviado correctamente al inquilino");
    closeContractModal();
    await loadRequests();
  } catch (error) {
    console.error("Error enviando contrato:", error);
    
    // ✅ Mostrar el error específico del backend
    if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`);
    } else if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat();
      alert(`Errores de validación:\n${errors.join('\n')}`);
    } else {
      alert("Error al enviar el contrato");
    }
  }
};

// FINALIZAR PROCESO (sin contrato)
const finalizarProceso = async (requestId) => {
  if (!confirm("¿Finalizar el proceso sin generar contrato?")) return;

  try {
    await rentalRequestService.rejectRequest(requestId);
    alert("Proceso finalizado");
    await loadRequests();
  } catch (error) {
    console.error("Error finalizando proceso:", error);
    alert("Error al finalizar");
  }
};

// UTILIDADES
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getStatusText = (status) => {
  const map = {
    pending: "Pendiente",
    accepted: "Aceptada",
    rejected: "Rechazada",
    counter_proposed: "Contra-propuesta enviada",
    visit_completed: "Visita completada",
    contract_sent: "Contrato enviado"
  };
  return map[status] || status;
};

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};
</script>
<style scoped>
@import "../../../assets/css/components/RequestsView.css";
</style>
