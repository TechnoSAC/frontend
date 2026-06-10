<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'primevue/chart';
import useOrderingStore from '../../../ordering/application/ordering.store.js';
import pinia from '../../../pinia.js';

const router = useRouter();
const orderingStore = useOrderingStore(pinia);

onMounted(() => {
  if (!orderingStore.ordersLoaded) orderingStore.fetchOrders();
});

// ── Fuel KPI ───────────────────────────────────────────────────────────────
const LITERS_PER_GALLON = 3.78541;
const fuelUnit = ref('LITERS');

const totalFuelLiters = computed(() =>
  orderingStore.activeOrders.reduce((sum, o) => {
    if (o.unit === 'LITERS')   return sum + Number(o.quantity);
    if (o.unit === 'GALLONS')  return sum + Number(o.quantity) * LITERS_PER_GALLON;
    return sum;
  }, 0)
);

const totalFuelGallons = computed(() => totalFuelLiters.value / LITERS_PER_GALLON);

const totalFuelDisplay = computed(() =>
  fuelUnit.value === 'GALLONS'
    ? Math.round(totalFuelGallons.value).toLocaleString('en-US')
    : Math.round(totalFuelLiters.value).toLocaleString('en-US')
);

// ── Trend Chart ────────────────────────────────────────────────────────────
const selectedPeriod = ref('monthly');

const datasets = {
  daily: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [8500, 12000, 9800, 15500, 11200, 6800, 4200],
  },
  weekly: {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
    values: [42000, 38000, 51000, 47000, 62000, 55000, 48000, 71000, 65000, 58000],
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [68000, 72000, 89000, 95000, 115000, 43940, 78000, 82000, 91000, 105000, 88000, 62000],
  },
};

