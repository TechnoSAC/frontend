const dashboardView = () => import('./views/dashboard.vue');

/**
 * Route definitions for the Dashboard bounded context.
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const dashboardRoutes = [
    {
        path: '',
        name: 'dashboard',
        component: dashboardView,
        meta: { title: 'Dashboard' }
    }
];

export default dashboardRoutes;