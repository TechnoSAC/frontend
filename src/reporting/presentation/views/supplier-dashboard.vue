<script setup>
import { onMounted, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import useReportingStore from "../../application/reporting.store.js";
import useOrderingStore from "../../../ordering/application/ordering.store.js";
import useInventoryStore from "../../../inventory/application/inventory.store.js";
import pinia from "../../../pinia.js";

const reportingStore = useReportingStore(pinia);
const orderingStore = useOrderingStore(pinia);
const inventoryStore = useInventoryStore(pinia);

const { totalSalesRevenue, avgFulfillmentRate, clientSalesPerformance, loading, error } = toRefs(reportingStore);
const { fetchClients, fetchMonthlySales } = reportingStore;
const { t } = useI18n();

const formatCurrency = (amount) => {
  return `S/ ${(amount / 1000).toFixed(2)}`;
};

const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
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
            <pv-button
                icon="pi pi-refresh"
                text
                rounded
                class="icon-btn"
                :loading="loading"
                @click="refreshData"
            />
            <pv-button
                :label="t('reporting.supplier.export-pdf')"
                icon="pi pi-file-pdf"
                class="export-btn"
            />
          </div>
        </div>

        <pv-message v-if="error" severity="error" class="error-message">
          {{ t('errors.fetch') }}: {{ error }}
        </pv-message>

        <!-- KPI CARDS -->
        <div class="kpi-grid">
          <!-- Total Sales Revenue -->
          <pv-card class="kpi-card">
            <template #content>
              <div class="kpi-icon blue">
                <i class="pi pi-chart-line"/>
              </div>
              <div class="kpi-content">
                <div class="kpi-label">{{ t('reporting.supplier.kpi-sales') }}</div>
                <div class="kpi-value">{{ formatCurrency(totalSalesRevenue) }}</div>
                <div class="kpi-change positive">
                  <i class="pi pi-arrow-up"/>
                  <span>+12.4% {{ t('reporting.supplier.vs-period') }}</span>
                </div>
              </div>
            </template>
          </pv-card>

          <!-- Avg Fulfillment Rate -->
          <pv-card class="kpi-card">
            <template #content>
              <div class="kpi-icon green">
                <i class="pi pi-check-circle"/>
              </div>
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
              <div class="kpi-icon orange">
                <i class="pi pi-clock"/>
              </div>
              <div class="kpi-content">
                <div class="kpi-label">{{ t('reporting.supplier.kpi-lead-time') }}</div>
                <div class="kpi-value">--</div>
              </div>
            </template>
          </pv-card>
        </div>

        <!-- CLIENT SALES PERFORMANCE -->
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
              <pv-column
                  field="companyName"
                  :header="t('reporting.supplier.col-company')"
              >
                <template #body="{ data }">
                  <strong>{{ data.companyName }}</strong>
                </template>
              </pv-column>
              <pv-column
                  field="totalVolume"
                  :header="t('reporting.supplier.col-volume')"
              >
                <template #body="{ data }">
                  {{ data.totalVolume.toLocaleString() }} gallons
                </template>
              </pv-column>
              <pv-column
                  field="status"
                  :header="t('reporting.supplier.col-status')"
              >
                <template #body="{ data }">
                  <pv-tag :value="data.status" severity="success" class="status-badge"/>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>
  </div>
</template>

<style scoped>
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 2rem;
}
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }
.page-subtitle { color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0 0; }
.page-actions { display: flex; align-items: center; gap: 0.75rem; }
.error-message { margin-bottom: 1.5rem; }
.export-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: #1E3A8A; color: #ffffff;
  border: none; border-radius: 8px;
  padding: 0.6rem 1.25rem;
  font-weight: 600; font-size: 0.9rem; cursor: pointer;
}
.export-btn:hover { background: #1E40AF; }

/* KPI CARDS */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.kpi-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.kpi-card :deep(.p-card-body) {
  padding: 1.5rem;
}
.kpi-card :deep(.p-card-content) {
  display: flex;
  gap: 1rem;
  padding: 0;
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
.kpi-icon.blue { background: #DBEAFE; color: #1E40AF; }
.kpi-icon.green { background: #D1FAE5; color: #059669; }
.kpi-icon.orange { background: #FEF3C7; color: #D97706; }
.kpi-content { flex: 1; }
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
  margin-bottom: 0.5rem;
}
.kpi-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.kpi-change.positive { color: #059669; }
.kpi-target {
  font-size: 0.85rem;
  color: #6B7280;
}

/* SECTION CARD */
.section-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.section-card :deep(.p-card-body) {
  padding: 2rem;
}
.section-card :deep(.p-card-content) {
  padding: 0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
.view-all-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1E3A8A;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
}
.view-all-link:hover { text-decoration: underline; }

/* TABLE */
.performance-table :deep(.p-datatable-table) {
  width: 100%;
  border-collapse: collapse;
}
.performance-table :deep(.p-datatable-thead > tr > th) {
  text-align: left;
  font-weight: 600;
  color: #1E3A8A;
  font-size: 0.9rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #E5E7EB;
  background: #ffffff;
}
.performance-table :deep(.p-datatable-tbody > tr > td) {
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
.status-badge.active {
  background: #DCFCE7;
  color: #15803D;
}
</style>
