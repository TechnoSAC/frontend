import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const inventoryEndpointPath = import.meta.env.VITE_INVENTORY_ENDPOINT_PATH;
const requestsEndpointPath  = import.meta.env.VITE_REQUESTS_ENDPOINT_PATH;

/**
 * Infrastructure adapter for Dashboard HTTP endpoints.
 *
 * @class DashboardApi
 * @extends BaseApi
 */
export class DashboardApi extends BaseApi {
    /** @type {BaseEndpoint} */
    #inventoryEndpoint;
    /** @type {BaseEndpoint} */
    #requestsEndpoint;

    constructor() {
        super();
        this.#inventoryEndpoint = new BaseEndpoint(this, inventoryEndpointPath);
        this.#requestsEndpoint  = new BaseEndpoint(this, requestsEndpointPath);
    }

    /** @returns {Promise<import('axios').AxiosResponse>} */
    getInventory() {
        return this.#inventoryEndpoint.getAll();
    }

    /** @returns {Promise<import('axios').AxiosResponse>} */
    getRequests() {
        return this.#requestsEndpoint.getAll();
    }
}