<template>
  <transition name="fade">
    <div v-if="open" class="overlay" @click.self="close">
      <transition name="modal">
        <div class="modal">
          <header class="modal-header">
            <div class="title-box">
              <h2>Mis Solicitudes de Visita</h2>
              <p class="subtitle">Seguimiento de tus citas programadas</p>
            </div>
            <button class="btn-close" @click="close">✕</button>
          </header>

          <section class="modal-body">
            <!-- Loading -->
            <div v-if="loading" class="loading">
              <div class="spinner"></div>
              <p>Cargando solicitudes...</p>
            </div>

            <!-- Solicitudes -->
            <div v-else-if="solicitudes.length > 0">
              <div
                class="request-item"
                v-for="solicitud in solicitudes"
                :key="solicitud.id"
              >
                <!-- Imagen de la propiedad -->
                <div class="property-image">
                  <img 
                    :src="solicitud.property?.image_url" 
                    :alt="solicitud.property?.title" 
                  />
                </div>

                <div class="request-details">
                  <!-- Info de la propiedad -->
                  <div class="property-info">
                    <h4>{{ solicitud.property?.title }}</h4>
                    <p class="address">📍 {{ solicitud.property?.address }}</p>
                  </div>

                  <!-- Fecha solicitada -->
                  <div class="date-info">
                    <p class="label">Fecha solicitada:</p>
                    <p class="value">
                      📅 {{ formatDate(solicitud.requested_date) }} 
                      🕐 {{ solicitud.requested_time }}
                    </p>
                  </div>

                  <!-- Contra-propuesta (si existe) -->
                  <div 
                    v-if="solicitud.status === 'counter_proposed'" 
                    class="counter-proposal"
                  >
                    <p class="label">🔄 Nueva fecha propuesta por el dueño:</p>
                    <p class="value highlight">
                      📅 {{ formatDate(solicitud.counter_date) }} 
                      🕐 {{ solicitud.counter_time }}
                    </p>
                  </div>

                  <!-- Estado -->
                  <div class="status-badge" :class="solicitud.status">
                    {{ getStatusText(solicitud.status) }}
                  </div>

                  <!-- Acciones según estado -->
                  <div class="actions">
                    <!-- Contra-propuesta pendiente -->
                    <template v-if="solicitud.status === 'counter_proposed'">
                      <button 
                        class="btn success" 
                        @click="acceptCounter(solicitud.id)"
                      >
                        ✓ Aceptar nueva fecha
                      </button>
                      <button 
                        class="btn danger" 
                        @click="rejectCounter(solicitud.id)"
                      >
                        ✕ Rechazar
                      </button>
                    </template>

                    <!-- Aceptada - Esperando visita -->
                    <template v-else-if="solicitud.status === 'accepted'">
                      <div class="info-message">
                        ✅ Visita confirmada. El dueño te contactará pronto.
                      </div>
                    </template>

                    <!-- Contrato enviado -->
                    <template v-else-if="solicitud.status === 'contract_sent'">
                      <button 
                        class="btn primary" 
                        @click="viewContract(solicitud)"
                      >
                        📄 Ver Contrato
                      </button>
                    </template>

                    <!-- Rechazada -->
                    <template v-else-if="solicitud.status === 'rejected'">
                      <div class="info-message rejected">
                        ❌ Solicitud rechazada por el dueño
                      </div>
                    </template>

                    <!-- Pendiente -->
                    <template v-else-if="solicitud.status === 'pending'">
                      <div class="info-message pending">
                        ⏳ Esperando respuesta del dueño...
                      </div>
                      <button 
                        class="btn danger-outline" 
                        @click="cancelRequest(solicitud.id)"
                      >
                        Cancelar solicitud
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vacío -->
            <div v-else class="empty">
              <i class="fas fa-clipboard-list"></i>
              <p>No tienes solicitudes de visita</p>
              <button class="btn primary" @click="goToProperties">
                Buscar propiedades
              </button>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { rentalRequestService } from "../../../services/rentalRequestService";

const props = defineProps({
  open: Boolean
});

const emit = defineEmits(["close", "view-contract"]);
const router = useRouter();

const solicitudes = ref([]);
const loading = ref(false);

const close = () => emit("close");

// Cargar solicitudes cuando se abre
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await loadRequests();
  }
});

const loadRequests = async () => {
  loading.value = true;
  try {
    solicitudes.value = await rentalRequestService.getMyRequests();
  } catch (error) {
    console.error("Error cargando solicitudes:", error);
  } finally {
    loading.value = false;
  }
};

// Aceptar contra-propuesta
const acceptCounter = async (requestId) => {
  try {
    await rentalRequestService.acceptCounterProposal(requestId);
    await loadRequests();
  } catch (error) {
    console.error("Error aceptando contra-propuesta:", error);
    alert("Error al aceptar la nueva fecha");
  }
};

// Rechazar contra-propuesta
const rejectCounter = async (requestId) => {
  if (!confirm("¿Rechazar la fecha propuesta?")) return;
  
  try {
    await rentalRequestService.rejectCounterProposal(requestId);
    await loadRequests();
  } catch (error) {
    console.error("Error rechazando contra-propuesta:", error);
    alert("Error al rechazar");
  }
};

// Cancelar solicitud
const cancelRequest = async (requestId) => {
  if (!confirm("¿Cancelar esta solicitud de visita?")) return;
  
  try {
    await rentalRequestService.cancelRequest(requestId);
    await loadRequests();
  } catch (error) {
    console.error("Error cancelando solicitud:", error);
    alert("Error al cancelar");
  }
};

// Ver contrato
const viewContract = (request) => {
  close();
  emit("view-contract", request);
  router.push("/contratos");
};

// Ir a propiedades
const goToProperties = () => {
  close();
  router.push("/propiedades");
};

// Utilidades
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
    counter_proposed: "Nueva fecha propuesta",
    visit_completed: "Visita completada",
    contract_sent: "Contrato enviado"
  };
  return map[status] || status;
};
</script>

<style scoped>
@import "../../../assets/css/MyRequestsModal.css";
</style>