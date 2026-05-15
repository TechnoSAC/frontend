/**
 * SectorDistribution Entity
 * Represents the distribution of volume by industrial sector
 */
export class SectorDistribution {
    constructor({
                    sector,
                    totalVolume,
                    percentage
                }) {
        this.sector = sector;
        this.totalVolume = totalVolume;
        this.percentage = percentage;
    }

    /**
     * Gets the name of the formatted sector
     */
    getSectorLabel() {
        const sectorMap = {
            MINING: 'Mining',
            MARITIME: 'Maritime',
            TRANSPORT: 'Transport',
            LOGISTICS: 'Logistics',
            CONSTRUCTION: 'Construction'
        };
        return sectorMap[this.sector] || this.sector;
    }

    /**
     * Gets the formatted volume
     */
    getFormattedVolume() {
        return `${this.totalVolume.toLocaleString('es-PE', { minimumFractionDigits: 3 })} MT`;
    }

    /**
     * Gets the formatted percentage
     */
    getFormattedPercentage() {
        return `${this.percentage}%`;
    }

    /**
     * Gets the color for the graph according to the sector
     */
    getChartColor() {
        const colorMap = {
            MINING: '#3b82f6',      // blue
            MARITIME: '#06b6d4',    // cyan
            TRANSPORT: '#6366f1',   // indigo
            LOGISTICS: '#8b5cf6',   // purple
            CONSTRUCTION: '#ec4899' // pink
        };
        return colorMap[this.sector] || '#64748b';
    }
}