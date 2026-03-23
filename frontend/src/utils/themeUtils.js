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
            primary: 'deep-purple', // Morado/Azul para narrativo
            secondary: 'indigo',
            bgLight: 'bg-purple-50',
            bgMiddle: 'bg-purple-100',
            bgDark: 'bg-purple-200',
            textPrimary: 'text-purple-900',
            textSecondary: 'text-purple-500',
            border: 'border-purple-500',
            lightborder: 'border-purple-300',
            buttonColor: 'deep-purple',
            badge: 'purple',
            banner: 'from-purple-700 to-deep-purple-900'
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
        border: 'border-red-500',
        lightborder: 'border-red-300',
        buttonColor: 'red',
        badge: 'red',
        banner: 'from-red-700 to-red-900'
    };
    
};