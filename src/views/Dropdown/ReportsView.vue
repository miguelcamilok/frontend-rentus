<template>
  <div class="user-reports-page">
    <div class="page-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
    </div>

    <main class="reports-container">
      <div class="page-header">
        <div class="header-left">
          <h1>Mis Reportes y Quejas</h1>
          <p>Realiza y haz seguimiento a tus reclamos sobre usuarios o propiedades</p>
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <font-awesome-icon icon="flag" class="mr-2" /> 
          Nuevo Reporte
        </button>
      </div>

      <!-- Content -->
      <div class="reports-content">
        <div class="filters-bar">
          <div class="search-box">
            <font-awesome-icon icon="search" class="search-icon" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar por detalle..." 
              @input="handleSearch"
            />
          </div>
          <select v-model="statusFilter" @change="fetchReports" class="status-select">
            <option value="">Todos los Estados</option>
            <option value="pending">Pendiente</option>
            <option value="reviewed">Revisado</option>
            <option value="resolved">Resuelto</option>
            <option value="dismissed">Desestimado</option>
          </select>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando reportes...</p>
        </div>

        <div v-else-if="reports.length === 0" class="empty-state">
          <font-awesome-icon icon="file-signature" class="empty-icon" />
          <h3>No has generado ningún reporte</h3>
          <p>Si tuviste algún inconveniente en la plataforma, puedes crear un reporte aquí.</p>
          <button class="btn-primary mt-4" @click="openCreateModal">
            Crear Reporte
          </button>
        </div>

        <div v-else class="table-wrapper">
          <table class="reports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in reports" :key="req.id">
                <td class="font-medium text-gray-500">#{{ req.id }}</td>
                <td>{{ formatDate(req.created_at) }}</td>
                <td>
                  <span class="report-type">
                    <font-awesome-icon :icon="getTypeIcon(req.type)" class="mr-1" />
                    {{ translateType(req.type) }}
                  </span>
                </td>
                <td class="max-w-[300px] truncate text-sm" :title="req.description">
                  {{ req.description }}
                </td>
                <td>
                  <span :class="['status-badge', req.status]">
                    {{ translateStatus(req.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="meta && meta.last_page > 1" class="pagination">
          <button 
            :disabled="meta.current_page === 1"
            @click="changePage(meta.current_page - 1)"
            class="page-btn"
          >
            <font-awesome-icon icon="chevron-left" /> Anterior
          </button>
          <span>Página {{ meta.current_page }} de {{ meta.last_page }}</span>
          <button 
            :disabled="meta.current_page === meta.last_page"
            @click="changePage(meta.current_page + 1)"
            class="page-btn"
          >
            Siguiente <font-awesome-icon icon="chevron-right" />
          </button>
        </div>
      </div>
    </main>
    
    <!-- Report Modal Placeholder -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showCreateModal" class="modal-backdrop" @click.self="closeCreateModal">
          <div class="modal">
            <header class="modal-header">
              <h3>Crear Nuevo Reporte</h3>
              <button class="btn-close" @click="closeCreateModal">
                <font-awesome-icon icon="times" />
              </button>
            </header>
            <div class="modal-body">
              <div class="form-group">
                <label>Tipo de Reporte</label>
                <select v-model="newReport.type" class="form-select">
                  <option value="property">Propiedad</option>
                  <option value="user">Usuario</option>
                  <option value="review">Reseña</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div class="form-group" v-if="newReport.type === 'property'">
                <label>ID de la Propiedad (Opcional)</label>
                <input v-model="newReport.property_id" type="number" class="form-input" placeholder="Ej: 1">
              </div>
              <div class="form-group" v-if="newReport.type === 'user'">
                <label>ID del Usuario (Opcional)</label>
                <input v-model="newReport.reported_user_id" type="number" class="form-input" placeholder="Ej: 1">
              </div>
              <div class="form-group">
                <label>Detalle de lo ocurrido</label>
                <textarea 
                  v-model="newReport.description" 
                  rows="4" 
                  class="form-input" 
                  placeholder="Por favor, sé lo más específico posible..."
                ></textarea>
              </div>
            </div>
            <footer class="modal-footer">
              <button class="btn-outline" @click="closeCreateModal">Cancelar</button>
              <button class="btn-primary" @click="submitReport" :disabled="!isReportValid">
                Enviar Reporte
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAlerts } from '@/composables/useAlerts';
import api from '@/services/api';

const { error, success } = useAlerts();

const reports = ref<any[]>([]);
const loading = ref(true);
const meta = ref<any>(null);
const showCreateModal = ref(false);

const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
let searchTimeout: any = null;

const newReport = ref({
  type: 'property',
  description: '',
  property_id: null,
  reported_user_id: null
});

onMounted(() => {
  fetchReports();
});

const fetchReports = async () => {
  loading.value = true;
  try {
    const params: any = { page: currentPage.value };
    if (searchQuery.value) params.search = searchQuery.value;
    if (statusFilter.value) params.status = statusFilter.value;

    const response = await api.get('/reports', { params });
    const resData = response.data;
    reports.value = resData.data ?? ((Array.isArray(resData)) ? resData : []);
    meta.value = resData.meta ?? { current_page: 1, last_page: 1 };
  } catch (err: any) {
    console.error('Error fetching reports:', err);
    error('No se pudieron cargar tus reportes.', 'Error');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchReports();
  }, 500);
};

const changePage = (page: number) => {
  currentPage.value = page;
  fetchReports();
};

const openCreateModal = () => {
  newReport.value = {
    type: 'property',
    description: '',
    property_id: null,
    reported_user_id: null
  };
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

const isReportValid = computed(() => {
  return newReport.value.description.trim().length > 0;
});

const submitReport = async () => {
  if (!isReportValid.value) return;
  try {
    const payload: any = { ...newReport.value };
    if (payload.type !== 'property') delete payload.property_id;
    if (payload.type !== 'user') delete payload.reported_user_id;

    await api.post('/reports', payload);
    success('Tu reporte ha sido enviado. Será revisado por un administrador.', 'Reporte Enviado');
    closeCreateModal();
    currentPage.value = 1;
    fetchReports();
  } catch (err: any) {
    console.error('Failed to submit report', err);
    error('No pudimos enviar tu reporte. Intenta más tarde.', 'Error');
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-CO', {
    dateStyle: 'medium'
  });
};

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    reviewed: 'En Revisión',
    resolved: 'Resuelto',
    dismissed: 'Desestimado'
  };
  return map[status?.toLowerCase()] || status;
};

