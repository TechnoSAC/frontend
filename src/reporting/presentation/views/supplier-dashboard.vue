<script setup>
import { computed, onMounted, toRefs } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Chart from 'primevue/chart';
import useReportingStore from "../../application/reporting.store.js";
import useOrderingStore from "../../../ordering/application/ordering.store.js";
import useInventoryStore from "../../../inventory/application/inventory.store.js";
import pinia from "../../../pinia.js";

const router = useRouter();
const reportingStore = useReportingStore(pinia);
const orderingStore = useOrderingStore(pinia);
const inventoryStore = useInventoryStore(pinia);

const { totalSalesRevenue, avgFulfillmentRate, clientSalesPerformance, loading, error } = toRefs(reportingStore);
const { fetchClients, fetchMonthlySales } = reportingStore;
const { t } = useI18n();

const formatCurrency = (amount) => `S/ ${Number(amount).toLocaleString('en-US')}`;
const formatPercentage = (value) => `${value.toFixed(1)}%`;

const getStatusSeverity = (status) => {
  const map = { PAID: 'success', PENDING: 'warn' };
  return map[status] ?? 'secondary';
};

// Monthly revenue bar chart
const revenueChartData = computed(() => ({
  labels: reportingStore.monthlySales.map(m => m.month.slice(0, 3)),
  datasets: [{
    data: reportingStore.monthlySales.map(m => m.revenue),
    backgroundColor: reportingStore.monthlySales.map((_, i, arr) =>
      i === arr.length - 1 ? '#1e3a8a' : '#93c5fd'
    ),
    borderRadius: 4,
    barThickness: 18,
  }]
}));

const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `S/ ${ctx.parsed.y.toLocaleString('en-US')}`
      }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: {
      display: false,
      beginAtZero: true,
    }
  }
};

const refreshData = () => {
  fetchClients();
  fetchMonthlySales();
};

onMounted(() => {
  refreshData();
  if (!orderingStore.requestsLoaded) orderingStore.fetchRequests();
  if (!inventoryStore.productsLoaded) inventoryStore.fetchProducts();
});
</script>

