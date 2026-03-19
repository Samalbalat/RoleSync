export const mockPosts = [
    {
        id: "post-5",
        type: "THREAD_START",
        content: "> *«Aquel que ose perturbar el descanso de los Lamentos, encontrará su propia voz sumada al coro eternamente.»*\n\nRecordáis de pronto la vieja inscripción que leísteis en el libro de la biblioteca de la ciudad antes de partir.",
        authorProfileId: "prof-dm",
        authorCharacterId: null,
        authorCharacterName: "El loco",
        authorCharacterImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop",
        campaignId: "camp-1",
        parentPostId: null,
        createdAt: "2026-03-07T18:40:00Z",
        isOoc: false,
        isDm: true, // <--- AÑADIDO
        mediaUrls: [],
        isEdited: false,
        updatedAt: null,
        isPinned: false,
        isLocked: false,
        visibleToCharacterIds: []
    },
    {
        id: "post-6",
        type: "THREAD_START",
        content: "*(Te acercas a Mifo por la espalda y le deslizas 10 monedas de oro en el bolsillo sin que los demás lo vean. «Toma, por si tenemos que salir corriendo», le susurras).* ",
        authorProfileId: "prof-player3",
        authorCharacterId: "char-rogue",
        authorCharacterName: "El Pícaro",
        authorCharacterImage: "https://ui-avatars.com/api/?name=Rogue&background=ffe4e6&color=be123c",
        campaignId: "camp-1",
        parentPostId: null,
        createdAt: "2026-03-07T18:45:00Z",
        isOoc: false,
        isDm: false, // Jugador
        mediaUrls: [],
        isEdited: false,
        updatedAt: null,
        isPinned: false,
        isLocked: false,
        visibleToCharacterIds: ["char-mifo", "char-rogue"] // MENSAJE SECRETO
    },
    {
        id: "post-7",
        type: "THREAD_START",
        content: "¡Chicos! Recordad que hoy cambiamos la hora de la sesión, empezamos a las **19:00** en lugar de las 18:00. Id preparando las fichas y subiendo de nivel a los que les falte.",
        authorProfileId: "prof-dm",
        authorCharacterId: null,
        authorCharacterName: null, // Que salga por defecto "Dungeon Master"
        authorCharacterImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop",
        campaignId: "camp-1",
        parentPostId: null,
        createdAt: "2026-03-07T19:00:00Z",
        isOoc: true, // <--- OOC TRUE
        isDm: true,  // <--- Y DM TRUE = ¡MENSAJE AZUL!
        mediaUrls: [],
        isEdited: false,
        updatedAt: null,
        isPinned: false,
        isLocked: false,
        visibleToCharacterIds: []
    },
    {
        id: "post-3",
        type: "THREAD_START",
        content: "Chicos, perdonad que interrumpa. Me tengo que ir a cenar, luego sigo leyendo y pongo mi acción. ¡No matéis a nadie sin mí! 😂",
        authorProfileId: "prof-player2",
        authorCharacterId: "char-elara",
        authorCharacterName: "Elara",
        authorCharacterImage: "https://ui-avatars.com/api/?name=Elara&background=ffe4e6&color=be123c",
        campaignId: "camp-1",
        parentPostId: null,
        createdAt: "2026-03-07T18:15:00Z",
        isOoc: true, // FUERA DE ROL
        isDm: false, // Jugador
        mediaUrls: [],
        isEdited: false,
        updatedAt: null,
        isPinned: false,
        isLocked: false,
        visibleToCharacterIds: []
    },
    {
        id: "post-1",
        type: "THREAD_START",
        content: "La taberna huele a cerveza rancia y humo de leña. En la esquina más oscura, un extraño encapuchado levanta la vista hacia vosotros.\n\n**«Habéis tardado»**, murmura con una voz rasposa.",
        authorProfileId: "prof-dm",
        authorCharacterId: null, // Es el DM narrando
        authorCharacterName: "El loco",
        authorCharacterImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop",
        campaignId: "camp-1",
        parentPostId: null,
        createdAt: "2026-03-07T18:00:00Z",
        isOoc: false,
        isDm: true, // <--- AÑADIDO
        mediaUrls: [],
        isEdited: false,
        updatedAt: null,
        isPinned: false,
        isLocked: false,
        visibleToCharacterIds: [] // Público
    },
    {
        id: "post-2",
        type: "THREAD_START",
        content: "Mifo desenvaina sus dagas gemelas y da un paso al frente. \n\n*«No me fío de él»*, susurra al resto del grupo mientras mantiene la mirada fija en el encapuchado.",
        authorProfileId: "prof-player1",
        authorCharacterId: "char-mifo", 
        authorCharacterName: "Mifo",
        authorCharacterImage: "https://ui-avatars.com/api/?name=Mifo&background=ffe4e6&color=be123c",
        campaignId: "camp-1",
        parentPostId: null,
        createdAt: "2026-03-07T18:05:00Z",
        isOoc: false,
        isDm: false, // Jugador
        mediaUrls: [],
        isEdited: true,
        updatedAt: "2026-03-07T18:06:00Z",
        isPinned: false,
        isLocked: false,
        visibleToCharacterIds: []
    },
    {
        id: "post-4",
        type: "THREAD_START",
        content: "El extraño saca un mapa ajado de su túnica y lo desenrolla sobre la mesa astillada. \n\n**«Este es el camino hacia la Cripta de los Lamentos»**.",
        authorProfileId: "prof-dm",
        authorCharacterId: null,
        authorCharacterName: "El loco",
        authorCharacterImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop",
        campaignId: "camp-1",
        parentPostId: null,
        createdAt: "2026-03-07T18:30:00Z",
        isOoc: false,
        isDm: true, // <--- AÑADIDO
        mediaUrls: ["https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=800&auto=format&fit=crop"],
        isEdited: false,
        updatedAt: null,
        isPinned: true, // EL DM LO HA PINEADO
        isLocked: false,
        visibleToCharacterIds: []
    }
    
];

