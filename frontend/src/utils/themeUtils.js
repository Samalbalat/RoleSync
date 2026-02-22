export const getTheme = () => {
    const storedProfile = localStorage.getItem('activeProfile');
    let type = 'TABLETOP'; 

    if (storedProfile) {
        try {
            const parsed = JSON.parse(storedProfile);
            if (parsed.type === 'WRITTEN') {
                type = 'WRITTEN';
            }
        } catch (e) {
            console.error("Error leyendo perfil", e);
        }
    }

    if (type === 'WRITTEN') {
        return {
            primary: 'indigo', // Morado/Azul para narrativo
            secondary: 'blue',
            bgLight: 'bg-indigo-50',
            textPrimary: 'text-indigo-900',
            textSecondary: 'text-indigo-500',
            border: 'border-t-indigo-500',
            buttonColor: 'indigo',
            badge: 'purple'
        };
    } 
    
    return {
        primary: 'red', // Rojo para mesa (D&D vibes)
        secondary: 'orange',
        bgLight: 'bg-red-50',
        textPrimary: 'text-red-900',
        textSecondary: 'text-red-500',
        border: 'border-t-red-500',
        buttonColor: 'red',
        badge: 'red'
    };
    
};