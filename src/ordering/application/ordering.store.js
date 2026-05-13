import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { OrderingApi } from "../infrastructure/ordering-api.js";
import { RequestAssembler } from "../infrastructure/request.assembler.js";
import { OrderAssembler } from "../infrastructure/order.assembler.js";
import { Request } from "../domain/model/request.entity.js";
import { Order } from "../domain/model/order.entity.js";

const orderingApi = new OrderingApi();

const useOrderingStore = defineStore('ordering', () => {

    // ── Requests ────────────────────────────────────────────────────────────
    /** @type {import('vue').Ref<Request[]>} */
    const requests = ref([]);
    /** @type {import('vue').Ref<boolean>} */
    const requestsLoaded = ref(false);

    /** @type {import('vue').ComputedRef<Request[]>} */
    const pendingRequests = computed(() => requests.value.filter(r => r.status === 'PENDING'));
    /** @type {import('vue').ComputedRef<Request[]>} */
    const approvedRequests = computed(() => requests.value.filter(r => r.status === 'APPROVED'));

    // ── Orders ──────────────────────────────────────────────────────────────
    /** @type {import('vue').Ref<Order[]>} */
    const orders = ref([]);
    /** @type {import('vue').Ref<boolean>} */
    const ordersLoaded = ref(false);

    /** @type {import('vue').ComputedRef<Order[]>} */
    const activeOrders = computed(() =>
        orders.value.filter(o => o.status === 'CREATED' || o.status === 'DISPATCHED')
    );
    /** @type {import('vue').ComputedRef<Order[]>} */
    const closedOrders = computed(() =>
        orders.value.filter(o => o.status === 'CLOSED')
    );

    // ── Shared state ────────────────────────────────────────────────────────
    /** @type {import('vue').Ref<boolean>} */
    const loading = ref(false);
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);

    /** @type {import('vue').ComputedRef<number>} */
    const requestsCount = computed(() => requestsLoaded.value ? requests.value.length : 0);

    // ── Request actions ─────────────────────────────────────────────────────
    function fetchRequests() {
        loading.value = true;
        orderingApi.getRequests().then(response => {
            requests.value = RequestAssembler.toEntitiesFromResponse(response);
            requestsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            loading.value = false;
        });
    }

    function getRequestById(id) {
        const idNum = parseInt(id);
        return requests.value.find(r => r.id === idNum || r.id === id);
    }

    function addRequest(request) {
        orderingApi.createRequest(request).then(response => {
            const newRequest = RequestAssembler.toEntityFromResource(response.data);
            requests.value.push(newRequest);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function updateRequest(request) {
        orderingApi.updateRequest(request).then(response => {
            const updated = RequestAssembler.toEntityFromResource(response.data);
            const index = requests.value.findIndex(r => r.id === updated.id);
            if (index !== -1) requests.value[index] = updated;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function deleteRequest(request) {
        orderingApi.deleteRequest(request.id).then(() => {
            const index = requests.value.findIndex(r => r.id === request.id);
            if (index !== -1) requests.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function approveRequest(request) {
        const approved = new Request({ ...request, status: 'APPROVED' });
        updateRequest(approved);

        const now = new Date().toISOString();
        const newOrder = new Order({
            requestId:       request.id,
            clientId:        request.clientId,
            providerId:      request.providerId,
            fuelType:        request.fuelType,
            quantity:        request.quantity,
            unit:            request.unit,
            totalAmount:     0,
            deliveryAddress: request.deliveryAddress,
            status:          'CREATED',
            createdAt:       now,
            updatedAt:       now,
        });
        addOrder(newOrder);
    }

    function rejectRequest(request) {
        const updated = new Request({ ...request, status: 'REJECTED' });
        updateRequest(updated);
    }

    // ── Order actions ───────────────────────────────────────────────────────
    function fetchOrders() {
        loading.value = true;
        orderingApi.getOrders().then(response => {
            orders.value = OrderAssembler.toEntitiesFromResponse(response);
            ordersLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            loading.value = false;
        });
    }

    function getOrderById(id) {
        const idNum = parseInt(id);
        return orders.value.find(o => o.id === idNum || o.id === id);
    }

    function addOrder(order) {
        orderingApi.createOrder(order).then(response => {
            const newOrder = OrderAssembler.toEntityFromResource(response.data);
            orders.value.push(newOrder);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function updateOrder(order) {
        orderingApi.updateOrder(order).then(response => {
            const updated = OrderAssembler.toEntityFromResource(response.data);
            const index = orders.value.findIndex(o => o.id === updated.id);
            if (index !== -1) orders.value[index] = updated;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function deleteOrder(order) {
        orderingApi.deleteOrder(order.id).then(() => {
            const index = orders.value.findIndex(o => o.id === order.id);
            if (index !== -1) orders.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function clearErrors() {
        errors.value = [];
    }

    return {
        // state
        requests, requestsLoaded,
        orders, ordersLoaded,
        loading, errors,
        // computed
        requestsCount,
        pendingRequests, approvedRequests,
        activeOrders, closedOrders,
        // request actions
        fetchRequests, getRequestById,
        addRequest, updateRequest, deleteRequest,
        approveRequest, rejectRequest,
        // order actions
        fetchOrders, getOrderById,
        addOrder, updateOrder, deleteOrder,
        clearErrors,
    };
});

export default useOrderingStore;
