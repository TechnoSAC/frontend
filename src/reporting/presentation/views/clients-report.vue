<template>
  <div class="clients-report-container">
    <!-- Header -->
    <div class="report-header">
      <div>
        <h1 class="report-title">{{ $t('reporting.clients.title') }}</h1>
        <p class="report-subtitle">{{ $t('reporting.clients.subtitle') }}</p>
      </div>
      <Button
          icon="pi pi-refresh"
          rounded
          text
          @click="refreshData"
      />
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <Card class="kpi-card">
        <template #content>
          <div class="kpi-icon" style="background: #6366f1;">
            <i class="pi pi-users"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ $t('reporting.clients.kpi-clients') }}</span>
            <h2 class="kpi-value">{{ reportingStore.totalClients }}</h2>
          </div>
        </template>
      </Card>

      <Card class="kpi-card">
        <template #content>
          <div class="kpi-icon" style="background: #10b981;">
            <i class="pi pi-dollar"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ $t('reporting.clients.kpi-revenue') }}</span>
            <h2 class="kpi-value">S/ {{ formattedRevenue }}</h2>
          </div>
        </template>
      </Card>

      <Card class="kpi-card">
        <template #content>
          <div class="kpi-icon" style="background: #f59e0b;">
            <i class="pi pi-shopping-cart"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ $t('reporting.clients.kpi-orders') }}</span>
            <h2 class="kpi-value">{{ reportingStore.activeOrders }}</h2>
          </div>
        </template>
      </Card>

      <Card class="kpi-card">
        <template #content>
          <div class="kpi-icon" style="background: #ec4899;">
            <i class="pi pi-chart-line"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ $t('reporting.clients.kpi-growth') }}</span>
            <h2 class="kpi-value">+{{ reportingStore.growthRate }}%</h2>
          </div>
        </template>
      </Card>
    </div>

    <!-- Client Portfolio Table -->
    <Card class="table-card">
      <template #header>
        <div class="table-header">
          <h3>{{ $t('reporting.clients.section-clients') }}</h3>
          <Dropdown
              v-model="selectedSector"
              :options="sectorOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('reporting.clients.filter-sector')"
              class="sector-filter"
              @change="onSectorChange"
          />
        </div>
      </template>
      <template #content>
        <DataTable
            :value="reportingStore.clients"
            :loading="reportingStore.loading"
            responsiveLayout="scroll"
            paginator
            :rows="10"
        >
          <Column
              field="companyName"
              :header="$t('reporting.clients.col-entity')"
          ></Column>

          <Column
              field="sector"
              :header="$t('reporting.clients.col-sector')"
          >
            <template #body="slotProps">
              <Tag
                  :value="$t(`reporting.clients.sector-${slotProps.data.sector.toLowerCase()}`)"
                  :severity="getSectorSeverity(slotProps.data.sector)"
              />
            </template>
          </Column>

          <Column
              field="totalVolume"
              :header="$t('reporting.clients.col-volume')"
          >
            <template #body="slotProps">
              {{ slotProps.data.getFormattedVolume() }}
            </template>
          </Column>

          <Column
              field="totalCost"
              :header="$t('reporting.clients.col-cost')"
          >
            <template #body="slotProps">
              {{ slotProps.data.getFormattedCost() }}
            </template>
          </Column>

          <Column
              field="lastActive"
              :header="$t('reporting.clients.col-active')"
          >
            <template #body="slotProps">
              {{ slotProps.data.getFormattedLastActive() }}
            </template>
          </Column>

          <Column
              field="status"
              :header="$t('reporting.clients.col-status')"
          >
            <template #body="slotProps">
              <Tag
                  :value="$t(`reporting.clients.status-${slotProps.data.status.toLowerCase()}`)"
                  :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Volume Distribution by Sector Chart -->
    <Card class="chart-card">
      <template #header>
        <h3 class="chart-title">{{ $t('reporting.clients.section-distribution') }}</h3>
      </template>
      <template #content>
        <div class="horizontal-chart-container">
          <Chart type="bar" :data="sectorChartData" :options="sectorChartOptions" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import useReportingStore from '../../application/reporting.store.js';
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';
import Chart from 'primevue/chart';
import {$t} from "@primeuix/styled";

const { t } = useI18n();
const reportingStore = useReportingStore();
const selectedSector = ref('ALL');

const sectorOptions = computed(() => [
  { label: t('reporting.clients.all-sectors'), value: 'ALL' },
  { label: t('reporting.clients.sector-transport'), value: 'TRANSPORT' },
  { label: t('reporting.clients.sector-mining'), value: 'MINING' },
  { label: t('reporting.clients.sector-construction'), value: 'CONSTRUCTION' },
  { label: t('reporting.clients.sector-maritime'), value: 'MARITIME' },
  { label: t('reporting.clients.sector-logistics'), value: 'LOGISTICS' }
]);

const formattedRevenue = computed(() =>
    reportingStore.totalRevenue.toLocaleString('es-PE')
);

// Sector Chart Data
const sectorChartData = computed(() => {
  const distribution = reportingStore.sectorDistribution;
  return {
    labels: distribution.map(d => d.getSectorLabel()),
    datasets: [{
      label: t('reporting.clients.section-distribution'),
      data: distribution.map(d => d.totalVolume),
      backgroundColor: distribution.map(d => d.getChartColor()),
      borderRadius: 4,
      barThickness: 30
    }]
  };
});

const sectorChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const distribution = reportingStore.sectorDistribution[context.dataIndex];
          return `${distribution.getFormattedVolume()} (${distribution.getFormattedPercentage()})`;
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `${(value / 1000).toFixed(0)}K MT`
      }
    }
  }
};

function getSectorSeverity(sector) {
  const severityMap = {
    TRANSPORT: 'info',
    MINING: 'warn',
    CONSTRUCTION: 'danger',
    MARITIME: 'secondary',
    LOGISTICS: 'success'
  };
  return severityMap[sector] || 'info';
}

function getStatusSeverity(status) {
  const severityMap = {
    ACTIVE: 'success',
    PENDING: 'warn',
    INACTIVE: 'secondary',
    REVIEW: 'info'
  };
  return severityMap[status] || 'info';
}

async function onSectorChange() {
  if (selectedSector.value === 'ALL') {
    await reportingStore.fetchClients();
  } else {
    await reportingStore.fetchClientsBySector(selectedSector.value);
  }
}

async function refreshData() {
  selectedSector.value = 'ALL';
  await reportingStore.fetchClients();
  await reportingStore.fetchMonthlySales();
}

onMounted(async () => {
  await reportingStore.fetchClients();
  await reportingStore.fetchMonthlySales();
});
</script>

<style scoped>
.clients-report-container {
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
  max-width: 800px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kpi-card :deep(.p-card-body) {
  padding: 1.5rem;
}

.kpi-card :deep(.p-card-content) {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0;
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
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
  display: block;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0.25rem 0 0 0;
}

.table-card,
.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
}

.table-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.sector-filter {
  min-width: 200px;
}

.chart-title {
  padding: 1.5rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.horizontal-chart-container {
  height: 300px;
  padding: 0 1.5rem 1.5rem;
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
