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
const { t } = useI18n();

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

const navigateBack = () => router.push({ name: 'ordering-orders' });

const saveRequest = () => {
  const request = new Request({
    id: isEdit.value ? route.params.id : null,
    clientId: 101,
    providerId: 201,
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
  <div>
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? 'Edit Request' : 'Create Fuel Request' }}</h1>
      <p class="page-subtitle">{{ isEdit ? 'Update your fuel delivery request' : 'Request fuel delivery for your business' }}</p>
    </div>

    <pv-message v-if="errors.length" severity="error" class="error-banner">
      {{ t('errors.fetch') }}: {{ errors[0]?.message || 'Unknown Error' }}
    </pv-message>

    <pv-card class="form-card">
      <template #content>
        <form class="form-content" @submit.prevent="saveRequest">
          <div class="field-group">
            <div class="field-icon"><i class="pi pi-bolt"/></div>
            <div class="field-content">
              <label>Fuel Type<span class="req">*</span></label>
              <pv-select
                  v-model="form.fuelType"
                  :options="fuelTypeOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select fuel type"
                  class="select-input"
                  required
              />
            </div>
          </div>

          <div class="field-row">
            <div class="field-group field-group-half">
              <div class="field-icon"><i class="pi pi-database"/></div>
              <div class="field-content">
                <label>Quantity<span class="req">*</span></label>
                <pv-input-number v-model="form.quantity" :min="1" class="text-input" input-class="text-input-native" required/>
              </div>
            </div>
            <div class="field-group field-group-half">
              <div class="field-icon"><i class="pi pi-list"/></div>
              <div class="field-content">
                <label>Unit<span class="req">*</span></label>
                <pv-select v-model="form.unit" :options="unitOptions" option-label="label" option-value="value" class="select-input" required/>
              </div>
            </div>
          </div>

          <div class="field-group">
            <div class="field-icon"><i class="pi pi-map-marker"/></div>
            <div class="field-content">
              <label>Delivery Address<span class="req">*</span></label>
              <pv-input-text v-model="form.deliveryAddress" class="text-input" required/>
            </div>
          </div>

          <div class="field-group">
            <div class="field-icon"><i class="pi pi-calendar"/></div>
            <div class="field-content">
              <label>Delivery Date<span class="req">*</span></label>
              <pv-input-text v-model="form.deliveryDate" type="date" class="text-input" required/>
            </div>
          </div>

          <div class="form-actions">
            <pv-button type="button" label="Cancel" outlined class="btn-secondary" @click="navigateBack" />
            <pv-button type="submit" :label="isEdit ? 'Update Request' : 'Submit Request'" icon="pi pi-save" class="btn-primary" />
          </div>
        </form>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.75rem; font-weight: 700; color: #1E3A8A; margin: 0; }
.page-subtitle { color: #6B7280; font-size: 0.9rem; margin: 0.25rem 0 0 0; }
.error-banner { margin-bottom: 1.25rem; }

.form-card { border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.form-card :deep(.p-card-body) { padding: 2rem; }
.form-card :deep(.p-card-content) { padding: 0; }
.form-content { display: flex; flex-direction: column; gap: 1.25rem; }

.field-group {
  display: flex; align-items: stretch; gap: 0.5rem;
  border: 1px solid #D1D5DB; border-radius: 8px;
  padding: 0.5rem 1rem; transition: border-color 0.2s; background: #ffffff;
}
.field-group:focus-within { border-color: #1E3A8A; }
.field-icon { display: flex; align-items: center; color: #6B7280; font-size: 1.1rem; padding-right: 0.5rem; }
.field-content { display: flex; flex-direction: column; flex: 1; padding: 0.25rem 0; }
.field-content label { font-size: 0.78rem; color: #6B7280; font-weight: 500; margin-bottom: 0.15rem; }
.req { color: #DC2626; margin-left: 2px; }

.text-input, .select-input,
.text-input :deep(.p-inputtext),
.select-input :deep(.p-select-label),
.text-input-native {
  border: none; outline: none; padding: 0.25rem 0;
  font-size: 0.95rem; font-family: inherit;
  color: #1f2937; width: 100%; background: transparent; box-shadow: none;
}
.text-input :deep(.p-inputnumber-input) { border: none; padding: 0.25rem 0; background: transparent; box-shadow: none; }
.select-input { cursor: pointer; width: 100%; border: none; background: transparent; box-shadow: none; }
.select-input :deep(.p-select-dropdown) { color: #6B7280; }
.field-row { display: flex; gap: 1rem; }
.field-group-half { flex: 1; }

.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
.btn-secondary {
  background: #ffffff; color: #475569; border: 1px solid #D1D5DB;
  padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem;
}
.btn-secondary:hover { background: #F3F4F6; }
.btn-primary {
  background: #1E3A8A; color: #ffffff; border: none;
  padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;
}
.btn-primary:hover { background: #1E40AF; }
</style>