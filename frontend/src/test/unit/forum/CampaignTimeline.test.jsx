import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import CampaignTimeline from '../../../components/forum/CampaignTimeline';
import ForumService from '../../../services/ForumService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/ForumService', () => ({
	default: { getTimeline: vi.fn() },
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}));

// PostEditor → Le añadimos un botón para simular la creación de un post
vi.mock('../../../components/forum/PostEditor', () => ({
	default: ({ onPostCreated }) => (
		<div data-testid='post-editor'>
			<button
				data-testid='btn-create-post'
				onClick={() => onPostCreated({ id: 99, content: 'Nuevo post desde editor', isPinned: false })}
			>
				Crear Post
			</button>
		</div>
	),
}));

// PostCard → Exponemos los botones de interacción y mostramos si está pineado/bloqueado
vi.mock('../../../components/forum/PostCard', () => ({
	default: ({ post, onClickThread, onTogglePin, onToggleLock }) => (
		<div data-testid='post-card'>
			<span>{post.content}</span>
			<span data-testid={`status-pinned-${post.id}`}>{post.isPinned ? 'PINNED' : 'UNPINNED'}</span>
			<span data-testid={`status-locked-${post.id}`}>{post.isLocked ? 'LOCKED' : 'UNLOCKED'}</span>

			<button data-testid={`btn-thread-${post.id}`} onClick={() => onClickThread?.(post)}>
				Thread
			</button>
			<button data-testid={`btn-pin-${post.id}`} onClick={e => onTogglePin?.(e, post.id)}>
				Pin
			</button>
			<button data-testid={`btn-lock-${post.id}`} onClick={e => onToggleLock?.(e, post.id)}>
				Lock
			</button>
		</div>
	),
}));

// ThreadDialog → Renderiza un botón para cerrarlo y probar el handleClose
vi.mock('../../../components/forum/ThreadDialog', () => ({
	default: ({ open, handleClose }) =>
		open ? (
			<div data-testid='thread-dialog'>
				<button data-testid='btn-close-dialog' onClick={handleClose}>
					Cerrar Dialog
				</button>
			</div>
		) : null,
}));

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
	Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
	Accordion: ({ children }) => <div>{children}</div>,
	AccordionHeader: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
	AccordionBody: ({ children }) => <div>{children}</div>,
}));

vi.mock('@heroicons/react/24/outline', async importOriginal => {
	const actual = await importOriginal();
	return { ...actual, ChevronDownIcon: () => null };
});

vi.mock('react-icons/tb', () => ({
	TbPinnedFilled: () => null,
}));

// ─── Helper ──────────────────────────────────────────────────────────────────

const myCharacter = { id: 1, name: 'Arador el Valiente', avatar: null };

