/**
 * SalesPerformance Entity
 * Represents a customer's sales performance
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
     * Gets the formatted volume
     */
    getFormattedVolume() {
        return `${this.totalVolume.toLocaleString('es-PE', { minimumFractionDigits: 1 })} MT`;
    }

    /**
     * Get the status badge
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