import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import { ProfileCampaignList } from '../../../components/profile/ProfileCampaignList';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('react-i18next', () => {
	const t = key => key;
	return {
		useTranslation: () => ({ t }),
	};
});

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
	Card: ({ children, onClick }) => (
		<div onClick={onClick} data-testid='campaign-card'>
			{children}
		</div>
	),
	CardBody: ({ children }) => <div>{children}</div>,
	Chip: ({ value }) => <span>{value}</span>,
	Badge: ({ children, content }) => (
		<div>
			<span data-testid='badge'>{content}</span>
			{children}
		</div>
	),
}));

vi.mock('@heroicons/react/24/outline', async importOriginal => {
	const actual = await importOriginal();
	return { ...actual, UserPlusIcon: () => null };
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockCampaigns = {
	asMaster: [
		{ id: 1, name: 'La Maldición de Strahd', status: 'OPEN', pendingRequests: 2 },
		{ id: 2, name: 'El Camino de Seda', status: 'ACTIVE', pendingRequests: 0 },
	],
	asPlayer: [{ id: 3, name: 'Crónicas de Ámbar', status: 'OPEN', pendingRequests: 0 }],
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProfileCampaignList — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// ── Modo Master ───────────────────────────────────────────────────────────

	test('muestra el título de campañas como master', () => {
		render(<ProfileCampaignList campaigns={mockCampaigns} type='master' />);
		expect(screen.getByText('home.masterCampaigns.title')).toBeInTheDocument();
	});

	test('renderiza todas las campañas del master', () => {
		render(<ProfileCampaignList campaigns={mockCampaigns} type='master' />);
		expect(screen.getByText('La Maldición de Strahd')).toBeInTheDocument();
		expect(screen.getByText('El Camino de Seda')).toBeInTheDocument();
	});

	test('muestra el chip de estado correcto para cada campaña', () => {
		render(<ProfileCampaignList campaigns={mockCampaigns} type='master' />);
		expect(screen.getByText('status.open')).toBeInTheDocument();
		expect(screen.getByText('status.active')).toBeInTheDocument();
	});

	test('muestra el badge de solicitudes pendientes si pendingRequests > 0', () => {
		render(<ProfileCampaignList campaigns={mockCampaigns} type='master' />);
		expect(screen.getByTestId('badge')).toBeInTheDocument();
		expect(screen.getByTestId('badge')).toHaveTextContent('2');
	});

	test('no muestra badge si no hay solicitudes pendientes', () => {
		const sinPendientes = {
			asMaster: [{ id: 1, name: 'Campaña', status: 'OPEN', pendingRequests: 0 }],
			asPlayer: [],
		};
		render(<ProfileCampaignList campaigns={sinPendientes} type='master' />);
		expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
	});

	test('navega al detalle de la campaña al hacer click', async () => {
		render(<ProfileCampaignList campaigns={mockCampaigns} type='master' />);
		const cards = screen.getAllByTestId('campaign-card');
		await userEvent.click(cards[0]);
		expect(mockNavigate).toHaveBeenCalledWith('/campaign/1');
	});

	// ── Modo Player ───────────────────────────────────────────────────────────

	test('muestra el título de campañas como jugador', () => {
		render(<ProfileCampaignList campaigns={mockCampaigns} type='player' />);
		expect(screen.getByText('home.playerCampaigns.title')).toBeInTheDocument();
	});

	test('renderiza las campañas en las que participa como jugador', () => {
		render(<ProfileCampaignList campaigns={mockCampaigns} type='player' />);
		expect(screen.getByText('Crónicas de Ámbar')).toBeInTheDocument();
	});

	test('no renderiza nada si el jugador no tiene campañas', () => {
		const sinCampañas = { asMaster: [], asPlayer: [] };
		const { container } = render(<ProfileCampaignList campaigns={sinCampañas} type='player' />);
		expect(container).toBeEmptyDOMElement();
	});
});
