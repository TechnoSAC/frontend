/**
 * Cross-context coordination service (application layer).
 *
 * This is the ONLY place where multiple bounded contexts are orchestrated
 * together. Presentation components never import another context's store: they
 * emit events, and the route-level page calls one of these use cases. Each
 * function below talks to the involved contexts exclusively through their
 * public store actions, keeping the contexts decoupled from each other.
 *
 * Contexts touched here: Ordering, Inventory, Fulfillment, Payment,
 * Notification and Equipment. Identity comes from IAM.
 *
 * @module coordination.service
 */
import pinia from "../../pinia.js";
import useOrderingStore from "../../ordering/application/ordering.store.js";
import useInventoryStore from "../../inventory/application/inventory.store.js";
import useNotificationStore from "../../notification/application/notification.store.js";
import usePaymentStore from "../../payment/application/payment.store.js";
import useFulfillmentStore from "../../fulfillment/application/fulfillment.store.js";
import useEquipmentStore from "../../equipment/application/equipment.store.js";
import { fuelTypeLabel } from "../domain/fuel-types.js";

const LITERS_PER_GALLON = 3.78541;

/** Converts a quantity to liters so it can be discounted from tank stock. */
function toLiters(quantity, unit) {
    return unit === 'GALLONS' ? Number(quantity) * LITERS_PER_GALLON : Number(quantity);
}

const ordering = () => useOrderingStore(pinia);
const inventory = () => useInventoryStore(pinia);
const notifications = () => useNotificationStore(pinia);
const payments = () => usePaymentStore(pinia);
const fulfillment = () => useFulfillmentStore(pinia);
const equipment = () => useEquipmentStore(pinia);

/**
 * Application read use case: list a buyer's equipment so another context
 * (e.g. Catalog) can offer an equipment picker without importing the Equipment
 * store directly. Loads it on demand if not present.
 *
 * @param {number} companyId
 * @returns {Promise<import('../../equipment/domain/model/equipment.entity.js').Equipment[]>}
 */
export async function listCompanyEquipment(companyId) {
    const store = equipment();
    if (!store.loaded) await store.fetchEquipment();
    return store.forCompany(companyId);
}

/**
 * Application read use case: list available drivers + vehicles so the Ordering
 * page can offer a driver/vehicle picker without importing the Fulfillment store
 * directly. Loads resources on demand.
 *
 * @param {number|string} providerId
 * @returns {Promise<{ drivers:Array, vehicles:Array }>}
 */
export async function listAvailableResources(providerId) {
    const store = fulfillment();
    await Promise.all([
        store.fetchDrivers(providerId),
        store.fetchVehicles(providerId),
    ]);
    return { drivers: store.availableDrivers, vehicles: store.availableVehicles };
}

/**
 * Application read use case: resolve all drivers + vehicles (including assigned
 * ones) so the Ordering order-detail page can display the names assigned to an
 * order without importing the Fulfillment store directly.
 *
 * @param {number|string} providerId
 * @returns {Promise<{ drivers:Array, vehicles:Array }>}
 */
export async function listAllResources(providerId) {
    const store = fulfillment();
    await Promise.all([
        store.fetchDrivers(providerId),
        store.fetchVehicles(providerId),
    ]);
    return { drivers: store.drivers, vehicles: store.vehicles };
}

/**
 * Buyer use case: create a fuel request (from Catalog or Equipment) and notify
 * both parties. Catalog/Equipment components emit an event; their page calls
 * this — they never touch the Ordering or Notification stores themselves.
 *
 * @param {Object} payload - Request attributes (companyId, providerId, fuelType…).
 * @returns {Promise<import('../../ordering/domain/model/request.entity.js').Request|null>}
 */
