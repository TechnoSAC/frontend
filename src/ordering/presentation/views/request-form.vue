<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import useOrderingStore from "../../application/ordering.store.js";
import { Request } from "../../domain/model/request.entity.js";

const route = useRoute();
const router = useRouter();
const store = useOrderingStore();
const { errors, requestsLoaded } = toRefs(store);
const { addRequest, updateRequest, fetchRequests, getRequestById } = store;
const { t, locale } = useI18n();

const sidebarCollapsed = ref(false);
const ordersExpanded = ref(true);

const isEdit = computed(() => !!route.params.id);

const fuelTypeOptions = [
  { label: 'Gasoline 84',   value: 'GASOLINE_84' },
  { label: 'Gasoline 90',   value: 'GASOLINE_90' },
  { label: 'Gasoline 95',   value: 'GASOLINE_95' },
  { label: 'Gasoline 97',   value: 'GASOLINE_97' },
  { label: 'Diesel B5',     value: 'DIESEL_B5' },
  { label: 'GLP',           value: 'GLP' }
];

const unitOptions = [
  { label: 'Gallons', value: 'GALLONS' },
  { label: 'Liters',  value: 'LITERS' }
];

const form = ref({
  fuelType: '',
  quantity: 0,
  unit: 'GALLONS',
  deliveryAddress: '',
  deliveryDate: ''
});

onMounted(() => {
  if (isEdit.value) {
    if (!requestsLoaded.value) {
      fetchRequests();
      setTimeout(loadRequestIntoForm, 300);
    } else {
      loadRequestIntoForm();
    }
  }
});

const loadRequestIntoForm = () => {
  const request = getRequestById(route.params.id);
  if (request) {
    form.value.fuelType = request.fuelType;
    form.value.quantity = request.quantity;
    form.value.unit = request.unit;
    form.value.deliveryAddress = request.deliveryAddress;
    form.value.deliveryDate = request.deliveryDate;
  }
};

const navigateBack = () => router.push({ name: 'ordering-client-requests' });

const saveRequest = () => {
  const request = new Request({
    id: isEdit.value ? route.params.id : null,
    clientId: 101, // TODO: Get from auth context
    providerId: 201, // TODO: Get from selected provider
    fuelType: form.value.fuelType,
    quantity: Number(form.value.quantity),
    unit: form.value.unit,
    deliveryAddress: form.value.deliveryAddress,
    deliveryDate: form.value.deliveryDate,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });
  if (isEdit.value) updateRequest(request);
  else addRequest(request);
  navigateBack();
};
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
              <router-link to="/ordering/pending" class="sub-item">Pending Requests</router-link>
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
        <div class="page-header">
          <h1 class="page-title">{{ isEdit ? 'Edit Request' : 'Create Fuel Request' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update your fuel delivery request' : 'Request fuel delivery for your business' }}</p>
        </div>

        <div v-if="errors.length" class="error-banner">
          <i class="pi pi-exclamation-circle"/>
          <span>{{ t('errors.fetch') }}: {{ errors[0]?.message || 'Unknown Error' }}</span>
        </div>

        <form class="form-card" @submit.prevent="saveRequest">
          <!-- Fuel Type -->
          <div class="field-group">
            <div class="field-icon"><i class="pi pi-bolt"/></div>
            <div class="field-content">
              <label>Fuel Type<span class="req">*</span></label>
              <select v-model="form.fuelType" class="select-input" required>
                <option value="" disabled>Select fuel type</option>
                <option v-for="opt in fuelTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Quantity + Unit -->
          <div class="field-row">
            <div class="field-group field-group-half">
              <div class="field-icon"><i class="pi pi-database"/></div>
              <div class="field-content">
                <label>Quantity<span class="req">*</span></label>
                <input
                    v-model.number="form.quantity"
                    type="number"
                    min="1"
                    class="text-input"
                    required
                />
              </div>
            </div>
            <div class="field-group field-group-half">
              <div class="field-icon"><i class="pi pi-list"/></div>
              <div class="field-content">
                <label>Unit<span class="req">*</span></label>
                <select v-model="form.unit" class="select-input" required>
                  <option v-for="opt in unitOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Delivery Address -->
          <div class="field-group">
            <div class="field-icon"><i class="pi pi-map-marker"/></div>
            <div class="field-content">
              <label>Delivery Address<span class="req">*</span></label>
              <input v-model="form.deliveryAddress" type="text" class="text-input" required/>
            </div>
          </div>

          <!-- Delivery Date -->
          <div class="field-group">
            <div class="field-icon"><i class="pi pi-calendar"/></div>
            <div class="field-content">
              <label>Delivery Date<span class="req">*</span></label>
              <input v-model="form.deliveryDate" type="date" class="text-input" required/>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="navigateBack">Cancel</button>
            <button type="submit" class="btn-primary">
              <i class="pi pi-save"/>
              <span>{{ isEdit ? 'Update Request' : 'Submit Request' }}</span>
            </button>
          </div>
        </form>
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
.topbar {
  height: 64px; background: #ffffff;
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

.main-area { flex: 1; padding: 2rem 2.5rem; }
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }
.page-subtitle { color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0 0; }

.error-banner {
  background: #FEE2E2; border: 1px solid #FCA5A5;
  color: #B91C1C; padding: 1rem 1.25rem;
  border-radius: 8px;
  display: flex; align-items: center; gap: 0.75rem;
  margin-bottom: 1.25rem; font-size: 0.95rem;
}

.form-card {
  background: #ffffff; border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; gap: 1.25rem;
}
.field-group {
  display: flex; align-items: stretch; gap: 0.5rem;
  border: 1px solid #D1D5DB; border-radius: 8px;
  padding: 0.5rem 1rem;
  transition: border-color 0.2s; background: #ffffff;
}
.field-group:focus-within { border-color: #1E3A8A; }
.field-icon {
  display: flex; align-items: center;
  color: #6B7280; font-size: 1.1rem;
  padding-right: 0.5rem;
}
.field-content {
  display: flex; flex-direction: column;
  flex: 1; padding: 0.25rem 0;
}
.field-content label {
  font-size: 0.78rem; color: #6B7280;
  font-weight: 500; margin-bottom: 0.15rem;
}
.req { color: #DC2626; margin-left: 2px; }
.text-input, .select-input {
  border: none; outline: none;
  padding: 0.25rem 0;
  font-size: 0.95rem; font-family: inherit;
  color: #1f2937; width: 100%; background: transparent;
}
.select-input { cursor: pointer; }
.field-row { display: flex; gap: 1rem; }
.field-group-half { flex: 1; }

.form-actions {
  display: flex; justify-content: flex-end;
  gap: 0.75rem; margin-top: 1rem;
}
.btn-secondary {
  background: #ffffff; color: #475569;
  border: 1px solid #D1D5DB;
  padding: 0.6rem 1.5rem; border-radius: 8px;
  font-weight: 600; cursor: pointer; font-size: 0.9rem;
}
.btn-secondary:hover { background: #F3F4F6; }
.btn-primary {
  background: #1E3A8A; color: #ffffff;
  border: none; padding: 0.6rem 1.5rem;
  border-radius: 8px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;
}
.btn-primary:hover { background: #1E40AF; }
</style>