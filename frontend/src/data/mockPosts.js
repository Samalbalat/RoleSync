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