export async function submitFuelRequest(payload) {
    const request = await ordering().createRequestAsync(payload);
    if (!request) return null;

    const fuel = fuelTypeLabel(payload.fuelType);
    await notifications().createNotification({
        recipientType: 'PROVIDER',
        providerId: payload.providerId,
        type: 'NEW_REQUEST',
        titleKey: 'notification.new-request-title',
        messageKey: 'notification.new-request-msg',
        params: { qty: payload.quantity, unit: payload.unit?.toLowerCase(), fuel },
        relatedId: request.id,
    });
    await notifications().createNotification({
        recipientType: 'BUYER',
        companyId: payload.companyId,
        type: 'ORDER_CREATED',
        titleKey: 'notification.order-created-title',
        messageKey: 'notification.order-created-msg',
        params: { fuel },
        relatedId: request.id,
    });
    return request;
}

/**
 * Equipment use case: attempt an automatic refill. Checks the favorite
 * provider's stock (via Inventory, the only context that knows stock) and either
 * creates a request or raises a "no stock" buyer notification.
 *
 * @param {import('../../equipment/domain/model/equipment.entity.js').Equipment} item
 * @param {string} deliveryAddress
 * @returns {Promise<{ ok:boolean, reason?:string }>}
 */
async function ensureInventoryLoaded() {
    const store = inventory();
    if (!store.productsLoaded) await store.fetchProducts();
}

export async function triggerAutoRefill(item, deliveryAddress = '') {
    await ensureInventoryLoaded();
    const providerId = item.favoriteProviderId;
    const missing = Math.max(0, item.capacity - item.currentLevel);
    const stockItem = inventory().findItem(providerId, item.requiredFuelType);
    const hasStock = stockItem && stockItem.status === 'ACTIVE' && stockItem.availableStock() >= toLiters(missing, item.unit);

    if (!providerId || !hasStock) {
        await notifications().createNotification({
            recipientType: 'BUYER',
            companyId: item.companyId,
            type: 'NO_STOCK',
            titleKey: 'notification.no-stock-title',
            messageKey: 'notification.no-stock-msg',
            params: { name: item.name, fuel: fuelTypeLabel(item.requiredFuelType) },
            relatedId: item.id,
        });
        return { ok: false, reason: 'NO_STOCK' };
    }

    await submitFuelRequest({
        companyId: item.companyId,
        providerId,
        equipmentId: item.id,
        fuelType: item.requiredFuelType,
        productName: stockItem.name,
        quantity: Math.round(missing),
        unit: item.unit,
        unitPrice: stockItem.pricePerLiter,
        deliveryAddress: deliveryAddress || item.location,
        deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        source: 'AUTO_REFILL',
    });
    return { ok: true };
}

/**
 * Manual refill request triggered from an equipment card. Resolves the product
 * name and price from the favorite provider's inventory so the Equipment page
 * never imports Catalog/Inventory data itself.
 *
 * @param {import('../../equipment/domain/model/equipment.entity.js').Equipment} item
 * @param {{ quantity?:number, deliveryAddress?:string }} [options]
 * @returns {Promise<{ ok:boolean, reason?:string, request?:Object }>}
 */
export async function requestManualRefill(item, options = {}) {
    await ensureInventoryLoaded();
    const providerId = item.favoriteProviderId;
    if (!providerId) return { ok: false, reason: 'NO_PROVIDER' };

    const stockItem = inventory().findItem(providerId, item.requiredFuelType);
    const quantity = options.quantity ?? Math.max(1, Math.round(item.capacity - item.currentLevel));

    // Validate available stock at the favorite provider BEFORE creating a request
    // that would just get rejected. Caller can then offer the catalog instead.
    if (!stockItem || stockItem.status !== 'ACTIVE' || stockItem.availableStock() < toLiters(quantity, item.unit)) {
        return { ok: false, reason: 'NO_STOCK' };
    }

    const request = await submitFuelRequest({
        companyId: item.companyId,
        providerId,
        equipmentId: item.id,
        fuelType: item.requiredFuelType,
        productName: stockItem?.name ?? fuelTypeLabel(item.requiredFuelType),
        quantity,
        unit: item.unit,
        unitPrice: stockItem?.pricePerLiter ?? 0,
        deliveryAddress: options.deliveryAddress || item.location,
        deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        source: 'MANUAL',
    });
    return { ok: !!request, request };
}

