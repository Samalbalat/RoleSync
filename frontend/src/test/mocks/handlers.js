import { http, HttpResponse } from 'msw'

/**
 * BASE URL — debe coincidir con VITE_BACKEND_API_URL del .env.test
 * Todos los handlers usan esta constante para construir las URLs.
 */
const BASE = 'http://localhost:8080'

// =============================================================================
// DATOS MOCK
// Se irán completando a medida que se creen los tests que los necesiten.
// =============================================================================

const mockProfiles = [
	{ email: 'alex@email.com', profileName: 'AlexTable',     roleType: 'TABLETOP' },
	{ email: 'alex@email.com', profileName: 'AlexNarrative', roleType: 'WRITTEN'  },
]

const mockCampaigns = [
	{
		id: 1, name: 'La Maldición de Strahd', description: 'Terror gótico en Barovia.',
		type: 'TABLETOP', status: 'OPEN', system: 'D&D 5e',
		image: 'https://example.com/strahd.jpg', language: 'Español', timeZone: 'CET',
		communication: 'Discord', location: 'Online', frequency: 'weekly',
		dayWeek: 'friday', duration: '3h', currentPlayers: 3, maxPlayers: 5,
		themes: ['Horror', 'Gothic'], userRelation: 'VISITOR',
		owner: { profileName: 'MasterDungeon', profileImage: null },
	},
	{
		id: 2, name: 'El Camino de Seda', description: 'Aventuras comerciales.',
		type: 'TABLETOP', status: 'ACTIVE', system: 'Pathfinder',
		image: 'https://example.com/silk.jpg', language: 'English', timeZone: 'GMT',
		communication: 'Discord', location: 'Online', frequency: 'biweekly',
		dayWeek: 'saturday', duration: '4h', currentPlayers: 2, maxPlayers: 4,
		themes: ['Fantasy'], userRelation: 'VISITOR',
		owner: { profileName: 'SilkMaster', profileImage: null },
	},
]

const mockParticipants = [
	{ profileId: 1, profileName: 'Jugador1', profileImage: null },
	{ profileId: 2, profileName: 'Jugador2', profileImage: null },
]

const mockRequests = [
	{ profileId: 3, profileName: 'SolicitudPendiente', message: 'Quiero unirme!', profileImage: null },
]

const mockCharacters = [
	{ id: 10, name: 'Arador el Valiente', campaignId: 1, profileName: 'Jugador1', image: null },
	{ id: 11, name: 'Lira la Maga',       campaignId: 1, profileName: 'Jugador2', image: null },
]

const mockTemplate = {
	id: 1,
	campaignId: 1,
	name: 'Template Test',
	schema: [
		{ key: 'str', label: 'Strength', type: 'number', required: true, min: 1, max: 20 },
	],
};



const mockPosts = [
	{ id: 1, title: 'Guía de iniciación al rol',  content: 'Contenido del post.', author: 'AlexTable',     createdAt: '2024-01-15T10:00:00Z', comments: 3, likes: 12 },
	{ id: 2, title: '¿Vuestro sistema favorito?', content: 'D&D vs Pathfinder.', author: 'MasterDungeon', createdAt: '2024-01-20T14:30:00Z', comments: 8, likes: 25 },
]

const mockProfile = {
	profileName: 'AlexTable', roleType: 'TABLETOP',
	bio: 'Amante del rol desde hace 10 años.',
	profileImage: null,
}

// =============================================================================
// HANDLERS — organizados por servicio
// =============================================================================

