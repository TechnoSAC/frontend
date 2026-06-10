/**
 * Order entity in the Ordering bounded context.
 * Created from an approved Request. Lifecycle: CREATED → DISPATCHED → DELIVERED → CLOSED.
 *
 * @class Order
 */
export class Order {
    /**
     * @param {Object} params
     * @param {number|string|null} [params.id=null]
     * @param {number|string|null} [params.requestId=null]
     * @param {number|string|null} [params.clientId=null]
     * @param {number|string|null} [params.providerId=null]
     * @param {string} [params.fuelType='']
     * @param {number} [params.quantity=0]
     * @param {string} [params.unit='GALLONS']
     * @param {number} [params.totalAmount=0]
     * @param {string} [params.deliveryAddress='']
     * @param {string} [params.status='CREATED']
     * @param {string|null} [params.dispatchedAt=null]
     * @param {string|null} [params.deliveredAt=null]
     * @param {string|null} [params.closedAt=null]
     * @param {string|null} [params.createdAt=null]
     * @param {string|null} [params.updatedAt=null]
     */
    constructor({
        id = null,
        requestId = null,
        clientId = null,
        providerId = null,
        fuelType = '',
        quantity = 0,
        unit = 'GALLONS',
        totalAmount = 0,
        deliveryAddress = '',
        status = 'CREATED',
        dispatchedAt = null,
        deliveredAt = null,
        closedAt = null,
        createdAt = null,
        updatedAt = null,
    } = {}) {
        this.id = id;
        this.requestId = requestId;
        this.clientId = clientId;
        this.providerId = providerId;
        this.fuelType = fuelType;
        this.quantity = quantity;
        this.unit = unit;
        this.totalAmount = totalAmount;
        this.deliveryAddress = deliveryAddress;
        this.status = status;
        this.dispatchedAt = dispatchedAt;
        this.deliveredAt = deliveredAt;
        this.closedAt = closedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
