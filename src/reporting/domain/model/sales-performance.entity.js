/**
 * SalesPerformance Entity
 * Representa el rendimiento de ventas de un cliente
 */
export class SalesPerformance {
    constructor({
                    companyName,
                    totalVolume,
                    status
                }) {
        this.companyName = companyName;
        this.totalVolume = totalVolume;
        this.status = status;
    }

    /**
     * Obtiene el volumen formateado
     */
    getFormattedVolume() {
        return `${this.totalVolume.toLocaleString('es-PE', { minimumFractionDigits: 1 })} MT`;
    }

    /**
     * Obtiene el badge de estado
     */
    getStatusBadge() {
        const badgeMap = {
            ACTIVE: { severity: 'success', label: 'Active' },
            PENDING: { severity: 'warn', label: 'Pending' },
            INACTIVE: { severity: 'secondary', label: 'Inactive' }
        };
        return badgeMap[this.status] || { severity: 'info', label: this.status };
    }
}