import api from '../utils/backendApi';

const CharacterService = {
    // ==========================================
    // SECCIÓN: PLANTILLAS (Templates)
    // ==========================================

    /**
     * Obtener las plantillas asociadas a una campaña específica
     * @param {number|string} campaignId 
     */
    getCampaignTemplates: async (campaignId) => {
        try {
            const response = await api.get(`/rolesync/campaigns/${campaignId}/templates`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching templates for campaign ${campaignId}:`, error);
            throw error;
        }
    },

    /**
     * Obtener el detalle de una plantilla por ID
     * @param {number|string} templateId 
     */
    getTemplateById: async (templateId) => {
        try {
            const response = await api.get(`/rolesync/templates/${templateId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching template ${templateId}:`, error);
            throw error;
        }
    },

    /**
     * Crear una nueva plantilla para una campaña
     * @param {Object} templateData - Debe coincidir con CharacterSheetInPostDTO
     */
    createTemplate: async (templateData) => {
        try {
            // El DTO espera: name, avatar_url, campaign_id, template_id (null aquí), attributes (array de objetos)
            const response = await api.post('/rolesync/templates', templateData);
            return response.data;
        } catch (error) {
            console.error("Error creating template:", error);
            throw error;
        }
    },

    /**
     * Actualizar una plantilla
     * @param {number|string} templateId 
     * @param {Object} templateData 
     */
    updateTemplate: async (templateId, templateData) => {
        try {
            const response = await api.put(`/rolesync/templates/${templateId}`, templateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating template ${templateId}:`, error);
            throw error;
        }
    },

    
    // ==========================================
    // SECCIÓN: PERSONAJES (Characters)
    // ==========================================

    /**
     * Obtener todos los personajes públicos
     */
    getAllCharacters: async () => {
        try {
            const response = await api.get('/rolesync/characters');
            return response.data;
        } catch (error) {
            console.error("Error fetching all characters:", error);
            throw error;
        }
    },

    /**
     * Obtener mis personajes (los de mi usuario/perfil activo)
     */
    getMyCharacters: async () => {
        try {
            const response = await api.get('/rolesync/characters/me');
            return response.data;
        } catch (error) {
            console.error("Error fetching my characters:", error);
            throw error;
        }
    },

    /**
     * Obtener los personajes de una campaña específica
     * @param {number|string} campaignId 
     */
    getCampaignCharacters: async (campaignId) => {
        try {
            const response = await api.get(`/rolesync/campaigns/${campaignId}/characters`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching characters for campaign ${campaignId}:`, error);
            throw error;
        }
    },

    /**
     * Obtener el detalle de un personaje por ID
     * @param {number|string} characterId 
     */
    getCharacterById: async (characterId) => {
        try {
            const response = await api.get(`/rolesync/characters/${characterId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching character ${characterId}:`, error);
            throw error;
        }
    },

    /**
     * Crear un nuevo personaje (Libre o basado en plantilla)
     * @param {Object} characterData - Debe coincidir con CharacterSheetInPostDTO
     */
    createCharacter: async (characterData) => {
        try {
            const response = await api.post('/rolesync/characters', characterData);
            return response.data;
        } catch (error) {
            console.error("Error creating character:", error);
            throw error;
        }
    },

    /**
     * Actualizar un personaje
     * @param {number|string} characterId 
     * @param {Object} characterData 
     */
    updateCharacter: async (characterId, characterData) => {
        try {
            const response = await api.put(`/rolesync/characters/${characterId}`, characterData);
            return response.data;
        } catch (error) {
            console.error(`Error updating character ${characterId}:`, error);
            throw error;
        }
    }
};

export default CharacterService;