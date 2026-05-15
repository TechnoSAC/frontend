<script setup>
import { useConfirm } from "primevue/useconfirm";
import { onMounted, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import useOrderingStore from "../../application/ordering.store.js";

const confirm = useConfirm();
const store = useOrderingStore();
const { pendingRequests, errors, requestsLoaded, loading } = toRefs(store);
const { fetchRequests, approveRequest, rejectRequest, clearErrors } = store;
const { t } = useI18n();

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
  clearErrors();
  if (!requestsLoaded.value) fetchRequests();
});
</script>

<template>
  <div>
        <div class="page-header">
          <div class="page-title-group">
            <h1 class="page-title">{{ t('ordering.page-title') }}</h1>
            <p class="page-subtitle">{{ t('ordering.page-subtitle') }}</p>
          </div>
          <div class="page-actions">
            <pv-button icon="pi pi-refresh" text rounded class="refresh-btn" :loading="loading" @click="onRefresh" />
          </div>
        </div>

        <pv-message v-if="errors.length" severity="error" class="error-banner">
          {{ t('errors.fetch') }}: {{ errors[0]?.message || 'Unknown Error' }}
        </pv-message>

        <pv-card class="table-card">
          <template #content>
            <pv-data-table :value="pendingRequests" :loading="loading" responsive-layout="scroll" class="requests-table">
              <template #empty>
                <div class="empty-row">{{ t('ordering.no-pending') }}</div>
              </template>
              <pv-column :header="t('ordering.col-request-id')">
                <template #body="{ data }">
                  <span class="request-id">#{{ data.id }}</span>
                </template>
              </pv-column>
              <pv-column :header="t('ordering.col-client-id')">
                <template #body="{ data }">Client #{{ data.clientId }}</template>
              </pv-column>
              <pv-column field="fuelType" :header="t('ordering.col-fuel-type')" />
              <pv-column :header="t('ordering.col-quantity')">
                <template #body="{ data }">{{ data.quantity }} {{ data.unit }}</template>
              </pv-column>
              <pv-column field="deliveryAddress" :header="t('ordering.col-address')" class="address-col" />
              <pv-column field="deliveryDate" :header="t('ordering.col-date')" />
              <pv-column :header="t('ordering.col-actions')" class="actions-col">
                <template #body="{ data }">
                  <div class="row-actions">
                    <pv-button :label="t('ordering.approve')" icon="pi pi-check" class="action-btn approve-btn" @click="confirmApprove(data)" />
                    <pv-button :label="t('ordering.reject')" icon="pi pi-times" class="action-btn reject-btn" @click="confirmReject(data)" />
                  </div>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>
    <pv-confirm-dialog/>
  </div>
</template>

<style scoped>

.request-id {
  font-family: monospace;
  color: #1f2937;
}

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
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.table-card :deep(.p-card-body) { padding: 1.5rem 2rem; }
.table-card :deep(.p-card-content) { padding: 0; }
.requests-table :deep(.p-datatable-table) { width: 100%; border-collapse: collapse; }
.requests-table :deep(.p-datatable-thead > tr > th) {
  text-align: left; font-weight: 600;
  color: #1E3A8A; font-size: 0.95rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #E5E7EB;
  background: #ffffff;
}
.requests-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 0.5rem; color: #1f2937; font-size: 0.92rem;
  border-bottom: 1px solid #F3F4F6;
}
.empty-row { text-align: center; color: #9CA3AF; padding: 3rem 0 !important; }
.address-col { color: #6B7280; max-width: 200px; }
.actions-col { width: 220px; text-align: right; }
.row-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
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
