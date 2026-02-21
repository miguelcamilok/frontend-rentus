<template>
  <div class="pv-page">
    <div class="pv-bg" aria-hidden="true">
      <div class="pv-bg__orb pv-bg__orb--1"></div>
      <div class="pv-bg__orb pv-bg__orb--2"></div>
    </div>

    <div class="pv-shell">

      <!-- ── Header ── -->
      <header class="pv-header">
        <div class="pv-header__left">
          <span class="pv-eyebrow"><span class="ew-pip"></span>Mis Contratos</span>
          <h1 class="pv-title">Historial de <em>Pagos</em></h1>
          <p class="pv-subtitle">Pagos realizados en tus contratos de arrendamiento activos</p>
        </div>
        <div class="pv-header__right">
          <div class="pv-counters">
            <div class="pv-counter">
              <span class="pv-counter__val">{{ payments.length }}</span>
              <span class="pv-counter__lbl">Registros</span>
            </div>
            <div class="pv-counter-sep"></div>
            <div class="pv-counter">
              <span class="pv-counter__val">{{ pendingCount }}</span>
              <span class="pv-counter__lbl">Pendientes</span>
            </div>
          </div>
        </div>
      </header>

      <!-- ── Panel ── -->
      <div class="pv-panel">

        <!-- Toolbar -->
        <div class="pv-toolbar">
          <div class="pv-search">
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14" class="pv-search__ico">
              <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
              <path d="M15 15l-3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por ID de contrato o monto..."
              @input="handleSearch"
            />
          </div>
          <select v-model="statusFilter" class="pv-select" @change="fetchPayments">
            <option value="">Todos los estados</option>
            <option value="completed">Completados</option>
            <option value="pending">Pendientes</option>
            <option value="failed">Fallidos</option>
          </select>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="pv-state">
          <div class="pv-spinner"></div>
          <p>Cargando pagos...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="payments.length === 0" class="pv-state">
          <div class="pv-empty-icon">
            <svg viewBox="0 0 48 48" fill="none" width="26" height="26">
              <rect x="6" y="12" width="36" height="26" rx="4" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 20h36" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="16" cy="32" r="2" fill="currentColor"/>
              <path d="M24 32h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>No se encontraron pagos</h3>
          <p>Aún no tienes registros de pagos o tu búsqueda no arrojó resultados.</p>
        </div>

        <!-- Table -->
        <div v-else class="pv-table-wrap">
          <table class="pv-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Contrato</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id" class="pv-row">
                <td><span class="cell-id">#{{ payment.id }}</span></td>
                <td><span class="cell-muted">{{ formatDate(payment.created_at) }}</span></td>
                <td><span class="cell-amount">{{ formatPrice(payment.amount) }}</span></td>
                <td>
                  <span :class="['pay-status', `pay-status--${payment.status}`]">
                    {{ translateStatus(payment.status) }}
                  </span>
                </td>
                <td><span class="cell-type">{{ translateType(payment.type) }}</span></td>
                <td>
                  <span v-if="payment.contract" class="cell-contract">
                    <span class="contract-dot"></span>
                    Contrato #{{ payment.contract.id }}
                  </span>
                  <span v-else class="cell-na">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="meta && meta.last_page > 1" class="pv-pager">
          <button
            :disabled="meta.current_page === 1"
            @click="changePage(meta.current_page - 1)"
            class="pager-arrow"
          >
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Anterior
          </button>
          <span class="pager-info">Página {{ meta.current_page }} de {{ meta.last_page }}</span>
          <button
            :disabled="meta.current_page === meta.last_page"
            @click="changePage(meta.current_page + 1)"
            class="pager-arrow"
          >
            Siguiente
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAlerts } from '@/composables/useAlerts';
import api from '@/services/api';

const { error } = useAlerts();

const payments    = ref<any[]>([]);
const loading     = ref(true);
const meta        = ref<any>(null);
const searchQuery  = ref('');
const statusFilter = ref('');
const currentPage  = ref(1);
let searchTimeout: any = null;

const pendingCount = computed(() =>
  payments.value.filter(p => p.status === 'pending').length
);

onMounted(() => fetchPayments());

