// Lazy-loaded components
const supplierDashboard = () => import('./views/supplier-dashboard.vue');
const clientPortfolio = () => import('./views/client-portfolio.vue');

/**
 * Reporting presentation routes mounted under `/reporting`.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const reportingRoutes = [
    { path: 'supplier', name: 'reporting-supplier', component: supplierDashboard, meta: { title: 'Supplier Dashboard' } },
    { path: 'portfolio', name: 'reporting-portfolio', component: clientPortfolio, meta: { title: 'Client Portfolio' } }
];

export default reportingRoutes;