import api from '../utils/backendApi';

const ReviewService = {

    /**
     * Obtener el listado de reviews
     * @param {string} type - 'CAMPAIGN' o 'PROFILE'
     * @param {number} targetId - ID numérico del objetivo
     */
    getReviews: async (type, targetId) => {
        try {
            const params = { type, targetId };
            const response = await api.get('/rolesync/reviews', { params });
            return response.data;
        } catch (error) {
            console.error(`Error fetching reviews for ${type} ${targetId}:`, error);
            throw error;
        }
    },

    /**
     * Crear una nueva reseña
     * @param {Object} reviewData - { targetType, targetId, rating, comment }
     */
    createReview: async (reviewData) => {
        try {
            
            const response = await api.post('/rolesync/reviews', reviewData);
            return response.data;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    },

    /**
     * Obtener el resumen (nota media y total)
     * @param {string} type - 'CAMPAIGN' o 'PROFILE'
     * @param {number} targetId - ID numérico del objetivo
     */
    getReviewSummary: async (type, targetId) => {
        try {
            const params = { type, targetId };
            const response = await api.get('/rolesync/reviews/summary', { params });
            return response.data; // Devuelve { averageRating, totalReviews }
        } catch (error) {
            console.error(`Error fetching summary for ${type} ${targetId}:`, error);
            throw error;
        }
    }
};

export default ReviewService;