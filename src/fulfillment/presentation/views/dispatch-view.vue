<script setup>
import { computed, onMounted, toRefs } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import useFulfillmentStore from "../../application/fulfillment.store.js";
import useOrderingStore from "../../../ordering/application/ordering.store.js";

const router = useRouter();
const { t } = useI18n();

const fulfillmentStore = useFulfillmentStore();
const orderingStore = useOrderingStore();

const { vehicles, drivers, vehiclesLoaded, driversLoaded } = toRefs(fulfillmentStore);
const { requests, requestsLoaded } = toRefs(orderingStore);

// Computed: Available Vehicles
const availableVehicles = computed(() => {
  return vehicles.value.filter(v => v.status === 'AVAILABLE').length;
});

// Computed: Available Drivers
const availableDrivers = computed(() => {
  return drivers.value.filter(d => d.status === 'AVAILABLE').length;
});

// Computed: Active Deliveries (requests IN_TRANSIT)
const activeDeliveries = computed(() => {
  return requests.value.filter(r => r.status === 'IN_TRANSIT');
});

// Computed: Completed Deliveries
const completedDeliveries = computed(() => {
  return requests.value.filter(r => r.status === 'DELIVERED').length;
});

// Get vehicle by plate
const getVehiclePlate = (requestId) => {
  // En producción, aquí buscarías la asignación real
  // Por ahora, mapeo mock basado en requestId
  const mockAssignments = {
    1: 'DEF-456',
    2: 'ABC-123',
    3: 'GHI-789'
  };
  return mockAssignments[requestId] || '--';
};

