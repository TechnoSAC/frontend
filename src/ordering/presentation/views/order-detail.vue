<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import useOrderingStore from '../../application/ordering.store.js';

const route  = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const store  = useOrderingStore();

const sidebarCollapsed = ref(false);
const ordersExpanded   = ref(true);

onMounted(() => {
  if (!store.requestsLoaded) store.fetchRequests();
});

const request = computed(() => store.getRequestById(route.params.id));

const statusLabel = computed(() => {
  const map = {
    PENDING:    t('ordering.status-pending'),
    APPROVED:   t('ordering.status-approved'),
    REJECTED:   t('ordering.status-rejected'),
    DISPATCHED: t('ordering.status-dispatched'),
    DELIVERED:  t('ordering.status-delivered'),
  };
  return map[request.value?.status] ?? request.value?.status ?? '—';
});

const statusClass = computed(() => {
  const map = {
    PENDING:    'status-badge--pending',
    APPROVED:   'status-badge--approved',
    REJECTED:   'status-badge--rejected',
    DISPATCHED: 'status-badge--dispatched',
    DELIVERED:  'status-badge--delivered',
  };
  return map[request.value?.status] ?? '';
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
</script>

<template>
  <div class="layout-wrapper">
    <!-- TOPBAR -->
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
          <a class="side-item"><i class="pi pi-th-large"/><span>{{ t('option.dashboard') }}</span></a>
          <a class="side-item">
            <i class="pi pi-box"/><span>{{ t('option.catalog') }}</span>
            <i class="pi pi-chevron-down chevron"/>
          </a>
          <div class="side-group">
            <a class="side-item active-group" @click="ordersExpanded = !ordersExpanded">
              <i class="pi pi-shopping-cart"/><span>{{ t('option.ordering') }}</span>
              <i class="pi pi-chevron-up chevron" :class="{ rotated: !ordersExpanded }"/>
            </a>
            <div v-if="ordersExpanded" class="sub-nav">
              <router-link to="/ordering/pending" class="sub-item active-sub">
                {{ t('ordering.pending-requests') }}
              </router-link>
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

      <!-- MAIN -->
      <main class="main-area">
        <!-- Back button -->
        <div class="back-row">
          <button class="back-btn" @click="router.back()">
            <i class="pi pi-arrow-left"/> {{ t('ordering.back') }}
          </button>
          <h1 class="page-title">{{ t('ordering.order-detail-title') }}</h1>
        </div>

        <!-- Not found -->
        <div v-if="store.requestsLoaded && !request" class="not-found-card">
          <i class="pi pi-inbox"/> {{ t('common.no-data') }}
        </div>

        <!-- Loading -->
        <div v-else-if="store.loading" class="loading-row">
          <i class="pi pi-spin pi-spinner"/> {{ t('common.loading') }}
        </div>

        <!-- Detail card -->
        <div v-else-if="request" class="detail-card">
          <!-- Card header: ID + status badge -->
          <div class="card-header">
            <span class="order-id">{{ request.id }}</span>
            <span class="status-badge" :class="statusClass">{{ statusLabel }}</span>
          </div>

          <div class="card-divider"/>

          <!-- Fields grid -->
          <div class="fields-grid">
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-request-id-label') }}</span>
              <span class="field-value">{{ request.id }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-client-label') }}</span>
              <span class="field-value">{{ request.clientId ?? t('ordering.not-available') }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-provider-label') }}</span>
              <span class="field-value">{{ request.providerId ?? t('ordering.not-available') }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-product-label') }}</span>
              <span class="field-value">{{ request.fuelType || t('ordering.not-available') }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-quantity-label') }}</span>
              <span class="field-value highlight">{{ request.quantity }} {{ request.unit }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-total-label') }}</span>
              <span class="field-value highlight">{{ formatCurrency(request.totalAmount) }}</span>
            </div>
            <div class="field-block full-width">
              <span class="field-label">{{ t('ordering.col-delivery-address-label') }}</span>
              <span class="field-value">{{ request.deliveryAddress || t('ordering.not-available') }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-created-label') }}</span>
              <span class="field-value">{{ formatDate(request.createdAt) }}</span>
            </div>
            <div class="field-block">
              <span class="field-label">{{ t('ordering.col-dispatched-label') }}</span>
              <span class="field-value">{{ formatDate(request.deliveryDate) }}</span>
            </div>
          </div>

          <div class="card-divider"/>

          <!-- Actions -->
          <div class="card-footer">
            <button
                v-if="request.status === 'DISPATCHED'"
                class="confirm-btn"
                @click="store.updateRequest({ ...request, status: 'DELIVERED' })"
            >
              <i class="pi pi-check-circle"/> {{ t('ordering.confirm-delivery') }}
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ── Reutiliza el mismo sistema de layout que provider-request-list ── */
.layout-wrapper { min-height: 100vh; background: #F5F6F8; font-family: 'Inter', sans-serif; }

/* TOPBAR */
.topbar {
  height: 64px; background: #ffffff; border-bottom: 1px solid #E5E7EB;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1.5rem; position: sticky; top: 0; z-index: 50;
}
.topbar-left { display: flex; align-items: center; gap: 0.75rem; }
.brand { display: flex; align-items: center; gap: 0.5rem; }
.brand-logo-img { height: 36px; width: auto; object-fit: contain; }
.topbar-right { display: flex; align-items: center; gap: 1rem; }
.lang-switch { display: flex; background: #EFF2F7; border-radius: 999px; padding: 4px; }
.lang-btn {
  border: none; background: transparent; padding: 6px 14px; border-radius: 999px;
  cursor: pointer; font-weight: 600; font-size: 0.85rem; color: #475569;
  display: flex; align-items: center; gap: 6px;
}
.lang-btn.active { background: #ffffff; color: #1E3A8A; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
.icon-btn {
  border: none; background: transparent; width: 36px; height: 36px; border-radius: 50%;
  cursor: pointer; color: #475569; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
}
.icon-btn:hover { background: #F3F4F6; }

/* LAYOUT */
.layout-body { display: flex; min-height: calc(100vh - 64px); }
.sidebar {
  width: 240px; background: #ffffff; border-right: 1px solid #E5E7EB;
  padding: 1rem 0; transition: width 0.2s;
}
.sidebar-collapsed { width: 0; overflow: hidden; padding: 0; }
.side-nav { display: flex; flex-direction: column; }
.side-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1.25rem; color: #1f2937;
  font-weight: 500; cursor: pointer; text-decoration: none; font-size: 0.95rem;
}
.side-item:hover { background: #F8F9FB; }
.side-item .chevron { margin-left: auto; font-size: 0.75rem; color: #94A3B8; transition: transform 0.2s; }
.side-item .chevron.rotated { transform: rotate(180deg); }
.side-item.active-group { font-weight: 600; }
.sub-nav {
  display: flex; flex-direction: column;
  margin-left: 0.5rem; padding-left: 1.5rem; border-left: 1px solid #E5E7EB;
}
.sub-item {
  padding: 0.55rem 1rem; color: #6B7280;
  text-decoration: none; font-size: 0.9rem; border-radius: 6px; margin: 2px 0;
}
.sub-item:hover { color: #1E3A8A; background: #F8F9FB; }
.sub-item.active-sub { color: #F59E0B; font-weight: 600; background: #FEF3C7; }

/* MAIN */
.main-area { flex: 1; padding: 2rem 2.5rem; }

.back-row {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;
}
.back-btn {
  border: none; background: transparent; cursor: pointer;
  color: #6B7280; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;
  padding: 0;
}
.back-btn:hover { color: #1E3A8A; }
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }

.loading-row { color: #6B7280; display: flex; align-items: center; gap: 0.5rem; padding: 2rem 0; }
.not-found-card {
  background: #fff; border-radius: 8px; padding: 3rem;
  text-align: center; color: #9CA3AF; font-size: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

/* DETAIL CARD */
.detail-card {
  background: #ffffff; border-radius: 10px;
  padding: 1.75rem 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  max-width: 820px;
}
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.25rem;
}
.order-id { font-family: monospace; font-size: 1.05rem; font-weight: 700; color: #1f2937; }
.card-divider { border: none; border-top: 1px solid #E5E7EB; margin: 1.25rem 0; }

/* Status badge */
.status-badge {
  padding: 5px 14px; border-radius: 6px;
  font-size: 0.82rem; font-weight: 600;
}
.status-badge--pending    { background: #FEF3C7; color: #92400E; }
.status-badge--approved   { background: #DCFCE7; color: #15803D; }
.status-badge--rejected   { background: #FEE2E2; color: #B91C1C; }
.status-badge--dispatched { background: #E0E7FF; color: #3730A3; }
.status-badge--delivered  { background: #F0FDF4; color: #166534; }

/* Fields */
.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem 2rem;
}
.field-block.full-width { grid-column: 1 / -1; }
.field-label {
  display: block; font-size: 0.75rem; font-weight: 600;
  color: #9CA3AF; letter-spacing: 0.05em; margin-bottom: 0.3rem;
}
.field-value { font-size: 0.95rem; color: #374151; }
.field-value.highlight { font-size: 1rem; font-weight: 700; color: #1E3A8A; }

/* Footer */
.card-footer { display: flex; justify-content: flex-end; }
.confirm-btn {
  border: none; background: #E0E7FF; color: #3730A3;
  padding: 0.6rem 1.4rem; border-radius: 8px;
  font-weight: 600; font-size: 0.9rem; cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem;
}
.confirm-btn:hover { background: #C7D2FE; }
</style>