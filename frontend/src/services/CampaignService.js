import api from '../utils/backendApi';

const getActiveProfileType = () => {
    const profileString = localStorage.getItem('activeProfile');
    if (profileString) {
        const profileData = JSON.parse(profileString);
        return profileData.type; // Retornará 'TABLETOP' o 'WRITTEN'
    }
    throw new Error("No hay un perfil activo seleccionado");
};

const CampaignService = {
    /**
     *  Listar las campañas
     * @param {Object} filters - Objeto con los filtros opcionales (system, search, etc.)
     */
    getCampaigns: async (filters = {}) => {
        try {
            
            const activeType = getActiveProfileType();
            
            const params = { type: activeType, ...filters };

            const response = await api.get('/campaigns', { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            throw error;
        }
    },

    /**
     * Detalles de una campaña por ID
     * @param {number|string} id - El ID de la campaña
     */
    getCampaignById: async (id) => {
        try {
            const response = await api.get(`/campaigns/${id}`);
            return response.data; 
        } catch (error) {
            console.error(`Error fetching campaign with id ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crear una nueva campaña
     * @param {Object} campaignData - Datos del formulario
     */
    createCampaign: async (campaignData) => {
        try {
            const activeType = getActiveProfileType();
            
            const payload = { 
                ...campaignData, 
                type: activeType 
            };

            const response = await api.post('/campaigns', payload);
            return response.data;
        } catch (error) {
            console.error("Error creating campaign:", error);
            throw error;
        }
    },

    /**
     * Actualizar una campaña existente
     * @param {number|string} id - El ID de la campaña
     * @param {Object} campaignData - Datos actualizados del formulario
     */
    updateCampaign: async (id, campaignData) => {
        try {
            const activeType = getActiveProfileType();
            
            const payload = { 
                ...campaignData, 
                type: activeType,
                maxPlayers: Number.parseInt(campaignData.maxPlayers, 10) || 0,
            };

            const response = await api.put(`/campaigns/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Error updating campaign with id ${id}:`, error);
            throw error;
        }
    }
};


export default CampaignService;