/**
 * Provider use case: accept a request. Verifies tank stock, creates the order,
 * decrements inventory and notifies the buyer.
 *
 * @param {import('../../ordering/domain/model/request.entity.js').Request} request
 * @returns {Promise<{ ok:boolean, reason?:string, order?:Object }>}
 */
export async function acceptRequest(request) {
    await ensureInventoryLoaded();
    const stockItem = inventory().findItem(request.providerId, request.fuelType);
    const requiredLiters = toLiters(request.quantity, request.unit);
    // Reject when there is no matching tank at all, or it is inactive / short on
    // AVAILABLE stock (physical minus already reserved). A missing tank must not
    // silently pass (would create an order the provider cannot fulfil).
    if (!stockItem || stockItem.status !== 'ACTIVE' || stockItem.availableStock() < requiredLiters) {
        return { ok: false, reason: 'NO_STOCK' };
    }

    // Reserve the stock now so it can't be promised twice. Physical stock is only
    // discounted at dispatch (see assignDelivery), which also frees the reservation.
    await inventory().reserveStock(stockItem.id, requiredLiters);
    const order = await ordering().approveRequestAsync(request);
    if (!order) {
        await inventory().releaseReservation(stockItem.id, requiredLiters);
        return { ok: false, reason: 'PERSISTENCE_ERROR' };
    }

    await notifications().createNotification({
        recipientType: 'BUYER',
        companyId: request.companyId ?? request.clientId,
        type: 'REQUEST_APPROVED',
        titleKey: 'notification.request-approved-title',
        messageKey: 'notification.request-approved-msg',
        params: { fuel: fuelTypeLabel(request.fuelType), id: order?.id ?? '' },
        relatedId: order?.id ?? request.id,
    });
    return { ok: true, order };
}

/**
 * Provider use case: reject a request and notify the buyer.
 * @param {import('../../ordering/domain/model/request.entity.js').Request} request
 * @returns {Promise<{ ok:boolean }>}
 */
export async function rejectRequest(request, { code = 'OTHER', note = '' } = {}) {
    await ordering().rejectRequestAsync(request, code, note);
    await notifications().createNotification({
        recipientType: 'BUYER',
        companyId: request.companyId ?? request.clientId,
        type: 'REQUEST_REJECTED',
        titleKey: 'notification.request-rejected-title',
        messageKey: 'notification.request-rejected-msg',
        params: { fuel: fuelTypeLabel(request.fuelType) },
        relatedId: request.id,
    });
    return { ok: true };
}

/**
 * Provider use case (Fulfillment): assign a driver + vehicle to an order,
 * dispatch it and notify the buyer.
 *
 * @param {{ order:Object, driverId:number, vehicleId:number }} params
 * @returns {Promise<{ ok:boolean }>}
 */
export async function assignDelivery({ order, driverId, vehicleId }) {
    // Validate stock BEFORE dispatching: the tank must exist, be active and hold
    // enough fuel. Otherwise we abort so we never dispatch an unfulfillable order.
    await ensureInventoryLoaded();
    const stockItem = inventory().findItem(order.providerId, order.fuelType);
    const liters = toLiters(order.quantity, order.unit);
    if (!stockItem || stockItem.status !== 'ACTIVE' || stockItem.stock < liters) {
        return { ok: false, reason: 'NO_STOCK' };
    }

    await fulfillment().assignToOrder({ order, driverId, vehicleId });
    await ordering().dispatchOrder(order, { driverId, vehicleId });

    // Inventory stock is discounted at dispatch (the chosen simulated rule).
    await inventory().decreaseStock(stockItem.id, liters, `Order #${order.id} dispatched`, order.id);

    await notifications().createNotification({
        recipientType: 'BUYER',
        companyId: order.companyId ?? order.clientId,
        type: 'ORDER_DISPATCHED',
        titleKey: 'notification.order-dispatched-title',
        messageKey: 'notification.order-dispatched-msg',
        params: { id: order.id },
        relatedId: order.id,
    });
    return { ok: true };
}

