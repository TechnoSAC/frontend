export class SalesPerformance {
    constructor({ companyName, totalVolume, status, revenue }) {
        this.companyName = companyName;
        this.totalVolume = totalVolume;
        this.status = status;
        this.revenue = revenue ?? 0;
    }

    getFormattedVolume() {
        return `${this.totalVolume.toLocaleString('es-PE', { minimumFractionDigits: 1 })} MT`;
    }

    getFormattedRevenue() {
        return `S/ ${this.revenue.toLocaleString('es-PE')}`;
    }

    getStatusBadge() {
        const map = {
            PAID:    { severity: 'success', label: 'Paid' },
            PENDING: { severity: 'warn',    label: 'Pending' },
        };
        return map[this.status] ?? { severity: 'info', label: this.status };
    }
}