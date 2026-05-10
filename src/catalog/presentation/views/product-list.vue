<script setup>
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { onMounted, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import useCatalogStore from "../../application/catalog.store.js";

const router = useRouter();
const confirm = useConfirm();
const store = useCatalogStore();
const { products, errors, productsLoaded, loading } = toRefs(store);
const { fetchProducts, deleteProduct, clearErrors } = store;
const { t, locale } = useI18n();

const sidebarCollapsed = ref(false);
const catalogExpanded = ref(true);

const navigateToNew = () => router.push({ name: 'catalog-product-new' });
const navigateToEdit = (id) => router.push({ name: 'catalog-product-edit', params: { id } });

const onRefresh = () => {
  clearErrors();
  fetchProducts();
};

const confirmDelete = (product) => {
  confirm.require({
    message: `Are you sure you want to delete ${product.name}?`,
    header: 'Delete Product',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteProduct(product)
  });
};

const formatFuelType = (type) => {
  if (!type) return '';
  return type.replace(/_/g, ' ');
};

onMounted(() => {
  if (!productsLoaded.value) fetchProducts();
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
          <div class="side-group">
            <a class="side-item active-group" @click="catalogExpanded = !catalogExpanded">
              <i class="pi pi-box"/><span>{{ t('option.catalog') }}</span>
              <i class="pi pi-chevron-up chevron" :class="{ 'rotated': !catalogExpanded }"/>
            </a>
            <div v-if="catalogExpanded" class="sub-nav">
              <router-link to="/catalog/products" class="sub-item active-sub">{{ t('option.product-inventory') }}</router-link>
              <router-link to="/catalog/products/new" class="sub-item">{{ t('option.add-product') }}</router-link>
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

      <!-- MAIN CONTENT -->
      <main class="main-area">
        <div class="page-header">
          <div class="page-title-group">
            <h1 class="page-title">{{ t('catalog.product-list.title') }}</h1>
            <p class="page-subtitle">{{ t('catalog.product-list.subtitle') }}</p>
          </div>
          <div class="page-actions">
            <button class="refresh-btn" @click="onRefresh" :disabled="loading">
              <i class="pi pi-refresh" :class="{ 'spinning': loading }"/>
            </button>
            <button class="add-btn" @click="navigateToNew">
              <i class="pi pi-plus"/><span>{{ t('option.add-product') }}</span>
            </button>
          </div>
        </div>

        <div v-if="errors.length" class="error-banner">
          <i class="pi pi-exclamation-circle"/>
          <span>{{ t('errors.fetch') }}: {{ errors[0]?.message || 'Unknown Error' }}</span>
        </div>

        <div class="table-card">
          <table class="products-table">
            <thead>
            <tr>
              <th>{{ t('catalog.product-list.col-name') }}</th>
              <th>{{ t('catalog.product-list.col-fuel') }}</th>
              <th>{{ t('catalog.product-list.col-price') }}</th>
              <th>{{ t('catalog.product-list.col-unit') }}</th>
              <th>{{ t('catalog.product-list.col-desc') }}</th>
              <th class="actions-col"></th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="!loading && products.length === 0">
              <td colspan="6" class="empty-row">{{ t('catalog.product-list.no-products') }}</td>
            </tr>
            <tr v-for="product in products" :key="product.id">
              <td>{{ product.name }}</td>
              <td>{{ formatFuelType(product.type) }}</td>
              <td>S/ {{ Number(product.pricePerLiter).toFixed(2) }}</td>
              <td>{{ product.unit }}</td>
              <td class="desc-col">{{ product.description }}</td>
              <td class="actions-col">
                <button class="row-btn" @click="navigateToEdit(product.id)">
                  <i class="pi pi-pencil"/>
                </button>
                <button class="row-btn row-btn-danger" @click="confirmDelete(product)">
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
.products-table { width: 100%; border-collapse: collapse; }
.products-table th {
  text-align: left; font-weight: 600;
  color: #1E3A8A; font-size: 0.95rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #E5E7EB;
}
.products-table td {
  padding: 1rem 0.5rem; color: #1f2937; font-size: 0.92rem;
  border-bottom: 1px solid #F3F4F6;
}
.empty-row { text-align: center; color: #9CA3AF; padding: 3rem 0 !important; }
.desc-col { color: #6B7280; }
.actions-col { width: 100px; text-align: right; }
.row-btn {
  border: none; background: transparent;
  width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; color: #475569; margin-left: 4px;
}
.row-btn:hover { background: #F3F4F6; color: #1E3A8A; }
.row-btn-danger:hover { color: #DC2626; background: #FEE2E2; }
</style>