// Lazy-loaded components
const supplierDashboard = () => import('./views/supplier-dashboard.vue');
const clientPortfolio = () => import('./views/client-portfolio.vue');

/**
 * Reporting presentation routes mounted under `/reporting`.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const reportingRoutes = [
    { path: 'supplier', name: 'reporting-supplier', component: supplierDashboard, meta: { title: 'Main Reports' } },
    { path: 'portfolio', name: 'reporting-portfolio', component: clientPortfolio, meta: { title: "Your Client's Analytics" } }
];

export default reportingRoutes;