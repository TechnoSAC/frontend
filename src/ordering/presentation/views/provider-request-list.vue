<script setup>
import { useConfirm } from "primevue/useconfirm";
import { onMounted, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import useOrderingStore from "../../application/ordering.store.js";

const confirm = useConfirm();
const store = useOrderingStore();
const { pendingRequests, errors, requestsLoaded, loading } = toRefs(store);
const { fetchRequests, approveRequest, rejectRequest, clearErrors } = store;
const { t, locale } = useI18n();

const sidebarCollapsed = ref(false);
const ordersExpanded = ref(true);

const onRefresh = () => {
  clearErrors();
  fetchRequests();
};

const confirmApprove = (request) => {
  confirm.require({
    message: `Approve fuel request #${request.id} for ${request.quantity} ${request.unit} of ${request.fuelType}?`,
    header: 'Approve Request',
    icon: 'pi pi-check-circle',
    acceptClass: 'p-button-success',
    accept: () => approveRequest(request)
  });
};

const confirmReject = (request) => {
  confirm.require({
    message: `Reject fuel request #${request.id}? This action cannot be undone.`,
    header: 'Reject Request',
    icon: 'pi pi-times-circle',
    acceptClass: 'p-button-danger',
    accept: () => rejectRequest(request)
  });
};

onMounted(() => {
  if (!requestsLoaded.value) fetchRequests();
});
</script>

<template>
  <div class="layout-wrapper">


      <!-- MAIN CONTENT -->
      <main class="main-area">
        <div class="page-header">
          <div class="page-title-group">
            <h1 class="page-title">{{ t('ordering.page-title') }}</h1>
            <p class="page-subtitle">{{ t('ordering.page-subtitle') }}</p>
          </div>
          <div class="page-actions">
            <button class="refresh-btn" @click="onRefresh" :disabled="loading">
              <i class="pi pi-refresh" :class="{ 'spinning': loading }"/>
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
              <th>{{ t('ordering.col-request-id') }}</th>
              <th>{{ t('ordering.col-client-id') }}</th>
              <th>{{ t('ordering.col-fuel-type') }}</th>
              <th>{{ t('ordering.col-quantity') }}</th>
              <th>{{ t('ordering.col-address') }}</th>
              <th>{{ t('ordering.col-date') }}</th>
              <th class="actions-col">{{ t('ordering.col-actions') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="!loading && pendingRequests.length === 0">
              <td colspan="7" class="empty-row">{{ t('ordering.no-pending') }}</td>
            </tr>
            <tr v-for="request in pendingRequests" :key="request.id">
              <!--<td><strong>#{{ request.id }}</strong></td>-->
              <td>
                <strong
                    class="request-id-link"
                    @click="$router.push({ name: 'ordering-order-detail', params: { id: request.id } })"
                >
                  #{{ request.id }}
                </strong>
              </td>
              <td>Client #{{ request.clientId }}</td>
              <td>{{ request.fuelType }}</td>
              <td>{{ request.quantity }} {{ request.unit }}</td>
              <td class="address-col">{{ request.deliveryAddress }}</td>
              <td>{{ request.deliveryDate }}</td>

              <td class="actions-col">
                <button class="action-btn approve-btn" @click="confirmApprove(request)">
                  <i class="pi pi-check"/>
                  <span>{{ t('ordering.approve') }}</span>
                </button>
                <button class="action-btn reject-btn" @click="confirmReject(request)">
                  <i class="pi pi-times"/>
                  <span>{{ t('ordering.reject') }}</span>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <pv-confirm-dialog/>
</template>

<style scoped>

.request-id-link {
  color: #1E3A8A;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.request-id-link:hover { color: #F59E0B; }


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
.actions-col { width: 220px; text-align: right; }
.action-btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 0.5rem;
}
.approve-btn {
  background: #DCFCE7;
  color: #15803D;
}
.approve-btn:hover {
  background: #BBF7D0;
}
.reject-btn {
  background: #FEE2E2;
  color: #B91C1C;
}
.reject-btn:hover {
  background: #FECACA;
}
</style>