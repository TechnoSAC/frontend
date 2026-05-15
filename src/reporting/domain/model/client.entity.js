/**
 * Client Entity
 * Represent a B2B client with fuel consumption information
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
     * Verify if the client is active
     */
    isActive() {
        return this.status === 'PAID';
    }

    /**
     * Gets the formatted sector
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
     * Gets the formatted cost
     */
    getFormattedCost() {
        return `S/ ${this.totalCost.toLocaleString('es-PE')}`;
    }

    /**
     * Gets the formatted volume
     */
    getFormattedVolume() {
        return `${this.totalVolume.toLocaleString('es-PE', { minimumFractionDigits: 1 })} MT`;
    }

    /**
     * Gets the date of last formatted activity
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