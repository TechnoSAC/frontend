/**
 * Application service store for the `Catalog` bounded context.
 * Coordinates product use cases and exposes UI-facing state.
 *
 * @module useCatalogStore
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { CatalogApi } from "../infrastructure/catalog-api.js";
import { ProductAssembler } from "../infrastructure/product.assembler.js";
import { Product } from "../domain/model/product.entity.js";

const catalogApi = new CatalogApi();

const useCatalogStore = defineStore('catalog', () => {
    /** @type {import('vue').Ref<Product[]>} */
    const products = ref([]);
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} */
    const productsLoaded = ref(false);
    /** @type {import('vue').Ref<boolean>} */
    const loading = ref(false);

    /** @type {import('vue').ComputedRef<number>} */
    const productsCount = computed(() => productsLoaded.value ? products.value.length : 0);

    function fetchProducts() {
        loading.value = true;
        catalogApi.getProducts().then(response => {
            products.value = ProductAssembler.toEntitiesFromResponse(response);
            productsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            loading.value = false;
        });
    }

    function getProductById(id) {
        const idNum = parseInt(id);
        return products.value.find(p => p.id === idNum || p.id === id);
    }

    function addProduct(product) {
        catalogApi.createProduct(product).then(response => {
            const newProduct = ProductAssembler.toEntityFromResource(response.data);
            products.value.push(newProduct);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function updateProduct(product) {
        catalogApi.updateProduct(product).then(response => {
            const updated = ProductAssembler.toEntityFromResource(response.data);
            const index = products.value.findIndex(p => p.id === updated.id);
            if (index !== -1) products.value[index] = updated;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function deleteProduct(product) {
        catalogApi.deleteProduct(product.id).then(() => {
            const index = products.value.findIndex(p => p.id === product.id);
            if (index !== -1) products.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function clearErrors() {
        errors.value = [];
    }

    return {
        products,
        errors,
        productsLoaded,
        loading,
        productsCount,
        fetchProducts,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
        clearErrors
    };
});

export default useCatalogStore;