<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import Chart from 'primevue/chart';
import useReportingStore from "../../application/reporting.store.js";
import useOrderingStore from "../../../ordering/application/ordering.store.js";
import pinia from "../../../pinia.js";

const reportingStore = useReportingStore(pinia);
const orderingStore = useOrderingStore(pinia);

const { t } = useI18n();
const selectedSector = ref('all');

const sectorOptions = computed(() => [
  { label: t('reporting.portfolio.all-sectors'), value: 'all' },
  { label: 'Transport',    value: 'TRANSPORT' },
  { label: 'Mining',       value: 'MINING' },
  { label: 'Construction', value: 'CONSTRUCTION' },
  { label: 'Maritime',     value: 'MARITIME' },
  { label: 'Logistics',    value: 'LOGISTICS' },
]);

const formatCurrency = (amount) => `S/ ${(amount / 1000).toFixed(1)}k`;

const getStatusSeverity = (status) => {
  const map = { ACTIVE: 'success', INACTIVE: 'secondary', PENDING: 'warn', REVIEW: 'info' };
  return map[status] || 'info';
};

const getSectorSeverity = (sector) => {
  const map = {
    TRANSPORT: 'info', MINING: 'warn', CONSTRUCTION: 'danger',
    MARITIME: 'secondary', LOGISTICS: 'success'
  };
  return map[sector] || 'info';
};

// Doughnut chart built from real sectorDistribution data
const chartData = computed(() => {
  const dist = reportingStore.sectorDistribution;
  return {
    labels: dist.map(d => d.getSectorLabel()),
    datasets: [{
      data: dist.map(d => d.percentage),
      backgroundColor: dist.map(d => d.getChartColor()),
      hoverOffset: 6,
    }],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const d = reportingStore.sectorDistribution[ctx.dataIndex];
          return d ? `${d.getFormattedVolume()} (${d.getFormattedPercentage()})` : '';
        },
      },
    },
  },
}));

const onSectorChange = () => {
  reportingStore.filterBySector(selectedSector.value);
};

const refreshData = () => {
  selectedSector.value = 'all';
  reportingStore.fetchClients();
  reportingStore.fetchMonthlySales();
};

onMounted(() => {
  refreshData();
  if (!orderingStore.ordersLoaded) orderingStore.fetchOrders();
});
</script>

<template>
    <div class="layout-body">
      <main class="main-area">
        <div class="page-header">
          <div class="page-title-group">
            <h1 class="page-title">{{ t('reporting.portfolio.title') }}</h1>
            <p class="page-subtitle">{{ t('reporting.portfolio.subtitle') }}</p>
          </div>
          <div class="page-actions">
            <pv-button
                icon="pi pi-refresh"
                text
                rounded
                class="icon-btn"
                :loading="reportingStore.loading"
                @click="refreshData"
            />
          </div>
        </div>

        <pv-message v-if="reportingStore.error" severity="error" class="error-message">
          {{ t('errors.fetch') }}: {{ reportingStore.error }}
        </pv-message>

        <!-- KPI CARDS -->
        <div class="kpi-grid">
          <pv-card class="kpi-card">
            <template #content>
              <div class="kpi-icon blue"><i class="pi pi-users"/></div>
              <div class="kpi-content">
                <div class="kpi-label">{{ t('reporting.portfolio.kpi-clients') }}</div>
                <div class="kpi-value">{{ reportingStore.totalClients }}</div>
              </div>
            </template>
          </pv-card>

          <pv-card class="kpi-card">
            <template #content>
              <div class="kpi-icon green"><i class="pi pi-dollar"/></div>
              <div class="kpi-content">
                <div class="kpi-label">{{ t('reporting.portfolio.kpi-revenue') }}</div>
                <div class="kpi-value">{{ formatCurrency(reportingStore.totalRevenue) }}</div>
              </div>
            </template>
          </pv-card>

          <pv-card class="kpi-card">
            <template #content>
              <div class="kpi-icon orange"><i class="pi pi-shopping-cart"/></div>
              <div class="kpi-content">
                <div class="kpi-label">{{ t('reporting.portfolio.kpi-orders') }}</div>
                <div class="kpi-value">{{ orderingStore.activeOrders.length }}</div>
              </div>
            </template>
          </pv-card>

          <pv-card class="kpi-card">
            <template #content>
              <div class="kpi-icon pink"><i class="pi pi-chart-line"/></div>
              <div class="kpi-content">
                <div class="kpi-label">{{ t('reporting.portfolio.kpi-growth') }}</div>
                <div class="kpi-value">+{{ reportingStore.growthRate }}%</div>
              </div>
            </template>
          </pv-card>
        </div>

        <!-- CLIENT PORTFOLIO TABLE -->
        <pv-card class="section-card">
          <template #content>
            <div class="section-header">
              <h2 class="section-title">{{ t('reporting.portfolio.section-clients') }}</h2>
              <div class="filter-group">
                <label>{{ t('reporting.portfolio.filter-sector') }}</label>
                <pv-select
                    v-model="selectedSector"
                    :options="sectorOptions"
                    option-label="label"
                    option-value="value"
                    class="sector-filter"
                    @change="onSectorChange"
                />
              </div>
            </div>

            <pv-data-table
                :value="reportingStore.clients"
                :loading="reportingStore.loading"
                responsive-layout="scroll"
                class="portfolio-table"
            >
              <template #empty>
                <div class="empty-row">{{ t('reporting.portfolio.no-clients') }}</div>
              </template>

              <pv-column field="companyName" :header="t('reporting.portfolio.col-entity')">
                <template #body="{ data }">
                  <strong>{{ data.companyName }}</strong>
                </template>
              </pv-column>

              <pv-column field="sector" :header="t('reporting.portfolio.col-sector')">
                <template #body="{ data }">
                  <pv-tag :value="data.sector" :severity="getSectorSeverity(data.sector)" />
                </template>
              </pv-column>

              <pv-column field="totalVolume" :header="t('reporting.portfolio.col-volume')">
                <template #body="{ data }">
                  {{ data.getFormattedVolume() }}
                </template>
              </pv-column>

              <pv-column field="lastActive" :header="t('reporting.portfolio.col-active')">
                <template #body="{ data }">
                  {{ data.getFormattedLastActive() }}
                </template>
              </pv-column>

              <pv-column field="status" :header="t('reporting.portfolio.col-status')">
                <template #body="{ data }">
                  <pv-tag :value="data.status" :severity="getStatusSeverity(data.status)" class="status-badge"/>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>

        <!-- SECTOR DISTRIBUTION CHART -->
        <pv-card class="section-card">
          <template #content>
            <h2 class="section-title">{{ t('reporting.portfolio.section-distribution') }}</h2>
            <div v-if="reportingStore.sectorDistribution.length === 0 && !reportingStore.loading" class="chart-placeholder">
              <i class="pi pi-chart-pie chart-placeholder-icon"/>
              <p class="chart-placeholder-text">{{ t('reporting.portfolio.no-clients') }}</p>
            </div>
            <div v-else class="chart-wrapper">
              <Chart type="doughnut" :data="chartData" :options="chartOptions" />
            </div>
          </template>
        </pv-card>
      </main>
    </div>
