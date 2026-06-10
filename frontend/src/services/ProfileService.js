import api from '../utils/backendApi';

const profileService = {
    // Obtener datos del perfil actual
    getProfile: async (roleType) => {
        const response = await api.get(`/rolesync/profile/${roleType}`);
        return response.data;
    },

    // Actualizar datos del perfil
    updateProfile: async (roleType, profileData) => {
        const response = await api.put(`/rolesync/profile/${roleType}`, profileData);
        return response.data;
        
    },

    // Crear un nuevo perfil
    createProfile: async (roleType, profileData) => {
        const response = await api.post(`/rolesync/profile/${roleType}`, profileData);
        return response.data;
       
    },

    // Obtener datos detallados de la cuenta (User + todos sus perfiles)
    getUserInfo: async () => {
        const response = await api.get('/rolesync/user');
        return response.data;
        
    },

    // Obtener los datos de un perfil segun su profilename
    getProfileByName: async (roleType, profileName) => {
        const response = await api.get(`/rolesync/profile/${roleType}/${profileName}`);
        return response.data;
        
    },

    // Actualizar datos de la cuenta (email, timeZone, password)
    // updateUserInfo: async (userData) => {
    //     
    //         // userData debe contener { email, timeZone, password }
    //         const response = await api.put('/rolesync/user', userData);
    //         return response.data;
    //     
    // }
};

export default profileService;