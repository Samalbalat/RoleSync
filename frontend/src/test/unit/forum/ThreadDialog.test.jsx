import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import ThreadDialog from '../../../components/forum/ThreadDialog';
import ForumService from '../../../services/ForumService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/ForumService', () => ({
	default: { getReplies: vi.fn() },
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}));

vi.mock('react-hot-toast', () => ({
	default: { error: vi.fn() },
	toast: { error: vi.fn() },
}));

// PostCard → muestra el contenido del post
vi.mock('../../../components/forum/PostCard', () => ({
	default: ({ post }) => <div data-testid='post-card'>{post.content}</div>,
}));

// PostEditor → simplificado
vi.mock('../../../components/forum/PostEditor', () => ({
	default: ({ onPostCreated }) => (
		<div data-testid='post-editor'>
			<button onClick={() => onPostCreated({ id: 99, content: 'Nueva respuesta', createdAt: new Date().toISOString() })}>
				common.send
			</button>
		</div>
	),
}));

// Material Tailwind → importamos original para evitar fallos de dependencias ocultas
vi.mock('@material-tailwind/react', () => ({
	Dialog: ({ open, children }) => (open ? <div role='dialog'>{children}</div> : null),
	DialogHeader: ({ children }) => <div>{children}</div>,
	DialogBody: ({ children }) => <div>{children}</div>,
	Typography: ({ children }) => <div>{children}</div>,
	IconButton: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,

	Avatar: () => <div data-testid='mock-avatar' />,
	Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
	Spinner: () => <div data-testid='mock-spinner' />,
	Tooltip: ({ children }) => <div data-testid='mock-tooltip'>{children}</div>,
	Textarea: () => <textarea data-testid='mock-textarea' />,
}));

// HeroIcons → mock síncrono
vi.mock('@heroicons/react/24/outline', () => ({
	XMarkIcon: () => <span data-testid='x-icon' />,
}));

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const myCharacter = { id: 1, name: 'Arador', avatar: null };

const mockPost = {
	id: 1,
	content: 'Este es el mensaje principal del hilo.',
	createdAt: new Date().toISOString(),
	campaignId: '1',
	isPinned: false,
	isLocked: false,
	isDm: false,
	isOoc: false,
	visibleToCharacterIds: [],
	authorCharacterName: 'Arador',
};