// Get driver name
const getDriverName = (requestId) => {
  // En producción, aquí buscarías la asignación real
  const mockAssignments = {
    1: 'María García',
    2: 'Carlos Ramírez',
    3: 'Juan López'
  };
  return mockAssignments[requestId] || '--';
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Navigation
const goToVehicles = () => router.push('/fulfillment/vehicles');
const goToDrivers = () => router.push('/fulfillment/drivers');

onMounted(() => {
  if (!vehiclesLoaded.value) fulfillmentStore.fetchVehicles();
  if (!driversLoaded.value) fulfillmentStore.fetchDrivers();
  if (!requestsLoaded.value) orderingStore.fetchRequests();
});
</script>

<template>
  <div class="dispatch-container">
    <!-- PAGE HEADER -->
    <div class="page-header">
      <div class="page-title-group">
        <h1 class="page-title">{{ t('fulfillment.dispatch-view.title') }}</h1>
        <p class="page-subtitle">{{ t('fulfillment.dispatch-view.subtitle') }}</p>
      </div>
      <div class="page-actions">
        <button class="icon-btn" @click="fulfillmentStore.fetchVehicles(); fulfillmentStore.fetchDrivers(); orderingStore.fetchRequests();">
          <i class="pi pi-refresh"/>
        </button>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="kpi-grid">
      <!-- Available Vehicles -->
      <div class="kpi-card">
        <div class="kpi-icon blue">
          <i class="pi pi-truck"/>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">{{ t('fulfillment.dispatch-view.kpi-vehicles') }}</div>
          <div class="kpi-value">{{ availableVehicles }}</div>
          <div class="kpi-meta">{{ t('fulfillment.dispatch-view.total') }}: {{ vehicles.length }}</div>
        </div>
      </div>

      <!-- Available Drivers -->
      <div class="kpi-card">
        <div class="kpi-icon green">
          <i class="pi pi-users"/>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">{{ t('fulfillment.dispatch-view.kpi-drivers') }}</div>
          <div class="kpi-value">{{ availableDrivers }}</div>
          <div class="kpi-meta">{{ t('fulfillment.dispatch-view.total') }}: {{ drivers.length }}</div>
        </div>
      </div>

      <!-- Active Deliveries -->
      <div class="kpi-card">
        <div class="kpi-icon orange">
          <i class="pi pi-truck"/>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">{{ t('fulfillment.dispatch-view.kpi-deliveries') }}</div>
          <div class="kpi-value">{{ activeDeliveries.length }}</div>
          <div class="kpi-meta">{{ t('fulfillment.dispatch-view.completed') }}: {{ completedDeliveries }}</div>
        </div>
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="action-buttons">
      <button class="action-btn primary" @click="goToVehicles">
        <i class="pi pi-truck"/>
        <span>{{ t('fulfillment.dispatch-view.manage-vehicles') }}</span>
      </button>
      <button class="action-btn secondary" @click="goToDrivers">
        <i class="pi pi-users"/>
        <span>{{ t('fulfillment.dispatch-view.manage-drivers') }}</span>
      </button>
    </div>

    <!-- ACTIVE DELIVERIES TABLE -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">{{ t('fulfillment.dispatch-view.section-active') }}</h2>
      </div>

      <table class="deliveries-table">
        <thead>
        <tr>
          <th>{{ t('fulfillment.dispatch-view.col-order') }}</th>
          <th>{{ t('fulfillment.dispatch-view.col-vehicle') }}</th>
          <th>{{ t('fulfillment.dispatch-view.col-driver') }}</th>
          <th>{{ t('fulfillment.dispatch-view.col-status') }}</th>
          <th>{{ t('fulfillment.dispatch-view.col-scheduled') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="activeDeliveries.length === 0">
          <td colspan="5" class="empty-row">{{ t('fulfillment.dispatch-view.no-deliveries') }}</td>
        </tr>
        <tr v-for="delivery in activeDeliveries" :key="delivery.id">
          <td><strong>ord{{ delivery.id }}</strong></td>
          <td>{{ getVehiclePlate(delivery.id) }}</td>
          <td>{{ getDriverName(delivery.id) }}</td>
          <td>
            <span class="status-badge in-transit">{{ delivery.status === 'IN_TRANSIT' ? 'In Transit' : delivery.status }}</span>
          </td>
          <td>{{ formatDate(delivery.deliveryDate) }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.dispatch-container {
  padding: 0;
}

/* PAGE HEADER */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1E3A8A;
  margin: 0;
}

.page-subtitle {
  color: #6B7280;
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-btn {
  border: none;
  background: transparent;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: #475569;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #F3F4F6;
}

/* KPI CARDS */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1rem;
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.kpi-icon.blue {
  background: #DBEAFE;
  color: #1E40AF;
}

.kpi-icon.green {
  background: #D1FAE5;
  color: #059669;
}

.kpi-icon.orange {
  background: #FEF3C7;
  color: #D97706;
}

.kpi-content {
  flex: 1;
}

.kpi-label {
  font-size: 0.85rem;
  color: #6B7280;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.kpi-meta {
  font-size: 0.85rem;
  color: #6B7280;
}

/* ACTION BUTTONS */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #1E3A8A;
  color: #ffffff;
}

.action-btn.primary:hover {
  background: #1E40AF;
}

.action-btn.secondary {
  background: #059669;
  color: #ffffff;
}

.action-btn.secondary:hover {
  background: #047857;
}

/* SECTION CARD */
.section-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* TABLE */
.deliveries-table {
  width: 100%;
  border-collapse: collapse;
}

.deliveries-table th {
  text-align: left;
  font-weight: 600;
  color: #1E3A8A;
  font-size: 0.9rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.deliveries-table td {
  padding: 1rem 0.5rem;
  color: #1f2937;
  font-size: 0.92rem;
  border-bottom: 1px solid #F3F4F6;
}

.empty-row {
  text-align: center;
  color: #9CA3AF;
  padding: 3rem 0 !important;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.in-transit {
  background: #DBEAFE;
  color: #1E40AF;
}

.status-badge.assigned {
  background: #FEF3C7;
  color: #D97706;
}
</style>