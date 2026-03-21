import api from '../utils/backendApi';

const profileService = {
    // Obtener datos del perfil actual
    getProfile: async (roleType) => {
        try {
            const response = await api.get(`/rolesync/profile/${roleType}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching profile:", error);
            throw error;
        }
    },

    // Actualizar datos del perfil
    updateProfile: async (roleType, profileData) => {
        try {
            const response = await api.put(`/rolesync/profile/${roleType}`, profileData);
            return response.data;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },

    // Crear un nuevo perfil
    createProfile: async (roleType, profileData) => {
        try {
            const response = await api.post(`/rolesync/profile/${roleType}`, profileData);
            return response.data;
        } catch (error) {
            console.error("Error creating profile:", error);
            throw error;
        }
    },

    // Obtener datos detallados de la cuenta (User + todos sus perfiles)
    getUserInfo: async () => {
        try {
            const response = await api.get('/rolesync/user');
            return response.data;
        } catch (error) {
            console.error("Error fetching user info:", error);
            throw error;
        }
    }
};

export default profileService;