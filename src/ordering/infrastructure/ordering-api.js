import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const requestsEndpointPath = import.meta.env.VITE_REQUESTS_ENDPOINT_PATH;
const ordersEndpointPath   = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;

/**
 * Infrastructure adapter for Ordering HTTP endpoints.
 *
 * @class OrderingApi
 * @extends BaseApi
 */
export class OrderingApi extends BaseApi {
    /** @type {BaseEndpoint} */
    #requestsEndpoint;
    /** @type {BaseEndpoint} */
    #ordersEndpoint;

    constructor() {
        super();
        this.#requestsEndpoint = new BaseEndpoint(this, requestsEndpointPath);
        this.#ordersEndpoint   = new BaseEndpoint(this, ordersEndpointPath);
    }

    /**
     * Retrieves all request resources.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getRequests() {
        return this.#requestsEndpoint.getAll();
    }

    /**
     * Retrieves one request resource by identifier.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getRequestById(id) {
        return this.#requestsEndpoint.getById(id);
    }

    /**
     * Persists a new request resource.
     * @param {Object|import('../domain/model/request.entity.js').Request} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createRequest(resource) {
        return this.#requestsEndpoint.create(resource);
    }

    /**
     * Updates an existing request resource.
     * @param {Object|import('../domain/model/request.entity.js').Request} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateRequest(resource) {
        return this.#requestsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes one request resource by identifier.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteRequest(id) {
        return this.#requestsEndpoint.delete(id);
    }

    /** @returns {Promise<import('axios').AxiosResponse>} */
    getOrders() {
        return this.#ordersEndpoint.getAll();
    }

    /** @param {number|string} id @returns {Promise<import('axios').AxiosResponse>} */
    getOrderById(id) {
        return this.#ordersEndpoint.getById(id);
    }

    /** @param {Object} resource @returns {Promise<import('axios').AxiosResponse>} */
    createOrder(resource) {
        return this.#ordersEndpoint.create(resource);
    }

    /** @param {Object} resource @returns {Promise<import('axios').AxiosResponse>} */
    updateOrder(resource) {
        return this.#ordersEndpoint.update(resource.id, resource);
    }

    /** @param {number|string} id @returns {Promise<import('axios').AxiosResponse>} */
    deleteOrder(id) {
        return this.#ordersEndpoint.delete(id);
    }
}