import api from '../utils/backendApi';

const ForumService = {
    // ==========================================
    // SECCIÓN A: FORO GENERAL (Comunidad)
    // ==========================================

    /**
     * Obtener el listado de hilos del foro general (estilo Reddit)
     * @param {number} page - Página actual
     * @param {number} limit - Cantidad por página
     * @param {string} search - Término de búsqueda (opcional)
     * @param {string} tags - Tags separados por coma (opcional)
     */
    getGeneralThreads: async (page = 1, limit = 20, search = '', tags = '') => {
        try {
            const params = { page, limit };
            if (search) params.search = search;
            if (tags) params.tags = tags;

            const response = await api.get('/forums/posts', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching general threads:', error);
            throw error;
        }
    },

    /**
     * Obtener el detalle de un hilo principal (post padre) del foro general
     * @param {number|string} postId 
     */
    getGeneralThreadDetail: async (postId) => {
        try {
            const response = await api.get(`/forums/posts/${postId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching thread detail for post ${postId}:`, error);
            throw error;
        }
    },

    /**
     * Crear un nuevo hilo (post principal) en el foro general
     * @param {Object} threadData - { title, tags, content, mediaUrls }
     */
    createGeneralThread: async (threadData) => {
        try {
            const response = await api.post('/forums/posts', threadData);
            return response.data;
        } catch (error) {
            console.error('Error creating general thread:', error);
            throw error;
        }
    },

    /**
     * Obtener los hilos creados por el usuario actual
     * @param {number} page - Página actual
     * @param {number} limit - Cantidad por página
     */
    getMyThreads: async (page = 1, limit = 20) => {
        try {
            const params = { page, limit };
            // Según indicas, el endpoint es /forums/myPosts
            const response = await api.get('/forums/myPosts', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching my threads:', error);
            throw error;
        }
    },

    /**
     * Crear una respuesta a un hilo en el foro general
     * @param {Object} replyData - { type, title, parentPostId, content, mediaUrls, tags }
     */
    createGeneralReply: async (replyData) => {
        try {
            const response = await api.post('/forums/posts', replyData);
            return response.data;
        } catch (error) {
            console.error('Error creating general reply:', error);
            throw error;
        }
    },

    // ==========================================
    // SECCIÓN B: CAMPAÑAS (Rol y Foro Interno)
    // ==========================================

    /**
     * Crear un nuevo post (Inicio de hilo o respuesta si lleva parentPostId)
     * @param {number|string} campaignId 
     * @param {Object} postData 
     */
    createPost: async (campaignId, postData) => {
        try {
            const response = await api.post(`/campaigns/${campaignId}/posts`, postData);
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
            
            const response = await api.get(`/campaigns/${campaignId}/posts`, { params });
            return response.data;
        } catch (error) {
            console.error(`Error fetching timeline for campaign ${campaignId}:`, error);
            throw error;
        }
    },

    /**
     * Pinnear un post en la campaña
     * @param {number|string} postId 
     * @param {boolean} isPinned
     */
    pinPost: async (postId, isPinned) => {
        try {
            const response = await api.put(`/post/${postId}/pin`, { isPinned });
            return response.data;
        } catch (error) {
            console.error(`Error pinning post ${postId}:`, error);
            throw error;
        }
    },

    /**
     * Bloquear un post en la campaña
     * @param {number|string} postId 
     * @param {boolean} isLocked
     */
    lockPost: async (postId, isLocked) => {
        try {
            const response = await api.put(`/post/${postId}/lock`, { isLocked });
            return response.data;
        } catch (error) {
            console.error(`Error locking post ${postId}:`, error);
            throw error;
        }
    },

    // ==========================================
    // SECCIÓN C: ENDPOINTS COMPARTIDOS (Interacciones con Posts)
    // ==========================================
    // Estos sirven tanto para la campaña como para el foro general

    /**
     * Obtener las respuestas de un hilo (ya sea un hilo de campaña o del foro general)
     * @param {number|string} postId - ID del post padre
     * @param {string|null} cursor 
     * @param {number} limit 
     */
    getReplies: async (postId, cursor = null, limit = 20) => {
        try {
            const params = { limit };
            if (cursor) params.cursor = cursor;

            const response = await api.get(`/posts/${postId}/replies`, { params });
            return response.data;
        } catch (error) {
            console.error(`Error fetching replies for post ${postId}:`, error);
            throw error;
        }
    },

    /**
     * Actualizar el contenido de un post (o título/tags si es el hilo principal)
     * @param {number|string} postId 
     * @param {Object} updateData 
     */
    updatePost: async (postId, updateData) => {
        try {
            const response = await api.put(`/posts/${postId}`, updateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating post ${postId}:`, error);
            throw error;
        }
    },

    /**
     * Moderar un post (Bloquear hilo o Fijarlo)
     * @param {number|string} postId 
     * @param {Object} moderationData - { isPinned, isLocked }
     */
    moderatePost: async (postId, moderationData) => {
        try {
            const response = await api.patch(`/posts/${postId}/moderate`, moderationData);
            return response.data;
        } catch (error) {
            console.error(`Error moderating post ${postId}:`, error);
            throw error;
        }
    },

    /**
     * Eliminar un post (Soft delete)
     * @param {number|string} postId 
     */
    deletePost: async (postId) => {
        try {
            const response = await api.delete(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting post ${postId}:`, error);
            throw error;
        }
    }
};

export default ForumService;