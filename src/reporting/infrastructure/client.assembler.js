import { Client } from '../domain/model/client.entity.js';
import { SalesPerformance } from '../domain/model/sales-performance.entity.js';
import { SectorDistribution } from '../domain/model/sector-distribution.entity.js';

export const ClientAssembler = {
    /**
     * Transforms a Client DTO into a Client entity
     */
    toClient(dto) {
        return new Client({
            id: dto.id,
            companyName: dto.companyName,
            sector: dto.sector,
            totalVolume: dto.totalVolume,
            totalCost: dto.totalCost,
            lastActive: dto.lastActive,
            status: dto.status
        });
    },

    /**
     * Transforms an array of DTOs into an array of Client entities
     */
    toClientList(dtos) {
        return dtos.map(dto => this.toClient(dto));
    },

    /**
     * Transform a customer into SalesPerformance
     */
    toSalesPerformance(client) {
        return new SalesPerformance({
            companyName: client.companyName,
            totalVolume: client.totalVolume,
            status: client.status,
            revenue: client.totalCost ?? 0,
        });
    },

    /**
     * Calculate sector distribution from a customer list
     */
    toSectorDistribution(clients) {
        // Group by sector
        const sectorTotals = clients.reduce((acc, client) => {
            if (!acc[client.sector]) {
                acc[client.sector] = 0;
            }
            acc[client.sector] += client.totalVolume;
            return acc;
        }, {});

        // Calculate grand total
        const totalVolume = Object.values(sectorTotals).reduce((sum, vol) => sum + vol, 0);

        // Create SectorDistribution entities
        return Object.entries(sectorTotals)
            .map(([sector, volume]) => new SectorDistribution({
                sector,
                totalVolume: volume,
                percentage: Math.round((volume / totalVolume) * 100)
            }))
            .sort((a, b) => b.totalVolume - a.totalVolume); // Ordenar por volumen descendente
    }

};