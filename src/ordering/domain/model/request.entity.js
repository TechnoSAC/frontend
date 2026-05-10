/**
 * Request entity in the Ordering bounded context.
 * Represents a fuel delivery request from a client.
 *
 * @class Request
 */
export class Request {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number|string|null} [params.id=null] - Request identifier.
     * @param {number|string|null} [params.clientId=null] - Client who made the request.
     * @param {number|string|null} [params.providerId=null] - Provider assigned to fulfill.
     * @param {string} [params.fuelType=''] - Type of fuel requested.
     * @param {number} [params.quantity=0] - Quantity requested.
     * @param {string} [params.unit='GALLONS'] - Unit of measurement.
     * @param {string} [params.deliveryAddress=''] - Delivery location.
     * @param {string} [params.deliveryDate=''] - Requested delivery date.
     * @param {string} [params.status='PENDING'] - Request status.
     * @param {string|null} [params.createdAt=null] - Creation timestamp.
     */
    constructor({
                    id = null,
                    clientId = null,
                    providerId = null,
                    fuelType = '',
                    quantity = 0,
                    unit = 'GALLONS',
                    deliveryAddress = '',
                    deliveryDate = '',
                    status = 'PENDING',
                    createdAt = null
                }) {
        this.id = id;
        this.clientId = clientId;
        this.providerId = providerId;
        this.fuelType = fuelType;
        this.quantity = quantity;
        this.unit = unit;
        this.deliveryAddress = deliveryAddress;
        this.deliveryDate = deliveryDate;
        this.status = status;
        this.createdAt = createdAt;
    }
}