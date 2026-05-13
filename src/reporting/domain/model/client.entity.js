/**
 * Client Entity
 * Representa un cliente B2B con información de consumo de combustible
 */
export class Client {
    constructor({
                    id,
                    companyName,
                    sector,
                    totalVolume,
                    totalCost,
                    lastActive,
                    status
                }) {
        this.id = id;
        this.companyName = companyName;
        this.sector = sector; // TRANSPORT, MINING, CONSTRUCTION, MARITIME, LOGISTICS
        this.totalVolume = totalVolume;
        this.totalCost = totalCost;
        this.lastActive = new Date(lastActive);
        this.status = status; // ACTIVE, INACTIVE, PENDING, REVIEW
    }

    /**
     * Verifica si el cliente está activo
     */
    isActive() {
        return this.status === 'ACTIVE';
    }

    /**
     * Obtiene el sector formateado
     */
    getSectorLabel() {
        const sectorMap = {
            TRANSPORT: 'Transport',
            MINING: 'Mining',
            CONSTRUCTION: 'Construction',
            MARITIME: 'Maritime',
            LOGISTICS: 'Logistics'
        };
        return sectorMap[this.sector] || this.sector;
    }

    /**
     * Obtiene el costo formateado
     */
    getFormattedCost() {
        return `S/ ${this.totalCost.toLocaleString('es-PE')}`;
    }

    /**
     * Obtiene el volumen formateado
     */
    getFormattedVolume() {
        return `${this.totalVolume.toLocaleString('es-PE', { minimumFractionDigits: 1 })} MT`;
    }

    /**
     * Obtiene la fecha de última actividad formateada
     */
    getFormattedLastActive() {
        return this.lastActive.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
}