export const mockReplies = [
    {
        id: "reply-1",
        type: "REPLY",
        content: "Me acerco a la mesa y miro el mapa con desconfianza. ¿Qué nos garantiza que no es una trampa?",
        authorProfileId: "prof-player1",
        authorCharacterId: "char-mifo",
        authorCharacterName: "Mifo",
        authorCharacterImage: "https://ui-avatars.com/api/?name=Mifo&background=ffe4e6&color=be123c",
        campaignId: "camp-1",
        parentPostId: "post-4", // Es respuesta al post del mapa
        createdAt: "2026-03-07T18:32:00Z",
        isOoc: false,
        isDm: false,
        mediaUrls: [],
        isEdited: false,
        updatedAt: null,
        isPinned: false,
        isLocked: false,
        visibleToCharacterIds: []
    },
    {
        id: "reply-2",
        type: "REPLY",
        content: "El extraño sonríe con malicia. \n\n*«¿Trampa? No, no es una trampa... es un desafío»*, dice mientras sus ojos brillan con una luz siniestra.",
        authorProfileId: "prof-dm",
        authorCharacterId: null,
        authorCharacterName: "El loco",
        authorCharacterImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop",
        campaignId: "camp-1",
        parentPostId: "post-4",
        createdAt: "2026-03-07T18:35:00Z",
        isOoc: false,
        isDm: true, // DM
        mediaUrls: [],
        isEdited: false,
        updatedAt: null,
        isPinned: false,
        isLocked: false,
        visibleToCharacterIds: []
    }
];

