/**
 * Clients API
 * Maneja las peticiones HTTP relacionadas con clientes
 */

const API_BASE_URL =
    import.meta.env.PROD
        ? 'https://json-server-1-1uka.onrender.com'
        : import.meta.env.VITE_FULLTANK_API_URL;

export const ClientsApi = {
    /**
     * Obtiene todos los clientes
     */
    async getAllClients() {
        try {
            const response = await fetch(`${API_BASE_URL}/clients`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    },

    /**
     * Obtiene un cliente por ID
     */
    async getClientById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/clients/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching client ${id}:`, error);
            throw error;
        }
    },

    /**
     * Filtra clientes por sector
     */
    async getClientsBySector(sector) {
        try {
            const url = sector && sector !== 'ALL'
                ? `${API_BASE_URL}/clients?sector=${sector}`
                : `${API_BASE_URL}/clients`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching clients by sector ${sector}:`, error);
            throw error;
        }
    }
};