<template>
  <div>
    <div class="page-header">
      <div class="page-title-group">
        <h1 class="page-title">{{ t('reporting.supplier.title') }}</h1>
        <p class="page-subtitle">{{ t('reporting.supplier.subtitle') }}</p>
      </div>
      <div class="page-actions">
        <pv-button icon="pi pi-refresh" text rounded :loading="loading" @click="refreshData" />
        <pv-button :label="t('reporting.supplier.export-pdf')" icon="pi pi-file-pdf" class="export-btn" />
      </div>
    </div>

    <pv-message v-if="error" severity="error" class="error-message">
      {{ t('errors.fetch') }}: {{ error }}
    </pv-message>

    <!-- TOP ROW: large revenue card + 2 small KPIs -->
    <div class="kpi-grid">

      <!-- Total Sales Revenue — with monthly bar chart -->
      <pv-card class="kpi-card revenue-card">
        <template #content>
          <div class="revenue-top">
            <div class="kpi-icon blue"><i class="pi pi-chart-line"/></div>
            <div class="kpi-content">
              <div class="kpi-label">{{ t('reporting.supplier.kpi-sales') }}</div>
              <div class="kpi-value">{{ formatCurrency(totalSalesRevenue) }}</div>
            </div>
          </div>
          <div class="revenue-chart">
            <Chart
                v-if="reportingStore.monthlySales.length"
                type="bar"
                :data="revenueChartData"
                :options="revenueChartOptions"
            />
          </div>
        </template>
      </pv-card>

      <div class="kpi-side">
        <!-- Avg Fulfillment Rate -->
        <pv-card class="kpi-card">
          <template #content>
            <div class="kpi-icon green"><i class="pi pi-check-circle"/></div>
            <div class="kpi-content">
              <div class="kpi-label">{{ t('reporting.supplier.kpi-fulfillment') }}</div>
              <div class="kpi-value">{{ formatPercentage(avgFulfillmentRate) }}</div>
              <div class="kpi-target">{{ t('reporting.supplier.target') }}: 95.0%</div>
            </div>
          </template>
        </pv-card>

        <!-- Avg Lead Time -->
        <pv-card class="kpi-card">
          <template #content>
            <div class="kpi-icon orange"><i class="pi pi-clock"/></div>
            <div class="kpi-content">
              <div class="kpi-label">{{ t('reporting.supplier.kpi-lead-time') }}</div>
              <div class="kpi-value">--</div>
            </div>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- CLIENT SALES PERFORMANCE (top 4) -->
    <pv-card class="section-card">
      <template #content>
        <div class="section-header">
          <h2 class="section-title">{{ t('reporting.supplier.section-performance') }}</h2>
          <pv-button
              :label="t('reporting.supplier.view-all')"
              icon="pi pi-arrow-right"
              icon-pos="right"
              text
              class="view-all-link"
              @click="router.push('/reporting/portfolio')"
          />
        </div>

        <pv-data-table
            :value="clientSalesPerformance"
            :loading="loading"
            responsive-layout="scroll"
            class="performance-table"
        >
          <template #empty>
            <div class="empty-row">{{ t('reporting.supplier.no-data') }}</div>
          </template>
          <pv-column field="companyName" :header="t('reporting.supplier.col-company')">
            <template #body="{ data }"><strong>{{ data.companyName }}</strong></template>
          </pv-column>
          <pv-column field="revenue" :header="t('reporting.supplier.col-revenue')">
            <template #body="{ data }">{{ data.getFormattedRevenue() }}</template>
          </pv-column>
          <pv-column field="totalVolume" :header="t('reporting.supplier.col-volume')">
            <template #body="{ data }">{{ data.getFormattedVolume() }}</template>
          </pv-column>
          <pv-column field="status" :header="t('reporting.supplier.col-status')">
            <template #body="{ data }">
              <pv-tag :value="data.status" :severity="getStatusSeverity(data.status)" />
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem;
}
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }
.page-subtitle { color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0 0; }
.page-actions { display: flex; align-items: center; gap: 0.75rem; }
.error-message { margin-bottom: 1.5rem; }
.export-btn { background: #1E3A8A; color: #fff; border: none; border-radius: 8px; padding: 0.6rem 1.25rem; font-weight: 600; font-size: 0.9rem; }

/* KPI LAYOUT */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.kpi-side { display: flex; flex-direction: column; gap: 1.5rem; }

.kpi-card { border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.kpi-card :deep(.p-card-body) { padding: 1.5rem; }
.kpi-card :deep(.p-card-content) { display: flex; gap: 1rem; padding: 0; }

/* Revenue card overrides — content is column not row */
.revenue-card :deep(.p-card-content) { flex-direction: column; gap: 0; }
.revenue-top { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
.revenue-chart { height: 140px; }

.kpi-icon {
  width: 56px; height: 56px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
}
.kpi-icon.blue   { background: #DBEAFE; color: #1E40AF; }
.kpi-icon.green  { background: #D1FAE5; color: #059669; }
.kpi-icon.orange { background: #FEF3C7; color: #D97706; }
.kpi-content { flex: 1; }
.kpi-label { font-size: 0.82rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 0.4rem; }
.kpi-value { font-size: 1.9rem; font-weight: 700; color: #1f2937; margin-bottom: 0.35rem; }
.kpi-target { font-size: 0.85rem; color: #6B7280; }

/* TABLE */
.section-card { border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.section-card :deep(.p-card-body) { padding: 2rem; }
.section-card :deep(.p-card-content) { padding: 0; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.section-title { font-size: 1.25rem; font-weight: 700; color: #1f2937; margin: 0; }
.performance-table :deep(.p-datatable-thead > tr > th) {
  text-align: left; font-weight: 600; color: #1E3A8A;
  font-size: 0.9rem; padding: 0.75rem 0.5rem; border-bottom: 1px solid #E5E7EB;
}
.performance-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 0.5rem; color: #1f2937; font-size: 0.92rem; border-bottom: 1px solid #F3F4F6;
}
.empty-row { text-align: center; color: #9CA3AF; padding: 3rem 0 !important; }

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>