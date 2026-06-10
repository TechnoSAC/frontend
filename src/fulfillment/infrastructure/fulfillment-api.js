import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH;
const driversEndpointPath = import.meta.env.VITE_DRIVERS_ENDPOINT_PATH;

/**
 * Infrastructure adapter for Fulfillment HTTP endpoints.
 *
 * @class FulfillmentApi
 * @extends BaseApi
 */
export class FulfillmentApi extends BaseApi {
    /** @type {BaseEndpoint} */
    #vehiclesEndpoint;
    /** @type {BaseEndpoint} */
    #driversEndpoint;

    /** Creates endpoint clients for vehicles and drivers resources. */
    constructor() {
        super();
        this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath);
        this.#driversEndpoint = new BaseEndpoint(this, driversEndpointPath);
    }

    // VEHICLES
    getVehicles() {
        return this.#vehiclesEndpoint.getAll();
    }

    getVehicleById(id) {
        return this.#vehiclesEndpoint.getById(id);
    }

    createVehicle(resource) {
        return this.#vehiclesEndpoint.create(resource);
    }

    updateVehicle(resource) {
        return this.#vehiclesEndpoint.update(resource.id, resource);
    }

    deleteVehicle(id) {
        return this.#vehiclesEndpoint.delete(id);
    }

    // DRIVERS
    getDrivers() {
        return this.#driversEndpoint.getAll();
    }

    getDriverById(id) {
        return this.#driversEndpoint.getById(id);
    }

    createDriver(resource) {
        return this.#driversEndpoint.create(resource);
    }

    updateDriver(resource) {
        return this.#driversEndpoint.update(resource.id, resource);
    }

    deleteDriver(id) {
        return this.#driversEndpoint.delete(id);
    }
}