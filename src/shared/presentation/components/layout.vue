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
  <!-- Shell delegado a cada vista BC que maneja su propio layout -->
  <!-- Cuando IAM sea implementado, restaurar el toolbar y sidebar aquí -->
  <router-view/>
</template>