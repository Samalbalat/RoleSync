import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// 1. Interceptor de peticiones (El que ya tenías)
api.interceptors.request.use((config) => {
    const profileString = localStorage.getItem('activeProfile');
    if (profileString) {
        try {
            const { name } = JSON.parse(profileString);
            config.headers['X-Profile-Name'] = name; 
        } catch (e) {
            console.error("Error parsing activeProfile from localStorage", e);
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response, 
    (error) => {
        // Log genérico de errores (Sustituye a los console.error de tus servicios)
        const status = error.response ? error.response.status : 'Network Error';
        const method = error.config ? error.config.method.toUpperCase() : '';
        const url = error.config ? error.config.url : '';
        
        console.error(`[API Error] ${method} ${url} | Status: ${status}`);

        // // Manejo de sesión expirada
        // if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        //     console.warn('Sesión inválida. Limpiando datos y redirigiendo...');
        //     localStorage.clear();
        //     // Evitamos redirecciones infinitas si ya estamos en el login
        //     if (window.location.pathname !== '/login') {
        //         window.location.href = '/login'; 
        //     }
        // }
        
        // Es vital devolver Promise.reject(error) para que los componentes
        // que REALMENTE necesiten manejar un error específico puedan hacerlo.
        return Promise.reject(error);
    }
);

export default api;