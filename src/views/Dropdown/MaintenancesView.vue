<template>
  <div class="user-maintenances-page">
    <div class="page-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
    </div>

    <main class="maintenances-container">
      <div class="page-header">
        <div class="header-left">
          <h1>Mis Solicitudes de Mantenimiento</h1>
          <p>Supervisa el estado de tus reportes de averías o mejoras</p>
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <font-awesome-icon icon="plus" class="mr-2" /> 
          Nueva Solicitud
        </button>
      </div>

      <!-- Content -->
      <div class="maintenances-content">
        <div class="filters-bar">
          <div class="search-box">
            <font-awesome-icon icon="search" class="search-icon" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar por título o propiedad..." 
              @input="handleSearch"
            />
          </div>
          <select v-model="statusFilter" @change="fetchMaintenances" class="status-select">
            <option value="">Todos los Estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>

        <div v-else-if="maintenances.length === 0" class="empty-state">
          <font-awesome-icon icon="tools" class="empty-icon" />
          <h3>Sin solicitudes de mantenimiento</h3>
          <p>Actualmente no tienes reportes de mantenimiento activos.</p>
          <button class="btn-primary mt-4" @click="openCreateModal">
            Generar un Reporte
          </button>
        </div>

        <div v-else class="table-wrapper">
          <table class="maintenances-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Propiedad</th>
                <th>Título</th>
                <th>Prioridad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in maintenances" :key="req.id">
                <td class="font-medium text-gray-500">#{{ req.id }}</td>
                <td>{{ formatDate(req.created_at) }}</td>
                <td>
                  <span v-if="req.property" class="font-medium text-blue-600">
                    {{ req.property.title }}
                  </span>
                  <span v-else class="text-gray-400">N/A</span>
                </td>
                <td class="max-w-[200px] truncate" :title="req.title">
                  {{ req.title }}
                </td>
                <td>
                  <span :class="['priority-badge', req.priority]">
                    {{ translatePriority(req.priority) }}
                  </span>
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
    
    <!-- Using the existing modal for submission -->
    <MaintenanceModal 
      :is-visible="showCreateModal" 
      @close="closeCreateModal" 
      @submitted="onMaintenanceSubmitted" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAlerts } from '@/composables/useAlerts';
import MaintenanceModal from '@/components/modals/Maintenance/MaintenanceModal.vue';
import api from '@/services/api';

const { error, success } = useAlerts();

const maintenances = ref<any[]>([]);
const loading = ref(true);
const meta = ref<any>(null);
const showCreateModal = ref(false);

const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
let searchTimeout: any = null;

onMounted(() => {
  fetchMaintenances();
});

const fetchMaintenances = async () => {
  loading.value = true;
  try {
    const params: any = { page: currentPage.value };
    if (searchQuery.value) params.search = searchQuery.value;
    if (statusFilter.value) params.status = statusFilter.value;

    const response = await api.get('/maintenances', { params });
    const resData = response.data;
    maintenances.value = resData.data ?? ((Array.isArray(resData)) ? resData : []);
    meta.value = resData.meta ?? { current_page: 1, last_page: 1 };
  } catch (err: any) {
    console.error('Error fetching user maintenances:', err);
    error('No se pudieron cargar las solicitudes. Intenta de nuevo.', 'Error');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchMaintenances();
  }, 500);
};

const changePage = (page: number) => {
  currentPage.value = page;
  fetchMaintenances();
};

const openCreateModal = () => {
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

const onMaintenanceSubmitted = () => {
  success('Solicitud enviada correctamente', 'Éxito');
  showCreateModal.value = false;
  // Reload exactly after creation
  currentPage.value = 1;
  fetchMaintenances();
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
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };
  return map[status?.toLowerCase()] || status;
};

const translatePriority = (priority: string) => {
  const map: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    emergency: 'Emergencia'
  };
  return map[priority?.toLowerCase()] || priority;
};
</script>

<style scoped>
.user-maintenances-page {
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
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0) 70%);
}

.orb-2 {
  bottom: -10%;
  right: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0) 70%);
}

.maintenances-container {
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
  background: #3b82f6;
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

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.maintenances-content {
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

.status-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: white;
  color: #334155;
  font-size: 0.95rem;
  min-width: 180px;
  cursor: pointer;
}

.status-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.table-wrapper {
  overflow-x: auto;
}

.maintenances-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.maintenances-table th {
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

.maintenances-table th:first-child { border-top-left-radius: 10px; }
.maintenances-table th:last-child { border-top-right-radius: 10px; }

.maintenances-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.95rem;
  vertical-align: middle;
}

.maintenances-table tr:last-child td { border-bottom: none; }
.maintenances-table tbody tr:hover { background-color: #f8fafc; }

.font-medium { font-weight: 500; }
.text-gray-500 { color: #64748b; }
.text-gray-400 { color: #94a3b8; }
.text-blue-600 { color: #2563eb; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.max-w-\[200px\] { max-width: 200px; }

.status-badge, .priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.completed { background: #dcfce7; color: #166534; }
.status-badge.in_progress { background: #e0e7ff; color: #3730a3; }
.status-badge.pending { background: #fef9c3; color: #854d0e; }
.status-badge.cancelled { background: #f1f5f9; color: #475569; }

.priority-badge.low { background: #f1f5f9; color: #475569; }
.priority-badge.medium { background: #fef9c3; color: #854d0e; }
.priority-badge.high { background: #fee2e2; color: #991b1b; }
.priority-badge.emergency { background: #991b1b; color: white; }

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
  max-width: 300px;
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

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .search-box { max-width: none; }
  .maintenances-table td, .maintenances-table th { padding: 0.75rem; }
}
</style>
