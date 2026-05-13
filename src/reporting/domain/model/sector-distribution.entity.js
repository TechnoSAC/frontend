/**
 * SectorDistribution Entity
 * Representa la distribución de volumen por sector industrial
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
     * Obtiene el nombre del sector formateado
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
     * Obtiene el volumen formateado
     */
    getFormattedVolume() {
        return `${this.totalVolume.toLocaleString('es-PE', { minimumFractionDigits: 3 })} MT`;
    }

    /**
     * Obtiene el porcentaje formateado
     */
    getFormattedPercentage() {
        return `${this.percentage}%`;
    }

    /**
     * Obtiene el color para el gráfico según el sector
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