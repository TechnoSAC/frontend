<script setup>
import { onMounted, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import useReportingStore from "../../application/reporting.store.js";
import useOrderingStore from "../../../ordering/application/ordering.store.js";
import useCatalogStore from "../../../catalog/application/catalog.store.js";

const reportingStore = useReportingStore();
const orderingStore = useOrderingStore();
const catalogStore = useCatalogStore();

const { totalSalesRevenue, avgFulfillmentRate, clientSalesPerformance } = toRefs(reportingStore);
const { t, locale } = useI18n();

const sidebarCollapsed = ref(false);
const reportsExpanded = ref(true);

const formatCurrency = (amount) => {
  return `S/ ${(amount / 1000).toFixed(2)}`;
};

const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

onMounted(() => {
  if (!orderingStore.requestsLoaded) orderingStore.fetchRequests();
  if (!catalogStore.productsLoaded) catalogStore.fetchProducts();
});
</script>

<template>
  <div class="layout-wrapper">
    <!-- TOP NAVBAR -->
    <div class="topbar">
      <div class="topbar-left">
        <button class="icon-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <i class="pi pi-bars"/>
        </button>
        <div class="brand">
          <img src="/fulltank-logo.png" alt="FullTank" class="brand-logo-img"/>
        </div>
      </div>
      <div class="topbar-right">
        <div class="lang-switch">
          <button class="lang-btn" :class="{ active: locale === 'en' }" @click="locale = 'en'">
            <i v-if="locale === 'en'" class="pi pi-check"/> EN
          </button>
          <button class="lang-btn" :class="{ active: locale === 'es' }" @click="locale = 'es'">
            <i v-if="locale === 'es'" class="pi pi-check"/> ES
          </button>
        </div>
        <button class="icon-btn"><i class="pi pi-bell"/></button>
      </div>
    </div>

    <div class="layout-body">
      <!-- SIDEBAR -->
      <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <nav class="side-nav">
          <a class="side-item">
            <i class="pi pi-th-large"/><span>{{ t('option.dashboard') }}</span>
          </a>
          <a class="side-item">
            <i class="pi pi-box"/><span>{{ t('option.catalog') }}</span>
            <i class="pi pi-chevron-down chevron"/>
          </a>
          <a class="side-item">
            <i class="pi pi-shopping-cart"/><span>{{ t('option.ordering') }}</span>
            <i class="pi pi-chevron-down chevron"/>
          </a>
          <a class="side-item">
            <i class="pi pi-truck"/><span>{{ t('option.fulfillment') }}</span>
            <i class="pi pi-chevron-down chevron"/>
          </a>
          <a class="side-item">
            <i class="pi pi-credit-card"/><span>{{ t('option.payment') }}</span>
            <i class="pi pi-chevron-down chevron"/>
          </a>
          <div class="side-group">
            <a class="side-item active-group" @click="reportsExpanded = !reportsExpanded">
              <i class="pi pi-chart-bar"/><span>{{ t('option.reporting') }}</span>
              <i class="pi pi-chevron-up chevron" :class="{ 'rotated': !reportsExpanded }"/>
            </a>
            <div v-if="reportsExpanded" class="sub-nav">
              <router-link to="/reporting/supplier" class="sub-item active-sub">{{ t('reporting.supplier-dashboard') }}</router-link>
              <router-link to="/reporting/portfolio" class="sub-item">{{ t('reporting.client-portfolio') }}</router-link>
            </div>
          </div>
        </nav>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="main-area">
        <div class="page-header">
          <div class="page-title-group">
            <h1 class="page-title">{{ t('reporting.supplier.title') }}</h1>
            <p class="page-subtitle">{{ t('reporting.supplier.subtitle') }}</p>
          </div>
          <div class="page-actions">
            <button class="icon-btn">
              <i class="pi pi-refresh"/>
            </button>
            <button class="export-btn">
              <i class="pi pi-file-pdf"/>
              <span>{{ t('reporting.supplier.export-pdf') }}</span>
            </button>
          </div>
        </div>

        <!-- KPI CARDS -->
        <div class="kpi-grid">
          <!-- Total Sales Revenue -->
          <div class="kpi-card">
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
          </div>

          <!-- Avg Fulfillment Rate -->
          <div class="kpi-card">
            <div class="kpi-icon green">
              <i class="pi pi-check-circle"/>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">{{ t('reporting.supplier.kpi-fulfillment') }}</div>
              <div class="kpi-value">{{ formatPercentage(avgFulfillmentRate) }}</div>
              <div class="kpi-target">{{ t('reporting.supplier.target') }}: 95.0%</div>
            </div>
          </div>

          <!-- Avg Lead Time -->
          <div class="kpi-card">
            <div class="kpi-icon orange">
              <i class="pi pi-clock"/>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">{{ t('reporting.supplier.kpi-lead-time') }}</div>
              <div class="kpi-value">--</div>
            </div>
          </div>
        </div>

        <!-- CLIENT SALES PERFORMANCE -->
        <div class="section-card">
          <div class="section-header">
            <h2 class="section-title">{{ t('reporting.supplier.section-performance') }}</h2>
            <a class="view-all-link">
              <span>{{ t('reporting.supplier.view-all') }}</span>
              <i class="pi pi-arrow-right"/>
            </a>
          </div>

          <table class="performance-table">
            <thead>
            <tr>
              <th>{{ t('reporting.supplier.col-company') }}</th>
              <th>{{ t('reporting.supplier.col-volume') }}</th>
              <th>{{ t('reporting.supplier.col-status') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="clientSalesPerformance.length === 0">
              <td colspan="3" class="empty-row">{{ t('reporting.supplier.no-data') }}</td>
            </tr>
            <tr v-for="client in clientSalesPerformance" :key="client.clientId">
              <td><strong>{{ client.companyName }}</strong></td>
              <td>{{ client.totalVolume.toLocaleString() }} gallons</td>
              <td>
                <span class="status-badge active">{{ client.status }}</span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  background: #F5F6F8;
  font-family: 'Inter', sans-serif;
}

/* TOPBAR */
.topbar {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #E5E7EB;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1.5rem; position: sticky; top: 0; z-index: 50;
}
.topbar-left { display: flex; align-items: center; gap: 0.75rem; }
.brand { display: flex; align-items: center; gap: 0.5rem; }
.brand-logo-img { height: 36px; width: auto; object-fit: contain; }
.topbar-right { display: flex; align-items: center; gap: 1rem; }
.lang-switch { display: flex; background: #EFF2F7; border-radius: 999px; padding: 4px; }
.lang-btn {
  border: none; background: transparent;
  padding: 6px 14px; border-radius: 999px;
  cursor: pointer; font-weight: 600; font-size: 0.85rem; color: #475569;
  display: flex; align-items: center; gap: 6px;
}
.lang-btn.active { background: #ffffff; color: #1E3A8A; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
.icon-btn {
  border: none; background: transparent;
  width: 36px; height: 36px; border-radius: 50%;
  cursor: pointer; color: #475569; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
}
.icon-btn:hover { background: #F3F4F6; }

/* LAYOUT */
.layout-body { display: flex; min-height: calc(100vh - 64px); }
.sidebar {
  width: 240px; background: #ffffff;
  border-right: 1px solid #E5E7EB;
  padding: 1rem 0; transition: width 0.2s;
}
.sidebar-collapsed { width: 0; overflow: hidden; padding: 0; }
.side-nav { display: flex; flex-direction: column; }
.side-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1.25rem; color: #1f2937;
  font-weight: 500; cursor: pointer;
  text-decoration: none; font-size: 0.95rem;
}
.side-item:hover { background: #F8F9FB; }
.side-item .chevron {
  margin-left: auto; font-size: 0.75rem;
  color: #94A3B8; transition: transform 0.2s;
}
.side-item .chevron.rotated { transform: rotate(180deg); }
.side-item.active-group { font-weight: 600; }
.sub-nav {
  display: flex; flex-direction: column;
  margin-left: 0.5rem; padding-left: 1.5rem;
  border-left: 1px solid #E5E7EB;
}
.sub-item {
  padding: 0.55rem 1rem; color: #6B7280;
  text-decoration: none; font-size: 0.9rem;
  border-radius: 6px; margin: 2px 0;
}
.sub-item:hover { color: #1E3A8A; background: #F8F9FB; }
.sub-item.active-sub { color: #F59E0B; font-weight: 600; background: #FEF3C7; }

/* MAIN */
.main-area { flex: 1; padding: 2rem 2.5rem; }
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 2rem;
}
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }
.page-subtitle { color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0 0; }
.page-actions { display: flex; align-items: center; gap: 0.75rem; }
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
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
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
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
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
.performance-table { width: 100%; border-collapse: collapse; }
.performance-table th {
  text-align: left;
  font-weight: 600;
  color: #1E3A8A;
  font-size: 0.9rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #E5E7EB;
}
.performance-table td {
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