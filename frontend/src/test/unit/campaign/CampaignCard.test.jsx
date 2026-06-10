import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import CampaignCard from '../../../components/campaign/CampaignCard';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}));

vi.mock('../../../components/reviews/ReviewList', () => ({
	default: () => <div data-testid='mock-review-list' />,
}));

vi.mock('../../../components/reviews/StarRatingBadge', () => ({
	default: () => <div data-testid='mock-star-rating-badge' />,
}));

vi.mock('@material-tailwind/react', () => ({
	Card: ({ children, onClick, className }) => (
		<div onClick={onClick} className={className}>
			{children}
		</div>
	),
	CardBody: ({ children }) => <div>{children}</div>,
	Typography: ({ children }) => <div>{children}</div>,
	Chip: ({ value }) => <span>{value}</span>,
	Tooltip: ({ children }) => <div>{children}</div>,
}));

vi.mock('@heroicons/react/24/solid', () => ({
	UserGroupIcon: () => null,
	CalendarIcon: () => null,
	ChatBubbleLeftRightIcon: () => null,
}));

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const theme = { primary: 'blue', textPrimary: 'text-blue-900', bgLight: 'bg-blue-50', lightborder: 'border-blue-100' };

const campanaTabletop = {
	id: 1,
	name: 'La Maldición de Strahd',
	status: 'OPEN',
	type: 'TABLETOP',
	system: 'D&D 5e',
	image: 'https://example.com/img.jpg',
	themes: ['Horror', 'Gothic'],
	currentPlayers: 2,
	maxPlayers: 5,
	schedule: 'Viernes 20:00',
	reviewSummary: { averageRating: 4.5, totalReviews: 10 },
};

const campanaWritten = {
	...campanaTabletop,
	id: 2,
	type: 'WRITTEN',
	communication: 'Discord',
	reviewSummary: { averageRating: 4.5, totalReviews: 10 },
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CampaignCard — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Renderizado básico
	test('muestra el nombre de la campaña', () => {
		render(<CampaignCard campana={campanaTabletop} theme={theme} />);
		expect(screen.getByText('La Maldición de Strahd')).toBeInTheDocument();
	});

	// 2️⃣  Estado OPEN → texto y chip verde
	test('muestra el estado correcto para una campaña abierta', () => {
		render(<CampaignCard campana={campanaTabletop} theme={theme} />);
		expect(screen.getByText('status.open')).toBeInTheDocument();
	});

	// 3️⃣  Estado ACTIVE
	test('muestra el estado correcto para una campaña activa', () => {
		render(<CampaignCard campana={{ ...campanaTabletop, status: 'ACTIVE' }} theme={theme} />);
		expect(screen.getByText('status.active')).toBeInTheDocument();
	});

	// 4️⃣  Muestra tags
	test('renderiza los tags de la campaña', () => {
		render(<CampaignCard campana={campanaTabletop} theme={theme} />);
		expect(screen.getByText('Horror')).toBeInTheDocument();
		expect(screen.getByText('Gothic')).toBeInTheDocument();
	});

	// 5️⃣  Navegación al hacer click
	test('navega al detalle de la campaña al hacer click', async () => {
		render(<CampaignCard campana={campanaTabletop} theme={theme} />);
		await userEvent.click(screen.getByText('La Maldición de Strahd'));
		expect(mockNavigate).toHaveBeenCalledWith('/campaign/1');
	});

	// 6️⃣  TABLETOP muestra schedule
	test('muestra el horario para campañas de tipo TABLETOP', () => {
		render(<CampaignCard campana={campanaTabletop} theme={theme} />);
		expect(screen.getByText('Viernes 20:00')).toBeInTheDocument();
	});

	// 7️⃣  WRITTEN muestra communication
	test('muestra el canal de comunicación para campañas de tipo WRITTEN', () => {
		render(<CampaignCard campana={campanaWritten} theme={theme} />);
		expect(screen.getByText('Discord')).toBeInTheDocument();
	});

	// 8️⃣  Contador de jugadores
	test('muestra el contador de jugadores actual/máximo', () => {
		render(<CampaignCard campana={campanaTabletop} theme={theme} />);
		expect(screen.getByText('2/5')).toBeInTheDocument();
	});

	// 9️⃣  Estado BREAK
	test('muestra el estado correcto para una campaña en pausa (BREAK)', () => {
		render(<CampaignCard campana={{ ...campanaTabletop, status: 'BREAK' }} theme={theme} />);
		expect(screen.getByText('status.break')).toBeInTheDocument();
	});

	// 🔟  Estado FINISHED
	test('muestra el estado correcto para una campaña finalizada (FINISHED)', () => {
		render(<CampaignCard campana={{ ...campanaTabletop, status: 'FINISHED' }} theme={theme} />);
		expect(screen.getByText('status.finished')).toBeInTheDocument();
	});

	// 1️⃣1️⃣ Renderizado de tema único (cuando no es array)
	test('renderiza el campo theme en singular si themes no es un array', () => {
		const campanaSinThemes = { ...campanaTabletop, themes: undefined, theme: 'Cyberpunk' };
		render(<CampaignCard campana={campanaSinThemes} theme={theme} />);
		expect(screen.getByText('Cyberpunk')).toBeInTheDocument();
	});

	// 1️⃣2️⃣ Fallback de la imagen (evento onError)
	test('cambia a la imagen por defecto si la original falla al cargar', () => {
		render(<CampaignCard campana={campanaTabletop} theme={theme} />);

		const imagen = screen.getByAltText('La Maldición de Strahd');
		fireEvent.error(imagen);

		expect(imagen).toHaveAttribute('src', '/default_image.png');
	});

	// 1️⃣3️⃣ Valores undefined (imagen nula y sistema nulo)
	test('renderiza sin errores cuando falta la imagen o el sistema', () => {
		const campanaIncompleta = { ...campanaTabletop, image: null, system: null };
		render(<CampaignCard campana={campanaIncompleta} theme={theme} />);

		expect(screen.getByAltText('La Maldición de Strahd')).toHaveAttribute('src', '/default_image.png');
	});
});
