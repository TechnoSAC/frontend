import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { DashboardApi } from "../infrastructure/dashboard-api.js";

const dashboardApi = new DashboardApi();

const useDashboardStore = defineStore('dashboard', () => {
    /** @type {import('vue').Ref<number>} */
    const totalFuelLiters = ref(0);
    /** @type {import('vue').Ref<number>} */
    const pendingRequests = ref(0);
    /** @type {import('vue').Ref<Array>} */
    const activeRequests = ref([]);
    /** @type {import('vue').Ref<boolean>} */
    const loading = ref(false);
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);

    /** @type {import('vue').ComputedRef<string>} */
    const totalFuelDisplay = computed(() =>
        (totalFuelLiters.value / 1000).toFixed(1) + 'k'
    );

    function fetchDashboardData() {
        loading.value = true;
        Promise.all([
            dashboardApi.getInventory(),
            dashboardApi.getRequests()
        ]).then(([inventoryRes, requestsRes]) => {
            const inventory = inventoryRes.data instanceof Array ? inventoryRes.data : [];
            const requests  = requestsRes.data  instanceof Array ? requestsRes.data  : [];

            totalFuelLiters.value = inventory.reduce(
                (sum, item) => sum + Number(item.pricePerLiter || 0), 0
            );
            pendingRequests.value = requests.filter(r => r.status === 'PENDING').length;
            activeRequests.value  = requests.filter(
                r => !['REJECTED'].includes(r.status)
            );
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            loading.value = false;
        });
    }

    function clearErrors() {
        errors.value = [];
    }

    return {
        totalFuelLiters,
        pendingRequests,
        activeRequests,
        loading,
        errors,
        totalFuelDisplay,
        fetchDashboardData,
        clearErrors
    };
});

export default useDashboardStore;