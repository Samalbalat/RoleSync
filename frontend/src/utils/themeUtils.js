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
            bgMiddle: 'bg-indigo-100',
            bgDark: 'bg-indigo-200',
            textPrimary: 'text-indigo-900',
            textSecondary: 'text-indigo-500',
            border: 'border-t-indigo-500',
            lightborder: 'border-indigo-300',
            buttonColor: 'indigo',
            badge: 'purple'
        };
    } 
    
    return {
        primary: 'red', // Rojo para mesa (D&D vibes)
        secondary: 'orange',
        bgLight: 'bg-red-50',
        bgMiddle: 'bg-red-100',
        bgDark: 'bg-red-200',
        textPrimary: 'text-red-900',
        textSecondary: 'text-red-500',
        border: 'border-t-red-500',
        lightborder: 'border-red-300',
        buttonColor: 'red',
        badge: 'red'
    };
    
};