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

    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('fulfillment.dispatch-view.title') }}</h1>
        <p class="page-subtitle">{{ t('fulfillment.dispatch-view.subtitle') }}</p>
      </div>
      <pv-button icon="pi pi-refresh" text rounded @click="onRefresh" />
    </div>

    <div class="kpi-grid">
      <pv-card class="kpi-card">
        <template #content>
          <div class="kpi-icon blue"><i class="pi pi-truck"/></div>
          <div class="kpi-content">
            <div class="kpi-label">{{ t('fulfillment.dispatch-view.kpi-vehicles') }}</div>
            <div class="kpi-value">{{ availableVehicles }}</div>
            <div class="kpi-meta">{{ t('fulfillment.dispatch-view.total') }}: {{ vehicles.length }}</div>
          </div>
        </template>
      </pv-card>

      <pv-card class="kpi-card">
        <template #content>
          <div class="kpi-icon green"><i class="pi pi-users"/></div>
          <div class="kpi-content">
            <div class="kpi-label">{{ t('fulfillment.dispatch-view.kpi-drivers') }}</div>
            <div class="kpi-value">{{ availableDrivers }}</div>
            <div class="kpi-meta">{{ t('fulfillment.dispatch-view.total') }}: {{ drivers.length }}</div>
          </div>
        </template>
      </pv-card>

      <pv-card class="kpi-card">
        <template #content>
          <div class="kpi-icon orange"><i class="pi pi-send"/></div>
          <div class="kpi-content">
            <div class="kpi-label">{{ t('fulfillment.dispatch-view.kpi-deliveries') }}</div>
            <div class="kpi-value">{{ activeDeliveries.length }}</div>
            <div class="kpi-meta">{{ t('fulfillment.dispatch-view.completed') }}: {{ completedDeliveries }}</div>
          </div>
        </template>
      </pv-card>
    </div>

    <div class="action-buttons">
      <pv-button
          icon="pi pi-truck"
          :label="t('fulfillment.dispatch-view.manage-vehicles')"
          class="action-primary"
          @click="router.push('/fulfillment/vehicles')"
      />
      <pv-button
          icon="pi pi-users"
          :label="t('fulfillment.dispatch-view.manage-drivers')"
          class="action-secondary"
          @click="router.push('/fulfillment/drivers')"
      />
    </div>

    <pv-card class="section-card">
      <template #header>
        <h2 class="section-title">{{ t('fulfillment.dispatch-view.section-active') }}</h2>
      </template>
      <template #content>
        <pv-data-table
            :value="activeDeliveries"
            responsive-layout="scroll"
            class="deliveries-table"
        >
          <template #empty>
            <div class="empty-row">{{ t('fulfillment.dispatch-view.no-deliveries') }}</div>
          </template>
          <pv-column :header="t('fulfillment.dispatch-view.col-order')">
            <template #body="{ data }">
              <strong class="order-id">#{{ data.id }}</strong>
            </template>
          </pv-column>
          <pv-column field="fuelType" :header="t('fulfillment.dispatch-view.col-fuel')" />
          <pv-column :header="t('fulfillment.dispatch-view.col-quantity')">
            <template #body="{ data }">{{ data.quantity }} {{ data.unit }}</template>
          </pv-column>
          <pv-column field="deliveryAddress" :header="t('fulfillment.dispatch-view.col-destination')" class="destination-col" />
          <pv-column :header="t('fulfillment.dispatch-view.col-dispatched')">
            <template #body="{ data }">{{ formatDate(data.dispatchedAt) }}</template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>

  </div>
</template>

<style scoped>
.dispatch-container { padding: 0; }

.page-header {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem;
}
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }
.page-subtitle { color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0; }

.kpi-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem; margin-bottom: 2rem;
}
.kpi-card { border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.kpi-card :deep(.p-card-body) { padding: 1.5rem; }
.kpi-card :deep(.p-card-content) { display: flex; gap: 1rem; padding: 0; }
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

.action-buttons { display: flex; gap: 1rem; margin-bottom: 2rem; }
.action-primary :deep(.p-button) { background: #1E3A8A; border-color: #1E3A8A; }
.action-secondary :deep(.p-button) { background: #059669; border-color: #059669; }

.section-card { border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.section-card :deep(.p-card-body) { padding: 2rem; }
.section-card :deep(.p-card-content) { padding: 0; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #1f2937; margin: 0 0 1.5rem; }

.deliveries-table :deep(.p-datatable-thead > tr > th) {
  text-align: left; font-weight: 600; color: #1E3A8A;
  font-size: 0.9rem; padding: 0.75rem; border-bottom: 1px solid #E5E7EB;
}
.deliveries-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 0.75rem; color: #1f2937; font-size: 0.92rem; border-bottom: 1px solid #F3F4F6;
}
.empty-row { text-align: center; color: #9CA3AF; padding: 3rem 0 !important; }
.order-id { font-family: 'Courier New', monospace; color: #1E3A8A; }
.destination-col { color: #6B7280; max-width: 220px; }
</style>