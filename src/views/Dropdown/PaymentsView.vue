<template>
  <div class="user-payments-page">
    <div class="page-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
    </div>

    <main class="payments-container">
      <div class="page-header">
        <h1>Mis Pagos</h1>
        <p>Gestiona y revisa tu historial de transacciones</p>
      </div>

      <!-- Content -->
      <div class="payments-content">
        <div class="filters-bar">
          <div class="search-box">
            <font-awesome-icon icon="search" class="search-icon" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar por ID de contrato o monto..." 
              @input="handleSearch"
            />
          </div>
          <select v-model="statusFilter" @change="fetchPayments" class="status-select">
            <option value="">Todos los Estados</option>
            <option value="completed">Completados</option>
            <option value="pending">Pendientes</option>
            <option value="failed">Fallidos</option>
          </select>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando pagos...</p>
        </div>

        <div v-else-if="payments.length === 0" class="empty-state">
          <font-awesome-icon icon="receipt" class="empty-icon" />
          <h3>No se encontraron pagos</h3>
          <p>Aún no tienes registros de pagos o tu búsqueda no arrojó resultados.</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="payments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id">
                <td class="font-medium">#{{ payment.id }}</td>
                <td>{{ formatDate(payment.created_at) }}</td>
                <td class="amount-cell">{{ formatPrice(payment.amount) }}</td>
                <td>
                  <span :class="['status-badge', payment.status]">
                    {{ translateStatus(payment.status) }}
                  </span>
                </td>
                <td>{{ translateType(payment.type) }}</td>
                <td>
                  <span v-if="payment.contract" class="text-sm">
                    Contrato #{{ payment.contract.id }}
                  </span>
                  <span v-else class="text-gray-400 text-sm">N/A</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAlerts } from '@/composables/useAlerts';
// You would ideally create a user-facing method in paymentService, e.g. getUserPayments
// For now we will assume the backend allows generic users to fetch their payments at /payments GET
import api from '@/services/api';

const { error } = useAlerts();

const payments = ref<any[]>([]);
const loading = ref(true);
const meta = ref<any>(null);

const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
let searchTimeout: any = null;

onMounted(() => {
  fetchPayments();
});

const fetchPayments = async () => {
  loading.value = true;
  try {
    const params: any = { page: currentPage.value };
    if (searchQuery.value) params.search = searchQuery.value;
    if (statusFilter.value) params.status = statusFilter.value;

    const response = await api.get('/payments', { params });
    // Assuming enveloped format { success, data, meta }
    const resData = response.data;
    payments.value = resData.data ?? ((Array.isArray(resData)) ? resData : []);
    meta.value = resData.meta ?? { current_page: 1, last_page: 1 };
  } catch (err: any) {
    console.error('Error fetching user payments:', err);
    error('No se pudieron cargar los pagos. Intenta de nuevo.', 'Error');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchPayments();
  }, 500);
};

const changePage = (page: number) => {
  currentPage.value = page;
  fetchPayments();
};

const formatPrice = (price: number) => {
  if (!price) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
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
    completed: 'Completado',
    failed: 'Fallido',
    refunded: 'Reembolsado'
  };
  return map[status?.toLowerCase()] || status;
};

const translateType = (type: string) => {
  const map: Record<string, string> = {
    rental: 'Alquiler',
    deposit: 'Depósito',
    fee: 'Tarifa',
    maintenance: 'Mantenimiento'
  };
  return map[type?.toLowerCase()] || type;
};
</script>

<style scoped>
.user-payments-page {
  min-height: calc(100vh - 80px); /* Adjust based on navbar */
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
  background: radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%);
}

.orb-2 {
  bottom: -10%;
  right: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0) 70%);
}

.payments-container {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-family: 'Outfit', sans-serif;
}

.page-header p {
  color: #64748b;
  font-size: 1rem;
}

.payments-content {
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

.payments-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.payments-table th {
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

.payments-table th:first-child { border-top-left-radius: 10px; }
.payments-table th:last-child { border-top-right-radius: 10px; }

.payments-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.95rem;
  vertical-align: middle;
}

.payments-table tr:last-child td { border-bottom: none; }
.payments-table tbody tr:hover { background-color: #f8fafc; }

.font-medium { font-weight: 500; }
.amount-cell { font-weight: 600; color: #0f172a; }

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.completed { background: #dcfce7; color: #166534; }
.status-badge.pending { background: #fef9c3; color: #854d0e; }
.status-badge.failed { background: #fee2e2; color: #991b1b; }
.status-badge.refunded { background: #f1f5f9; color: #475569; }

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
  .filters-bar { flex-direction: column; align-items: stretch; }
  .search-box { max-width: none; }
  .payments-table td, .payments-table th { padding: 0.75rem; }
}
</style>
