<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t, locale } = useI18n();
const route = useRoute();

const sidebarCollapsed = ref(false);

const navItems = [
  {
    key: 'dashboard',
    icon: 'pi pi-home',
    label: 'option.dashboard',
    to: '/dashboard',
    children: []
  },
  {
    key: 'inventory',
    icon: 'pi pi-box',
    label: 'option.inventory',
    children: [
      { label: 'option.product-inventory', to: '/inventory/products' },
      { label: 'option.add-product',       to: '/inventory/products/new' },
    ]
  },
  {
    key: 'ordering',
    icon: 'pi pi-shopping-cart',
    label: 'option.ordering',
    children: [
      { label: 'ordering.pending-requests', to: '/ordering/pending' },
      { label: 'ordering.orders',           to: '/ordering/orders' },
    ]
  },
  {
    key: 'fulfillment',
    icon: 'pi pi-truck',
    label: 'option.fulfillment',
    children: [
      { label: 'fulfillment.dispatch', to: '/fulfillment/dispatch' },
      { label: 'fulfillment.vehicles', to: '/fulfillment/vehicles' },
      { label: 'fulfillment.drivers',  to: '/fulfillment/drivers' },
    ]
  },
  /*{
    key: 'payment',
    icon: 'pi pi-credit-card',
    label: 'option.payment',
    children: [] // pendiente de implementar
  },*/
  {
    key: 'reporting',
    icon: 'pi pi-chart-bar',
    label: 'option.reporting',
    children: [
      { label: 'reporting.supplier-dashboard', to: '/reporting/supplier' },
      { label: 'reporting.client-portfolio', to: '/reporting/portfolio' }
    ] // pendiente de implementar
  },
];

// Expande automáticamente la sección activa según la ruta actual
const expanded = ref(
    navItems.reduce((acc, item) => {
      acc[item.key] = route.path.startsWith(`/${item.key}`);
      return acc;
    }, {})
);

const toggle = (key) => { expanded.value[key] = !expanded.value[key]; };

const isActive = (to) => route.path === to || route.path.startsWith(to + '/');
</script>

<template>
  <div class="shell">
    <!-- TOPBAR -->
    <header class="topbar">
      <div class="topbar-left">
        <button class="icon-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <i class="pi pi-bars"/>
        </button>
        <img src="/fulltank-logo.png" alt="FullTank" class="brand-logo"/>
        <span class="brand-name">FullTank</span>
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
    </header>

    <div class="body">
      <!-- SIDEBAR -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <nav>
          <template v-for="item in navItems" :key="item.key">
            <router-link
                v-if="item.to && !item.children.length"
                :to="item.to"
                class="nav-item"
                :class="{ 'nav-item--active': route.path.startsWith('/' + item.key) }"
                style="text-decoration:none"
            >
              <i :class="item.icon"/>
              <span v-if="!sidebarCollapsed">{{ t(item.label) }}</span>
            </router-link>

            <template v-else>
              <div
                  class="nav-item"
                  :class="{ 'nav-item--active': route.path.startsWith('/' + item.key) }"
                  @click="toggle(item.key)"
              >
                <i :class="item.icon"/>
                <span v-if="!sidebarCollapsed">{{ t(item.label) }}</span>
                <i
                    v-if="item.children.length && !sidebarCollapsed"
                    class="pi chevron"
                    :class="expanded[item.key] ? 'pi-chevron-up' : 'pi-chevron-down'"
                />
              </div>

              <transition name="slide">
                <div v-if="expanded[item.key] && !sidebarCollapsed && item.children.length" class="sub-nav">
                  <router-link
                      v-for="child in item.children"
                      :key="child.to"
                      :to="child.to"
                      class="sub-item"
                      :class="{ 'sub-item--active': isActive(child.to) }"
                  >
                    {{ t(child.label) }}
                  </router-link>
                </div>
              </transition>
            </template>
          </template>
        </nav>
      </aside>

      <!-- CONTENIDO -->
      <main class="main">
        <router-view/>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell { display: flex; flex-direction: column; min-height: 100vh; background: #F5F6F8; font-family: 'Inter', sans-serif; }

/* TOPBAR */
.topbar {
  height: 64px; background: #fff; border-bottom: 1px solid #E5E7EB;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1.5rem; position: sticky; top: 0; z-index: 50;
}
.topbar-left { display: flex; align-items: center; gap: .75rem; }
.brand-logo  { height: 36px; object-fit: contain; }
.brand-name  { font-size: 1.1rem; font-weight: 700; color: #1E3A8A; letter-spacing: -0.3px; }
.topbar-right { display: flex; align-items: center; gap: 1rem; }
.lang-switch { display: flex; background: #EFF2F7; border-radius: 999px; padding: 4px; }
.lang-btn {
  border: none; background: transparent; padding: 6px 14px; border-radius: 999px;
  cursor: pointer; font-weight: 600; font-size: .85rem; color: #475569;
  display: flex; align-items: center; gap: 6px;
}
.lang-btn.active { background: #fff; color: #1E3A8A; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.icon-btn {
  border: none; background: transparent; width: 36px; height: 36px;
  border-radius: 50%; cursor: pointer; color: #475569;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
}
.icon-btn:hover { background: #F3F4F6; }

/* BODY */
.body { display: flex; flex: 1; }

/* SIDEBAR */
.sidebar {
  width: 240px; min-height: calc(100vh - 64px);
  background: #fff; border-right: 1px solid #E5E7EB;
  padding: 1rem 0; transition: width .2s; overflow: hidden;
  position: sticky; top: 64px; align-self: flex-start; height: calc(100vh - 64px);
}
.sidebar.collapsed { width: 56px; }

.nav-item {
  display: flex; align-items: center; gap: .75rem;
  padding: .75rem 1.25rem; cursor: pointer;
  color: #374151; font-weight: 500; font-size: .95rem;
  transition: background .15s;
}
.nav-item:hover { background: #F8F9FB; }
.nav-item--active { color: #1E3A8A; font-weight: 600; }
.nav-item .chevron { margin-left: auto; font-size: .75rem; color: #94A3B8; }

.sub-nav {
  display: flex; flex-direction: column;
  margin-left: 1rem; padding-left: 1.25rem;
  border-left: 2px solid #E5E7EB;
}
.sub-item {
  padding: .5rem .75rem; color: #6B7280; font-size: .9rem;
  text-decoration: none; border-radius: 6px; margin: 2px 0;
  transition: background .15s, color .15s;
}
.sub-item:hover { color: #1E3A8A; background: #F8F9FB; }
.sub-item--active { color: #F59E0B; font-weight: 600; background: #FEF3C7; }

/* MAIN */
.main { flex: 1; padding: 2rem 2.5rem; overflow-y: auto; }

/* Animación sub-nav */
.slide-enter-active, .slide-leave-active { transition: all .2s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 200px; opacity: 1; }
</style>