const fetchPayments = async () => {
  loading.value = true;
  try {
    const params: any = { page: currentPage.value };
    if (searchQuery.value) params.search = searchQuery.value;
    if (statusFilter.value) params.status = statusFilter.value;

    const response = await api.get('/payments', { params });
    const resData = response.data;
    payments.value = resData.data ?? (Array.isArray(resData) ? resData : []);
    meta.value = resData.meta ?? { current_page: 1, last_page: 1 };
  } catch (err: any) {
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
  return new Date(dateString).toLocaleDateString('es-CO', { dateStyle: 'medium' });
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
/* ══════════════════════════════════════════════════════════════
   USER PAYMENTS VIEW  —  pagos del arrendatario a sus contratos
   • padding-top: 65px  →  navbar fixed (height: 65px)
   • Paleta: #1a0e0a / #2e1d17 / #3b2416 + acento #da9c5f
   ══════════════════════════════════════════════════════════════ */

.pv-page {
  min-height: calc(100vh - 65px);
  padding-top: 65px;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(135deg, #1a0e0a 0%, #2e1d17 50%, #3b2416 100%);
}
.pv-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("https://i.pinimg.com/1200x/e2/d2/b7/e2d2b7877ffb88a68d6b72e5ea0bd965.jpg") center/cover no-repeat;
  opacity: 0.12;
  filter: blur(7px);
  pointer-events: none;
  z-index: 0;
}

/* Orbs */
.pv-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.pv-bg__orb { position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.2; }
.pv-bg__orb--1 {
  width: 440px; height: 440px;
  background: radial-gradient(circle, rgba(218,156,95,0.45), transparent);
  top: -160px; right: -160px;
}
.pv-bg__orb--2 {
  width: 340px; height: 340px;
  background: radial-gradient(circle, rgba(184,121,31,0.3), transparent);
  bottom: -100px; left: -100px;
}

/* Shell */
.pv-shell {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 2rem 4rem;
}

/* ── Header ──────────────────────────────────────────────────── */
.pv-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.pv-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #da9c5f;
  margin-bottom: 0.6rem;
}
.ew-pip {
  display: block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #da9c5f;
  box-shadow: 0 0 8px rgba(218,156,95,0.7);
}
.pv-title {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 800;
  color: #f0e5db;
  line-height: 1.15;
  margin: 0 0 0.4rem;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 15px rgba(218,156,95,0.3), 0 0 30px rgba(218,156,95,0.15);
}
.pv-title em { font-style: italic; color: #da9c5f; font-weight: 500; }
.pv-subtitle { font-size: 0.9rem; color: rgba(240,229,219,0.5); margin: 0; }

.pv-header__right { display: flex; align-items: center; flex-shrink: 0; }
.pv-counters {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1.2rem;
  background: linear-gradient(135deg, rgba(62,36,24,0.95), rgba(46,29,23,0.95));
  border: 1px solid rgba(218,156,95,0.25);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07);
}
.pv-counter { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.pv-counter__val { font-size: 1.35rem; font-weight: 800; color: #da9c5f; line-height: 1; }
.pv-counter__lbl {
  font-size: 0.63rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgba(240,229,219,0.35);
}
.pv-counter-sep { width: 1px; height: 28px; background: rgba(218,156,95,0.2); }

/* ── Panel ───────────────────────────────────────────────────── */
.pv-panel {
  background: linear-gradient(135deg, rgba(62,36,24,0.95), rgba(46,29,23,0.95));
  border: 1px solid rgba(218,156,95,0.2);
  border-radius: 18px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
}

/* Toolbar */
.pv-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid rgba(218,156,95,0.12);
  flex-wrap: wrap;
}
.pv-search { position: relative; flex: 1; min-width: 240px; max-width: 420px; }
.pv-search__ico {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(240,229,219,0.3);
  pointer-events: none;
}
.pv-search input {
  width: 100%;
  padding: 0.68rem 0.9rem 0.68rem 2.5rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(218,156,95,0.2);
  border-radius: 9px;
  color: #f0e5db;
  font-family: inherit;
  font-size: 0.88rem;
  transition: all 0.2s;
}
.pv-search input::placeholder { color: rgba(240,229,219,0.28); }
.pv-search input:focus {
  outline: none;
  border-color: rgba(218,156,95,0.55);
  background: rgba(255,255,255,0.07);
  box-shadow: 0 0 0 3px rgba(218,156,95,0.08);
}
.pv-select {
  padding: 0.68rem 0.9rem;
  min-width: 175px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(218,156,95,0.2);
  border-radius: 9px;
  color: rgba(240,229,219,0.7);
  font-family: inherit;
  font-size: 0.83rem;
  cursor: pointer;
}
.pv-select:focus { outline: none; border-color: rgba(218,156,95,0.5); }
.pv-select option { background: #2e1d17; color: #f0e5db; }

/* States */
.pv-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 5rem 2rem;
  text-align: center;
}
.pv-spinner {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: 2px solid rgba(218,156,95,0.2);
  border-top-color: #da9c5f;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.pv-empty-icon {
  width: 68px; height: 68px;
  border-radius: 50%;
  background: rgba(218,156,95,0.08);
  border: 1px solid rgba(218,156,95,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #da9c5f;
}
.pv-state h3 { font-size: 1.15rem; font-weight: 700; color: #f0e5db; margin: 0; }
.pv-state p { font-size: 0.85rem; color: rgba(240,229,219,0.4); max-width: 320px; margin: 0; line-height: 1.65; }

/* ── Tabla ───────────────────────────────────────────────────── */
.pv-table-wrap { overflow-x: auto; }
.pv-table { width: 100%; border-collapse: collapse; }
.pv-table thead tr { border-bottom: 1px solid rgba(218,156,95,0.15); }
.pv-table th {
  padding: 0.9rem 1.25rem;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(240,229,219,0.3);
  text-align: left;
  background: rgba(255,255,255,0.02);
}
.pv-row { border-bottom: 1px solid rgba(218,156,95,0.07); transition: background 0.15s; }
.pv-row:last-child { border-bottom: none; }
.pv-row:hover { background: rgba(218,156,95,0.05); }
.pv-table td {
  padding: 1rem 1.25rem;
  font-size: 0.87rem;
  color: rgba(240,229,219,0.65);
  vertical-align: middle;
}

/* Cells */
.cell-id    { font-weight: 700; color: rgba(240,229,219,0.3); font-size: 0.8rem; }
.cell-muted { color: rgba(240,229,219,0.45); font-size: 0.82rem; }
.cell-amount { font-weight: 700; color: #f0e5db; font-size: 0.92rem; }
.cell-type  { color: rgba(240,229,219,0.5); font-size: 0.84rem; }
.cell-contract {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #da9c5f;
  font-weight: 600;
  font-size: 0.84rem;
}
.contract-dot { width: 5px; height: 5px; border-radius: 50%; background: #da9c5f; flex-shrink: 0; }
.cell-na { color: rgba(240,229,219,0.2); }

/* Status */
.pay-status {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.8rem;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}
.pay-status--completed { background: rgba(46,204,113,0.12);  color: #2ecc71; border: 1px solid rgba(46,204,113,0.25); }
.pay-status--pending   { background: rgba(245,158,11,0.12);  color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }
.pay-status--failed    { background: rgba(231,76,60,0.12);   color: #e74c3c; border: 1px solid rgba(231,76,60,0.25); }
.pay-status--refunded  { background: rgba(160,174,192,0.08); color: #94a3b8; border: 1px solid rgba(160,174,192,0.15); }

/* Pagination */
.pv-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(218,156,95,0.1);
}
.pager-arrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 1rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(218,156,95,0.2);
  border-radius: 8px;
  color: rgba(240,229,219,0.45);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.pager-arrow:not(:disabled):hover {
  background: rgba(218,156,95,0.1);
  color: #da9c5f;
  border-color: rgba(218,156,95,0.4);
}
.pager-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
.pager-info { font-size: 0.82rem; color: rgba(240,229,219,0.3); }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .pv-shell { padding: 2rem 1.25rem 3rem; }
  .pv-header { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 600px) {
  .pv-shell { padding: 1.5rem 1rem 2.5rem; }
  .pv-counters { display: none; }
  .pv-search { max-width: none; }
  .pv-toolbar { flex-direction: column; align-items: stretch; }
  .pv-select { width: 100%; }
}
</style>