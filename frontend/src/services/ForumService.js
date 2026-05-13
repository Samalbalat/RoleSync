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
        const params = { page, limit };
        if (search) params.search = search;
        if (tags) params.tags = tags;

        const response = await api.get('/forums/posts', { params });
        return response.data;
    },

    /**
     * Obtener el detalle de un hilo principal (post padre) del foro general
     * @param {number|string} postId 
     */
    getGeneralThreadDetail: async (postId) => {
        const response = await api.get(`/forums/posts/${postId}`);
        return response.data;
    },

    /**
     * Crear un nuevo hilo (post principal) en el foro general
     * @param {Object} threadData - { title, tags, content, mediaUrls }
     */
    createGeneralThread: async (threadData) => {
        const response = await api.post('/forums/posts', threadData);
        return response.data;
    },

    /**
     * Obtener los hilos creados por el usuario actual
     * @param {number} page - Página actual
     * @param {number} limit - Cantidad por página
     */
    getMyThreads: async (page = 1, limit = 20) => {
        const params = { page, limit };
        // Según indicas, el endpoint es /forums/myPosts
        const response = await api.get('/forums/myPosts', { params });
        return response.data;

    },

    /**
     * Crear una respuesta a un hilo en el foro general
     * @param {Object} replyData - { type, title, parentPostId, content, mediaUrls, tags }
     */
    createGeneralReply: async (replyData) => {
        const response = await api.post('/forums/posts', replyData);
        return response.data;

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
        const response = await api.post(`/campaigns/${campaignId}/posts`, postData);
        return response.data;
    },

    /**
     * Obtener la Timeline de la campaña (Paginación por cursor)
     * @param {number|string} campaignId 
     * @param {string|null} cursor - Fecha/Timestamp del último post cargado
     * @param {number} limit - Cantidad de posts a traer
     */
    getTimeline: async (campaignId, cursor = null, limit = 20) => {

        const params = { limit };
        if (cursor) params.cursor = cursor;
            
        const response = await api.get(`/campaigns/${campaignId}/posts`, { params });
        return response.data;

    },

    /**
     * Pinnear un post en la campaña
     * @param {number|string} postId 
     * @param {boolean} isPinned
     */
    pinPost: async (postId, isPinned) => {
        const response = await api.put(`/post/${postId}/pin`, { isPinned });
        return response.data;
    },

    /**
     * Bloquear un post en la campaña
     * @param {number|string} postId 
     * @param {boolean} isLocked
     */
    lockPost: async (postId, isLocked) => {
        const response = await api.put(`/post/${postId}/lock`, { isLocked });
        return response.data;
        
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
        const params = { limit };
        if (cursor) params.cursor = cursor;

        const response = await api.get(`/posts/${postId}/replies`, { params });
        return response.data;
        
    },

    /**
     * Actualizar el contenido de un post (o título/tags si es el hilo principal)
     * @param {number|string} postId 
     * @param {Object} updateData 
     */
    updatePost: async (postId, updateData) => {
        const response = await api.put(`/posts/${postId}`, updateData);
        return response.data;
    },

    /**
     * Moderar un post (Bloquear hilo o Fijarlo)
     * @param {number|string} postId 
     * @param {Object} moderationData - { isPinned, isLocked }
     */
    moderatePost: async (postId, moderationData) => {
        const response = await api.patch(`/posts/${postId}/moderate`, moderationData);
        return response.data;
        
    },

    /**
     * Eliminar un post (Soft delete)
     * @param {number|string} postId 
     */
    deletePost: async (postId) => {
        const response = await api.delete(`/posts/${postId}`);
        return response.data;
    }
};

export default ForumService;