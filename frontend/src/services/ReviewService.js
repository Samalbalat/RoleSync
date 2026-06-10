import api from '../utils/backendApi';

const ReviewService = {

    /**
     * Obtener el listado de reviews
     * @param {string} type - 'CAMPAIGN' o 'PROFILE'
     * @param {number} targetId - ID numérico del objetivo
     */
    getReviews: async (type, targetId) => {
        const params = { type, targetId };
        const response = await api.get('/rolesync/reviews', { params });
        return response.data;
    },

    /**
     * Crear una nueva reseña
     * @param {Object} reviewData - { targetType, targetId, rating, comment }
     */
    createReview: async (reviewData) => {
        const response = await api.post('/rolesync/reviews', reviewData);
        return response.data;
    },

    /**
     * Obtener el resumen (nota media y total)
     * @param {string} type - 'CAMPAIGN' o 'PROFILE'
     * @param {number} targetId - ID numérico del objetivo
     */
    getReviewSummary: async (type, targetId) => {
        const params = { type, targetId };
        const response = await api.get('/rolesync/reviews/summary', { params });
        return response.data; // Devuelve { averageRating, totalReviews }
        
    }
};

export default ReviewService;