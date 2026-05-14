import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ClientsApi } from '../infrastructure/clients-api.js';
import { SalesApi } from '../infrastructure/sales-api.js';
import { ClientAssembler } from '../infrastructure/client.assembler.js';

const useReportingStore = defineStore('reporting', () => {
    // State
    const allClients = ref([]);  // unfiltered — source of truth for KPIs & chart
    const clients = ref([]);     // filtered view for the table
    const monthlySales = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Actions
    async function fetchClients() {
        loading.value = true;
        error.value = null;
        try {
            const data = await ClientsApi.getAllClients();
            const list = ClientAssembler.toClientList(data);
            allClients.value = list;
            clients.value = list;
        } catch (err) {
            error.value = err.message;
            console.error('Error fetching clients:', err);
        } finally {
            loading.value = false;
        }
    }

    async function fetchMonthlySales() {
        loading.value = true;
        error.value = null;
        try {
            const data = await SalesApi.getMonthlySales();
            monthlySales.value = data;
        } catch (err) {
            error.value = err.message;
            console.error('Error fetching monthly sales:', err);
        } finally {
            loading.value = false;
        }
    }

    async function fetchClientsBySector(sector) {
        loading.value = true;
        error.value = null;
        try {
            const data = await ClientsApi.getClientsBySector(sector);
            clients.value = ClientAssembler.toClientList(data);
        } catch (err) {
            error.value = err.message;
            console.error('Error fetching clients by sector:', err);
        } finally {
            loading.value = false;
        }
    }

    /** Client-side sector filter — no HTTP call. */
    function filterBySector(sector) {
        if (sector === 'all') {
            clients.value = allClients.value;
        } else {
            clients.value = allClients.value.filter(c => c.sector === sector);
        }
    }

    // Computed — KPIs for General Report
    const avgFulfillmentRate = computed(() => {
        const total = allClients.value.length;
        if (total === 0) return 0;
        const paid = allClients.value.filter(c => c.status === 'PAID').length;
        return Math.round((paid / total) * 1000) / 10; // one decimal
    });

    const avgLeadTime = computed(() => 4.2);

    // Computed — KPIs for Clients Report (always from allClients, unaffected by filter)
    const totalClients = computed(() => allClients.value.length);

    const totalRevenue = computed(() =>
        allClients.value.reduce((sum, c) => sum + (c.totalCost ?? 0), 0)
    );

    /** Count of clients whose payment is complete. */
    const paidOrders = computed(() =>
        allClients.value.filter(c => c.status === 'PAID').length
    );

    // Alias kept for views that haven't migrated yet
    const activeOrders = paidOrders;
    const totalSalesRevenue = totalRevenue;

    // Computed — Sector Distribution from allClients (unaffected by table filter)
    const sectorDistribution = computed(() => {
        if (allClients.value.length === 0) return [];
        return ClientAssembler.toSectorDistribution(allClients.value);
    });

    // Computed — Sales Performance (top 10 of filtered view)
    const clientSalesPerformance = computed(() =>
        clients.value
            .map(client => ClientAssembler.toSalesPerformance(client))
            .sort((a, b) => b.totalVolume - a.totalVolume)
            .slice(0, 4)
    );

    const activeClients = computed(() =>
        allClients.value.filter(client => client.isActive())
    );

    return {
        // State
        allClients,
        clients,
        monthlySales,
        loading,
        error,

        // Actions
        fetchClients,
        fetchMonthlySales,
        fetchClientsBySector,
        filterBySector,

        // KPIs
        totalRevenue,
        totalSalesRevenue,
        avgFulfillmentRate,
        avgLeadTime,
        totalClients,
        paidOrders,
        activeOrders,

        // Computed
        clientSalesPerformance,
        sectorDistribution,
        activeClients,
    };
});

export default useReportingStore;