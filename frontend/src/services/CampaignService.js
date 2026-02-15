import api from '../utils/backendApi';

// Función para obtener todas las campañas
export const getAllCampaigns = async () => {
    try {
        const response = await api.get('/campaigns');
        return response.data; 
    } catch (error) {
        console.error("Error al obtener campañas:", error);
        throw error; 
    }
};

// Función para obtener una campaña por ID
export const getCampaignById = async (id) => {
    try {
        const response = await api.get(`/campaigns/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener campaña ${id}:`, error);
        throw error;
    }
};

import { mockCampaigns } from '../data/mockCampaigns';

export const searchCampaignsInBackend = (filters) => {
    return new Promise((resolve) => {
        console.log("Servicio: Iniciando búsqueda con filtros:", filters);

        // Simulamos retardo de red
        setTimeout(() => {
            try {
                // Validación de seguridad: Si no hay datos, devolvemos array vacío
                if (!mockCampaigns || !Array.isArray(mockCampaigns)) {
                    console.error("Servicio Error: mockCampaigns no se ha cargado correctamente.");
                    resolve([]);
                    return;
                }

                const { name, type, system, language, timeZone, theme, location, schedule, duration } = filters;

                const filtered = mockCampaigns.filter(c => {
                    if (!c) return false; // Protección contra objetos nulos

                    // Helpers seguros (Safe navigation)
                    const matchesText = (field, val) => 
                        !val || (field && field.toLowerCase().includes(val.toLowerCase()));
                    
                    const matchesExact = (field, val) => 
                        !val || field === val;
                    
                    const matchesTags = (tags, val) => {
                        if (!val || val.length === 0) return true; // Si no busco tags, pasa
                        if (!tags || !Array.isArray(tags)) return false; // Si la campaña no tiene tags, falla
                        // Buscamos si el string de búsqueda está en alguno de los tags
                        return tags.some(t => t.toLowerCase().includes(val.toLowerCase()));
                    };

                    // 1. Filtros Comunes
                    let match = 
                        matchesText(c.name, name) &&
                        matchesExact(c.type, type) &&
                        matchesExact(c.language, language) &&
                        matchesExact(c.timeZone, timeZone) &&
                        matchesTags(c.theme, theme);

                    // 2. Filtros específicos
                    if (match && type === 'TABLETOP') {
                        match = 
                            matchesExact(c.system, system) &&
                            matchesText(c.location, location) &&
                            matchesExact(c.schedule, schedule) &&
                            matchesExact(c.duration, duration);
                    }
                    
                    return match;
                });

                console.log(`Servicio: Encontrados ${filtered.length} resultados.`);
                resolve(filtered);

            } catch (error) {
                console.error("Servicio: Error crítico filtrando campañas:", error);
                // En caso de error, resolvemos con array vacío para quitar el spinner
                resolve([]); 
            }
        }, 600);
    });

};