export const handlers = [

	// ── AuthService ────────────────────────────────────────────────────────
	// POST /rolesync/auth/login
	http.post(`${BASE}/rolesync/auth/login`, () =>
		HttpResponse.json(mockProfiles)
	),

	// POST /rolesync/auth/register
	http.post(`${BASE}/rolesync/auth/register`, () =>
		HttpResponse.json({ message: 'Usuario registrado correctamente' }, { status: 201 })
	),

	// POST /rolesync/auth/logout
	http.post(`${BASE}/rolesync/auth/logout`, () =>
		HttpResponse.json({ message: 'Sesión cerrada' })
	),

	// GET /rolesync/me
	http.get(`${BASE}/rolesync/me`, () =>
		HttpResponse.json({ email: 'alex@email.com', authenticated: true })
	),


	// ── CampaignService ────────────────────────────────────────────────────
	// GET /campaigns  (listado con filtros)
	http.get(`${BASE}/campaigns`, () =>
		HttpResponse.json(mockCampaigns)
	),

	// GET /campaigns/me
	http.get(`${BASE}/campaigns/me`, () =>
		HttpResponse.json(mockCampaigns.slice(0, 1))
	),

	// GET /campaigns/:id
	http.get(`${BASE}/campaigns/:id`, ({ params }) => {
		const campaign = mockCampaigns.find(c => String(c.id) === params.id)
		if (!campaign) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
		return HttpResponse.json(campaign)
	}),

	// POST /campaigns
	http.post(`${BASE}/campaigns`, () =>
		HttpResponse.json({ id: 99, name: 'Nueva Campaña' }, { status: 201 })
	),

	// PUT /campaigns/:id
	http.put(`${BASE}/campaigns/:id`, ({ params }) =>
		HttpResponse.json({ ...mockCampaigns[0], id: Number(params.id), name: 'Campaña Actualizada' })
	),

	// PUT /campaigns/:id/status
	http.put(`${BASE}/campaigns/:id/status`, () =>
		HttpResponse.json({ message: 'Estado actualizado' })
	),

	// DELETE /campaigns/:id
	http.delete(`${BASE}/campaigns/:id`, () =>
		HttpResponse.json({ message: 'Campaña eliminada' })
	),

	// POST /campaigns/:id/join
	http.post(`${BASE}/campaigns/:id/join`, () =>
		HttpResponse.json({ message: 'Solicitud enviada' }, { status: 201 })
	),

	// GET /campaigns/:id/requests
	http.get(`${BASE}/campaigns/:id/requests`, () =>
		HttpResponse.json(mockRequests)
	),

	// PUT /campaigns/:id/requests
	http.put(`${BASE}/campaigns/:id/requests`, () =>
		HttpResponse.json({ message: 'Estado de solicitud actualizado' })
	),

	// GET /campaigns/:id/participants
	http.get(`${BASE}/campaigns/:id/participants`, () =>
		HttpResponse.json(mockParticipants)
	),

	// PUT /campaigns/:id/kick
	http.put(`${BASE}/campaigns/:id/kick`, () =>
		HttpResponse.json({ message: 'Jugador expulsado' })
	),

	// GET /campaigns/:id/posts  (timeline de campaña)
	http.get(`${BASE}/campaigns/:id/posts`, () =>
		HttpResponse.json({ posts: [], nextCursor: null })
	),

	// POST /campaigns/:id/posts
	http.post(`${BASE}/campaigns/:id/posts`, () =>
		HttpResponse.json({ id: 99, content: 'Nuevo post de campaña' }, { status: 201 })
	),


	// ── CharacterService ───────────────────────────────────────────────────
	// GET /rolesync/characters
	http.get(`${BASE}/rolesync/characters`, () =>
		HttpResponse.json(mockCharacters)
	),

	// GET /rolesync/characters/me
	http.get(`${BASE}/rolesync/characters/me`, () =>
		HttpResponse.json(mockCharacters.slice(0, 1))
	),

	// GET /rolesync/characters/:characterId
	http.get(`${BASE}/rolesync/characters/:characterId`, ({ params }) => {
		const character = mockCharacters.find(c => String(c.id) === params.characterId)
		if (!character) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
		return HttpResponse.json(character)
	}),

	// POST /rolesync/characters
	http.post(`${BASE}/rolesync/characters`, () =>
		HttpResponse.json({ id: 99, name: 'Nuevo Personaje' }, { status: 201 })
	),

	// PUT /rolesync/characters/:characterId
	http.put(`${BASE}/rolesync/characters/:characterId`, () =>
		HttpResponse.json({ message: 'Personaje actualizado' })
	),

	// GET /rolesync/campaigns/:campaignId/characters
	http.get(`${BASE}/rolesync/campaigns/:campaignId/characters`, () =>
		HttpResponse.json(mockCharacters)
	),

	// GET /rolesync/campaigns/:campaignId/templates
	http.get(`${BASE}/rolesync/campaigns/:campaignId/templates`, () =>
		HttpResponse.json([mockTemplate])
	),

	// GET /rolesync/templates/:templateId
	http.get(`${BASE}/rolesync/templates/:templateId`, () =>
		HttpResponse.json(mockTemplate)
	),

	// POST /rolesync/templates
	http.post(`${BASE}/rolesync/templates`, () =>
		HttpResponse.json({ id: 1, ...mockTemplate }, { status: 201 })
	),

	// PUT /rolesync/templates/:templateId
	http.put(`${BASE}/rolesync/templates/:templateId`, () =>
		HttpResponse.json({ message: 'Plantilla actualizada' })
	),


	// ── ForumService ───────────────────────────────────────────────────────
	// GET /forums/posts  (foro general)
	http.get(`${BASE}/forums/posts`, () =>
		HttpResponse.json(mockPosts)
	),

	// GET /forums/posts/:postId
	http.get(`${BASE}/forums/posts/:postId`, ({ params }) => {
		const post = mockPosts.find(p => String(p.id) === params.postId)
		if (!post) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
		return HttpResponse.json(post)
	}),

	// POST /forums/posts  (crear hilo o respuesta en foro general)
	http.post(`${BASE}/forums/posts`, () =>
		HttpResponse.json({ id: 99, title: 'Nuevo Post' }, { status: 201 })
	),

	// GET /forums/myPosts
	http.get(`${BASE}/forums/myPosts`, () =>
		HttpResponse.json(mockPosts.slice(0, 1))
	),

	// GET /posts/:postId/replies
	http.get(`${BASE}/posts/:postId/replies`, () =>
		HttpResponse.json({ replies: [], nextCursor: null })
	),

	// PUT /posts/:postId
	http.put(`${BASE}/posts/:postId`, () =>
		HttpResponse.json({ message: 'Post actualizado' })
	),

	// PATCH /posts/:postId/moderate
	http.patch(`${BASE}/posts/:postId/moderate`, () =>
		HttpResponse.json({ message: 'Post moderado' })
	),

	// DELETE /posts/:postId
	http.delete(`${BASE}/posts/:postId`, () =>
		HttpResponse.json({ message: 'Post eliminado' })
	),


	// ── ProfileService ─────────────────────────────────────────────────────
	// GET /rolesync/profile/:roleType
	http.get(`${BASE}/rolesync/profile/:roleType`, () =>
		HttpResponse.json(mockProfile)
	),

	// PUT /rolesync/profile/:roleType
	http.put(`${BASE}/rolesync/profile/:roleType`, () =>
		HttpResponse.json({ message: 'Perfil actualizado' })
	),

	// POST /rolesync/profile/:roleType
	http.post(`${BASE}/rolesync/profile/:roleType`, () =>
		HttpResponse.json({ message: 'Perfil creado' }, { status: 201 })
	),

	// GET /rolesync/user
	http.get(`${BASE}/rolesync/user`, () =>
		HttpResponse.json({ email: 'alex@email.com', profiles: mockProfiles })
	),

	// GET /rolesync/profile/:roleType/:profileName
	http.get(`${BASE}/rolesync/profile/:roleType/:profileName`, () =>
		HttpResponse.json(mockProfile)
	),
]