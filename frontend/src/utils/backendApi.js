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

// Interceptor de respuestas para manejar el JWT expirado
// api.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//             console.error('El token ha caducado o es inválido. Cerrando sesión...');
            
//             localStorage.clear();
            
//             window.location.href = '/login'; 
//         }
        
//         return Promise.reject(error);
//     }
// );

export default api;