/**
 * Provider use case: cancel an ACCEPTED order before dispatch. Releases the
 * reserved stock back to availability, marks the order CANCELLED and notifies
 * the buyer with the reason.
 *
 * @param {{ order:Object, reason?:string }} params
 * @returns {Promise<{ ok:boolean, reason?:string }>}
 */
export async function cancelAcceptedOrder({ order, reason = '' }) {
    if (order.status !== 'ACCEPTED') return { ok: false, reason: 'NOT_CANCELLABLE' };

    // Release the reservation taken at accept time.
    await ensureInventoryLoaded();
    const stockItem = inventory().findItem(order.providerId, order.fuelType);
    if (stockItem) {
        await inventory().releaseReservation(stockItem.id, toLiters(order.quantity, order.unit));
    }

    await ordering().cancelOrder(order.id, reason);

    await notifications().createNotification({
        recipientType: 'BUYER',
        companyId: order.companyId ?? order.clientId,
        type: 'ORDER_CANCELLED',
        titleKey: 'notification.order-cancelled-title',
        messageKey: 'notification.order-cancelled-msg',
        params: { id: order.id },
        relatedId: order.id,
    });
    return { ok: true };
}

/**
 * Buyer use case: confirm reception of a dispatched order. Moves the order to
 * PENDING_PAYMENT, tops up the associated equipment (assigning the favorite
 * provider if the equipment had none) and notifies both parties.
 *
 * @param {{ order:Object }} params
 * @returns {Promise<{ ok:boolean }>}
 */
export async function confirmOrderReception({ order }) {
    await ordering().confirmReception(order);

    // Close the delivery and free the driver + vehicle so the provider's fleet
    // becomes available again (keeps fulfillment consistent with ordering).
    await fulfillment().completeDeliveryForOrder(order.id);

    if (order.equipmentId) {
        const store = equipment();
        if (!store.loaded) await store.fetchEquipment();
        await store.applyDelivery(order.equipmentId, order.quantity, order.unit, order.providerId, { requestId: order.requestId });
    }

    await notifications().createNotification({
        recipientType: 'BUYER',
        companyId: order.companyId ?? order.clientId,
        type: 'ORDER_DELIVERED',
        titleKey: 'notification.order-received-title',
        messageKey: 'notification.order-received-msg',
        params: { id: order.id },
        relatedId: order.id,
    });
    await notifications().createNotification({
        recipientType: 'PROVIDER',
        providerId: order.providerId,
        type: 'ORDER_DELIVERED',
        titleKey: 'notification.delivery-confirmed-title',
        messageKey: 'notification.delivery-confirmed-msg',
        params: { id: order.id },
        relatedId: order.id,
    });
    return { ok: true };
}

/**
 * Buyer use case (Payment): pay an order, generating a payment + invoice and
 * flipping the order's payment status. Notifies the buyer.
 *
 * @param {{ order:Object, method:string, card:Object, buyer:Object, provider:Object }} params
 * @returns {Promise<{ payment:Object, invoice:Object }|null>}
 */
export async function completePayment({ order, method, card, buyer, provider }) {
    const result = await payments().payOrder({ order, method, card, buyer, provider });
    if (!result) return null;

    const paidOrder = ordering().markOrderPaidLocally(order.id);
    if (!paidOrder) return null;

    await notifications().createNotification({
        recipientType: 'BUYER',
        companyId: order.companyId ?? order.clientId,
        type: 'PAYMENT_REGISTERED',
        titleKey: 'notification.payment-registered-title',
        messageKey: 'notification.payment-registered-msg',
        params: { id: order.id },
        relatedId: order.id,
    });
    await notifications().createNotification({
        recipientType: 'BUYER',
        companyId: order.companyId ?? order.clientId,
        type: 'INVOICE_GENERATED',
        titleKey: 'notification.invoice-generated-title',
        messageKey: 'notification.invoice-generated-msg',
        params: { invoice: result.invoice?.invoiceNumber ?? '' },
        relatedId: order.id,
    });
    return result;
}
