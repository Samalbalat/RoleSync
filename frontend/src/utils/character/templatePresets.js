export const TEMPLATE_PRESETS = {
    dnd5e: {
        name: 'Dungeons & Dragons 5e',
        schema: [
            { 
                key: 'hp_base_preset', 
                label: 'Puntos de Golpe (HP)', 
                type: 'number', 
                required: true 
            },
            { 
                key: 'str_preset', 
                label: 'Fuerza', 
                type: 'number', 
                min: 1, 
                max: 20, 
                required: true 
            },
            { 
                key: 'class_preset', 
                label: 'Clase', 
                type: 'short_text', 
                required: true 
            },
            { 
                key: 'background_preset', 
                label: 'Historia / Trasfondo', 
                type: 'long_text', 
                required: false 
            }
        ]
    },
    cthulhu7e: {
        name: 'La Llamada de Cthulhu 7ª Ed.',
        schema: [
            { 
                key: 'cordura_preset', 
                label: 'Cordura', 
                type: 'number', 
                min: 0, 
                max: 99, 
                required: true 
            },
            { 
                key: 'str_cthulhu_preset', 
                label: 'Fuerza (FUE)', 
                type: 'number', 
                min: 1, 
                max: 100, 
                required: true 
            },
            { 
                key: 'occupation_preset', 
                label: 'Profesión', 
                type: 'short_text', 
                required: true 
            },
            { 
                key: 'investigator_backstory_preset', 
                label: 'Trasfondo del Investigador', 
                type: 'long_text', 
                required: false 
            }
        ]
    }
};