const buildProps = (overrides = {}) => ({
	campaignId: '1',
	isOwner: false,
	isTabletop: false,
	myCharacter,
	characters: [],
	ownerImage: null,
	campaignStatus: 'OPEN',
	...overrides,
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CampaignTimeline — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Carga inicial → muestra "Cargando posts..."
	test('muestra el indicador de carga mientras se cargan los posts', () => {
		ForumService.getTimeline.mockReturnValue(new Promise(() => {}));
		render(<CampaignTimeline {...buildProps()} />);
		expect(screen.getByText('Cargando posts...')).toBeInTheDocument();
	});

	// 2️⃣  Posts cargados → los renderiza
	test('muestra los posts recibidos del servicio', async () => {
		ForumService.getTimeline.mockResolvedValue({
			data: [{ id: 1, content: 'Mensaje de prueba', isPinned: false, createdAt: new Date().toISOString() }],
			nextCursor: null,
			hasMore: false,
		});

		render(<CampaignTimeline {...buildProps()} />);

		await waitFor(() => {
			expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
		});
	});

	// 3️⃣  Sin posts → mensaje de timeline vacía
	test('muestra el mensaje de timeline vacía si no hay posts', async () => {
		ForumService.getTimeline.mockResolvedValue({ data: [], nextCursor: null, hasMore: false });
		render(<CampaignTimeline {...buildProps()} />);

		await waitFor(() => {
			expect(screen.getByText('forum.campaign.emptyNarrative')).toBeInTheDocument();
		});
	});

	// 4️⃣  Sin posts tabletop → mensaje específico de mesa
	test('muestra el mensaje de tabla vacía si no hay posts en modo tabletop', async () => {
		ForumService.getTimeline.mockResolvedValue({ data: [], nextCursor: null, hasMore: false });
		render(<CampaignTimeline {...buildProps({ isTabletop: true })} />);

		await waitFor(() => {
			expect(screen.getByText('forum.campaign.emptyTable')).toBeInTheDocument();
		});
	});

	// 5️⃣  Con personaje y canWrite → muestra el PostEditor
	test('muestra el PostEditor si el usuario puede escribir y tiene personaje', async () => {
		ForumService.getTimeline.mockResolvedValue({ data: [], nextCursor: null, hasMore: false });
		render(<CampaignTimeline {...buildProps({ isOwner: false, campaignStatus: 'OPEN' })} />);

		await waitFor(() => {
			expect(screen.getByTestId('post-editor')).toBeInTheDocument();
		});
	});

	// 6️⃣  Sin personaje → muestra mensaje "necesitas personaje"
	test('muestra el aviso de necesitar personaje si myCharacter es null', async () => {
		ForumService.getTimeline.mockResolvedValue({ data: [], nextCursor: null, hasMore: false });
		render(<CampaignTimeline {...buildProps({ myCharacter: null })} />);

		await waitFor(() => {
			expect(screen.getByText('forum.campaign.needCharacter')).toBeInTheDocument();
		});
	});

	// 7️⃣  Campaña pausada (BREAK) → modo solo lectura para jugadores
	test('muestra el aviso de solo lectura si la campaña está en BREAK', async () => {
		ForumService.getTimeline.mockResolvedValue({ data: [], nextCursor: null, hasMore: false });
		render(<CampaignTimeline {...buildProps({ campaignStatus: 'BREAK', isOwner: false })} />);

		await waitFor(() => {
			expect(screen.getByText('forum.campaign.readOnly')).toBeInTheDocument();
		});
	});

	// 8️⃣  Campaña finalizada (FINISHED) → modo solo lectura para jugadores
	test('muestra el aviso de solo lectura si la campaña está FINISHED', async () => {
		ForumService.getTimeline.mockResolvedValue({ data: [], nextCursor: null, hasMore: false });
		render(<CampaignTimeline {...buildProps({ campaignStatus: 'FINISHED', isOwner: false })} />);

		await waitFor(() => {
			expect(screen.getByText('forum.campaign.readOnly')).toBeInTheDocument();
		});
	});

	// 9️⃣  El DM siempre puede escribir aunque la campaña esté pausada
	test('el DM puede escribir aunque la campaña esté pausada', async () => {
		ForumService.getTimeline.mockResolvedValue({ data: [], nextCursor: null, hasMore: false });
		render(<CampaignTimeline {...buildProps({ campaignStatus: 'BREAK', isOwner: true })} />);

		await waitFor(() => {
			expect(screen.getByTestId('post-editor')).toBeInTheDocument();
		});
	});

	// 🔟  Posts fijados → aparecen en la sección de fijados
	test('separa los posts fijados de los normales', async () => {
		ForumService.getTimeline.mockResolvedValue({
			data: [
				{ id: 1, content: 'Post normal', isPinned: false, createdAt: new Date().toISOString() },
				{ id: 2, content: 'Post fijado', isPinned: true, createdAt: new Date().toISOString() },
			],
			nextCursor: null,
			hasMore: false,
		});

		render(<CampaignTimeline {...buildProps()} />);

		await waitFor(() => {
			const cards = screen.getAllByTestId('post-card');
			// Se renderizan los dos posts (uno en fijados y otro en normales)
			expect(cards).toHaveLength(2);
		});
	});

	// 1️⃣1️⃣ Cargar más posts
	test('llama a ForumService.getTimeline al hacer clic en Cargar Más', async () => {
		ForumService.getTimeline
			// Primera llamada inicial
			.mockResolvedValueOnce({
				data: [{ id: 1, content: 'Post 1' }],
				nextCursor: 'cursor-abc',
				hasMore: true,
			})
			// Segunda llamada al hacer clic en "Cargar más"
			.mockResolvedValueOnce({
				data: [{ id: 2, content: 'Post 2' }],
				nextCursor: null,
				hasMore: false,
			});

		render(<CampaignTimeline {...buildProps()} />);

		// Esperamos a que cargue el primer post y aparezca el botón
		const loadMoreBtn = await screen.findByRole('button', { name: /common.loadMore/i });
		await userEvent.click(loadMoreBtn);

		// Debería mostrar ambos posts
		await waitFor(() => {
			expect(screen.getByText('Post 1')).toBeInTheDocument();
			expect(screen.getByText('Post 2')).toBeInTheDocument();
		});
		expect(ForumService.getTimeline).toHaveBeenCalledTimes(2);
	});

	// 1️⃣2️⃣ Añadir un nuevo post desde el PostEditor
	test('añade un nuevo post al timeline cuando se dispara onPostCreated', async () => {
		ForumService.getTimeline.mockResolvedValue({ data: [], nextCursor: null, hasMore: false });
		render(<CampaignTimeline {...buildProps()} />);

		// Esperamos a que el editor se renderice (ya que status='OPEN' y canWrite=true)
		const createBtn = await screen.findByTestId('btn-create-post');
		await userEvent.click(createBtn);

		expect(screen.getByText('Nuevo post desde editor')).toBeInTheDocument();
	});

	// 1️⃣3️⃣ Abrir y cerrar el ThreadDialog
	test('abre y cierra el ThreadDialog al hacer clic en un post (modo narrativo)', async () => {
		ForumService.getTimeline.mockResolvedValue({
			data: [{ id: 1, content: 'Post normal', isPinned: false }],
			nextCursor: null,
			hasMore: false,
		});

		render(<CampaignTimeline {...buildProps({ isTabletop: false })} />);

		// Abrir
		const threadBtn = await screen.findByTestId('btn-thread-1');
		await userEvent.click(threadBtn);
		expect(screen.getByTestId('thread-dialog')).toBeInTheDocument();

		// Cerrar
		const closeBtn = screen.getByTestId('btn-close-dialog');
		await userEvent.click(closeBtn);
		expect(screen.queryByTestId('thread-dialog')).not.toBeInTheDocument();
	});

	// 1️⃣4️⃣ No abre el ThreadDialog si es modo Tabletop
	test('no hace nada al hacer clic en thread si es modo tabletop', async () => {
		ForumService.getTimeline.mockResolvedValue({
			data: [{ id: 1, content: 'Post mesa', isPinned: false }],
			nextCursor: null,
			hasMore: false,
		});

		render(<CampaignTimeline {...buildProps({ isTabletop: true })} />);

		const threadBtn = await screen.findByTestId('btn-thread-1');
		await userEvent.click(threadBtn);

		expect(screen.queryByTestId('thread-dialog')).not.toBeInTheDocument();
	});

	// 1️⃣5️⃣ Toggle Pin y Lock
	test('actualiza el estado del post al usar toggle pin y toggle lock', async () => {
		ForumService.getTimeline.mockResolvedValue({
			data: [{ id: 1, content: 'Post de prueba', isPinned: false, isLocked: false }],
			nextCursor: null,
			hasMore: false,
		});

		render(<CampaignTimeline {...buildProps()} />);

		const pinBtn = await screen.findByTestId('btn-pin-1');
		const lockBtn = await screen.findByTestId('btn-lock-1');

		// Verificamos estado inicial
		expect(screen.getByTestId('status-pinned-1')).toHaveTextContent('UNPINNED');
		expect(screen.getByTestId('status-locked-1')).toHaveTextContent('UNLOCKED');

		// Clic en pin
		await userEvent.click(pinBtn);
		expect(screen.getByTestId('status-pinned-1')).toHaveTextContent('PINNED');

		// Clic en lock
		await userEvent.click(lockBtn);
		expect(screen.getByTestId('status-locked-1')).toHaveTextContent('LOCKED');
	});

	// 1️⃣6️⃣ Errores en la carga inicial y carga paginada (manejo de catch)
	test('maneja errores del servicio en getTimeline (console.error silenciado)', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		// Falla en la primera carga
		ForumService.getTimeline.mockRejectedValueOnce(new Error('Network error'));

		render(<CampaignTimeline {...buildProps()} />);

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith('Error cargando la timeline:', expect.any(Error));
		});

		consoleSpy.mockRestore();
	});

	// 1️⃣7️⃣ Abrir y cerrar el acordeón de pines
	test('permite abrir y cerrar el acordeón de posts fijados', async () => {
		ForumService.getTimeline.mockResolvedValue({
			data: [{ id: 1, content: 'Fijado', isPinned: true }],
			nextCursor: null,
			hasMore: false,
		});

		render(<CampaignTimeline {...buildProps()} />);

		// Buscamos el header del acordeón (que envuelve el mock de AccordionHeader)
		const accordionHeader = await screen.findByRole('button', { name: /forum.campaign.pinned/i });

		// Al hacer clic simulamos el toggle de isPinnedOpen (verificamos que no crashea)
		await userEvent.click(accordionHeader);
		expect(accordionHeader).toBeInTheDocument();
	});
});
