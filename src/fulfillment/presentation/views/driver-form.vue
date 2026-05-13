<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import useFulfillmentStore from "../../application/fulfillment.store.js";
import { Driver } from "../../domain/model/driver.entity.js";

const route = useRoute();
const router = useRouter();
const store = useFulfillmentStore();
const { errors, driversLoaded } = toRefs(store);
const { addDriver, updateDriver, fetchDrivers, getDriverById } = store;
const { t, locale } = useI18n();

const sidebarCollapsed = ref(false);
const fulfillmentExpanded = ref(true);

const isEdit = computed(() => !!route.params.id);

const statusOptions = [
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Assigned', value: 'ASSIGNED' }
];

const form = ref({
  name: '',
  licenseNumber: '',
  phone: '',
  email: '',
  status: 'AVAILABLE'
});

onMounted(() => {
  if (isEdit.value) {
    if (!driversLoaded.value) {
      fetchDrivers();
      setTimeout(loadDriverIntoForm, 300);
    } else {
      loadDriverIntoForm();
    }
  }
});

const loadDriverIntoForm = () => {
  const driver = getDriverById(route.params.id);
  if (driver) {
    form.value.name = driver.name;
    form.value.licenseNumber = driver.licenseNumber;
    form.value.phone = driver.phone;
    form.value.email = driver.email;
    form.value.status = driver.status;
  }
};

const navigateBack = () => router.push({ name: 'fulfillment-drivers' });

const saveDriver = () => {
  const driver = new Driver({
    id: isEdit.value ? route.params.id : null,
    name: form.value.name,
    licenseNumber: form.value.licenseNumber,
    phone: form.value.phone,
    email: form.value.email,
    status: form.value.status
  });
  if (isEdit.value) updateDriver(driver);
  else addDriver(driver);
  navigateBack();
};
</script>

<template>
  <div class="layout-wrapper">
    <!-- TOP NAVBAR -->
    <div class="topbar">
      <div class="topbar-left">
        <pv-button icon="pi pi-bars" text rounded class="icon-btn" @click="sidebarCollapsed = !sidebarCollapsed" />
        <div class="brand">
          <img src="/fulltank-logo.png" alt="FullTank" class="brand-logo-img"/>
        </div>
      </div>
      <div class="topbar-right">
        <div class="lang-switch">
          <pv-button label="EN" :icon="locale === 'en' ? 'pi pi-check' : undefined" text class="lang-btn" :class="{ active: locale === 'en' }" @click="locale = 'en'" />
          <pv-button label="ES" :icon="locale === 'es' ? 'pi pi-check' : undefined" text class="lang-btn" :class="{ active: locale === 'es' }" @click="locale = 'es'" />
        </div>
        <pv-button icon="pi pi-bell" text rounded class="icon-btn" />
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
          <div class="side-group">
            <a class="side-item active-group" @click="fulfillmentExpanded = !fulfillmentExpanded">
              <i class="pi pi-truck"/><span>{{ t('option.fulfillment') }}</span>
              <i class="pi pi-chevron-up chevron" :class="{ 'rotated': !fulfillmentExpanded }"/>
            </a>
            <div v-if="fulfillmentExpanded" class="sub-nav">
              <router-link to="/fulfillment/vehicles" class="sub-item">Vehicles</router-link>
              <router-link to="/fulfillment/drivers" class="sub-item active-sub">Drivers</router-link>
            </div>
          </div>
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
          <h1 class="page-title">{{ isEdit ? 'Edit Driver' : 'Register New Driver' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update driver information' : 'Add a new authorized driver' }}</p>
        </div>

        <pv-message v-if="errors.length" severity="error" class="error-banner">
          {{ t('errors.fetch') }}: {{ errors[0]?.message || 'Unknown Error' }}
        </pv-message>

        <pv-card class="form-card">
          <template #content>
        <form class="form-content" @submit.prevent="saveDriver">
          <!-- Full Name -->
          <div class="field-group">
            <div class="field-icon"><i class="pi pi-user"/></div>
            <div class="field-content">
              <label>Full Name<span class="req">*</span></label>
              <pv-input-text v-model="form.name" class="text-input" required/>
            </div>
          </div>

          <!-- License Number -->
          <div class="field-group">
            <div class="field-icon"><i class="pi pi-id-card"/></div>
            <div class="field-content">
              <label>License Number<span class="req">*</span></label>
              <pv-input-text v-model="form.licenseNumber" class="text-input" required/>
            </div>
          </div>

          <!-- Phone + Email -->
          <div class="field-row">
            <div class="field-group field-group-half">
              <div class="field-icon"><i class="pi pi-phone"/></div>
              <div class="field-content">
                <label>Phone<span class="req">*</span></label>
                <pv-input-text v-model="form.phone" type="tel" class="text-input" required/>
              </div>
            </div>
            <div class="field-group field-group-half">
              <div class="field-icon"><i class="pi pi-envelope"/></div>
              <div class="field-content">
                <label>Email<span class="req">*</span></label>
                <pv-input-text v-model="form.email" type="email" class="text-input" required/>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="field-group">
            <div class="field-icon"><i class="pi pi-check-circle"/></div>
            <div class="field-content">
              <label>Status<span class="req">*</span></label>
              <pv-select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" class="select-input" required/>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="form-actions">
            <pv-button type="button" label="Cancel" outlined class="btn-secondary" @click="navigateBack" />
            <pv-button type="submit" :label="isEdit ? 'Update Driver' : 'Register Driver'" icon="pi pi-save" class="btn-primary" />
          </div>
        </form>
          </template>
        </pv-card>
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
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.form-card :deep(.p-card-body) {
  padding: 2rem;
}
.form-card :deep(.p-card-content) {
  padding: 0;
}
.form-content {
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
.text-input, .select-input,
.text-input :deep(.p-inputtext),
.select-input :deep(.p-select-label) {
  border: none; outline: none;
  padding: 0.25rem 0;
  font-size: 0.95rem; font-family: inherit;
  color: #1f2937; width: 100%; background: transparent;
  box-shadow: none;
}
.select-input {
  cursor: pointer;
  width: 100%;
  border: none;
  background: transparent;
  box-shadow: none;
}
.select-input :deep(.p-select-dropdown) {
  color: #6B7280;
}
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
