import api from '../utils/backendApi';

// Función para obtener todas las campañas
export const getAllCampaigns = async () => {
    try {
        const response = await api.get('/campaigns');
        return response.data; 
    } catch (error) {
        console.error("Error al obtener campañas:", error);
        throw error; 
    }
};

// Función para obtener una campaña por ID
export const getCampaignById = async (id) => {
    try {
        const response = await api.get(`/campaigns/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener campaña ${id}:`, error);
        throw error;
    }
};