import { Client } from '../domain/model/client.entity.js';
import { SalesPerformance } from '../domain/model/sales-performance.entity.js';
import { SectorDistribution } from '../domain/model/sector-distribution.entity.js';

export const ClientAssembler = {
    /**
     * Transforma un DTO de cliente en entidad Client
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
     * Transforma un array de DTOs en array de entidades Client
     */
    toClientList(dtos) {
        return dtos.map(dto => this.toClient(dto));
    },

    /**
     * Transforma un cliente en SalesPerformance
     */
    toSalesPerformance(client) {
        return new SalesPerformance({
            companyName: client.companyName,
            totalVolume: client.totalVolume,
            status: client.status
        });
    },

    /**
     * Calcula la distribución por sectores desde una lista de clientes
     */
    toSectorDistribution(clients) {
        // Agrupar por sector
        const sectorTotals = clients.reduce((acc, client) => {
            if (!acc[client.sector]) {
                acc[client.sector] = 0;
            }
            acc[client.sector] += client.totalVolume;
            return acc;
        }, {});

        // Calcular total general
        const totalVolume = Object.values(sectorTotals).reduce((sum, vol) => sum + vol, 0);

        // Crear entidades SectorDistribution
        return Object.entries(sectorTotals)
            .map(([sector, volume]) => new SectorDistribution({
                sector,
                totalVolume: volume,
                percentage: Math.round((volume / totalVolume) * 100)
            }))
            .sort((a, b) => b.totalVolume - a.totalVolume); // Ordenar por volumen descendente
    }

};