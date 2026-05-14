<script setup>
import { computed, onMounted, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import useFulfillmentStore from '../../application/fulfillment.store.js';

const router = useRouter();
const { t } = useI18n();

const fulfillmentStore = useFulfillmentStore();
const { vehicles, drivers, vehiclesLoaded, driversLoaded } = toRefs(fulfillmentStore);

// ── Orders (fetched directly — DISPATCHED = active delivery) ────────────────
const orders = ref([]);
const ordersLoaded = ref(false);

const fetchOrders = async () => {
  try {
    const base = import.meta.env.VITE_FULLTANK_API_URL;
    const res  = await axios.get(`${base}/orders`);
    orders.value = res.data instanceof Array ? res.data : [];
    ordersLoaded.value = true;
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
};

// ── KPIs ────────────────────────────────────────────────────────────────────
const availableVehicles = computed(() =>
  vehicles.value.filter(v => v.status === 'AVAILABLE').length
);
const availableDrivers = computed(() =>
  drivers.value.filter(d => d.status === 'AVAILABLE').length
);
const activeDeliveries = computed(() =>
  orders.value.filter(o => o.status === 'DISPATCHED')
);
const completedDeliveries = computed(() =>
  orders.value.filter(o => o.status === 'DELIVERED' || o.status === 'CLOSED').length
);

// ── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleString('en-US', {
    month: '2-digit', day: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

const onRefresh = () => {
  fulfillmentStore.fetchVehicles();
  fulfillmentStore.fetchDrivers();
  fetchOrders();
};

onMounted(() => {
  if (!vehiclesLoaded.value) fulfillmentStore.fetchVehicles();
  if (!driversLoaded.value)  fulfillmentStore.fetchDrivers();
  fetchOrders();
});
</script>

<template>
  <div class="dispatch-container">

    <!-- PAGE HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('fulfillment.dispatch-view.title') }}</h1>
        <p class="page-subtitle">{{ t('fulfillment.dispatch-view.subtitle') }}</p>
      </div>
      <button class="icon-btn" @click="onRefresh">
        <i class="pi pi-refresh"/>
      </button>
    </div>

    <!-- KPI CARDS -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon blue"><i class="pi pi-truck"/></div>
        <div class="kpi-content">
          <div class="kpi-label">{{ t('fulfillment.dispatch-view.kpi-vehicles') }}</div>
          <div class="kpi-value">{{ availableVehicles }}</div>
          <div class="kpi-meta">{{ t('fulfillment.dispatch-view.total') }}: {{ vehicles.length }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon green"><i class="pi pi-users"/></div>
        <div class="kpi-content">
          <div class="kpi-label">{{ t('fulfillment.dispatch-view.kpi-drivers') }}</div>
          <div class="kpi-value">{{ availableDrivers }}</div>
          <div class="kpi-meta">{{ t('fulfillment.dispatch-view.total') }}: {{ drivers.length }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon orange"><i class="pi pi-send"/></div>
        <div class="kpi-content">
          <div class="kpi-label">{{ t('fulfillment.dispatch-view.kpi-deliveries') }}</div>
          <div class="kpi-value">{{ activeDeliveries.length }}</div>
          <div class="kpi-meta">{{ t('fulfillment.dispatch-view.completed') }}: {{ completedDeliveries }}</div>
        </div>
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="action-buttons">
      <button class="action-btn primary" @click="router.push('/fulfillment/vehicles')">
        <i class="pi pi-truck"/>
        <span>{{ t('fulfillment.dispatch-view.manage-vehicles') }}</span>
      </button>
      <button class="action-btn secondary" @click="router.push('/fulfillment/drivers')">
        <i class="pi pi-users"/>
        <span>{{ t('fulfillment.dispatch-view.manage-drivers') }}</span>
      </button>
    </div>

    <!-- ACTIVE DELIVERIES TABLE -->
    <div class="section-card">
      <h2 class="section-title">{{ t('fulfillment.dispatch-view.section-active') }}</h2>

      <table class="deliveries-table">
        <thead>
          <tr>
            <th>{{ t('fulfillment.dispatch-view.col-order') }}</th>
            <th>{{ t('fulfillment.dispatch-view.col-fuel') }}</th>
            <th>{{ t('fulfillment.dispatch-view.col-quantity') }}</th>
            <th>{{ t('fulfillment.dispatch-view.col-destination') }}</th>
            <th>{{ t('fulfillment.dispatch-view.col-dispatched') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="activeDeliveries.length === 0">
            <td colspan="5" class="empty-row">{{ t('fulfillment.dispatch-view.no-deliveries') }}</td>
          </tr>
          <tr v-for="order in activeDeliveries" :key="order.id">
            <td><strong class="order-id">#{{ order.id }}</strong></td>
            <td>{{ order.fuelType }}</td>
            <td>{{ order.quantity }} {{ order.unit }}</td>
            <td class="destination-cell">{{ order.deliveryAddress }}</td>
            <td>{{ formatDate(order.dispatchedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
.dispatch-container { padding: 0; }

/* HEADER */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 2rem;
}
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }
.page-subtitle { color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0; }
.icon-btn {
  border: none; background: transparent; width: 36px; height: 36px;
  border-radius: 50%; cursor: pointer; color: #475569; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
}
.icon-btn:hover { background: #F3F4F6; }

/* KPI CARDS */
.kpi-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem; margin-bottom: 2rem;
}
.kpi-card {
  background: #fff; border-radius: 12px; padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; gap: 1rem;
}
.kpi-icon {
  width: 56px; height: 56px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; flex-shrink: 0;
}
.kpi-icon.blue   { background: #DBEAFE; color: #1E40AF; }
.kpi-icon.green  { background: #D1FAE5; color: #059669; }
.kpi-icon.orange { background: #FEF3C7; color: #D97706; }
.kpi-label { font-size: 0.8rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 0.4rem; }
.kpi-value { font-size: 2rem; font-weight: 700; color: #1f2937; margin-bottom: 0.2rem; }
.kpi-meta  { font-size: 0.85rem; color: #6B7280; }

/* ACTION BUTTONS */
.action-buttons { display: flex; gap: 1rem; margin-bottom: 2rem; }
.action-btn {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1.5rem; border-radius: 8px;
  font-weight: 600; font-size: 0.95rem; cursor: pointer; border: none;
  transition: background 0.2s;
}
.action-btn.primary   { background: #1E3A8A; color: #fff; }
.action-btn.primary:hover   { background: #1E40AF; }
.action-btn.secondary { background: #059669; color: #fff; }
.action-btn.secondary:hover { background: #047857; }

/* TABLE */
.section-card {
  background: #fff; border-radius: 12px; padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.section-title { font-size: 1.1rem; font-weight: 700; color: #1f2937; margin: 0 0 1.5rem; }
.deliveries-table { width: 100%; border-collapse: collapse; }
.deliveries-table th {
  text-align: left; font-weight: 600; color: #1E3A8A;
  font-size: 0.9rem; padding: 0.75rem 0.75rem;
  border-bottom: 1px solid #E5E7EB;
}
.deliveries-table td {
  padding: 1rem 0.75rem; color: #1f2937;
  font-size: 0.92rem; border-bottom: 1px solid #F3F4F6;
}
.empty-row { text-align: center; color: #9CA3AF; padding: 3rem 0 !important; }
.order-id { font-family: 'Courier New', monospace; color: #1E3A8A; }
.destination-cell { color: #6B7280; max-width: 220px; }
</style>
