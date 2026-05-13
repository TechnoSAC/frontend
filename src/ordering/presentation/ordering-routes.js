const requestForm         = () => import('./views/request-form.vue');
const providerRequestList = () => import('./views/provider-request-list.vue');
const orderList           = () => import('./views/order-list.vue');
const orderDetail         = () => import('./views/order-detail.vue');

/**
 * Ordering presentation routes mounted under `/ordering`.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const orderingRoutes = [
    { path: 'pending',           name: 'ordering-provider-pending', component: providerRequestList, meta: { title: 'Pending Requests' } },
    { path: 'orders',            name: 'ordering-orders',           component: orderList,           meta: { title: 'Orders' } },
    { path: 'orders/:id',        name: 'ordering-order-detail',     component: orderDetail,         meta: { title: 'Order Detail' } },
];

export default orderingRoutes;
