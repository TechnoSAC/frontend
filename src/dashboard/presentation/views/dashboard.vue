<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'primevue/chart';
import useDashboardStore from '../../application/dashboard.store.js';

const router = useRouter();
const store  = useDashboardStore();

onMounted(() => store.fetchDashboardData());

// ── Trend Chart ────────────────────────────────────────────────────────────
const selectedPeriod = ref('weekly');

const datasets = {
  daily: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    week1:  [3200, 4100, 5800, 6200, 4900, 2100, 1800],
    week2:  [2800, 3600, 4200, 7100, 5300, 2400, 1600],
  },
  weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    week1:  [12000, 15000, 22000, 18000, 25000, 9000, 7000, 14000, 11000, 19000, 21000, 13000],
    week2:  [9000, 11000, 16000, 28000, 13000, 6000, 5000, 17000, 8000, 23000, 30000, 10000],
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    week1:  [68000, 72000, 89000, 95000, 115000, 43940],
    week2:  [55000, 80000, 76000, 102000, 98000, 61000],
  }
};

const chartData = computed(() => {
  const d = datasets[selectedPeriod.value];
  return {
    labels: d.labels,
    datasets: [
      {
        data: d.week1,
        backgroundColor: d.week1.map((_, i) => i % 5 === 3 ? '#1a2e6b' : '#adc4e8'),
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.45,
      },
      {
        data: d.week2,
        backgroundColor: d.week2.map((_, i) => i % 5 === 0 ? '#2563eb' : '#d4e4f7'),
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.45,
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#8b9ab5', font: { size: 11 } } },
    y: { display: false, beginAtZero: true }
  }
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatVolume(quantity, unit) {
  return `${Number(quantity).toLocaleString()} ${unit === 'LITERS' ? 'L' : unit}`;
}

function formatEta(req) {
  if (['DELIVERED', 'CLOSED'].includes(req.status)) return 'Completed';
  if (req.deliveryDate) {
    const d = new Date(req.deliveryDate);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return '—';
}

function getStatusSeverity(status) {
  const map = {
    PENDING:    'warn',
    APPROVED:   'success',
    REJECTED:   'danger',
    DISPATCHED: 'info',
    DELIVERED:  'success',
  };
  return map[status] ?? 'secondary';
}

const goToOrders   = () => router.push('/ordering/pending');
const goToReports  = () => router.push('/reporting/supplier');
const viewRequest  = (req) => router.push(`/ordering/requests`);
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
      <pv-card class="kpi-card">
        <template #content>
          <div class="kpi-inner">
            <div class="kpi-icon fuel">
              <i class="pi pi-bolt"/>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">TOTAL FUEL SELLING</span>
              <span class="kpi-value">
                {{ store.totalFuelDisplay }}
                <span class="kpi-unit">Liters</span>
              </span>
            </div>
          </div>
        </template>
      </pv-card>

      <pv-card class="kpi-card">
        <template #content>
          <div class="kpi-inner">
            <div class="kpi-icon orders">
              <i class="pi pi-file-edit"/>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">PENDING REQUESTS</span>
              <span class="kpi-value">{{ store.pendingRequests }}</span>
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
                { label: 'Monthly', value: 'monthly' }
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

    <!-- Active Requests Table -->
    <pv-card class="orders-card">
      <template #content>
        <div class="orders-header">
          <div>
            <div class="orders-title">Active Requests</div>
            <div class="orders-subtitle">Track real-time fuel deliveries and scheduled refills.</div>
          </div>
          <pv-button
              label="View all requests"
              icon="pi pi-arrow-right"
              icon-pos="right"
              outlined
              class="view-all-btn"
              @click="goToOrders"
          />
        </div>

        <pv-data-table
            :value="store.activeRequests"
            :loading="store.loading"
            striped-rows
            class="orders-table"
        >
          <pv-column field="id" header="Request ID">
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

          <pv-column field="deliveryDate" header="ETA">
            <template #body="{ data }">
              <span class="eta-text">{{ formatEta(data) }}</span>
            </template>
          </pv-column>

          <pv-column field="status" header="Status">
            <template #body="{ data }">
              <pv-tag :value="data.status" :severity="getStatusSeverity(data.status)"/>
            </template>
          </pv-column>

          <pv-column header="Actions">
            <template #body="{ data }">
              <pv-button
                  icon="pi pi-eye"
                  text
                  rounded
                  severity="secondary"
                  @click="viewRequest(data)"
              />
            </template>
          </pv-column>

          <template #empty>
            <div class="no-data">No active requests</div>
          </template>
        </pv-data-table>
      </template>
    </pv-card>

  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f4f6fb;
  min-height: 100%;
}

/* Header */
.page-title    { font-size: 28px; font-weight: 700; color: #1a2744; margin: 0; }
.page-subtitle { font-size: 14px; color: #8b9ab5; margin: 4px 0 0; }

/* KPI Row */
.kpi-row { display: flex; gap: 16px; flex-wrap: wrap; }

.kpi-card { flex: 0 0 auto; min-width: 240px; }

.kpi-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
}

.kpi-icon {
  width: 44px; height: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}
.kpi-icon.fuel   { background: #e8f0fd; color: #2563eb; }
.kpi-icon.orders { background: #e6f7f1; color: #059669; }

.kpi-info  { display: flex; flex-direction: column; }
.kpi-label { font-size: 11px; font-weight: 600; letter-spacing: 0.6px; color: #8b9ab5; text-transform: uppercase; }
.kpi-value { font-size: 30px; font-weight: 700; color: #1a2744; line-height: 1.1; margin-top: 4px; }
.kpi-unit  { font-size: 14px; font-weight: 400; color: #8b9ab5; margin-left: 4px; }

/* Chart */
.chart-card { transition: box-shadow 0.2s; }
.chart-card:hover { box-shadow: 0 4px 16px rgba(37,99,235,0.12); }

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.chart-title    { font-size: 18px; font-weight: 600; color: #1a2744; }
.chart-subtitle { font-size: 13px; color: #8b9ab5; margin-top: 2px; }
.chart-area     { height: 220px; }

/* Orders table */
.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.orders-title    { font-size: 18px; font-weight: 600; color: #1a2744; }
.orders-subtitle { font-size: 13px; color: #8b9ab5; margin-top: 2px; }

.view-all-btn { font-size: 13px; }

.order-id        { font-weight: 700; color: #1a2e6b; font-size: 14px; font-family: 'Courier New', monospace; }
.destination-main { display: block; font-weight: 600; color: #1a2744; font-size: 14px; }
.destination-sub  { display: block; font-size: 11px; color: #8b9ab5; margin-top: 1px; }
.volume-text      { font-weight: 600; color: #1a2744; }
.eta-text         { font-size: 13px; color: #4a5568; }
.no-data          { text-align: center; padding: 32px; color: #8b9ab5; }
</style>