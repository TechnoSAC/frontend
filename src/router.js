import { createRouter, createWebHistory } from "vue-router";
import Home from "./shared/presentation/views/home.vue";
import inventoryRoutes from "./inventory/presentation/inventory-routes.js";
import { RouterView } from 'vue-router';
import orderingRoutes from "./ordering/presentation/ordering-routes.js";
import fulfillmentRoutes from "./fulfillment/presentation/fulfillment-routes.js";
import reportingRoutes from "./reporting/presentation/reporting-routes.js";
// To import when IAM is implemented
// import iamRoutes from "./iam/presentation/iam-routes.js";

// Lazy-loaded routes
const about = () => import('./shared/presentation/views/about.vue');
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

// Lazy-loaded BC routes (uncomment as each BC is implemented)
// const inventoryRoutes = () => import('./inventory/presentation/inventory-routes.js');
// const orderingRoutes     = () => import('./ordering/presentation/ordering-routes.js');
// const fulfillmentRoutes  = () => import('./fulfillment/presentation/fulfillment-routes.js');
// const paymentRoutes      = () => import('./payment/presentation/payment-routes.js');
// const notificationRoutes = () => import('./notification/presentation/notification-routes.js');
// const reportingRoutes    = () => import('./reporting/presentation/reporting-routes.js');

/*
// Full routes when all BCs + IAM are implemented
const routes = [
    { path: '/home',          name: 'home',         component: Home,   meta: { title: 'Home' } },
    { path: '/about',         name: 'about',        component: about,  meta: { title: 'About' } },
    { path: '/iam',           name: 'iam',          children: iamRoutes },
    { path: '/inventory',       name: 'inventory',      children: inventoryRoutes },
    { path: '/ordering',      name: 'ordering',     children: orderingRoutes },
    { path: '/fulfillment',   name: 'fulfillment',  children: fulfillmentRoutes },
    { path: '/payment',       name: 'payment',      children: paymentRoutes },
    { path: '/notification',  name: 'notification', children: notificationRoutes },
    { path: '/reporting',     name: 'reporting',    children: reportingRoutes },
    { path: '/',              redirect: '/home' },
    { path: '/:pathMatch(.*)*', name: 'not-found',  component: pageNotFound, meta: { title: 'Page Not Found' } }
];
*/

// Routes version without IAM and BCs not yet implemented
const routes = [
    { path: '/home', name: 'home', component: Home, meta: { title: 'Home' } },
    { path: '/about', name: 'about', component: about, meta: { title: 'About' } },
    { path: '/', redirect: '/home' },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: { title: 'Page Not Found' } },
    { path: '/inventory', component: RouterView, children: inventoryRoutes },
    { path: '/ordering', children: orderingRoutes },
    { path: '/fulfillment', children: fulfillmentRoutes },
    {
        path: '/reporting',
        children: reportingRoutes
    }
];



const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

/**
 * Global navigation guard that updates the document title and delegates auth when enabled.
 *
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {import('vue-router').RouteLocationNormalized} from
 * @param {import('vue-router').NavigationGuardNext} next
 */
router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    let baseTitle = 'FullTank';
    document.title = `${baseTitle} - ${to.meta['title']}`;
    // When IAM is implemented, use:
    // return authenticationGuard(to, from, next);
    return next();
});

export default router;