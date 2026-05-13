/**
 * Application service store for the `Reporting` bounded context.
 * Aggregates data from other BCs to calculate KPIs and metrics.
 *
 * @module useReportingStore
 */
import { defineStore } from "pinia";
import { computed } from "vue";
import useOrderingStore from "../../ordering/application/ordering.store.js";
import useCatalogStore from "../../catalog/application/catalog.store.js";

const useReportingStore = defineStore('reporting', () => {
    const orderingStore = useOrderingStore();
    const catalogStore = useCatalogStore();

    /**
     * Total Sales Revenue = suma de quantity * pricePerLiter de requests APPROVED/DELIVERED
     */
    const totalSalesRevenue = computed(() => {
        const deliveredRequests = orderingStore.requests.filter(r =>
            r.status === 'APPROVED' || r.status === 'DELIVERED'
        );

        let total = 0;
        deliveredRequests.forEach(request => {
            const product = catalogStore.products.find(p => p.type === request.fuelType);
            if (product) {
                total += request.quantity * product.pricePerLiter;
            }
        });
        return total;
    });

    /**
     * Average Fulfillment Rate = % de requests DELIVERED vs total
     */
    const avgFulfillmentRate = computed(() => {
        const total = orderingStore.requests.length;
        if (total === 0) return 0;

        const delivered = orderingStore.requests.filter(r => r.status === 'DELIVERED').length;
        return (delivered / total) * 100;
    });

    /**
     * Total Clients = clientes únicos en requests
     */
    const totalClients = computed(() => {
        const uniqueClients = new Set(orderingStore.requests.map(r => r.clientId));
        return uniqueClients.size;
    });

    /**
     * Active Orders = requests IN_TRANSIT
     */
    const activeOrders = computed(() => {
        return orderingStore.requests.filter(r => r.status === 'IN_TRANSIT').length;
    });

    /**
     * Client Sales Performance = agregado por clientId
     */
    const clientSalesPerformance = computed(() => {
        const clientMap = new Map();

        orderingStore.requests.forEach(request => {
            if (request.status === 'APPROVED' || request.status === 'DELIVERED') {
                const clientId = request.clientId;
                const product = catalogStore.products.find(p => p.type === request.fuelType);
                const volume = request.quantity;
                const revenue = product ? request.quantity * product.pricePerLiter : 0;

                if (!clientMap.has(clientId)) {
                    clientMap.set(clientId, {
                        clientId,
                        companyName: `Client ${clientId}`,
                        totalVolume: 0,
                        revenue: 0,
                        orderCount: 0,
                        status: 'ACTIVE'
                    });
                }

                const client = clientMap.get(clientId);
                client.totalVolume += volume;
                client.revenue += revenue;
                client.orderCount += 1;
            }
        });

        return Array.from(clientMap.values());
    });

    return {
        totalSalesRevenue,
        avgFulfillmentRate,
        totalClients,
        activeOrders,
        clientSalesPerformance
    };
});

export default useReportingStore;