<template>
  <div class="contracts-page">
    <div class="page-background"></div>

    <main class="carousel-container">
      <h2 class="titulo">Mis Contratos</h2>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando contratos...</p>
      </div>

      <!-- Carrusel de Contratos Paginado -->
      <div v-else-if="contracts.length > 0">
        <!-- Ir a Contrato 
        <div class="go-to-contract">
          <label for="contract-select">Ir a contrato:</label>
          <select id="contract-select" v-model="selectedContractId" @change="goToContract">
            <option value="">Seleccionar...</option>
            <option v-for="contract in contracts" :key="contract.id" :value="contract.id">
              {{ contract.title }} - {{ contract.propertyAddress }}
            </option>
          </select>
        </div> -->

        <div class="carousel">
          <div v-for="(contract, index) in paginatedContracts" :key="contract.id" class="card" :class="{
            active: activeIndex === index,
            'highlight-new': contract.isNew,
            'highlight-pending': contract.status === 'pending' && isUserTenant(contract),
          }" @click="setActiveContract(index)">
            <div class="card-badge" v-if="contract.isNew">Nuevo</div>
            <div class="card-badge pending-badge" v-if="contract.status === 'pending' && isUserTenant(contract)">
              Acción requerida
            </div>

            <img :src="getPropertyImage(contract.propertyImage)" :alt="contract.title" @error="handleImageError" />
            <h4>{{ contract.title }}</h4>
            <p class="property-address">{{ contract.propertyAddress }}</p>
            <p>
              Estado:
              <span :style="{ color: getStatusInfo(contract.status).color }">
                {{ getStatusInfo(contract.status).text }}
              </span>
            </p>
            <div class="contract-price">
              {{ formatPrice(contract.monthlyPrice) }}/mes
            </div>

            <div class="card-actions">
              <template v-if="contract.status === 'pending' && isUserTenant(contract)">
                <button class="btn-accept" @click.stop="openAcceptModal(contract)">
                  <i class="fas fa-check"></i>
                  Revisar
                </button>
              </template>

              <template v-else>
                <button class="vista-previa" @click.stop="openContractModal(contract)">
                  <font-awesome-icon :icon="['fas', 'eye']" />
                  Vista previa
                </button>
                <button class="download-btn-sm" @click.stop="downloadContract(contract)">
                  <font-awesome-icon :icon="['fas', 'download']" />
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Controles del Carrusel con Paginación -->
        <div class="carousel-controls">
          <button @click="prevPage" :disabled="currentPage === 0">⟨⟨</button>
          <button @click="prevContract" :disabled="activeIndex === 0">⟨</button>
          <span class="carousel-counter">
            {{ activeIndex + 1 }} / {{ paginatedContracts.length }}
            <span class="page-indicator">(Página {{ currentPage + 1 }} / {{ totalPages }})</span>
          </span>
          <button @click="nextContract" :disabled="activeIndex === paginatedContracts.length - 1">⟩</button>
          <button @click="nextPage" :disabled="currentPage === totalPages - 1">⟩⟩</button>
        </div>

        <!-- Estadísticas -->
        <div class="contracts-stats">
          <div class="stat-item">
            <span class="stat-number">{{ contractStats.active }}</span>
            <span class="stat-label">Activos</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ contractStats.total }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ contractStats.pending }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay contratos -->
      <div v-else class="empty-state">
        <i class="fas fa-file-contract"></i>
        <p>No tienes contratos aún</p>
      </div>
    </main>

    <!-- Modal de Vista Previa -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedContract?.title }}</h3>
          <span class="close" @click="closeModal">&times;</span>
        </div>

        <div v-if="previewLoading" class="preview-loading">
          <div class="loading-spinner"></div>
          <p>Generando vista previa del contrato...</p>
        </div>

        <div v-else class="contract-preview">
          <iframe v-if="contractPdfUrl" :src="contractPdfUrl" class="pdf-preview" frameborder="0"></iframe>
          <div v-else class="preview-fallback">
            <i class="fas fa-file-contract"></i>
            <p>Vista previa no disponible</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
            Cerrar
          </button>
          <button class="download-btn" @click="downloadContract(selectedContract!)" :disabled="!contractPdfUrl">
            <i class="fas fa-download"></i>
            Descargar PDF
          </button>
          <button class="share-btn" @click="shareContract(selectedContract!)">
            <i class="fas fa-share"></i>
            Compartir
          </button>
        </div>

        <div class="contract-details">
          <h4>Detalles del Contrato</h4>
          <div class="details-grid">
            <div class="detail-item">
              <label>Propiedad:</label>
              <span>{{ selectedContract?.propertyAddress }}</span>
            </div>
            <div class="detail-item">
              <label>Inquilino:</label>
              <span>{{ selectedContract?.tenantName }}</span>
            </div>
            <div class="detail-item">
              <label>Valor Mensual:</label>
              <span>{{ formatPrice(selectedContract?.monthlyPrice) }}</span>
            </div>
            <div class="detail-item">
              <label>Duración:</label>
              <span>{{ getContractDuration(selectedContract!) }}</span>
            </div>
            <div class="detail-item">
              <label>Fecha Inicio:</label>
              <span>{{ formatDate(selectedContract?.startDate) }}</span>
            </div>
            <div class="detail-item">
              <label>Fecha Fin:</label>
              <span>{{ formatDate(selectedContract?.endDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Aceptar/Rechazar Contrato -->
    <div v-if="showAcceptModal" class="modal-overlay" @click="closeAcceptModal">
      <div class="accept-modal-content" @click.stop>
        <div class="modal-header">
          <h3>📄 Revisar Contrato</h3>
          <span class="close" @click="closeAcceptModal">&times;</span>
        </div>

        <div class="accept-modal-body">
          <div v-if="previewLoading" class="preview-loading">
            <div class="loading-spinner"></div>
            <p>Cargando contrato...</p>
          </div>

          <div v-else class="contract-preview">
            <iframe v-if="contractPdfUrl" :src="contractPdfUrl" class="pdf-preview" frameborder="0"></iframe>
            <div v-else class="preview-fallback">
              <i class="fas fa-file-contract"></i>
              <p>Vista previa no disponible</p>
            </div>
          </div>

          <div class="contract-summary">
            <h4>Resumen del Contrato</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Propiedad:</span>
                <span class="summary-value">{{ selectedContract?.propertyAddress }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Arrendador:</span>
                <span class="summary-value">{{ selectedContract?.landlordName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Valor mensual:</span>
                <span class="summary-value highlight">{{ formatPrice(selectedContract?.monthlyPrice) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Depósito:</span>
                <span class="summary-value">{{ formatPrice(selectedContract?.deposit) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Duración:</span>
                <span class="summary-value">{{ getContractDuration(selectedContract!) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Inicio:</span>
                <span class="summary-value">{{ formatDate(selectedContract?.startDate) }}</span>
              </div>
            </div>

            <div v-if="selectedContract?.clauses && selectedContract.clauses.length > 0" class="clauses-section">
              <h5>Cláusulas importantes:</h5>
              <ul class="clauses-list">
                <li v-for="(clause, idx) in selectedContract.clauses" :key="idx">
                  {{ clause }}
                </li>
              </ul>
            </div>
          </div>

          <div class="confirmation-box">
            <label class="checkbox-label">
              <input type="checkbox" v-model="contractAccepted" />
              <span>He leído y acepto los términos del contrato</span>
            </label>
          </div>

          <div class="accept-modal-actions">
            <button class="btn-accept-full" @click="acceptContract" :disabled="!contractAccepted || acceptLoading">
              <i class="fas fa-check-circle"></i>
              {{ acceptLoading ? 'Aceptando...' : 'Aceptar Contrato' }}
            </button>
            <button class="btn-reject-full" @click="rejectContract" :disabled="acceptLoading">
              <i class="fas fa-times-circle"></i>
              Rechazar Contrato
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { contractService } from "../../services/contractService";
import { pdfService } from "../../services/pdfService";

// Constante para imagen por defecto
const DEFAULT_PROPERTY_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=";

interface ContractCardUI {
  id: number;
  title: string;
  status: string;
  propertyImage?: string;
  propertyAddress?: string;
  startDate?: string;
  endDate?: string;
  monthlyPrice?: number;
  deposit?: number;
  tenantName: string;
  tenantCC?: string;
  tenantEmail?: string;
  landlordName: string;
  landlordCC?: string;
  landlordEmail?: string;
  propertyType?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  clauses?: string[];
  isNew?: boolean;
  tenantId?: number;
  landlordId?: number;
}

// Estados
const contracts = ref<ContractCardUI[]>([]);
const activeIndex = ref(0);
const currentPage = ref(0);
const itemsPerPage = 5;
const showModal = ref(false);
const showAcceptModal = ref(false);
const selectedContract = ref<ContractCardUI | null>(null);
const contractPdfUrl = ref<string>("");
const previewLoading = ref(false);
const loading = ref(true);
const contractAccepted = ref(false);
const acceptLoading = ref(false);
const currentUserId = ref<number | null>(null);
//const selectedContractId = ref<string>("");

const contractStats = ref({
  active: 0,
  pending: 0,
  total: 0,
});

// Computed: Contratos paginados
const totalPages = computed(() => Math.ceil(contracts.value.length / itemsPerPage));

const paginatedContracts = computed(() => {
  const start = currentPage.value * itemsPerPage;
  const end = start + itemsPerPage;
  return contracts.value.slice(start, end);
});

// Watchers optimizados
watch(showModal, (val) => {
  document.body.style.overflow = val ? "hidden" : "";
});

watch(showAcceptModal, (val) => {
  document.body.style.overflow = val ? "hidden" : "";
});

watch(currentPage, () => {
  activeIndex.value = 0;
});

// Cargar usuario actual
const loadCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  currentUserId.value = user.id || null;
};

const isUserTenant = (contract: ContractCardUI) => {
  return contract.tenantId === currentUserId.value;
};

// Navegación de página
const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
  }
};

// Navegación de contratos
const setActiveContract = (index: number) => {
  activeIndex.value = index;
};

const prevContract = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--;
  }
};

const nextContract = () => {
  if (activeIndex.value < paginatedContracts.value.length - 1) {
    activeIndex.value++;
  }
};

// NUEVA: Ir a contrato específico
// const goToContract = () => {
//   if (!selectedContractId.value) return;

//   const contractId = parseInt(selectedContractId.value);
//   const contractIndex = contracts.value.findIndex(c => c.id === contractId);

//   if (contractIndex !== -1) {
//     // Calcular en qué página está el contrato
//     const targetPage = Math.floor(contractIndex / itemsPerPage);
//     const indexInPage = contractIndex % itemsPerPage;

//     // Cambiar a la página correcta
//     currentPage.value = targetPage;

//     // Esperar a que se actualice la vista y luego activar el contrato
//     setTimeout(() => {
//       activeIndex.value = indexInPage;

//       // Scroll suave hacia el contrato
//       const cardElement = document.querySelector('.card.active');
//       if (cardElement) {
//         cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//     }, 100);
//   }

//   // Reset del selector
//   selectedContractId.value = "";
// };

// NUEVA: Manejar error de imagen
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = DEFAULT_PROPERTY_IMAGE;
};

// Generar PDF con validación completa de tipos
const generatePdfSafely = async (contract: ContractCardUI): Promise<string> => {
  const contractData = {
    id: contract.id,
    title: contract.title,
    status: contract.status,
    propertyImage: contract.propertyImage || DEFAULT_PROPERTY_IMAGE,
    propertyAddress: contract.propertyAddress || 'Sin dirección',
    startDate: contract.startDate || '',
    endDate: contract.endDate || '',
    monthlyPrice: contract.monthlyPrice || 0,
    deposit: contract.deposit || 0,
    tenantName: contract.tenantName,
    tenantCC: contract.tenantCC || 'N/A',
    tenantEmail: contract.tenantEmail || 'N/A',
    landlordName: contract.landlordName,
    landlordCC: contract.landlordCC || 'N/A',
    landlordEmail: contract.landlordEmail || 'N/A',
    propertyType: contract.propertyType || 'N/A',
    area: contract.area || 0,
    bedrooms: contract.bedrooms || 0,
    bathrooms: contract.bathrooms || 0,
    clauses: contract.clauses || [],
    isNew: contract.isNew || false,
    tenantId: contract.tenantId,
    landlordId: contract.landlordId,
  };

  return await pdfService.generateContract(contractData);
};

// Modal de vista previa
const openContractModal = async (contract: ContractCardUI) => {
  selectedContract.value = contract;
  showModal.value = true;
  previewLoading.value = true;
  contractPdfUrl.value = "";

  try {
    contractPdfUrl.value = await generatePdfSafely(contract);
  } catch (error) {
    console.error("Error generando PDF:", error);
  } finally {
    previewLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedContract.value = null;
  contractPdfUrl.value = "";
};

// Modal de aceptar/rechazar
const openAcceptModal = async (contract: ContractCardUI) => {
  selectedContract.value = contract;
  showAcceptModal.value = true;
  contractAccepted.value = false;
  previewLoading.value = true;
  contractPdfUrl.value = "";

  try {
    contractPdfUrl.value = await generatePdfSafely(contract);
  } catch (error) {
    console.error("Error generando PDF:", error);
  } finally {
    previewLoading.value = false;
  }
};

const closeAcceptModal = () => {
  showAcceptModal.value = false;
  selectedContract.value = null;
  contractAccepted.value = false;
  contractPdfUrl.value = "";
};

// Aceptar contrato
const acceptContract = async () => {
  if (!selectedContract.value || !contractAccepted.value) return;

  if (!confirm("¿Estás seguro de aceptar este contrato? Esta acción es definitiva.")) {
    return;
  }

  acceptLoading.value = true;

  try {
    await contractService.acceptContract(selectedContract.value.id);
    alert("✅ Contrato aceptado exitosamente. Ahora está activo.");
    closeAcceptModal();
    await Promise.all([loadContracts(), loadContractStats()]);
  } catch (error: any) {
    console.error("Error aceptando contrato:", error);
    alert(error.response?.data?.message || "Error al aceptar el contrato");
  } finally {
    acceptLoading.value = false;
  }
};

// Rechazar contrato
const rejectContract = async () => {
  if (!selectedContract.value) return;

  if (!confirm("¿Estás seguro de rechazar este contrato? Esta acción NO se puede deshacer.")) {
    return;
  }

  acceptLoading.value = true;

  try {
    await contractService.rejectContract(selectedContract.value.id);
    alert("❌ Contrato rechazado.");
    closeAcceptModal();
    await Promise.all([loadContracts(), loadContractStats()]);
  } catch (error: any) {
    console.error("Error rechazando contrato:", error);
    alert(error.response?.data?.message || "Error al rechazar el contrato");
  } finally {
    acceptLoading.value = false;
  }
};

// Descargar y compartir
const downloadContract = async (contract: ContractCardUI) => {
  try {
    const pdfUrl = await generatePdfSafely(contract);
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `contrato_${contract.id}.pdf`;
    link.click();
  } catch (error) {
    console.error("Error descargando contrato:", error);
    alert("Error al descargar el contrato.");
  }
};

const shareContract = async (contract: ContractCardUI) => {
  if (navigator.share) {
    await navigator.share({
      title: contract.title,
      text: `Contrato - ${contract.propertyAddress}`,
      url: window.location.href,
    });
  } else {
    navigator.clipboard.writeText(
      `Contrato: ${contract.title}\nDirección: ${contract.propertyAddress}`
    );
    alert("Información copiada al portapapeles");
  }
};

// Utilidades
const getPropertyImage = (img?: string) => {
  if (!img) return DEFAULT_PROPERTY_IMAGE;
  if (img.startsWith("data:image")) return img;
  if (img.startsWith("/")) return img;
  return `/img/${img}`;
};

const getStatusInfo = (status: string) => {
  const map: Record<string, { text: string; color: string }> = {
    active: { text: "Activo", color: "green" },
    inactive: { text: "Inactivo", color: "gray" },
    expired: { text: "Expirado", color: "red" },
    pending: { text: "Pendiente", color: "orange" },
    rejected: { text: "Rechazado", color: "red" },
  };
  return map[status] ?? { text: "Desconocido", color: "black" };
};

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("es-ES") : "N/A";

const formatPrice = (price?: number) =>
  price
    ? new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
    : "Consultar";

const getContractDuration = (contract: ContractCardUI) => {
  if (!contract.startDate || !contract.endDate) return "N/A";
  const start = new Date(contract.startDate);
  const end = new Date(contract.endDate);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return `${months} meses`;
};

// Cargar estadísticas optimizado
const loadContractStats = async () => {
  try {
    const response = await contractService.getContractStats();
    contractStats.value = response;
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
  }
};

// Cargar contratos optimizado
const loadContracts = async () => {
  try {
    loading.value = true;
    const response = await contractService.getContracts();

    contracts.value = response.map((c: any) => {
      let parsedTerms: any = {};
      if (c.document_path) {
        try {
          parsedTerms = typeof c.document_path === 'string'
            ? JSON.parse(c.document_path)
            : c.document_path;
        } catch (e) {
          console.error("Error parseando document_path:", e);
        }
      }

      return {
        id: c.id,
        title: `Contrato ${c.id}`,
        status: c.status,
        propertyImage: c.property?.image_url,
        propertyAddress: c.property?.address,
        startDate: c.start_date,
        endDate: c.end_date,
        monthlyPrice: parsedTerms.monthly_price || c.property?.monthly_price,
        deposit: c.deposit || parsedTerms.deposit,
        tenantName: c.tenant?.name ?? "N/A",
        tenantCC: c.tenant?.id_documento ?? "N/A",
        tenantEmail: c.tenant?.email ?? "N/A",
        tenantId: c.tenant_id,
        landlordName: c.landlord?.name ?? "N/A",
        landlordCC: c.landlord?.id_documento ?? "N/A",
        landlordEmail: c.landlord?.email ?? "N/A",
        landlordId: c.landlord_id,
        propertyType: c.property?.title,
        area: c.property?.area_m2,
        bedrooms: c.property?.num_bedrooms,
        bathrooms: c.property?.num_bathrooms,
        clauses: parsedTerms.clauses ?? [],
        isNew: c.status === 'pending',
      };
    });
  } catch (error) {
    console.error("Error cargando contratos:", error);
  } finally {
    loading.value = false;
  }
};

// Montaje optimizado
onMounted(async () => {
  loadCurrentUser();
  await Promise.all([loadContracts(), loadContractStats()]);
});
</script>

<style scoped>
@import "../../assets/css/Dropdown/ContractView.css";
</style>