import api from '../utils/backendApi';

const getActiveProfileType = () => {
    const profileString = localStorage.getItem('activeProfile');
    if (profileString) {
        const profileData = JSON.parse(profileString);
        return profileData.type; 
    }
    throw new Error("No hay un perfil activo seleccionado");
};

const CampaignService = {
    // ---------------------------------------------------------
    // BÚSQUEDA Y DETALLES BÁSICOS
    // ---------------------------------------------------------
    
    getCampaigns: async (filters = {}) => {
        const activeType = getActiveProfileType();
        const params = { type: activeType, ...filters };
        const response = await api.get('/campaigns', { params });
        return response.data;
    },

    getCampaignById: async (id) => {
        const response = await api.get(`/campaigns/${id}`);
        return response.data; 
    },

    getMyCampaigns: async () => {
        const response = await api.get('/campaigns/me');
        return response.data;
    },

    // ---------------------------------------------------------
    // CREACIÓN Y EDICIÓN DE CAMPAÑAS
    // ---------------------------------------------------------

    createCampaign: async (campaignData) => {
        const activeType = getActiveProfileType();
        const payload = { ...campaignData, type: activeType };
        const response = await api.post('/campaigns', payload);
        return response.data;
    },

    updateCampaign: async (id, campaignData) => {
        const activeType = getActiveProfileType();
        const payload = { 
            ...campaignData, 
            type: activeType,
            maxPlayers: Number.parseInt(campaignData.maxPlayers, 10) || 0,
        };
        const response = await api.put(`/campaigns/${id}`, payload);
        return response.data;
    },

    changeCampaignStatus: async (id, status) => {
        const response = await api.put(`/campaigns/${id}/status`, { status });
        return response.data;
    },

    deleteCampaign: async (id) => {
        const response = await api.delete(`/campaigns/${id}`);
        return response.data;

    },

    // ---------------------------------------------------------
    // GESTIÓN DE SOLICITUDES Y MIEMBROS
    // ---------------------------------------------------------

    applyToCampaign: async (id, message) => {
        const response = await api.post(`/campaigns/${id}/join`, { message });
        return response.data;
    },

    getCampaignRequests: async (id) => {
        const response = await api.get(`/campaigns/${id}/requests`);
        return response.data;
    },

    updateRequestStatus: async (id, profileName, status, message) => {
        // status debe ser 'ACCEPTED' o 'REJECTED' según el backend
        const response = await api.put(`/campaigns/${id}/requests`, { profileName, status, message });
        return response.data;
    },

    getCampaignParticipants: async (id) => {
        const response = await api.get(`/campaigns/${id}/participants`);
        return response.data;

    },

    kickMember: async (id, profileName) => {
        const response = await api.put(`/campaigns/${id}/kick`, { profileName });
        return response.data;
    }
};

export default CampaignService;