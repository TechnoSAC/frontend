<template>
  <div class="general-report-container">
    <!-- Header -->
    <div class="report-header">
      <div>
        <h1 class="report-title">{{ $t('reporting.general.title') }}</h1>
        <p class="report-subtitle">{{ $t('reporting.general.subtitle') }}</p>
      </div>
      <Button
          :label="$t('reporting.general.export-pdf')"
          icon="pi pi-file-pdf"
          outlined
          class="export-btn"
      />
    </div>

    <!-- KPI Cards Grid -->
    <div class="kpi-grid">
      <!-- Total Sales Revenue with Chart -->
      <Card class="kpi-card kpi-card-large">
        <template #content>
          <div class="kpi-header">
            <div class="kpi-icon" style="background: #3b82f6;">
              <i class="pi pi-chart-line"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">{{ $t('reporting.general.kpi-sales') }}</span>
              <h2 class="kpi-value">S/ {{ formattedTotalRevenue }}</h2>
              <span class="kpi-trend positive">
                <i class="pi pi-arrow-up"></i>
                +12.4% {{ $t('reporting.general.vs-period') }}
              </span>
            </div>
          </div>
          <!-- Monthly Revenue Chart -->
          <div class="chart-container">
            <Chart type="bar" :data="chartData" :options="chartOptions" />
          </div>
        </template>
      </Card>

      <!-- Avg. Fulfillment Rate -->
      <Card class="kpi-card">
        <template #content>
          <div class="kpi-icon" style="background: #10b981;">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ $t('reporting.general.kpi-fulfillment') }}</span>
            <h2 class="kpi-value">{{ reportingStore.avgFulfillmentRate }}%</h2>
            <span class="kpi-meta">{{ $t('reporting.general.target') }}: 95.0%</span>
          </div>
        </template>
      </Card>

      <!-- Avg. Lead Time -->
      <Card class="kpi-card">
        <template #content>
          <div class="kpi-icon" style="background: #f59e0b;">
            <i class="pi pi-clock"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ $t('reporting.general.kpi-lead-time') }}</span>
            <h2 class="kpi-value">{{ reportingStore.avgLeadTime }} {{ $t('reporting.general.days') }}</h2>
            <span class="kpi-meta">{{ $t('reporting.general.target') }}: 5.0 {{ $t('reporting.general.days') }}</span>
          </div>
        </template>
      </Card>
    </div>

    <!-- Client Sales Performance Table -->
    <Card class="table-card">
      <template #header>
        <div class="table-header">
          <h3>{{ $t('reporting.general.section-performance') }}</h3>
          <Button
              :label="$t('reporting.general.view-all')"
              text
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="navigateToClients"
          />
        </div>
      </template>
      <template #content>
        <DataTable
            :value="reportingStore.clientSalesPerformance"
            :loading="reportingStore.loading"
            responsiveLayout="scroll"
        >
          <Column
              field="companyName"
              :header="$t('reporting.general.col-company')"
          ></Column>
          <Column
              field="totalVolume"
              :header="$t('reporting.general.col-volume')"
          >
            <template #body="slotProps">
              {{ slotProps.data.getFormattedVolume() }}
            </template>
          </Column>
          <Column
              field="status"
              :header="$t('reporting.general.col-status')"
          >
            <template #body="slotProps">
              <Tag
                  :value="$t(`reporting.general.status-${slotProps.data.status.toLowerCase()}`)"
                  :severity="slotProps.data.getStatusBadge().severity"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useReportingStore from '../../application/reporting.store.js';
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Chart from 'primevue/chart';
import {$t} from "@primeuix/styled";

const router = useRouter();
const { t } = useI18n();
const reportingStore = useReportingStore();

// Chart Data
const chartData = computed(() => ({
  labels: reportingStore.monthlySales.map(m => m.month),
  datasets: [{
    label: t('reporting.general.chart-title'),
    data: reportingStore.monthlySales.map(m => m.revenue),
    backgroundColor: ['#93c5fd', '#93c5fd', '#93c5fd', '#93c5fd', '#3b82f6', '#1e3a8a'],
    borderRadius: 4,
    barThickness: 40
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => `S/ ${context.parsed.y.toLocaleString('es-PE')}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `S/ ${(value / 1000000).toFixed(1)}M`
      }
    }
  }
};

const formattedTotalRevenue = computed(() =>
    reportingStore.totalSalesRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })
);

function navigateToClients() {
  router.push('/reporting/clients');
}

onMounted(async () => {
  await reportingStore.fetchClients();
  await reportingStore.fetchMonthlySales();
});
</script>

<style scoped>
.general-report-container {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.report-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.report-subtitle {
  color: #64748b;
  margin: 0.5rem 0 0 0;
}

.kpi-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kpi-card-large {
  grid-column: span 1;
}

.kpi-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.kpi-info {
  flex: 1;
}

.kpi-label {
  font-size: 0.875rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 500;
}

.kpi-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0.25rem 0;
}

.kpi-trend {
  font-size: 0.875rem;
  font-weight: 500;
}

.kpi-trend.positive {
  color: #10b981;
}

.kpi-meta {
  font-size: 0.875rem;
  color: #64748b;
}

.chart-container {
  height: 200px;
  margin-top: 1rem;
}

.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.table-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
