<template>
  <transition name="modal-fade">
    <div v-if="open" class="overlay" @click.self="close">
      <transition name="modal-scale">
        <div class="modal">
          <!-- Decorative particles -->
          <div class="particles">
            <div v-for="i in 6" :key="i" class="particle" :style="{ '--delay': i * 0.4 + 's' }"></div>
          </div>

          <!-- HEADER -->
          <header class="modal-header">
            <div class="header-content">
              <div class="icon-badge">
                <font-awesome-icon icon="home" class="header-icon" />
              </div>
              <div class="title-box">
                <h2>{{ t('requests.title') }}</h2>
                <p class="subtitle">{{ t('requests.subtitle') }}</p>
              </div>
            </div>
            <button class="btn-close" @click="close">
              <font-awesome-icon icon="times" />
            </button>
          </header>

          <!-- BODY -->
          <section class="modal-body">
            <!-- LOADING -->
            <div v-if="loading" class="loading">
              <div class="spinner-wrapper">
                <font-awesome-icon icon="spinner" class="spinner" spin />
              </div>
              <p>{{ t('requests.loading') }}</p>
            </div>

            <!-- SOLICITUDES -->
            <transition-group v-else-if="solicitudes.length > 0" name="request-list" tag="div"
              class="requests-container">
              <div class="request-item" v-for="solicitud in solicitudes" :key="solicitud.id">
                <div class="request-glow"></div>

                <!-- IMAGEN PROPIEDAD -->
                <div class="property-image">
                  <img :src="solicitud.property?.image_url" :alt="solicitud.property?.title" />
                  <div class="image-overlay">
                    <font-awesome-icon icon="home" />
                  </div>
                </div>

                <div class="request-details">
                  <!-- INFO PROPIEDAD -->
                  <div class="property-info">
                    <h4>{{ solicitud.property?.title }}</h4>
                    <p class="address">
                      <font-awesome-icon icon="map-marker-alt" class="icon-small" />
                      {{ solicitud.property?.address }}
                    </p>
                  </div>

                  <!-- INFO INQUILINO -->
                  <div class="tenant-info">
                    <div class="tenant-avatar-wrapper">
                      <img :src="solicitud.user?.photo || '/img/default.webp'" class="tenant-avatar"
                        :alt="solicitud.user?.name" />
                      <div class="avatar-ring"></div>
                    </div>
                    <div class="tenant-details">
                      <p class="tenant-name">{{ solicitud.user?.name }}</p>
                      <div class="rating">
                        <font-awesome-icon icon="star" class="star-icon" />
                        {{ solicitud.user?.rating || t('requests.rating.none') }}
                      </div>
                    </div>
                  </div>

                  <!-- FECHA SOLICITADA -->
                  <div class="date-info">
                    <div class="date-label">
                      <font-awesome-icon icon="calendar" class="icon-small" />
                      <span>{{ t('requests.property.requestedDate') }}</span>
                    </div>
                    <div class="date-value">
                      <span class="date">{{ formatDate(solicitud.requested_date) }}</span>
                      <span class="time">
                        <font-awesome-icon icon="clock" class="icon-tiny" />
                        {{ solicitud.requested_time }}
                      </span>
                    </div>
                  </div>

                  <!-- CONTRA-PROPUESTA -->
                  <div v-if="solicitud.status === 'counter_proposed' && solicitud.counter_date"
                    class="counter-proposal">
                    <div class="counter-header">
                      <font-awesome-icon icon="calendar-alt" class="counter-icon" />
                      <span class="counter-title">
                        {{ t('requests.property.proposedDate') }}
                      </span>
                    </div>
                    <div class="counter-value">
                      <span class="date">{{ formatDate(solicitud.counter_date) }}</span>
                      <span class="time">
                        <font-awesome-icon icon="clock" class="icon-tiny" />
                        {{ solicitud.counter_time }}
                      </span>
                    </div>
                  </div>

                  <!-- ESTADO -->
                  <div class="status-badge" :class="solicitud.status">
                    <span class="status-dot"></span>
                    {{ getStatusText(solicitud.status) }}
                  </div>

                  <!-- ACCIONES -->
                  <div class="actions">
                    <template v-if="solicitud.status === 'pending'">
                      <button class="btn success" @click="openReviewModal(solicitud)">
                        <font-awesome-icon icon="eye" />
                        <span>{{ t('requests.actions.review') }}</span>
                      </button>
                      <button class="btn danger" @click="rechazarDirecto(solicitud.id)">
                        <font-awesome-icon icon="times" />
                        <span>{{ t('requests.actions.reject') }}</span>
                      </button>
                    </template>

                    <template v-else-if="solicitud.status === 'accepted'">
                      <div v-if="isVisitPassed(solicitud)" class="actions-full">
                        <button class="btn primary-full" @click="openContractModal(solicitud)">
                          <font-awesome-icon icon="check-circle" />
                          <span>{{ t('requests.actions.continue') }}</span>
                        </button>
                        <button class="btn danger-outline" @click="finalizarProceso(solicitud.id)">
                          <font-awesome-icon icon="times-circle" />
                          <span>{{ t('requests.actions.finish') }}</span>
                        </button>
                      </div>
                      <div v-else class="info-message">
                        <font-awesome-icon icon="clock" class="info-icon" />
                        <span>
                          {{ t('requests.messages.visitScheduled', {
                            date: formatDate(solicitud.requested_date),
                            time: solicitud.requested_time
                          }) }}
                        </span>
                      </div>
                    </template>

                    <template v-else-if="solicitud.status === 'counter_proposed'">
                      <div class="info-message pending">
                        <font-awesome-icon icon="spinner" class="info-icon" spin />
                        <span>{{ t('requests.messages.waitingTenant') }}</span>
                      </div>
                    </template>

                    <template v-else-if="solicitud.status === 'rejected'">
                      <div class="info-message rejected">
                        <font-awesome-icon icon="times-circle" class="info-icon" />
                        <span>{{ t('requests.messages.requestRejected') }}</span>
                      </div>
                    </template>

                    <template v-else-if="solicitud.status === 'contract_sent'">
                      <div class="info-message success">
                        <font-awesome-icon icon="file-alt" class="info-icon" />
                        <span>{{ t('requests.messages.contractWaiting') }}</span>
                      </div>
                    </template>

                    <template v-else-if="solicitud.status === 'visit_completed'">
                      <div class="info-message">
                        <font-awesome-icon icon="check" class="info-icon" />
                        <span>{{ t('requests.messages.visitCompleted') }}</span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </transition-group>

            <!-- VACÍO -->
            <div v-else class="empty">
              <div class="empty-icon-wrapper">
                <font-awesome-icon icon="home" class="empty-icon" />
                <div class="empty-circle"></div>
              </div>
              <h3>{{ t('requests.empty.title') }}</h3>
              <p>{{ t('requests.empty.description') }}</p>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </transition>
