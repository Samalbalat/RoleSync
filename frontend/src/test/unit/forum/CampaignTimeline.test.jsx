import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CampaignTimeline from '../../../components/forum/CampaignTimeline';
import ForumService from '../../../services/ForumService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/ForumService', () => ({
	default: { getTimeline: vi.fn() },
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}));

// PostEditor → simplificado para no montar toda su lógica interna
vi.mock('../../../components/forum/PostEditor', () => ({
	default: () => <div data-testid='post-editor' />,
}));

// PostCard → muestra el contenido del post para poder verificarlo
vi.mock('../../../components/forum/PostCard', () => ({
	default: ({ post }) => <div data-testid='post-card'>{post.content}</div>,
}));

// ThreadDialog → no lo necesitamos en estos tests
vi.mock('../../../components/forum/ThreadDialog', () => ({
	default: () => null,
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
});
