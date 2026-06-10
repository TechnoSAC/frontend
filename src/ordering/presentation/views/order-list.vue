<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import useOrderingStore from '../../application/ordering.store.js';

const router  = useRouter();
const confirm = useConfirm();
const store   = useOrderingStore();
const { t }   = useI18n();

onMounted(() => {
  store.clearErrors();
  if (!store.ordersLoaded) store.fetchOrders();
});

const onRefresh = () => {
  store.clearErrors();
  store.fetchOrders();
};

const viewOrder = (id) => router.push({ name: 'ordering-order-detail', params: { id } });

const confirmDelete = (order) => {
  confirm.require({
    message: `Are you sure you want to delete order #${order.id}?`,
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => store.deleteOrder(order),
  });
};

const getStatusSeverity = (status) => {
  const map = {
    CREATED:    'info',
    DISPATCHED: 'warn',
    DELIVERED:  'success',
    CLOSED:     'secondary',
  };
  return map[status] ?? 'secondary';
};

const getStatusLabel = (status) => {
  const map = {
    CREATED:    t('ordering.status-created'),
    DISPATCHED: t('ordering.status-dispatched'),
    DELIVERED:  t('ordering.status-delivered'),
    CLOSED:     t('ordering.status-closed'),
  };
  return map[status] ?? status;
};
</script>

<template>
  <div class="main-area">
    <div class="page-header">
      <div class="page-title-group">
        <h1 class="page-title">{{ t('ordering.order-list-title') }}</h1>
        <p class="page-subtitle">{{ t('ordering.order-list-subtitle') }}</p>
      </div>
      <div class="page-actions">
        <pv-button icon="pi pi-refresh" text rounded class="refresh-btn" :loading="store.loading" @click="onRefresh"/>
      </div>
    </div>

    <pv-message v-if="store.errors.length" severity="error" class="error-banner">
      {{ t('errors.fetch') }}: {{ store.errors[0]?.message || t('errors.unknown') }}
    </pv-message>

    <pv-card class="table-card">
      <template #content>
        <pv-data-table
            :value="store.orders"
            :loading="store.loading"
            responsive-layout="scroll"
            class="orders-table"
            row-hover
            @row-click="(e) => viewOrder(e.data.id)"
        >
          <template #empty>
            <div class="empty-row">{{ t('ordering.no-orders') }}</div>
          </template>

          <pv-column :header="t('ordering.col-order-id')">
            <template #body="{ data }">
              <span class="order-id">#{{ data.id }}</span>
            </template>
          </pv-column>

          <pv-column :header="t('ordering.col-fuel-type')" field="fuelType"/>

          <pv-column :header="t('ordering.col-quantity')">
            <template #body="{ data }">{{ data.quantity }} {{ data.unit }}</template>
          </pv-column>

          <pv-column :header="t('ordering.col-address')" field="deliveryAddress" class="address-col"/>

          <pv-column :header="t('common.status')">
            <template #body="{ data }">
              <pv-tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" class="status-pill"/>
            </template>
          </pv-column>

          <pv-column :header="t('common.actions')" class="actions-col">
            <template #body="{ data }">
              <div class="row-actions" @click.stop>
                <pv-button icon="pi pi-eye"   text rounded severity="secondary" @click="viewOrder(data.id)"/>
                <pv-button icon="pi pi-trash" text rounded severity="danger"    @click="confirmDelete(data)"/>
              </div>
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>
  </div>

  <pv-confirm-dialog/>
</template>

<style scoped>
.main-area {
  flex: 1;
  padding: 2rem 2.5rem;
}

.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1.25rem;
}
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }
.page-subtitle { color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0; }
.page-actions { display: flex; align-items: center; gap: 0.75rem; }

.error-banner { margin-bottom: 1.25rem; }

.table-card { border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.table-card :deep(.p-card-body) { padding: 1.5rem 2rem; }
.table-card :deep(.p-card-content) { padding: 0; }

.orders-table :deep(.p-datatable-table) { width: 100%; border-collapse: collapse; }
.orders-table :deep(.p-datatable-thead > tr > th) {
  text-align: left; font-weight: 600; color: #1E3A8A;
  font-size: 0.95rem; padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #E5E7EB; background: #fff;
}
.orders-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 0.5rem; color: #1f2937; font-size: 0.92rem;
  border-bottom: 1px solid #F3F4F6;
}
.orders-table :deep(.p-datatable-tbody > tr:hover > td) {
  background: #F0F4FF; cursor: pointer;
}
.empty-row { text-align: center; color: #9CA3AF; padding: 3rem 0; }

.order-id { font-family: 'Courier New', monospace; font-weight: 700; color: #1E3A8A; }
.address-col { color: #6B7280; }
.status-pill { font-size: 0.8rem; font-weight: 600; }
.actions-col { width: 90px; }
.row-actions { display: flex; justify-content: flex-end; gap: 0.25rem; }
</style>
