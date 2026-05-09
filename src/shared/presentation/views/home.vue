<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <div class="hero-section">
    <div class="hero-text">
      <h1>{{ t('home.title') }}</h1>
      <p>{{ t('home.subtitle') }}</p>
    </div>
    <div class="hero-image">
      <img src="/home-hero.png" alt="FullTank Hero"/>
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 60px;
  min-height: 80vh;
  gap: 40px;
  background-color: #f5f5f5;
}
.hero-text {
  flex: 1;
}

.hero-text h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.hero-text p {
  font-size: 1.1rem;
  color: #555;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.hero-image img {
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
</style>