const buildProps = (overrides = {}) => ({
	open: true,
	handleClose: vi.fn(),
	isOwner: false,
	isTabletop: false,
	post: mockPost,
	myCharacter,
	characters: [],
	ownerImage: null,
	campaignStatus: 'OPEN',
	...overrides,
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ThreadDialog — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Visibilidad: abierto
	test('muestra el diálogo cuando open es true', async () => {
		ForumService.getReplies.mockResolvedValue({ data: [] });
		render(<ThreadDialog {...buildProps()} />);

		expect(screen.getByRole('dialog')).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText('forum.noReplies')).toBeInTheDocument();
		});
	});

	// 2️⃣  Post null → no falla
	// TODO: Revisar bloqueo de Vitest
	test.skip('no falla si post es null', () => {
		render(<ThreadDialog {...buildProps({ post: null })} />);
		expect(screen.queryByTestId('post-card')).not.toBeInTheDocument();
	});

	// 3️⃣  Muestra el post principal
	test('muestra el contenido del post principal', async () => {
		ForumService.getReplies.mockResolvedValue({ data: [] });
		render(<ThreadDialog {...buildProps()} />);

		await waitFor(() => {
			expect(screen.getByText('Este es el mensaje principal del hilo.')).toBeInTheDocument();
		});

		await waitFor(() => expect(screen.getByText('forum.noReplies')).toBeInTheDocument());
	});

	// 4️⃣  Cargando respuestas → spinner
	test('muestra el indicador de carga mientras se obtienen las respuestas', () => {
		ForumService.getReplies.mockReturnValue(new Promise(() => {}));
		render(<ThreadDialog {...buildProps()} />);
		expect(screen.getByText('Cargando respuestas...')).toBeInTheDocument();
	});

	// 5️⃣  Respuestas cargadas → las muestra
	test('muestra las respuestas tras cargarlas', async () => {
		ForumService.getReplies.mockResolvedValue({
			data: [
				{
					id: 10,
					content: 'Primera respuesta',
					createdAt: new Date().toISOString(),
					isDm: false,
					isOoc: false,
					visibleToCharacterIds: [],
					authorCharacterName: 'Jugador1',
				},
				{
					id: 11,
					content: 'Segunda respuesta',
					createdAt: new Date().toISOString(),
					isDm: false,
					isOoc: false,
					visibleToCharacterIds: [],
					authorCharacterName: 'Jugador2',
				},
			],
		});

		render(<ThreadDialog {...buildProps()} />);

		await waitFor(() => {
			expect(screen.getByText('Primera respuesta')).toBeInTheDocument();
			expect(screen.getByText('Segunda respuesta')).toBeInTheDocument();
		});
	});

	// 6️⃣  Sin respuestas → mensaje vacío
	test('muestra el mensaje de sin respuestas si el array está vacío', async () => {
		ForumService.getReplies.mockResolvedValue({ data: [] });
		render(<ThreadDialog {...buildProps()} />);

		await waitFor(() => {
			expect(screen.getByText('forum.noReplies')).toBeInTheDocument();
		});
	});

	// 7️⃣  Hilo bloqueado → no muestra PostEditor
	test('muestra el mensaje de hilo bloqueado si el post tiene isLocked true', async () => {
		ForumService.getReplies.mockResolvedValue({ data: [] });
		render(<ThreadDialog {...buildProps({ post: { ...mockPost, isLocked: true } })} />);

		await waitFor(() => {
			expect(screen.getByText('forum.dialog.locked')).toBeInTheDocument();
			expect(screen.queryByTestId('post-editor')).not.toBeInTheDocument();
		});
	});

	// 8️⃣  Campaña pausada → no muestra PostEditor para jugadores
	test('no muestra el PostEditor si la campaña está pausada y el usuario no es DM', async () => {
		ForumService.getReplies.mockResolvedValue({ data: [] });
		render(<ThreadDialog {...buildProps({ campaignStatus: 'BREAK', isOwner: false })} />);

		await waitFor(() => {
			expect(screen.getByText('forum.campaign.readOnly')).toBeInTheDocument();
			expect(screen.queryByTestId('post-editor')).not.toBeInTheDocument();
		});
	});

	// 9️⃣  Hilo abierto → muestra PostEditor
	test('muestra el PostEditor si el hilo está abierto y el usuario puede escribir', async () => {
		ForumService.getReplies.mockResolvedValue({ data: [] });
		render(<ThreadDialog {...buildProps()} />);

		await waitFor(() => {
			expect(screen.getByTestId('post-editor')).toBeInTheDocument();
		});
	});

	// 🔟  Nueva respuesta añadida a la lista sin recargar
	test('añade la nueva respuesta a la lista al enviar', async () => {
		render(<ThreadDialog {...buildProps()} />);

		await waitFor(() => expect(screen.getByText('forum.noReplies')).toBeInTheDocument());

		ForumService.getReplies.mockResolvedValue({
			data: [
				{
					id: 99,
					content: 'Nueva respuesta',
					createdAt: new Date().toISOString(),
					isDm: false,
					isOoc: false,
					visibleToCharacterIds: [],
					authorCharacterName: 'Arador',
				},
			],
		});

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'common.send' }));

		await waitFor(() => {
			expect(screen.getByText('Nueva respuesta')).toBeInTheDocument();
		});
	});

	// 1️⃣1️⃣  Botón cerrar → llama a handleClose
	test('llama a handleClose al hacer click en el botón cerrar', async () => {
		ForumService.getReplies.mockResolvedValue({ data: [] });
		const handleClose = vi.fn();
		render(<ThreadDialog {...buildProps({ handleClose })} />);

		await waitFor(() => expect(screen.getByText('forum.noReplies')).toBeInTheDocument());

		const user = userEvent.setup();
		await user.click(screen.getByTestId('x-icon').closest('button'));

		expect(handleClose).toHaveBeenCalledOnce();
	});
});
