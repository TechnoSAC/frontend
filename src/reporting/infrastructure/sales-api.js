const API_BASE_URL = 'http://localhost:10000';

export const SalesApi = {
    /**
     * Obtiene datos de ventas mensuales
     */
    async getMonthlySales() {
        try {
            const response = await fetch(`${API_BASE_URL}/monthlySales`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching monthly sales:', error);
            throw error;
        }
    }
};