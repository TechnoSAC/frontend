<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useOrderingStore from '../../application/ordering.store.js';

const route  = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const store  = useOrderingStore();

onMounted(() => {
  if (!store.ordersLoaded) store.fetchOrders();
});

const order = computed(() => store.getOrderById(route.params.id));

const statusSeverity = computed(() => {
  const map = {
    CREATED:    'info',
    DISPATCHED: 'warn',
    DELIVERED:  'success',
    CLOSED:     'secondary',
  };
  return map[order.value?.status] ?? 'secondary';
});

const statusLabel = computed(() => {
  const map = {
    CREATED:    t('ordering.status-created'),
    DISPATCHED: t('ordering.status-dispatched'),
    DELIVERED:  t('ordering.status-delivered'),
    CLOSED:     t('ordering.status-closed'),
  };
  return map[order.value?.status] ?? order.value?.status ?? '—';
});

const formatDate = (val) => {
  if (!val) return t('ordering.not-available');
  return new Date(val).toLocaleString(locale.value === 'es' ? 'es-PE' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (val) => {
  if (val == null) return t('ordering.not-available');
  return new Intl.NumberFormat(locale.value === 'es' ? 'es-PE' : 'en-US', {
    style: 'currency', currency: 'PEN'
  }).format(val);
};

const dispatch = () => {
  const now = new Date().toISOString();
  store.updateOrder({ ...order.value, status: 'DISPATCHED', dispatchedAt: now, updatedAt: now });
};

const confirmDelivery = () => {
  const now = new Date().toISOString();
  store.updateOrder({ ...order.value, status: 'DELIVERED', deliveredAt: now, updatedAt: now });
};

const closeOrder = () => {
  const now = new Date().toISOString();
  store.updateOrder({ ...order.value, status: 'CLOSED', closedAt: now, updatedAt: now });
};
</script>

<template>
  <div class="layout-body">
    <main class="main-area">
      <div class="back-row">
        <pv-button :label="t('ordering.back')" icon="pi pi-arrow-left" text class="back-btn" @click="router.back()" />
        <h1 class="page-title">{{ t('ordering.order-detail-title') }}</h1>
      </div>

      <pv-message v-if="store.ordersLoaded && !order" severity="warn" class="not-found-card">
        {{ t('common.no-data') }}
      </pv-message>

      <div v-else-if="store.loading" class="loading-row">
        <i class="pi pi-spin pi-spinner"/> {{ t('common.loading') }}
      </div>

      <pv-card v-else-if="order" class="detail-card">
        <template #content>
          <div class="card-header">
            <span class="order-id">#{{ order.id }}</span>
            <pv-tag :value="statusLabel" :severity="statusSeverity" class="status-badge"/>
          </div>

          <div class="card-divider"/>

          <div class="fields-grid">
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-request-ref-label') }}</span>
              <span class="field-value">#{{ order.requestId ?? t('ordering.not-available') }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-client-label') }}</span>
              <span class="field-value">{{ order.clientId ?? t('ordering.not-available') }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-provider-label') }}</span>
              <span class="field-value">{{ order.providerId ?? t('ordering.not-available') }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-product-label') }}</span>
              <span class="field-value">{{ order.fuelType || t('ordering.not-available') }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-quantity-label') }}</span>
              <span class="field-value highlight">{{ order.quantity }} {{ order.unit }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-total-label') }}</span>
              <span class="field-value highlight">{{ formatCurrency(order.totalAmount) }}</span>
            </div>
            <div class="field-block full-width">
              <span class="field-label">{{ t('ordering.col-delivery-address-label') }}</span>
              <span class="field-value">{{ order.deliveryAddress || t('ordering.not-available') }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-created-label') }}</span>
              <span class="field-value">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="field-block" v-if="order.dispatchedAt">
              <span class="field-label">{{ t('ordering.col-dispatched-label') }}</span>
              <span class="field-value">{{ formatDate(order.dispatchedAt) }}</span>
            </div>
            <div class="field-block" v-if="order.deliveredAt">
              <span class="field-label">{{ t('ordering.col-delivered-label') }}</span>
              <span class="field-value">{{ formatDate(order.deliveredAt) }}</span>
            </div>
            <div class="field-block" v-if="order.closedAt">
              <span class="field-label">{{ t('ordering.col-closed-label') }}</span>
              <span class="field-value">{{ formatDate(order.closedAt) }}</span>
            </div>
          </div>

          <div class="card-divider"/>

          <div class="card-footer">
            <pv-button
                v-if="order.status === 'CREATED'"
                :label="t('ordering.dispatch')"
                icon="pi pi-send"
                class="action-btn dispatch-btn"
                @click="dispatch"
            />
            <pv-button
                v-if="order.status === 'DISPATCHED'"
                :label="t('ordering.confirm-delivery')"
                icon="pi pi-check-circle"
                class="action-btn confirm-btn"
                @click="confirmDelivery"
            />
            <pv-button
                v-if="order.status === 'DELIVERED'"
                :label="t('ordering.close-order')"
                icon="pi pi-lock"
                class="action-btn close-btn"
                @click="closeOrder"
            />
          </div>
        </template>
      </pv-card>
    </main>
  </div>
</template>

<style scoped>
.layout-body { display: flex; min-height: calc(100vh - 64px); }
.main-area { flex: 1; padding: 2rem 2.5rem; }

.back-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.back-btn { color: #6B7280; }
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }

.loading-row { color: #6B7280; display: flex; align-items: center; gap: 0.5rem; padding: 2rem 0; }
.not-found-card { background: #fff; border-radius: 8px; padding: 3rem; text-align: center; }

.detail-card { border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); max-width: 820px; }
.detail-card :deep(.p-card-body) { padding: 1.75rem 2rem; }
.detail-card :deep(.p-card-content) { padding: 0; }

.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.order-id { font-family: monospace; font-size: 1.05rem; font-weight: 700; color: #1f2937; }
.card-divider { border: none; border-top: 1px solid #E5E7EB; margin: 1.25rem 0; }
.status-badge { font-size: 0.82rem; font-weight: 600; }

.fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem 2rem; }
.field-block.full-width { grid-column: 1 / -1; }
.field-label { display: block; font-size: 0.75rem; font-weight: 600; color: #9CA3AF; letter-spacing: 0.05em; margin-bottom: 0.3rem; }
.field-value { font-size: 0.95rem; color: #374151; }
.field-value.highlight { font-size: 1rem; font-weight: 700; color: #1E3A8A; }

.card-footer { display: flex; justify-content: flex-end; gap: 0.75rem; }

.action-btn { font-weight: 600; font-size: 0.9rem; padding: 0.6rem 1.4rem; border-radius: 8px; }
.dispatch-btn { background: #DBEAFE; color: #1D4ED8; }
.dispatch-btn:hover { background: #BFDBFE; }
.confirm-btn { background: #DCFCE7; color: #15803D; }
.confirm-btn:hover { background: #BBF7D0; }
.close-btn { background: #F1F5F9; color: #475569; }
.close-btn:hover { background: #E2E8F0; }
</style>
