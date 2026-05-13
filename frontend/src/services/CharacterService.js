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
        const response = await api.get(`/rolesync/campaigns/${campaignId}/templates`);
        return response.data;
    },

    /**
     * Obtener el detalle de una plantilla por ID
     * @param {number|string} templateId 
     */
    getTemplateById: async (templateId) => {
        const response = await api.get(`/rolesync/templates/${templateId}`);
        return response.data;
    },

    /**
     * Crear una nueva plantilla para una campaña
     * @param {Object} templateData - Debe coincidir con CharacterSheetInPostDTO
     */
    createTemplate: async (templateData) => {
        // El DTO espera: name, avatar_url, campaign_id, template_id (null aquí), attributes (array de objetos)
        const response = await api.post('/rolesync/templates', templateData);
        return response.data;
    },

    /**
     * Actualizar una plantilla
     * @param {number|string} templateId 
     * @param {Object} templateData 
     */
    updateTemplate: async (templateId, templateData) => {
        const response = await api.put(`/rolesync/templates/${templateId}`, templateData);
        return response.data;
    },

    /**
     * Obtener mis plantillas(los de mi usuario/perfil activo)
     */
    getMyTemplates: async () => {
        const response = await api.get('/rolesync/templates/me');
        return response.data;
    },

    
    // ==========================================
    // SECCIÓN: PERSONAJES (Characters)
    // ==========================================

    /**
     * Obtener todos los personajes públicos
     */
    getAllCharacters: async () => {
            const response = await api.get('/rolesync/characters');
            return response.data;
    },

    /**
     * Obtener mis personajes (los de mi usuario/perfil activo)
     */
    getMyCharacters: async () => {
        const response = await api.get('/rolesync/characters/me');
        return response.data;
    },

    /**
     * Obtener los personajes de una campaña específica
     * @param {number|string} campaignId 
     */
    getCampaignCharacters: async (campaignId) => {
        const response = await api.get(`/rolesync/campaigns/${campaignId}/characters`);
        return response.data;
    },

    /**
     * Obtener el detalle de un personaje por ID
     * @param {number|string} characterId 
     */
    getCharacterById: async (characterId) => {
        const response = await api.get(`/rolesync/characters/${characterId}`);
        return response.data;
    },

    /**
     * Crear un nuevo personaje (Libre o basado en plantilla)
     * @param {Object} characterData - Debe coincidir con CharacterSheetInPostDTO
     */
    createCharacter: async (characterData) => {
        const response = await api.post('/rolesync/characters', characterData);
        return response.data;
    },

    /**
     * Actualizar un personaje
     * @param {number|string} characterId 
     * @param {Object} characterData 
     */
    updateCharacter: async (characterId, characterData) => {
        const response = await api.put(`/rolesync/characters/${characterId}`, characterData);
        return response.data;
    }
};

export default CharacterService;