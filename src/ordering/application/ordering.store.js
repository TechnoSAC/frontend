/**
 * Application service store for the `Ordering` bounded context.
 * Coordinates request use cases and exposes UI-facing state.
 *
 * @module useOrderingStore
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { OrderingApi } from "../infrastructure/ordering-api.js";
import { RequestAssembler } from "../infrastructure/request.assembler.js";
import { Request } from "../domain/model/request.entity.js";

const orderingApi = new OrderingApi();

const useOrderingStore = defineStore('ordering', () => {
    /** @type {import('vue').Ref<Request[]>} */
    const requests = ref([]);
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} */
    const requestsLoaded = ref(false);
    /** @type {import('vue').Ref<boolean>} */
    const loading = ref(false);

    /** @type {import('vue').ComputedRef<number>} */
    const requestsCount = computed(() => requestsLoaded.value ? requests.value.length : 0);

    /** @type {import('vue').ComputedRef<Request[]>} */
    const pendingRequests = computed(() => {
        return requests.value.filter(r => r.status === 'PENDING');
    });

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
        const updated = new Request({ ...request, status: 'APPROVED' });
        updateRequest(updated);
    }

    function rejectRequest(request) {
        const updated = new Request({ ...request, status: 'REJECTED' });
        updateRequest(updated);
    }

    function clearErrors() {
        errors.value = [];
    }

    return {
        requests,
        errors,
        requestsLoaded,
        loading,
        requestsCount,
        pendingRequests,
        fetchRequests,
        getRequestById,
        addRequest,
        updateRequest,
        deleteRequest,
        approveRequest,
        rejectRequest,
        clearErrors
    };
});

export default useOrderingStore;