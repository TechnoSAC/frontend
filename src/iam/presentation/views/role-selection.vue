<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../application/iam.store.js';
import pinia from '../../../pinia.js';

const router = useRouter();
const { t } = useI18n();
const iamStore = useIamStore(pinia);

const selectedSegment = ref(null);          // 'BUYER' | 'PROVIDER'
const selectedBuyerId = ref(null);
const selectedProviderId = ref(null);

onMounted(async () => {
  await iamStore.fetchDirectories();
  selectedBuyerId.value = iamStore.buyerCompanies[0]?.id ?? null;
  selectedProviderId.value = iamStore.providerCompanies[0]?.id ?? null;
});

const canContinue = computed(() => {
  if (selectedSegment.value === 'BUYER') return !!selectedBuyerId.value;
  if (selectedSegment.value === 'PROVIDER') return !!selectedProviderId.value;
  return false;
});

function pick(segment) {
  selectedSegment.value = segment;
}

function enter() {
  if (selectedSegment.value === 'BUYER') {
    const company = iamStore.buyerCompanies.find(c => c.id === selectedBuyerId.value);
    iamStore.selectBuyer(company);
  } else {
    const provider = iamStore.providerCompanies.find(p => p.id === selectedProviderId.value);
    iamStore.selectProvider(provider);
  }
  router.push('/dashboard');
}
</script>

<template>
  <div class="iam-screen">
    <div class="iam-card">
      <div class="iam-brand">
        <img src="/fulltank-logo.png" alt="FullTank" class="iam-logo"/>
        <div>
          <h1 class="iam-title">FullTank</h1>
          <p class="iam-subtitle">{{ t('iam.subtitle') }}</p>
        </div>
      </div>

      <p class="iam-prompt">{{ t('iam.prompt') }}</p>

      <div class="segments">
        <!-- Buyer -->
        <button
            class="segment"
            :class="{ active: selectedSegment === 'BUYER' }"
            @click="pick('BUYER')"
        >
          <div class="segment-icon buyer"><i class="pi pi-building"/></div>
          <h3>{{ t('iam.buyer-title') }}</h3>
          <p>{{ t('iam.buyer-desc') }}</p>
        </button>

        <!-- Provider -->
        <button
            class="segment"
            :class="{ active: selectedSegment === 'PROVIDER' }"
            @click="pick('PROVIDER')"
        >
          <div class="segment-icon provider"><i class="pi pi-truck"/></div>
          <h3>{{ t('iam.provider-title') }}</h3>
          <p>{{ t('iam.provider-desc') }}</p>
        </button>
      </div>

      <!-- Company picker (simulated identity) -->
      <transition name="fade">
        <div v-if="selectedSegment" class="company-picker">
          <label class="company-label">{{ t('iam.select-company') }}</label>
          <pv-select
              v-if="selectedSegment === 'BUYER'"
              v-model="selectedBuyerId"
              :options="iamStore.buyerCompanies"
              option-label="name"
              option-value="id"
              :placeholder="t('iam.select-company')"
              class="company-select"
          />
          <pv-select
              v-else
              v-model="selectedProviderId"
              :options="iamStore.providerCompanies"
              option-label="name"
              option-value="id"
              :placeholder="t('iam.select-company')"
              class="company-select"
          />
        </div>
      </transition>

      <pv-button
          :label="t('iam.continue')"
          icon="pi pi-arrow-right"
          icon-pos="right"
          class="iam-continue"
          :disabled="!canContinue"
          @click="enter"
      />

      <p class="iam-note">{{ t('iam.simulation-note') }}</p>
    </div>
  </div>
</template>

<style scoped>
.iam-screen {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  padding: 2rem; font-family: 'Inter', sans-serif;
}
.iam-card {
  background: #fff; border-radius: 18px; padding: 2.5rem;
  width: 100%; max-width: 640px; box-shadow: 0 20px 50px rgba(0,0,0,.25);
}
.iam-brand { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.iam-logo { height: 52px; object-fit: contain; }
.iam-title { font-size: 1.8rem; font-weight: 800; color: #1e3a8a; margin: 0; }
.iam-subtitle { font-size: .9rem; color: #64748b; margin: 2px 0 0; }
.iam-prompt { font-size: 1.05rem; font-weight: 600; color: #1a2744; margin: 0 0 1.25rem; }

.segments { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.segment {
  border: 2px solid #e5e7eb; border-radius: 14px; background: #fff;
  padding: 1.5rem 1.25rem; cursor: pointer; text-align: left;
  transition: all .18s; display: flex; flex-direction: column; gap: .35rem;
}
.segment:hover { border-color: #93c5fd; transform: translateY(-2px); }
.segment.active { border-color: #2563eb; background: #eff6ff; box-shadow: 0 6px 18px rgba(37,99,235,.18); }
.segment h3 { margin: .4rem 0 0; font-size: 1.05rem; color: #1a2744; }
.segment p { margin: 0; font-size: .82rem; color: #64748b; line-height: 1.35; }
.segment-icon {
  width: 46px; height: 46px; border-radius: 12px; display: flex;
  align-items: center; justify-content: center; font-size: 1.3rem;
}
.segment-icon.buyer { background: #e8f0fd; color: #2563eb; }
.segment-icon.provider { background: #e6f7f1; color: #059669; }

.company-picker { margin-top: 1.5rem; display: flex; flex-direction: column; gap: .4rem; }
.company-label { font-size: .8rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .4px; }
.company-select { width: 100%; }

.iam-continue { margin-top: 1.5rem; width: 100%; justify-content: center; }
.iam-note { margin-top: 1rem; font-size: .78rem; color: #94a3b8; text-align: center; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s, transform .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 540px) {
  .segments { grid-template-columns: 1fr; }
}
</style>