const chartData = computed(() => {
  const d = datasets[selectedPeriod.value];
  const last = d.values.length - 1;
  return {
    labels: d.labels,
    datasets: [{
      data: d.values,
      backgroundColor: d.values.map((_, i) => i === last ? '#1a2e6b' : '#adc4e8'),
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.55,
    }],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#8b9ab5', font: { size: 11 } } },
    y: { display: false, beginAtZero: true },
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatVolume(quantity, unit) {
  return `${Number(quantity).toLocaleString('en-US')} ${unit === 'LITERS' ? 'L' : 'gal'}`;
}

function formatEta(order) {
  if (order.status === 'DELIVERED' || order.status === 'CLOSED') return 'Completed';
  if (order.status === 'DISPATCHED') return 'In Transit';
  if (order.createdAt) {
    return new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return '—';
}

function getStatusSeverity(status) {
  const map = { CREATED: 'info', DISPATCHED: 'warn', DELIVERED: 'success', CLOSED: 'secondary' };
  return map[status] ?? 'secondary';
}

const goToOrders  = () => router.push('/ordering/orders');
const goToReports = () => router.push('/reporting/supplier');
const viewOrder   = (order) => router.push(`/ordering/orders/${order.id}`);
</script>

<template>
  <div class="dashboard-container">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Resume of your logistics</p>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-row">

      <!-- Total Fuel Selling -->
      <pv-card class="kpi-card">
        <template #content>
          <div class="kpi-inner">
            <div class="kpi-icon fuel"><i class="pi pi-bolt"/></div>
            <div class="kpi-info">
              <span class="kpi-label">TOTAL FUEL SELLING</span>
              <span class="kpi-value">
                {{ totalFuelDisplay }}
                <span class="kpi-unit">{{ fuelUnit === 'LITERS' ? 'L' : 'gal' }}</span>
              </span>
              <div class="unit-toggle">
                <button
                    class="unit-btn"
                    :class="{ active: fuelUnit === 'LITERS' }"
                    @click="fuelUnit = 'LITERS'"
                >L</button>
                <button
                    class="unit-btn"
                    :class="{ active: fuelUnit === 'GALLONS' }"
                    @click="fuelUnit = 'GALLONS'"
                >gal</button>
              </div>
            </div>
          </div>
        </template>
      </pv-card>

      <!-- Active Orders count -->
      <pv-card class="kpi-card" style="cursor:pointer" @click="goToOrders">
        <template #content>
          <div class="kpi-inner">
            <div class="kpi-icon orders"><i class="pi pi-truck"/></div>
            <div class="kpi-info">
              <span class="kpi-label">ACTIVE ORDERS</span>
              <span class="kpi-value">{{ orderingStore.activeOrders.length }}</span>
            </div>
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Selling Trend Chart -->
    <pv-card class="chart-card" style="cursor:pointer" @click="goToReports">
      <template #content>
        <div class="chart-header">
          <div>
            <div class="chart-title">Selling trend</div>
            <div class="chart-subtitle">Graphics of the selling through time</div>
          </div>
          <pv-select-button
              v-model="selectedPeriod"
              :options="[
                { label: 'Daily',   value: 'daily'   },
                { label: 'Weekly',  value: 'weekly'  },
                { label: 'Monthly', value: 'monthly' },
              ]"
              option-label="label"
              option-value="value"
              @click.stop
          />
        </div>
        <div class="chart-area">
          <Chart type="bar" :data="chartData" :options="chartOptions" style="height:220px"/>
        </div>
      </template>
    </pv-card>

    <!-- Active Orders Table -->
    <pv-card class="orders-card">
      <template #content>
        <div class="orders-header">
          <div>
            <div class="orders-title">Active Orders</div>
            <div class="orders-subtitle">Track real-time fuel deliveries and scheduled refills.</div>
          </div>
          <pv-button
              label="View all orders"
              icon="pi pi-arrow-right"
              icon-pos="right"
              outlined
              class="view-all-btn"
              @click="goToOrders"
          />
        </div>

        <pv-data-table
            :value="orderingStore.activeOrders"
            :loading="orderingStore.loading"
            striped-rows
            class="orders-table"
        >
          <pv-column field="id" header="Order ID">
            <template #body="{ data }">
              <span class="order-id">#FT-{{ String(data.id).padStart(3, '0') }}</span>
            </template>
          </pv-column>

          <pv-column field="deliveryAddress" header="Destination">
            <template #body="{ data }">
              <span class="destination-main">{{ data.deliveryAddress?.split(',')[0] }}</span>
              <span class="destination-sub">{{ data.deliveryAddress?.split(',').slice(1).join(',').trim() }}</span>
            </template>
          </pv-column>

          <pv-column field="quantity" header="Volume">
            <template #body="{ data }">
              <span class="volume-text">{{ formatVolume(data.quantity, data.unit) }}</span>
            </template>
          </pv-column>

          <pv-column field="status" header="ETA">
            <template #body="{ data }">
              <span class="eta-text">{{ formatEta(data) }}</span>
            </template>
          </pv-column>

          <pv-column field="status" header="Status">
            <template #body="{ data }">
              <pv-tag :value="data.status" :severity="getStatusSeverity(data.status)"/>
            </template>
          </pv-column>

          <pv-column header="">
            <template #body="{ data }">
              <pv-button
                  icon="pi pi-eye"
                  text
                  rounded
                  severity="secondary"
                  @click="viewOrder(data)"
              />
            </template>
          </pv-column>

          <template #empty>
            <div class="no-data">No active orders</div>
          </template>
        </pv-data-table>
      </template>
    </pv-card>

  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex; flex-direction: column; gap: 20px;
  background: #f4f6fb; min-height: 100%;
}

.page-title    { font-size: 28px; font-weight: 700; color: #1a2744; margin: 0; }
.page-subtitle { font-size: 14px; color: #8b9ab5; margin: 4px 0 0; }

/* KPI Row */
.kpi-row { display: flex; gap: 16px; flex-wrap: wrap; }
.kpi-card { flex: 0 0 auto; min-width: 260px; }
.kpi-inner { display: flex; align-items: flex-start; gap: 16px; padding: 4px 0; }
.kpi-icon {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 20px;
}
.kpi-icon.fuel   { background: #e8f0fd; color: #2563eb; }
.kpi-icon.orders { background: #e6f7f1; color: #059669; }

.kpi-info  { display: flex; flex-direction: column; }
.kpi-label { font-size: 11px; font-weight: 600; letter-spacing: 0.6px; color: #8b9ab5; text-transform: uppercase; }
.kpi-value { font-size: 30px; font-weight: 700; color: #1a2744; line-height: 1.1; margin-top: 4px; }
.kpi-unit  { font-size: 14px; font-weight: 400; color: #8b9ab5; margin-left: 4px; }

/* Unit toggle */
.unit-toggle {
  display: flex; gap: 4px; margin-top: 8px;
}
.unit-btn {
  padding: 2px 10px; border-radius: 999px; border: 1px solid #d1d5db;
  font-size: 12px; font-weight: 600; cursor: pointer;
  background: #fff; color: #6b7280; transition: all 0.15s;
}
.unit-btn.active { background: #1a2e6b; color: #fff; border-color: #1a2e6b; }
.unit-btn:hover:not(.active) { background: #f3f4f6; }

/* Chart */
.chart-card { transition: box-shadow 0.2s; }
.chart-card:hover { box-shadow: 0 4px 16px rgba(37,99,235,0.12); }
.chart-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
}
.chart-title    { font-size: 18px; font-weight: 600; color: #1a2744; }
.chart-subtitle { font-size: 13px; color: #8b9ab5; margin-top: 2px; }
.chart-area     { height: 220px; }

/* Orders table */
.orders-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
}
.orders-title    { font-size: 18px; font-weight: 600; color: #1a2744; }
.orders-subtitle { font-size: 13px; color: #8b9ab5; margin-top: 2px; }
.view-all-btn    { font-size: 13px; }

.order-id         { font-weight: 700; color: #1a2e6b; font-size: 14px; font-family: 'Courier New', monospace; }
.destination-main { display: block; font-weight: 600; color: #1a2744; font-size: 14px; }
.destination-sub  { display: block; font-size: 11px; color: #8b9ab5; margin-top: 1px; }
.volume-text      { font-weight: 600; color: #1a2744; }
.eta-text         { font-size: 13px; color: #4a5568; }
.no-data          { text-align: center; padding: 32px; color: #8b9ab5; }
</style>
