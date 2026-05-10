<script setup>
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { onMounted, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import useOrderingStore from "../../application/ordering.store.js";

const router = useRouter();
const confirm = useConfirm();
const store = useOrderingStore();
const { requests, errors, requestsLoaded, loading } = toRefs(store);
const { fetchRequests, deleteRequest, clearErrors } = store;
const { t, locale } = useI18n();

const sidebarCollapsed = ref(false);
const ordersExpanded = ref(true);

const navigateToNew = () => router.push({ name: 'ordering-request-new' });
const navigateToEdit = (id) => router.push({ name: 'ordering-request-edit', params: { id } });

const onRefresh = () => {
  clearErrors();
  fetchRequests();
};

const confirmDelete = (request) => {
  confirm.require({
    message: `Are you sure you want to delete request #${request.id}?`,
    header: 'Delete Request',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteRequest(request)
  });
};

const formatStatus = (status) => {
  return status || 'PENDING';
};

const getStatusClass = (status) => {
  const map = {
    'PENDING': 'status-pending',
    'APPROVED': 'status-approved',
    'REJECTED': 'status-rejected',
    'IN_TRANSIT': 'status-transit',
    'DELIVERED': 'status-delivered'
  };
  return map[status] || 'status-pending';
};

onMounted(() => {
  if (!requestsLoaded.value) fetchRequests();
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
          <div class="side-group">
            <a class="side-item active-group" @click="ordersExpanded = !ordersExpanded">
              <i class="pi pi-shopping-cart"/><span>{{ t('option.ordering') }}</span>
              <i class="pi pi-chevron-up chevron" :class="{ 'rotated': !ordersExpanded }"/>
            </a>
            <div v-if="ordersExpanded" class="sub-nav">
              <router-link to="/ordering/requests" class="sub-item active-sub">My Requests</router-link>
              <router-link to="/ordering/requests/new" class="sub-item">New Request</router-link>
            </div>
          </div>
          <a class="side-item">
            <i class="pi pi-truck"/><span>{{ t('option.fulfillment') }}</span>
            <i class="pi pi-chevron-down chevron"/>
          </a>
          <a class="side-item">
            <i class="pi pi-credit-card"/><span>{{ t('option.payment') }}</span>
            <i class="pi pi-chevron-down chevron"/>
          </a>
          <a class="side-item">
            <i class="pi pi-chart-bar"/><span>{{ t('option.reporting') }}</span>
            <i class="pi pi-chevron-down chevron"/>
          </a>
        </nav>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="main-area">
        <div class="page-header">
          <div class="page-title-group">
            <h1 class="page-title">My Fuel Requests</h1>
            <p class="page-subtitle">Track and manage your fuel delivery requests</p>
          </div>
          <div class="page-actions">
            <button class="refresh-btn" @click="onRefresh" :disabled="loading">
              <i class="pi pi-refresh" :class="{ 'spinning': loading }"/>
            </button>
            <button class="add-btn" @click="navigateToNew">
              <i class="pi pi-plus"/><span>New Request</span>
            </button>
          </div>
        </div>

        <div v-if="errors.length" class="error-banner">
          <i class="pi pi-exclamation-circle"/>
          <span>{{ t('errors.fetch') }}: {{ errors[0]?.message || 'Unknown Error' }}</span>
        </div>

        <div class="table-card">
          <table class="requests-table">
            <thead>
            <tr>
              <th>Request ID</th>
              <th>Fuel Type</th>
              <th>Quantity</th>
              <th>Delivery Address</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th class="actions-col"></th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="!loading && requests.length === 0">
              <td colspan="7" class="empty-row">No requests available</td>
            </tr>
            <tr v-for="request in requests" :key="request.id">
              <td>#{{ request.id }}</td>
              <td>{{ request.fuelType }}</td>
              <td>{{ request.quantity }} {{ request.unit }}</td>
              <td class="address-col">{{ request.deliveryAddress }}</td>
              <td>{{ request.deliveryDate }}</td>
              <td>
                <span class="status-pill" :class="getStatusClass(request.status)">
                  {{ formatStatus(request.status) }}
                </span>
              </td>
              <td class="actions-col">
                <button class="row-btn" @click="navigateToEdit(request.id)" :disabled="request.status !== 'PENDING'">
                  <i class="pi pi-pencil"/>
                </button>
                <button class="row-btn row-btn-danger" @click="confirmDelete(request)" :disabled="request.status !== 'PENDING'">
                  <i class="pi pi-trash"/>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <pv-confirm-dialog/>
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
.brand-logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
}
.topbar-right { display: flex; align-items: center; gap: 1rem; }
.lang-switch { display: flex; background: #EFF2F7; border-radius: 999px; padding: 4px; }
.lang-btn {
  border: none; background: transparent;
  padding: 6px 14px; border-radius: 999px;
  cursor: pointer; font-weight: 600; font-size: 0.85rem; color: #475569;
  display: flex; align-items: center; gap: 6px;
}
.lang-btn.active {
  background: #ffffff; color: #1E3A8A;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
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
.sub-item.active-sub {
  color: #F59E0B; font-weight: 600; background: #FEF3C7;
}

/* MAIN */
.main-area { flex: 1; padding: 2rem 2.5rem; }
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1.25rem;
}
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }
.page-subtitle { color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0 0; }
.page-actions { display: flex; align-items: center; gap: 0.75rem; }
.refresh-btn {
  width: 40px; height: 40px; border-radius: 50%;
  border: none; background: transparent;
  color: #1E3A8A; cursor: pointer; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
}
.refresh-btn:hover { background: #EFF6FF; }
.refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.add-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: #ffffff; color: #1E3A8A;
  border: 1.5px solid #1E3A8A; border-radius: 999px;
  padding: 0.55rem 1.25rem;
  font-weight: 600; font-size: 0.9rem; cursor: pointer;
}
.add-btn:hover { background: #1E3A8A; color: #fff; }

.error-banner {
  background: #FEE2E2; border: 1px solid #FCA5A5;
  color: #B91C1C; padding: 1rem 1.25rem;
  border-radius: 8px;
  display: flex; align-items: center; gap: 0.75rem;
  margin-bottom: 1.25rem; font-size: 0.95rem;
}

.table-card {
  background: #ffffff; border-radius: 8px;
  padding: 1.5rem 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.requests-table { width: 100%; border-collapse: collapse; }
.requests-table th {
  text-align: left; font-weight: 600;
  color: #1E3A8A; font-size: 0.95rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #E5E7EB;
}
.requests-table td {
  padding: 1rem 0.5rem; color: #1f2937; font-size: 0.92rem;
  border-bottom: 1px solid #F3F4F6;
}
.empty-row { text-align: center; color: #9CA3AF; padding: 3rem 0 !important; }
.address-col { color: #6B7280; max-width: 200px; }
.actions-col { width: 100px; text-align: right; }
.row-btn {
  border: none; background: transparent;
  width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; color: #475569; margin-left: 4px;
}
.row-btn:hover { background: #F3F4F6; color: #1E3A8A; }
.row-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.row-btn-danger:hover:not(:disabled) { color: #DC2626; background: #FEE2E2; }
.status-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-pending { background: #FEF3C7; color: #92400E; }
.status-approved { background: #DCFCE7; color: #15803D; }
.status-rejected { background: #FEE2E2; color: #B91C1C; }
.status-transit { background: #DBEAFE; color: #1E40AF; }
.status-delivered { background: #E0E7FF; color: #4338CA; }
</style>