</template>


<script setup>
import { ref, watch } from "vue";
import { rentalRequestService } from "../../../services/rentalRequestService";
import { useAlerts } from "../../../composable/useAlerts";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  open: Boolean,
});

const emit = defineEmits(["close"]);

const { success, error, confirm } = useAlerts();

// Bloquear scroll del body cuando el modal está abierto
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Cleanup al desmontar
import { onUnmounted } from 'vue';
onUnmounted(() => {
  document.body.style.overflow = '';
});

// STATE
const solicitudes = ref([]);
const loading = ref(false);
const showReviewModal = ref(false);
const showCounterForm = ref(false);
const showContractModal = ref(false);
const selectedRequest = ref(null);

// Bloquear scroll también para modales anidados
watch([showReviewModal, showContractModal], ([review, contract]) => {
  if (review || contract) {
    document.body.style.overflow = 'hidden';
  } else if (props.open) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

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

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await loadRequests();
  }
});

const loadRequests = async () => {
  loading.value = true;
  try {
    solicitudes.value = await rentalRequestService.getOwnerRequests();
  } catch (err) {
    console.error("Error cargando solicitudes:", err);
    error("Error al cargar las solicitudes", "Error");
  } finally {
    loading.value = false;
  }
};

const isVisitPassed = (solicitud) => {
  if (!solicitud.visit_end_time) return false;
  const visitEndUTC = new Date(solicitud.visit_end_time + "Z");
  const now = new Date();
  return now >= visitEndUTC;
};

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

