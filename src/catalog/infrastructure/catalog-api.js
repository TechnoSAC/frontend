import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const catalogEndpointPath = import.meta.env.VITE_CATALOG_ENDPOINT_PATH;

/**
 * Infrastructure adapter for Catalog HTTP endpoints.
 *
 * @class CatalogApi
 * @extends BaseApi
 */
export class CatalogApi extends BaseApi {
    /** @type {BaseEndpoint} */
    #catalogEndpoint;

    /** Creates endpoint client for the catalog resource. */
    constructor() {
        super();
        this.#catalogEndpoint = new BaseEndpoint(this, catalogEndpointPath);
    }

    /**
     * Retrieves all product resources.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getProducts() {
        return this.#catalogEndpoint.getAll();
    }

    /**
     * Retrieves one product resource by identifier.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getProductById(id) {
        return this.#catalogEndpoint.getById(id);
    }

    /**
     * Persists a new product resource.
     * @param {Object|import('../domain/model/product.entity.js').Product} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createProduct(resource) {
        return this.#catalogEndpoint.create(resource);
    }

    /**
     * Updates an existing product resource.
     * @param {Object|import('../domain/model/product.entity.js').Product} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateProduct(resource) {
        return this.#catalogEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes one product resource by identifier.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteProduct(id) {
        return this.#catalogEndpoint.delete(id);
    }
}