import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import MyPostsPage from '../../../pages/forum/MyPostsPage'
import ForumService from '../../../services/ForumService'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/ForumService', () => ({
	default: { getMyThreads: vi.fn() },
}))

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}))

vi.mock('../../../components/forum/GeneralListCard', () => ({
	default: ({ thread }) => <div data-testid='thread-card'>{thread.title}</div>,
}))

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
	Button:     ({ children, onClick, disabled }) => (
		<button onClick={onClick} disabled={disabled}>{children}</button>
	),
	Spinner: () => <div data-testid='spinner' />,
}))

vi.mock('@heroicons/react/24/outline', async (importOriginal) => {
	const actual = await importOriginal()
	return { ...actual, ArrowLeftIcon: () => null, DocumentTextIcon: () => null }
})

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return { ...actual, useNavigate: () => mockNavigate }
})

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockMyPosts = [
	{ id: 1, title: 'Mi primer post de rol',  content: 'Contenido 1', author: { profileName: 'AlexTable' }, createdAt: '2024-01-15T10:00:00Z', tags: [], replyCount: 2 },
	{ id: 2, title: 'Pregunta sobre D&D 5e', content: 'Contenido 2', author: { profileName: 'AlexTable' }, createdAt: '2024-01-20T14:30:00Z', tags: [], replyCount: 5 },
]

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderPage = () =>
	render(
		<MemoryRouter>
			<MyPostsPage />
		</MemoryRouter>
	)

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('MyPostsPage — Tests de Integración', () => {

	beforeEach(() => vi.clearAllMocks())

	// 1️⃣  Spinner mientras carga
	test('muestra el spinner mientras se cargan los posts', () => {
		ForumService.getMyThreads.mockReturnValue(new Promise(() => {}))
		renderPage()
		expect(screen.getByTestId('spinner')).toBeInTheDocument()
	})

	// 2️⃣  Lista de posts propios
	test('muestra los posts del usuario cargados desde el servicio', async () => {
		ForumService.getMyThreads.mockResolvedValue({
			data: mockMyPosts,
			meta: { totalPages: 1 },
		})
		renderPage()

		await waitFor(() => {
			expect(screen.getByText('Mi primer post de rol')).toBeInTheDocument()
			expect(screen.getByText('Pregunta sobre D&D 5e')).toBeInTheDocument()
		})
	})

	// 3️⃣  Sin posts propios → estado vacío
	test('muestra el estado vacío si el usuario no tiene posts', async () => {
		ForumService.getMyThreads.mockResolvedValue({ data: [], meta: { totalPages: 1 } })
		renderPage()

		await waitFor(() => {
			expect(screen.getByText('forum.myPosts.emptyTitle')).toBeInTheDocument()
		})
	})

	// 4️⃣  Error de API → estado vacío sin romper
	test('muestra el estado vacío si el servicio falla', async () => {
		ForumService.getMyThreads.mockRejectedValue(new Error('Error de red'))
		renderPage()

		await waitFor(() => {
			expect(screen.getByText('forum.myPosts.emptyTitle')).toBeInTheDocument()
		})
	})

	// 5️⃣  Botón volver → navega al foro general
	test('navega a /forum al hacer click en volver', async () => {
		ForumService.getMyThreads.mockResolvedValue({ data: [], meta: { totalPages: 1 } })
		renderPage()
		await waitFor(() => screen.getByText('forum.myPosts.emptyTitle'))

		await userEvent.click(screen.getByRole('button', { name: /common.back/i }))

		expect(mockNavigate).toHaveBeenCalledWith('/forum')
	})

	// 6️⃣  Estado vacío: botón ir al foro → navega
	test('navega a /forum al hacer click en el botón del estado vacío', async () => {
		ForumService.getMyThreads.mockResolvedValue({ data: [], meta: { totalPages: 1 } })
		renderPage()
		await waitFor(() => screen.getByText('forum.myPosts.emptyButton'))

		await userEvent.click(screen.getByRole('button', { name: /forum.myPosts.emptyButton/i }))

		expect(mockNavigate).toHaveBeenCalledWith('/forum')
	})

	// 7️⃣  Paginación oculta con una sola página
	test('no muestra botones de paginación si solo hay una página', async () => {
		ForumService.getMyThreads.mockResolvedValue({ data: mockMyPosts, meta: { totalPages: 1 } })
		renderPage()
		await waitFor(() => screen.getAllByTestId('thread-card'))

		expect(screen.queryByRole('button', { name: /common.next/i })).not.toBeInTheDocument()
	})

	// 8️⃣  Paginación visible con varias páginas
	test('muestra los botones de paginación si hay más de una página', async () => {
		ForumService.getMyThreads.mockResolvedValue({ data: mockMyPosts, meta: { totalPages: 3 } })
		renderPage()

		await waitFor(() => {
			expect(screen.getByRole('button', { name: /common.next/i })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: /common.previous/i })).toBeInTheDocument()
		})
	})

	// 9️⃣  Paginación: botón siguiente llama al servicio con página 2
	test('al hacer click en siguiente llama al servicio con la página 2', async () => {
		ForumService.getMyThreads.mockResolvedValue({ data: mockMyPosts, meta: { totalPages: 3 } })
		renderPage()
		await waitFor(() => screen.getAllByTestId('thread-card'))

		await userEvent.click(screen.getByRole('button', { name: /common.next/i }))

		await waitFor(() => {
			expect(ForumService.getMyThreads).toHaveBeenLastCalledWith(2, 20)
		})
	})
})
