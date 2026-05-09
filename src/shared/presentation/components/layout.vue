<script setup>
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";
import { useI18n } from "vue-i18n";
// import AuthenticationSection from "../../../iam/presentation/components/authentication-section.vue";

const { t } = useI18n();
</script>

<template>
  <pv-toast/>
  <pv-confirm-dialog/>
  <div class="header">
    <pv-toolbar>
      <template #start>
        <div class="brand">
          <img src="/fulltank-logo.png" alt="FullTank Logo" class="brand-logo"/>
          <span class="brand-name">FullTank</span>
        </div>
      </template>
      <template #end>
        <!-- <authentication-section/> -->
        <language-switcher/>
      </template>
    </pv-toolbar>
  </div>
  <div class="main-content">
    <router-view/>
  </div>
  <div class="footer">
  </div>
</template>

<style scoped>
.header {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.brand-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1A73E8;  /* azul del documento */
}

.main-content {
  margin-top: 60px;
}

.footer {
  position: relative;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
}
</style>