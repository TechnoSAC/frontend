// Lazy-loaded components
const clientRequestList = () => import('./views/client-request-list.vue');
const requestForm = () => import('./views/request-form.vue');
const providerRequestList = () => import('./views/provider-request-list.vue');

/**
 * Ordering presentation routes mounted under `/ordering`.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const orderingRoutes = [
    { path: 'requests',          name: 'ordering-client-requests',    component: clientRequestList,   meta: { title: 'My Requests' } },
    { path: 'requests/new',      name: 'ordering-request-new',        component: requestForm,         meta: { title: 'New Request' } },
    { path: 'requests/:id/edit', name: 'ordering-request-edit',       component: requestForm,         meta: { title: 'Edit Request' } },
    { path: 'pending',           name: 'ordering-provider-pending',   component: providerRequestList, meta: { title: 'Pending Requests' } }
];

export default orderingRoutes;