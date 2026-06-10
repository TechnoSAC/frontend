<script setup>
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { onMounted, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import useInventoryStore from "../../application/inventory.store.js";

const router = useRouter();
const confirm = useConfirm();
const store = useInventoryStore();
const { products, errors, productsLoaded, loading } = toRefs(store);
const { fetchProducts, deleteProduct, clearErrors } = store;
const { t } = useI18n();

const navigateToNew = () => router.push({ name: 'inventory-product-new' });
const navigateToEdit = (id) => router.push({ name: 'inventory-product-edit', params: { id } });

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
  <div>
        <div class="page-header">
          <div class="page-title-group">
            <h1 class="page-title">{{ t('inventory.product-list.title') }}</h1>
            <p class="page-subtitle">{{ t('inventory.product-list.subtitle') }}</p>
          </div>
          <div class="page-actions">
            <pv-button icon="pi pi-refresh" text rounded class="refresh-btn" :loading="loading" @click="onRefresh" />
            <pv-button :label="t('option.add-product')" icon="pi pi-plus" class="add-btn" @click="navigateToNew" />
          </div>
        </div>

        <pv-message v-if="errors.length" severity="error" class="error-banner">
          {{ t('errors.fetch') }}: {{ errors[0]?.message || 'Unknown Error' }}
        </pv-message>

        <pv-card class="table-card">
          <template #content>
            <pv-data-table :value="products" :loading="loading" responsive-layout="scroll" class="products-table">
              <template #empty>
                <div class="empty-row">{{ t('inventory.product-list.no-products') }}</div>
              </template>
              <pv-column field="name" :header="t('inventory.product-list.col-name')" />
              <pv-column field="type" :header="t('inventory.product-list.col-fuel')">
                <template #body="{ data }">
                  {{ formatFuelType(data.type) }}
                </template>
              </pv-column>
              <pv-column field="pricePerLiter" :header="t('inventory.product-list.col-price')">
                <template #body="{ data }">
                  S/ {{ Number(data.pricePerLiter).toFixed(2) }}
                </template>
              </pv-column>
              <pv-column field="unit" :header="t('inventory.product-list.col-unit')" />
              <pv-column field="description" :header="t('inventory.product-list.col-desc')" class="desc-col" />
              <pv-column class="actions-col">
                <template #body="{ data }">
                  <div class="row-actions">
                    <pv-button icon="pi pi-pencil" text rounded class="row-btn" @click="navigateToEdit(data.id)" />
                    <pv-button icon="pi pi-trash" text rounded class="row-btn row-btn-danger" @click="confirmDelete(data)" />
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
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.table-card :deep(.p-card-body) { padding: 1.5rem 2rem; }
.table-card :deep(.p-card-content) { padding: 0; }
.products-table :deep(.p-datatable-table) { width: 100%; border-collapse: collapse; }
.products-table :deep(.p-datatable-thead > tr > th) {
  text-align: left; font-weight: 600;
  color: #1E3A8A; font-size: 0.95rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #E5E7EB;
  background: #ffffff;
}
.products-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 0.5rem; color: #1f2937; font-size: 0.92rem;
  border-bottom: 1px solid #F3F4F6;
}
.empty-row { text-align: center; color: #9CA3AF; padding: 3rem 0 !important; }
.desc-col { color: #6B7280; }
.actions-col { width: 100px; text-align: right; }
.row-actions { display: flex; justify-content: flex-end; gap: 0.25rem; }
.row-btn {
  border: none; background: transparent;
  width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; color: #475569; margin-left: 4px;
}
.row-btn:hover { background: #F3F4F6; color: #1E3A8A; }
.row-btn-danger:hover { color: #DC2626; background: #FEE2E2; }
</style>
