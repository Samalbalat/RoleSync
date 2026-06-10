import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import UserCharacterCarousel from '../../../components/character/UserCharacterCarousel';
import CharacterService from '../../../services/CharacterService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
}));

vi.mock('../../../services/CharacterService', () => ({
	default: { getMyCharacters: vi.fn() },
}));

const mockT = key => key;
vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: mockT }),
}));

vi.mock('react-hot-toast', () => ({
	default: { error: vi.fn() },
}));

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({ primary: 'blue', secondary: 'blue', textPrimary: 'text-blue-900', hoverBorder: 'border-blue-500' }),
}));

// Mock de Material Tailwind e Iconos
vi.mock('@material-tailwind/react', () => ({
	Card: ({ children, onClick, className }) => (
		<div data-testid='card' className={className} onClick={onClick}>
			{children}
		</div>
	),
	CardBody: ({ children }) => <div>{children}</div>,
	Typography: ({ children }) => <span>{children}</span>,
	Avatar: ({ alt }) => <img alt={alt} />,
	Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
	Spinner: () => <span data-testid='spinner'>Cargando...</span>,
}));

vi.mock('@heroicons/react/24/outline', () => ({
	ArrowRightIcon: () => <svg data-testid='arrow-icon' />,
}));

vi.mock('../../../components/character/CharacterDetailDialog', () => ({
	default: ({ open, characterId }) => (open ? <div data-testid='mock-dialog'>Viendo a {characterId}</div> : null),
}));

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockMyCharacters = [
	{ id: 10, name: 'Legolas', campaign_name: 'Comunidad del Anillo' },
	{ id: 11, name: 'SinCampaña', campaign_name: null },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('UserCharacterCarousel — Tests Unitarios', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// 1️⃣  Estado de carga
	test('muestra el spinner inicialmente mientras carga los personajes', () => {
		CharacterService.getMyCharacters.mockImplementation(() => new Promise(() => {}));
		render(<UserCharacterCarousel />);
		expect(screen.getByTestId('spinner')).toBeInTheDocument();
	});

	// 2️⃣  Estado vacío
	test('muestra el mensaje vacío y botón de crear si devuelve un array vacío', async () => {
		CharacterService.getMyCharacters.mockResolvedValue([]);
		render(<UserCharacterCarousel />);

		await waitFor(() => {
			expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
		});

		expect(screen.getByText('home.playerCharacters.emptyMessage')).toBeInTheDocument();

		// Clic en el botón de crear personaje
		await userEvent.click(screen.getByText('home.playerCharacters.createButton'));
		expect(mockNavigate).toHaveBeenCalledWith('/createCharacter');
	});

	// 3️⃣  Renderizado de lista y tarjeta de "Ver todos"
	test('renderiza los personajes y la tarjeta de Ver Todos', async () => {
		CharacterService.getMyCharacters.mockResolvedValue(mockMyCharacters);
		render(<UserCharacterCarousel />);

		await waitFor(() => {
			expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
		});

		expect(screen.getByText('Legolas')).toBeInTheDocument();
		expect(screen.getByText('Comunidad del Anillo')).toBeInTheDocument();
		expect(screen.getByText('SinCampaña')).toBeInTheDocument();
		expect(screen.getByText('home.playerCharacters.noCampaign')).toBeInTheDocument();

		// Si esto falla por espacios, puedes cambiarlo a una regex: /common\.viewAll.*2/
		expect(screen.getByText('common.viewAll (2)')).toBeInTheDocument();
	});

	// 4️⃣  Apertura de modal al clickear tarjeta
	test('abre el modal de detalles al clickear una tarjeta de personaje', async () => {
		CharacterService.getMyCharacters.mockResolvedValue(mockMyCharacters);
		render(<UserCharacterCarousel />);

		await waitFor(() => {
			expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
		});

		// Las tarjetas se renderizaron, hacemos click en la primera (Legolas, ID 10)
		const cards = screen.getAllByTestId('card');
		await userEvent.click(cards[0]);

		expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
		expect(screen.getByText('Viendo a 10')).toBeInTheDocument();
	});

	// 5️⃣  Navegación al hacer click en "Ver Todos"
	test('navega al perfil al clickear la tarjeta extra o el botón del título', async () => {
		CharacterService.getMyCharacters.mockResolvedValue(mockMyCharacters);
		render(<UserCharacterCarousel />);

		await waitFor(() => {
			expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
		});

		// Hacemos click en el botón "Ver todos" de la cabecera superior
		const headerButton = screen.getAllByRole('button', { name: /common.viewAll/i })[0];
		await userEvent.click(headerButton);

		expect(mockNavigate).toHaveBeenCalledWith('/myCharacters');
	});
});
