/**
 * Application service store for the `Reporting` bounded context.
 * Manages clients data, sales metrics, and sector distributions using DDD architecture.
 *
 * @module useReportingStore
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ClientsApi } from '../infrastructure/clients-api.js';
import { SalesApi } from '../infrastructure/sales-api.js';
import { ClientAssembler } from '../infrastructure/client.assembler.js';

const useReportingStore = defineStore('reporting', () => {
    // State
    const clients = ref([]);
    const monthlySales = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Actions
    async function fetchClients() {
        loading.value = true;
        error.value = null;
        try {
            const data = await ClientsApi.getAllClients();
            clients.value = ClientAssembler.toClientList(data);
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

    // Computed - KPIs for General Report
    const totalSalesRevenue = computed(() => {
        return monthlySales.value.reduce((sum, month) => sum + month.revenue, 0);
    });

    const avgFulfillmentRate = computed(() => {
        // Mock calculation - en producción vendría de otra fuente
        return 98.2;
    });

    const avgLeadTime = computed(() => {
        // Mock calculation - en producción vendría de otra fuente
        return 4.2;
    });

    // Computed - KPIs for Clients Report
    const totalClients = computed(() => {
        return clients.value.length;
    });

    const totalRevenue = computed(() => {
        return clients.value.reduce((sum, client) => sum + client.totalCost, 0);
    });

    const activeOrders = computed(() => {
        // Mock - en producción vendría de ordering BC
        return 65;
    });

    const growthRate = computed(() => {
        // Mock calculation - en producción se calcularía con históricos
        return 12.4;
    });

    // Computed - Sales Performance (top clients for table)
    const clientSalesPerformance = computed(() => {
        return clients.value
            .map(client => ClientAssembler.toSalesPerformance(client))
            .sort((a, b) => b.totalVolume - a.totalVolume)
            .slice(0, 10); // Top 10
    });

    // Computed - Sector Distribution
    const sectorDistribution = computed(() => {
        if (clients.value.length === 0) return [];
        return ClientAssembler.toSectorDistribution(clients.value);
    });

    // Computed - Active clients only
    const activeClients = computed(() => {
        return clients.value.filter(client => client.isActive());
    });

    return {
        // State
        clients,
        monthlySales,
        loading,
        error,

        // Actions
        fetchClients,
        fetchMonthlySales,
        fetchClientsBySector,

        // KPIs - General Report
        totalSalesRevenue,
        avgFulfillmentRate,
        avgLeadTime,

        // KPIs - Clients Report
        totalClients,
        totalRevenue,
        activeOrders,
        growthRate,

        // Computed
        clientSalesPerformance,
        sectorDistribution,
        activeClients
    };
});

export default useReportingStore;
