<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import useCatalogStore from "../../application/catalog.store.js";
import { Product } from "../../domain/model/product.entity.js";

const route = useRoute();
const router = useRouter();
const store = useCatalogStore();
const { errors, productsLoaded } = toRefs(store);
const { addProduct, updateProduct, fetchProducts, getProductById } = store;
const { t, locale } = useI18n();

const sidebarCollapsed = ref(false);
const catalogExpanded = ref(true);

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
  name: '',
  type: '',
  description: '',
  pricePerLiter: 0,
  unit: 'GALLONS'
});

onMounted(() => {
  if (isEdit.value) {
    if (!productsLoaded.value) {
      fetchProducts();
      setTimeout(loadProductIntoForm, 300);
    } else {
      loadProductIntoForm();
    }
  }
});

const loadProductIntoForm = () => {
  const product = getProductById(route.params.id);
  if (product) {
    form.value.name = product.name;
    form.value.type = product.type;
    form.value.description = product.description;
    form.value.pricePerLiter = product.pricePerLiter;
    form.value.unit = product.unit;
  }
};

const navigateBack = () => router.push({ name: 'catalog-products' });

const saveProduct = () => {
  const product = new Product({
    id: isEdit.value ? route.params.id : null,
    name: form.value.name,
    type: form.value.type,
    description: form.value.description,
    pricePerLiter: Number(form.value.pricePerLiter),
    unit: form.value.unit
  });
  if (isEdit.value) updateProduct(product);
  else addProduct(product);
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
          <div class="side-group">
            <a class="side-item active-group" @click="catalogExpanded = !catalogExpanded">
              <i class="pi pi-box"/><span>{{ t('option.catalog') }}</span>
              <i class="pi pi-chevron-up chevron" :class="{ 'rotated': !catalogExpanded }"/>
            </a>
            <div v-if="catalogExpanded" class="sub-nav">
              <router-link to="/catalog/products" class="sub-item">{{ t('option.product-inventory') }}</router-link>
              <router-link to="/catalog/products/new" class="sub-item active-sub">{{ t('option.add-product') }}</router-link>
            </div>
          </div>
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
          <a class="side-item">
            <i class="pi pi-chart-bar"/><span>{{ t('option.reporting') }}</span>
            <i class="pi pi-chevron-down chevron"/>
          </a>
        </nav>
      </aside>

      <!-- MAIN -->
      <main class="main-area">
        <div class="page-header">
          <h1 class="page-title">{{ isEdit ? t('catalog.product-form.title-edit') : t('catalog.product-form.title-create') }}</h1>
          <p class="page-subtitle">{{ isEdit ? t('catalog.product-form.subtitle-edit') : t('catalog.product-form.subtitle-create') }}</p>
        </div>

        <div v-if="errors.length" class="error-banner">
          <i class="pi pi-exclamation-circle"/>
          <span>{{ t('errors.fetch') }}: {{ errors[0]?.message || 'Unknown Error' }}</span>
        </div>

        <form class="form-card" @submit.prevent="saveProduct">
          <!-- Product Name -->
          <div class="field-group">
            <div class="field-icon"><i class="pi pi-tag"/></div>
            <div class="field-content">
              <label>{{ t('catalog.product-form.field-name') }}<span class="req">*</span></label>
              <input v-model="form.name" type="text" class="text-input" required/>
            </div>
          </div>

          <!-- Fuel Type -->
          <div class="field-group">
            <div class="field-icon"><i class="pi pi-bolt"/></div>
            <div class="field-content">
              <label>{{ t('catalog.product-form.field-fuel') }}<span class="req">*</span></label>
              <select v-model="form.type" class="select-input" required>
                <option value="" disabled>{{ t('catalog.product-form.select-fuel') }}</option>
                <option v-for="opt in fuelTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div class="field-group field-group-textarea">
            <div class="field-icon"><i class="pi pi-file"/></div>
            <div class="field-content">
              <label>{{ t('catalog.product-form.field-desc') }}<span class="req">*</span></label>
              <textarea v-model="form.description" rows="3" class="textarea-input" required/>
            </div>
          </div>

          <!-- Price + Unit -->
          <div class="field-row">
            <div class="field-group field-group-half">
              <div class="field-icon"><i class="pi pi-money-bill"/></div>
              <div class="field-content">
                <label>{{ t('catalog.product-form.field-price') }}<span class="req">*</span></label>
                <div class="price-input-wrapper">
                  <span class="prefix">S/</span>
                  <input
                      v-model.number="form.pricePerLiter"
                      type="number"
                      step="0.01"
                      min="0"
                      class="text-input price-input"
                      required
                  />
                </div>
              </div>
            </div>
            <div class="field-group field-group-half">
              <div class="field-icon"><i class="pi pi-list"/></div>
              <div class="field-content">
                <label>{{ t('catalog.product-form.field-unit') }}<span class="req">*</span></label>
                <select v-model="form.unit" class="select-input" required>
                  <option v-for="opt in unitOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="navigateBack">{{ t('catalog.product-form.cancel') }}</button>
            <button type="submit" class="btn-primary">
              <i class="pi pi-save"/>
              <span>{{ isEdit ? t('catalog.product-form.update') : t('catalog.product-form.save') }}</span>
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
.text-input, .select-input, .textarea-input {
  border: none; outline: none;
  padding: 0.25rem 0;
  font-size: 0.95rem; font-family: inherit;
  color: #1f2937; width: 100%; background: transparent;
}
.textarea-input { resize: vertical; min-height: 60px; }
.select-input { cursor: pointer; }
.field-row { display: flex; gap: 1rem; }
.field-group-half { flex: 1; }
.price-input-wrapper {
  display: flex; align-items: center;
  gap: 0.5rem; width: 100%;
}
.prefix {
  color: #6B7280; font-size: 0.95rem; font-weight: 500;
}
.price-input { flex: 1; text-align: left; }

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