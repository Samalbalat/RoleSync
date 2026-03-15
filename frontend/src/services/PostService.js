import api from '../utils/backendApi';

const PostService = {
    // ==========================================
    // SECCIÓN: POSTS (Hilos y Respuestas)
    // ==========================================

    /**
     * Crear un nuevo post (Inicio de hilo o respuesta si lleva parentPostId)
     * @param {number|string} campaignId 
     * @param {Object} postData 
     */
    createPost: async (campaignId, postData) => {
        try {
            const response = await api.post(`/api/campaigns/${campaignId}/posts`, postData);
            return response.data;
        } catch (error) {
            console.error(`Error creating post for campaign ${campaignId}:`, error);
            throw error;
        }
    },

    /**
     * Obtener la Timeline de la campaña (Paginación por cursor)
     * @param {number|string} campaignId 
     * @param {string|null} cursor - Fecha/Timestamp del último post cargado
     * @param {number} limit - Cantidad de posts a traer
     */
    getTimeline: async (campaignId, cursor = null, limit = 20) => {
        try {
            const params = { limit };
            if (cursor) params.cursor = cursor;
            
            const response = await api.get(`/api/campaigns/${campaignId}/posts`, { params });
            return response.data;
        } catch (error) {
            console.error(`Error fetching timeline for campaign ${campaignId}:`, error);
            throw error;
        }
    },

    /**
     * Obtener los mensajes de un hilo para la vista de Dialog "Chat"
     * @param {number|string} postId - ID del post padre
     * @param {string|null} cursor 
     * @param {number} limit 
     */
    getReplies: async (postId, cursor = null, limit = 20) => {
        try {
            const params = { limit };
            if (cursor) params.cursor = cursor;

            const response = await api.get(`/api/posts/${postId}/replies`, { params });
            return response.data;
        } catch (error) {
            console.error(`Error fetching replies for post ${postId}:`, error);
            throw error;
        }
    },

    /**
     * Actualizar el contenido de un post
     * @param {number|string} postId 
     * @param {Object} updateData 
     */
    updatePost: async (postId, updateData) => {
        try {
            const response = await api.put(`/api/posts/${postId}`, updateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating post ${postId}:`, error);
            throw error;
        }
    },

    /**
     * Moderar un post (Solo DM: Bloquear hilo o Fijarlo)
     * @param {number|string} postId 
     * @param {Object} moderationData - { isPinned, isLocked }
     */
    moderatePost: async (postId, moderationData) => {
        try {
            const response = await api.patch(`/api/posts/${postId}/moderate`, moderationData);
            return response.data;
        } catch (error) {
            console.error(`Error moderating post ${postId}:`, error);
            throw error;
        }
    },

    /**
     * Eliminar un post (Soft delete recomendado en backend)
     * @param {number|string} postId 
     */
    deletePost: async (postId) => {
        try {
            const response = await api.delete(`/api/posts/${postId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting post ${postId}:`, error);
            throw error;
        }
    }
};

export default PostService;