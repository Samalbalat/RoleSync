import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import GeneralForumPage from '../../../pages/forum/GeneralForumPage';
import ForumService from '../../../services/ForumService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/ForumService', () => ({
	default: { getGeneralThreads: vi.fn() },
}));

vi.mock('react-i18next', () => {
	const t = key => key;
	return {
		useTranslation: () => ({ t }),
	};
});

// GeneralListCard → muestra el título del hilo para poder verificar la lista
vi.mock('../../../components/forum/GeneralListCard', () => ({
	default: ({ thread }) => <div data-testid='thread-card'>{thread.title}</div>,
}));

// CreateGeneralPost → modal simplificado
vi.mock('../../../components/forum/CreateGeneralPost', () => ({
	default: ({ open, handleClose }) =>
		open ? (
			<div role='dialog'>
				<button onClick={handleClose}>common.cancel</button>
			</div>
		) : null,
}));

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
	Button: ({ children, onClick, disabled }) => (
		<button onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
	Input: ({ label, value, onChange, onKeyDown }) => (
		<input aria-label={label} value={value} onChange={onChange} onKeyDown={onKeyDown} />
	),
	Spinner: () => <div data-testid='spinner' />,
}));

vi.mock('@heroicons/react/24/outline', async importOriginal => {
	const actual = await importOriginal();
	return { ...actual, MagnifyingGlassIcon: () => null, PlusIcon: () => null, DocumentTextIcon: () => null };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockThreads = [
	{
		id: 1,
		title: 'Guía de iniciación al rol',
		content: 'Contenido 1',
		author: { profileName: 'AlexTable' },
		createdAt: '2024-01-15T10:00:00Z',
		tags: [],
		replyCount: 3,
	},
	{
		id: 2,
		title: '¿Vuestro sistema favorito?',
		content: 'Contenido 2',
		author: { profileName: 'Master' },
		createdAt: '2024-01-20T14:30:00Z',
		tags: [],
		replyCount: 8,
	},
];

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderPage = () =>
	render(
		<MemoryRouter>
			<GeneralForumPage />
		</MemoryRouter>,
	);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GeneralForumPage — Tests de Integración', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Spinner mientras carga
	test('muestra el spinner mientras se cargan los hilos', () => {
		ForumService.getGeneralThreads.mockReturnValue(new Promise(() => {}));
		renderPage();
		expect(screen.getByTestId('spinner')).toBeInTheDocument();
	});

	// 2️⃣  Lista de hilos
	test('muestra los hilos cargados desde el servicio', async () => {
		ForumService.getGeneralThreads.mockResolvedValue({
			data: mockThreads,
			meta: { totalPages: 1 },
		});
		renderPage();

		await waitFor(() => {
			expect(screen.getByText('Guía de iniciación al rol')).toBeInTheDocument();
			expect(screen.getByText('¿Vuestro sistema favorito?')).toBeInTheDocument();
		});
	});

	// 3️⃣  Sin resultados
	test('muestra mensaje de sin resultados cuando la lista está vacía', async () => {
		ForumService.getGeneralThreads.mockResolvedValue({ data: [], meta: { totalPages: 1 } });
		renderPage();

		await waitFor(() => {
			expect(screen.getByText('forum.general.noResults')).toBeInTheDocument();
		});
	});

	// 4️⃣  Error de API → sin resultados sin romper
	test('muestra lista vacía si el servicio falla', async () => {
		ForumService.getGeneralThreads.mockRejectedValue(new Error('Error de red'));
		renderPage();

		await waitFor(() => {
			expect(screen.getByText('forum.general.noResults')).toBeInTheDocument();
		});
	});

	// 5️⃣  Búsqueda: click en botón buscar
	test('llama al servicio con el término de búsqueda al buscar', async () => {
		ForumService.getGeneralThreads.mockResolvedValue({ data: mockThreads, meta: { totalPages: 1 } });
		renderPage();
		await waitFor(() => screen.getAllByTestId('thread-card'));

		await userEvent.type(screen.getByRole('textbox', { name: /forum.general.searchThreads/i }), 'dnd');
		await userEvent.click(screen.getByRole('button', { name: /common.search/i }));

		await waitFor(() => {
			// Se llamó 2 veces: al montar y al buscar
			expect(ForumService.getGeneralThreads).toHaveBeenCalledTimes(2);
			expect(ForumService.getGeneralThreads).toHaveBeenLastCalledWith(1, 20, 'dnd');
		});
	});

	// 6️⃣  Búsqueda: Enter en el input
	test('llama al servicio al pulsar Enter en el buscador', async () => {
		ForumService.getGeneralThreads.mockResolvedValue({ data: [], meta: { totalPages: 1 } });
		renderPage();
		await waitFor(() => screen.getByText('forum.general.noResults'));

		await userEvent.type(screen.getByRole('textbox', { name: /forum.general.searchThreads/i }), 'rol{Enter}');

		await waitFor(() => {
			expect(ForumService.getGeneralThreads).toHaveBeenCalledTimes(2);
		});
	});

	// 7️⃣  Paginación: botones solo visibles si totalPages > 1
	test('no muestra botones de paginación si solo hay una página', async () => {
		ForumService.getGeneralThreads.mockResolvedValue({ data: mockThreads, meta: { totalPages: 1 } });
		renderPage();
		await waitFor(() => screen.getAllByTestId('thread-card'));

		expect(screen.queryByRole('button', { name: /common.next/i })).not.toBeInTheDocument();
	});

	test('muestra botones de paginación si hay más de una página', async () => {
		ForumService.getGeneralThreads.mockResolvedValue({ data: mockThreads, meta: { totalPages: 3 } });
		renderPage();

		await waitFor(() => {
			expect(screen.getByRole('button', { name: /common.next/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /common.previous/i })).toBeInTheDocument();
		});
	});

	// 8️⃣  Botón nuevo hilo → abre modal
	test('abre el modal de crear hilo al hacer click en nuevo hilo', async () => {
		ForumService.getGeneralThreads.mockResolvedValue({ data: [], meta: { totalPages: 1 } });
		renderPage();
		await waitFor(() => screen.getByText('forum.general.noResults'));

		await userEvent.click(screen.getByRole('button', { name: /forum.general.newThread/i }));

		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	// 9️⃣  Botón mis posts → navega a /forum/my-posts
	test('navega a /forum/my-posts al hacer click en mis posts', async () => {
		ForumService.getGeneralThreads.mockResolvedValue({ data: [], meta: { totalPages: 1 } });
		renderPage();
		await waitFor(() => screen.getByText('forum.general.noResults'));

		await userEvent.click(screen.getByRole('button', { name: /forum.general.myPosts/i }));

		expect(mockNavigate).toHaveBeenCalledWith('/forum/my-posts');
	});
});
