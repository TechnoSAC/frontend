<script setup>
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
// To import when IAM is implemented
// import { useIamStore } from "../../../iam/application/iam.store.js";
// import AuthenticationSection from "../../../iam/presentation/components/authentication-section.vue";

const { t } = useI18n();

// To enable when IAM is implemented:
// const iamStore = useIamStore();
// const role = computed(() => iamStore.currentRole);

const drawer = ref(false);
const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

// Public nav items (shown before login / on landing)
const publicItems = [
  { label: 'option.home', to: '/home' },
];

// To enable when IAM is implemented — replace publicItems with role-based items:
// const clientItems = [
//   { label: 'option.dashboard',      to: '/client/dashboard' },
//   { label: 'option.orders',         to: '/client/orders' },
//   { label: 'option.notifications',  to: '/client/notifications' },
//   { label: 'option.reports',        to: '/client/reports' },
// ];
// const providerItems = [
//   { label: 'option.dashboard',      to: '/provider/dashboard' },
//   { label: 'option.orders',         to: '/provider/orders' },
//   { label: 'option.inventory',      to: '/provider/inventory' },
//   { label: 'option.fleet',          to: '/provider/fleet' },
//   { label: 'option.drivers',        to: '/provider/drivers' },
//   { label: 'option.reports',        to: '/provider/reports' },
// ];
// const items = computed(() => {
//   if (role.value === 'client')   return clientItems;
//   if (role.value === 'provider') return providerItems;
//   return publicItems;
// });

const items = publicItems;
</script>

<template>
  <pv-toast/>
  <pv-confirm-dialog/>
  <div class="header">
    <pv-toolbar class="bg-primary">
      <template #start>
        <pv-button class="p-button-text" icon="pi pi-bars" @click="toggleDrawer"/>
        <h3>FullTank</h3>
      </template>
      <template #center>
      </template>
      <template #end>
        <div class="flex-column mr-3">
          <pv-button v-for="item in items" :key="item.label" as-child v-slot="slotProps">
            <router-link :to="item.to" :class="slotProps['class']">{{ t(item.label) }}</router-link>
          </pv-button>
        </div>
        <!-- To add when IAM is implemented -->
        <!-- <authentication-section/> -->
        <language-switcher/>
      </template>
    </pv-toolbar>
    <pv-drawer v-model:visible="drawer"/>
  </div>
  <div class="main-content">
    <router-view/>
  </div>
  <div class="footer">
  </div>
</template>

<style scoped>
.header {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}

.main-content {
  margin-top: 60px;
}

.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
}
</style>