const toggleCounterForm = () => {
  showCounterForm.value = !showCounterForm.value;

  // Scroll suave al formulario cuando se abre
  if (showCounterForm.value) {
    setTimeout(() => {
      const formElement = document.querySelector('.counter-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }
};

const aceptarSolicitud = async () => {
  if (!selectedRequest.value) return;

  try {
    await rentalRequestService.acceptRequest(selectedRequest.value.id);
    success("Solicitud aceptada correctamente", "¡Éxito!");
    closeReviewModal();
    await loadRequests();
  } catch (err) {
    console.error("Error aceptando solicitud:", err);
    error("Error al aceptar la solicitud", "Error");
  }
};

const rechazarSolicitud = async () => {
  if (!selectedRequest.value) return;

  confirm(
    "¿Estás seguro de rechazar esta solicitud?",
    async () => {
      try {
        await rentalRequestService.rejectRequest(selectedRequest.value.id);
        success("Solicitud rechazada", "Proceso completado");
        closeReviewModal();
        await loadRequests();
      } catch (err) {
        console.error("Error rechazando solicitud:", err);
        error("Error al rechazar la solicitud", "Error");
      }
    },
    undefined,
    {
      title: "Confirmar rechazo",
      confirmText: "Sí, rechazar",
      cancelText: "Cancelar"
    }
  );
};

const rechazarDirecto = async (requestId) => {
  confirm(
    "¿Rechazar esta solicitud sin revisarla?",
    async () => {
      try {
        await rentalRequestService.rejectRequest(requestId);
        success("Solicitud rechazada", "Proceso completado");
        await loadRequests();
      } catch (err) {
        console.error("Error rechazando solicitud:", err);
        error("Error al rechazar la solicitud", "Error");
      }
    },
    undefined,
    {
      title: "Confirmar rechazo",
      confirmText: "Sí, rechazar",
      cancelText: "Cancelar"
    }
  );
};

const enviarContraPropuesta = async () => {
  if (!counterDate.value || !counterTime.value) {
    error("Por favor selecciona fecha y hora", "Campos requeridos");
    return;
  }

  try {
    await rentalRequestService.counterPropose(selectedRequest.value.id, {
      counter_date: counterDate.value,
      counter_time: counterTime.value
    });
    success("Contra-propuesta enviada correctamente", "¡Éxito!");
    closeReviewModal();
    await loadRequests();
  } catch (err) {
    console.error("Error enviando contra-propuesta:", err);
    error("Error al enviar contra-propuesta", "Error");
  }
};

const openContractModal = (solicitud) => {
  selectedRequest.value = solicitud;

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

const enviarContrato = async () => {
  if (!contractData.value.start_date || !contractData.value.end_date) {
    error("Por favor completa las fechas del contrato", "Campos requeridos");
    return;
  }

  if (contractData.value.monthly_price <= 0) {
    error("El precio mensual debe ser mayor a 0", "Precio inválido");
    return;
  }

  try {
    const utilities = utilitiesInput.value
      .split(",")
      .map(u => u.trim())
      .filter(u => u.length > 0);

    let clauses = clausesInput.value
      .split("\n")
      .map(c => c.trim())
      .filter(c => c.length > 0);

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
      clauses: clauses,
      payment_day: parseInt(contractData.value.payment_day),
      late_fee: parseFloat(contractData.value.late_fee),
      utilities_included: utilities,
      special_conditions: contractData.value.special_conditions || ""
    };

    await rentalRequestService.sendContractTerms(payload);
    success("Contrato enviado correctamente al inquilino", "¡Éxito!");
    closeContractModal();
    await loadRequests();
  } catch (err) {
    console.error("Error enviando contrato:", err);

    if (err.response?.data?.message) {
      error(err.response.data.message, "Error");
    } else if (err.response?.data?.errors) {
      const errors = Object.values(err.response.data.errors).flat();
      error(errors.join('\n'), "Errores de validación");
    } else {
      error("Error al enviar el contrato", "Error");
    }
  }
};

const finalizarProceso = async (requestId) => {
  confirm(
    "¿Finalizar el proceso sin generar contrato?",
    async () => {
      try {
        await rentalRequestService.rejectRequest(requestId);
        success("Proceso finalizado", "Completado");
        await loadRequests();
      } catch (err) {
        console.error("Error finalizando proceso:", err);
        error("Error al finalizar el proceso", "Error");
      }
    },
    undefined,
    {
      title: "Confirmar finalización",
      confirmText: "Sí, finalizar",
      cancelText: "Cancelar"
    }
  );
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getStatusText = (status) => {
  return t(`requests.status.${status}`, status);
};


const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};
</script>

<style scoped>
@import "../../../assets/css/components/RequestsView.css";
</style>