const translateType = (type: string) => {
  const map: Record<string, string> = {
    property: 'Propiedad',
    user: 'Usuario',
    review: 'Reseña',
    other: 'Otro'
  };
  return map[type?.toLowerCase()] || type;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'property': return 'home';
    case 'user': return 'user';
    case 'review': return 'star';
    default: return 'flag';
  }
};
</script>

<style scoped>
.user-reports-page {
  min-height: calc(100vh - 80px);
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;
}

.page-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  top: -10%;
  left: -5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0) 70%);
}

.orb-2 {
  bottom: -10%;
  right: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%);
}

.reports-container {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left h1 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-family: 'Outfit', sans-serif;
}

.header-left p {
  color: #64748b;
  font-size: 1rem;
}

.btn-primary {
  background: #ef4444;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
}

.btn-primary:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #64748b;
  border: 1px solid #cbd5e1;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #f8fafc;
  color: #334155;
  border-color: #94a3b8;
}

.mr-2 { margin-right: 0.5rem; }
.mr-1 { margin-right: 0.25rem; }
.mt-4 { margin-top: 1rem; }

.reports-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.status-select, .form-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: white;
  color: #334155;
  font-size: 0.95rem;
  min-width: 180px;
  cursor: pointer;
}

.status-select:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.table-wrapper {
  overflow-x: auto;
}

.reports-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.reports-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.reports-table th:first-child { border-top-left-radius: 10px; }
.reports-table th:last-child { border-top-right-radius: 10px; }

.reports-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.95rem;
  vertical-align: middle;
}

.reports-table tr:last-child td { border-bottom: none; }
.reports-table tbody tr:hover { background-color: #f8fafc; }

.font-medium { font-weight: 500; }
.text-gray-500 { color: #64748b; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.max-w-\[300px\] { max-width: 300px; }
.text-sm { font-size: 0.875rem; }

.report-type {
  display: inline-flex;
  align-items: center;
  color: #475569;
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.resolved { background: #dcfce7; color: #166534; }
.status-badge.reviewed { background: #e0e7ff; color: #3730a3; }
.status-badge.pending { background: #fef9c3; color: #854d0e; }
.status-badge.dismissed { background: #f1f5f9; color: #475569; }

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.empty-icon {
  font-size: 3.5rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #334155;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  max-width: 350px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
  color: #64748b;
  font-size: 0.9rem;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: #3b82f6;
  border-color: #cbd5e1;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styling */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-pop {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f8fafc;
}

/* Animations */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .search-box { max-width: none; }
  .reports-table td, .reports-table th { padding: 0.75rem; }
}
</style>
