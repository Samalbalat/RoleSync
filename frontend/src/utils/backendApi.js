import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    headers: {
        'Content-Type': 'application/json',
        // Aquí podrías añadir headers de autenticación en el futuro
    }
});

export default api;