export const mockGeneralThreads = [
    {
        id: "gen-1",
        type: "THREAD_START",
        title: "¿Mejores sistemas para Sci-Fi duro?",
        tags: ["duda", "sci-fi", "sistemas"],
        content: "Hola a todos, estoy buscando recomendaciones para dirigir una partida de naves con físicas realistas. Vengo de jugar mucho D&D y quiero cambiar un poco de aires. He mirado Traveller y The Expanse RPG, pero me gustaría saber vuestras opiniones y si hay algún sistema indie que merezca la pena probar. ¡Gracias!",
        author: {
            id: "prof-123",
            profileName: "AlexRolero",
            profileImage: "https://ui-avatars.com/api/?name=Alex&background=0D8ABC&color=fff"
        },
        createdAt: "2026-03-15T10:30:00Z",
        isEdited: false,
        isLocked: false,
        replyCount: 14,
        mediaUrls: []
    },
    {
        id: "gen-2",
        type: "THREAD_START",
        title: "Busco mesa para jugar D&D 5e los domingos",
        tags: ["lfg", "dnd5e", "online"],
        content: "Buenas, tengo algo de experiencia y busco un grupo que acepte a un Bardo un poco caótico. Prometo no seducir al dragón (o al menos intentarlo). Tengo disponibilidad los domingos por la tarde, zona horaria GMT+1.",
        author: {
            id: "prof-456",
            profileName: "LidiaD20",
            profileImage: null
        },
        createdAt: "2026-03-14T18:15:00Z",
        isEdited: true,
        isLocked: false,
        replyCount: 3,
        mediaUrls: []
    },
    {
        id: "gen-3",
        type: "THREAD_START",
        title: "¿Cómo gestionáis a los 'Murder Hobos'?",
        tags: ["mastering", "debate"],
        content: "Tengo un grupo que, literalmente, intenta matar a todos los NPCs que les pongo delante. El tabernero les cobra 1 cobre de más por la cerveza -> Puñalada. El guardia les pide identificación -> Bola de fuego. ¿Algún consejo para reconducir esto sin ser un DM tirano?",
        author: {
            id: "prof-789",
            profileName: "DMSufriendo",
            profileImage: "https://ui-avatars.com/api/?name=DM&background=ef4444&color=fff"
        },
        createdAt: "2026-03-16T09:00:00Z",
        isEdited: false,
        isLocked: true, // Bloqueado por salseo
        replyCount: 42,
        mediaUrls: []
    },
    {
        id: 'thread-101',
        title: '¿Qué sistema de magia prefieren para fantasía oscura?',
        content: 'Hola a todos. Estoy creando una campaña de fantasía oscura y dudo si usar un sistema de magia vanciano clásico o algo más libre y peligroso, tipo tiradas que puedan salir muy mal (magia corrupta). ¿Qué os ha funcionado mejor a vosotros para dar sensación de peligro?\n\nCualquier consejo es bienvenido.',
        tags: ['dudas', 'rol', 'mastering'],
        author: {
            id: 'user-1',
            profileName: 'MiUsuario',
            profileImage: null,
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // Hace 2 días
        isLocked: false,
        replyCount: 5
    },
    {
        id: 'thread-102',
        title: 'Busco jugadores para campaña corta de Cyberpunk RED',
        content: '¡Buenas! Tengo mono de dirigir algo de Cyberpunk RED. Sería una minicampaña de 3-4 sesiones centrada en un atraco a una corpo. \n\n**Horario:** Viernes por la tarde (hora España).\n**Plataforma:** Discord + Roll20.\n\nNo hace falta experiencia previa con el sistema, yo enseño a jugar. ¡Dejad comentario si os interesa!',
        tags: ['busco-grupo', 'cyberpunk', 'online'],
        author: {
            id: 'user-1',
            profileName: 'MiUsuario',
            profileImage: 'https://ui-avatars.com/api/?name=MiUsuario&background=6366f1&color=fff',
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // Hace 5 horas
        isLocked: false,
        replyCount: 12
    }
];

export const mockGeneralReplies = [
    {
        id: "rep-1",
        parentPostId: "gen-1", // Pertenece al primer hilo de Sci-Fi
        content: "Yo he probado The Expanse RPG y el sistema AGE está bastante bien, aunque si buscas físicas orbitales súper realistas igual se te queda algo corto y narrativo.",
        author: {
            id: "prof-999",
            profileName: "MasterGalactico",
            profileImage: null
        },
        createdAt: "2026-03-15T11:00:00Z",
        isEdited: false
    },
    {
        id: "rep-2",
        parentPostId: "gen-1",
        content: "Échale un ojo a **Traveller**. Es el abuelo de la ciencia ficción dura. El sistema de creación de personajes es un minijuego en sí mismo donde tu personaje puede morir antes de empezar a jugar jajaja.",
        author: {
            id: "prof-444",
            profileName: "ViejoRolero",
            profileImage: "https://ui-avatars.com/api/?name=VR&background=fbbf24&color=fff"
        },
        createdAt: "2026-03-15T12:30:00Z",
        isEdited: true
    }
];