</template>

<style scoped>
.layout-body { display: flex; min-height: calc(100vh - 64px); }
.main-area { flex: 1; padding: 2rem 2.5rem; }

.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 2rem;
}
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }
.page-subtitle { color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0 0; }
.page-actions { display: flex; align-items: center; gap: 0.75rem; }
.error-message { margin-bottom: 1.5rem; }

/* KPI CARDS */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.kpi-card { border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.kpi-card :deep(.p-card-body) { padding: 1.5rem; }
.kpi-card :deep(.p-card-content) { display: flex; gap: 1rem; padding: 0; }
.kpi-icon {
  width: 56px; height: 56px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; flex-shrink: 0;
}
.kpi-icon.blue { background: #DBEAFE; color: #1E40AF; }
.kpi-icon.green { background: #D1FAE5; color: #059669; }
.kpi-icon.orange { background: #FEF3C7; color: #D97706; }
.kpi-icon.pink { background: #FCE7F3; color: #DB2777; }
.kpi-content { flex: 1; }
.kpi-label {
  font-size: 0.85rem; color: #6B7280;
  margin-bottom: 0.5rem; text-transform: uppercase;
  letter-spacing: 0.5px; font-weight: 600;
}
.kpi-value { font-size: 2rem; font-weight: 700; color: #1f2937; }

/* SECTION CARDS */
.section-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
}
.section-card :deep(.p-card-body) { padding: 2rem; }
.section-card :deep(.p-card-content) { padding: 0; }
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.5rem;
}
.section-title { font-size: 1.25rem; font-weight: 700; color: #1f2937; margin: 0 0 1rem 0; }
.filter-group { display: flex; align-items: center; gap: 0.75rem; }
.filter-group label { font-size: 0.9rem; color: #6B7280; font-weight: 500; }
.sector-filter { min-width: 180px; }

/* TABLE */
.portfolio-table :deep(.p-datatable-table) { width: 100%; border-collapse: collapse; }
.portfolio-table :deep(.p-datatable-thead > tr > th) {
  text-align: left; font-weight: 600; color: #1E3A8A;
  font-size: 0.9rem; padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #E5E7EB; background: #ffffff;
}
.portfolio-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 0.5rem; color: #1f2937;
  font-size: 0.92rem; border-bottom: 1px solid #F3F4F6;
}
.empty-row { text-align: center; color: #9CA3AF; padding: 3rem 0 !important; }
.status-badge { font-size: 0.8rem; font-weight: 600; }

/* CHART */
.chart-wrapper { height: 320px; position: relative; }
.chart-placeholder {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 4rem 2rem;
}
.chart-placeholder-icon { font-size: 3rem; color: #D1D5DB; }
.chart-placeholder-text { color: #9CA3AF; margin-top: 1rem; }
</style>