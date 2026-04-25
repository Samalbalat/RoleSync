import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProfileCharacterList } from '../../../components/profile/ProfileCharacterList';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => {
	const t = key => key;
	return {
		useTranslation: () => ({ t }),
	};
});

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({ primary: 'indigo', textPrimary: 'text-indigo-900' }),
}));

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children, className }) => <div className={className}>{children}</div>,
	Card: ({ children, onClick }) => (
		<div onClick={onClick} data-testid='char-card'>
			{children}
		</div>
	),
	CardBody: ({ children }) => <div>{children}</div>,
	Avatar: ({ alt }) => <img alt={alt} />,
}));

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockCharacters = [
	{ id: 10, name: 'Arador el Valiente', image: null, campaign_name: 'La Maldición de Strahd' },
	{ id: 11, name: 'Lira la Maga', image: null, campaign_name: null },
];

const onCharacterClick = vi.fn();

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProfileCharacterList — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Sin personajes → mensaje vacío
	test('muestra el mensaje de sin personajes cuando la lista está vacía', () => {
		render(<ProfileCharacterList characters={[]} onCharacterClick={onCharacterClick} />);
		expect(screen.getByText('profile.noCharacters')).toBeInTheDocument();
	});

	// 2️⃣  Con personajes → los renderiza
	test('renderiza todos los personajes de la lista', () => {
		render(<ProfileCharacterList characters={mockCharacters} onCharacterClick={onCharacterClick} />);
		expect(screen.getByText('Arador el Valiente')).toBeInTheDocument();
		expect(screen.getByText('Lira la Maga')).toBeInTheDocument();
	});

	// 3️⃣  Personaje con campaña → muestra el nombre de la campaña
	test('muestra el nombre de la campaña si el personaje pertenece a una', () => {
		render(<ProfileCharacterList characters={mockCharacters} onCharacterClick={onCharacterClick} />);
		expect(screen.getByText('La Maldición de Strahd')).toBeInTheDocument();
	});

	// 4️⃣  Personaje sin campaña → muestra "sin campaña"
	test('muestra el texto de sin campaña si el personaje no tiene campaña asignada', () => {
		render(<ProfileCharacterList characters={mockCharacters} onCharacterClick={onCharacterClick} />);
		expect(screen.getByText('home.playerCharacters.noCampaign')).toBeInTheDocument();
	});

	// 5️⃣  Click en personaje → llama a onCharacterClick con el id correcto
	test('llama a onCharacterClick con el id del personaje al hacer click', async () => {
		render(<ProfileCharacterList characters={mockCharacters} onCharacterClick={onCharacterClick} />);
		const cards = screen.getAllByTestId('char-card');
		await userEvent.click(cards[0]);
		expect(onCharacterClick).toHaveBeenCalledWith(10);
	});

	test('llama a onCharacterClick con el id correcto del segundo personaje', async () => {
		render(<ProfileCharacterList characters={mockCharacters} onCharacterClick={onCharacterClick} />);
		const cards = screen.getAllByTestId('char-card');
		await userEvent.click(cards[1]);
		expect(onCharacterClick).toHaveBeenCalledWith(11);
	});
});
