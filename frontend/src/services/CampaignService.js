import { mockCampaigns } from '../data/mockCampaigns';

// --- 1. BUSCADOR (FILTROS) ---
export const searchCampaignsInBackend = (filters) => {
    return new Promise((resolve) => {
        console.log("Servicio: Iniciando búsqueda con filtros:", filters);

        setTimeout(() => {
            try {
                if (!mockCampaigns || !Array.isArray(mockCampaigns)) {
                    console.error("Servicio Error: mockCampaigns no cargado.");
                    resolve([]);
                    return;
                }

                if (!filters) {
                    resolve(mockCampaigns);
                    return;
                }

                const { name, type, system, language, timeZone, theme, location, schedule, duration } = filters;

                const filtered = mockCampaigns.filter(c => {
                    if (!c) return false;

                    const matchesText = (field, val) => !val || (field && field.toLowerCase().includes(val.toLowerCase()));
                    const matchesExact = (field, val) => !val || field === val;
                    const matchesTags = (tags, val) => {
                        if (!val || val.length === 0) return true;
                        if (!tags || !Array.isArray(tags)) return false;
                        return tags.some(t => t.toLowerCase().includes(val.toLowerCase()));
                    };

                    // Filtros Comunes
                    let match = 
                        matchesText(c.name, name) &&
                        matchesExact(c.type, type) &&
                        matchesExact(c.language, language) &&
                        matchesExact(c.timeZone, timeZone) &&
                        matchesTags(c.theme, theme);

                    // Filtros específicos de TABLETOP
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
                console.error("Servicio: Error crítico filtrando:", error);
                resolve([]); 
            }
        }, 600);
    });
};

// --- 2. OBTENER UNA CAMPAÑA POR ID (Corrección Clave) ---
// Antes usabas api.get, ahora usamos mockCampaigns.find
export const getCampaignById = (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Aseguramos que id sea número porque viene como string del URL
            const campaign = mockCampaigns.find(c => c.id === parseInt(id));
            
            if (campaign) {
                console.log("Campaña encontrada:", campaign);
                resolve(campaign);
            } else {
                console.error("Campaña no encontrada ID:", id);
                reject(new Error("Campaña no encontrada"));
            }
        }, 500);
    });
};

// --- 3. CREAR CAMPAÑA (Mock) ---
export const createCampaign = async (campaignData) => {
    const storedProfile = localStorage.getItem('activeProfile');
    let profileData = { name: 'Unknown', type: 'TABLETOP' };
    
    if (storedProfile) {
        try { profileData = JSON.parse(storedProfile); } catch (e) { console.error('Error parsing activeProfile', e); }
    }
    
    const payload = {
        ...campaignData,
        type: profileData.type, 
        profileName: profileData.name 
    };

    console.log("Simulando creación:", payload);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulamos que el backend devuelve un ID nuevo
            const newId = Math.floor(Math.random() * 10000) + 100;
            const newCampaign = { id: newId, ...payload, currentPlayers: 0 };
            
            // Opcional: Si quieres que aparezca en la lista temporalmente sin recargar navegador
            // mockCampaigns.push(newCampaign); 
            
            resolve({ success: true, ...newCampaign });
        }, 1000);
    });
};

// --- 4. ACTUALIZAR CAMPAÑA (Mock) ---
export const updateCampaign = (id, updatedData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Simulando actualización ID ${id} con:`, updatedData);
            
            // En un mock real en memoria, actualizaríamos el array:
            // const index = mockCampaigns.findIndex(c => c.id === parseInt(id));
            // if (index !== -1) mockCampaigns[index] = { ...mockCampaigns[index], ...updatedData };

            resolve({ success: true, id, ...updatedData });
        }, 800);
    });
};

// --- 5. OBTENER TODAS (Mock simple) ---
export const getAllCampaigns = async () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockCampaigns), 500);
    });
};