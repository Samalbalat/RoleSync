import api from '../utils/backendApi';

const AuthService = {
    login: async (email, password) => {
        const response = await api.post('/rolesync/auth/login', { email, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/rolesync/auth/register', userData);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/rolesync/auth/logout');
        return response.data;
    },

    checkSession: async () => {
        const response = await api.get('/rolesync/profile/me');
        return response.data;
    }
};

export default AuthService;