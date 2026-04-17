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

    getCampaignById: async (id) => {
        try {
            const response = await api.get(`/campaigns/${id}`);
            return response.data; 
        } catch (error) {
            console.error(`Error fetching campaign with id ${id}:`, error);
            throw error;
        }
    },

    getMyCampaigns: async () => {
        try {
            const response = await api.get('/campaigns/me');
            return response.data;
        } catch (error) {
            console.error("Error fetching my campaigns:", error);
            throw error;
        }
    },

    // ---------------------------------------------------------
    // CREACIÓN Y EDICIÓN DE CAMPAÑAS
    // ---------------------------------------------------------

    createCampaign: async (campaignData) => {
        try {
            const activeType = getActiveProfileType();
            const payload = { ...campaignData, type: activeType };
            const response = await api.post('/campaigns', payload);
            return response.data;
        } catch (error) {
            console.error("Error creating campaign:", error);
            throw error;
        }
    },

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
    },

    changeCampaignStatus: async (id, status) => {
        try {
            const response = await api.put(`/campaigns/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error(`Error changing status for campaign ${id}:`, error);
            throw error;
        }
    },

    deleteCampaign: async (id) => {
        try {
            const response = await api.delete(`/campaigns/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting campaign ${id}:`, error);
            throw error;
        }
    },

    // ---------------------------------------------------------
    // GESTIÓN DE SOLICITUDES Y MIEMBROS
    // ---------------------------------------------------------

    applyToCampaign: async (id, message) => {
        try {
            const response = await api.post(`/campaigns/${id}/join`, { message });
            return response.data;
        } catch (error) {
            console.error(`Error applying to campaign ${id}:`, error);
            throw error;
        }
    },

    getCampaignRequests: async (id) => {
        try {
            const response = await api.get(`/campaigns/${id}/requests`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching requests for campaign ${id}:`, error);
            throw error;
        }
    },

    updateRequestStatus: async (id, profileName, status, message) => {
        try {
            // status debe ser 'ACCEPTED' o 'REJECTED' según el backend
            const response = await api.put(`/campaigns/${id}/requests`, { profileName, status, message });
            return response.data;
        } catch (error) {
            console.error(`Error updating request status for profile ${profileName}:`, error);
            throw error;
        }
    },

    getCampaignParticipants: async (id) => {
        try {
            const response = await api.get(`/campaigns/${id}/participants`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching participants for campaign ${id}:`, error);
            throw error;
        }
    },

    kickMember: async (id, profileName) => {
        try {
            const response = await api.put(`/campaigns/${id}/kick`, { profileName });
            return response.data;
        } catch (error) {
            console.error(`Error kicking member ${profileName} from campaign ${id}:`, error);
            throw error;
        }
    }
};

export default CampaignService;