// Lazy-loaded components
const productList = () => import('./views/product-list.vue');
const productForm = () => import('./views/product-form.vue');

/**
 * Catalog presentation routes mounted under `/catalog`.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const catalogRoutes = [
    { path: 'products',          name: 'catalog-products',      component: productList, meta: { title: 'Product Inventory' } },
    { path: 'products/new',      name: 'catalog-product-new',   component: productForm, meta: { title: 'Add Product' } },
    { path: 'products/:id/edit', name: 'catalog-product-edit',  component: productForm, meta: { title: 'Edit Product' } }
];

export default catalogRoutes;