import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        // Aquí podrías añadir headers de autenticación en el futuro
    }
});

// Interceptor para inyectar el nombre del perfil activo en una cabecera
api.interceptors.request.use((config) => {
    const profileString = localStorage.getItem('activeProfile');
    if (profileString) {
        const { name } = JSON.parse(profileString);
        // Creamos una cabecera personalizada. Tu backend podría leerla con @RequestHeader("X-Profile-Name")
        config.headers['X-Profile-Name'] = name; 
    }
    return config;
});

export default api;