import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CampaignCharacterList from '../../../components/character/CampaignCharacterList';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}));

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({
		primary: 'blue',
		textPrimary: 'text-blue-900',
		bgLight: 'bg-blue-50',
	}),
}));

// Mock del diálogo hijo
vi.mock('../../../components/character/CharacterDetailDialog', () => ({
	default: ({ open, characterId, handleClose }) =>
		open ? (
			<div data-testid='mock-detail-dialog'>
				<p>Viendo personaje: {characterId}</p>
				<button onClick={handleClose}>close</button>
			</div>
		) : null,
}));

// Material Tailwind simplificado
vi.mock('@material-tailwind/react', () => ({
	Card: ({ children, className }) => <div className={className}>{children}</div>,
	Typography: ({ children }) => <span>{children}</span>,
	List: ({ children }) => <ul>{children}</ul>,
	ListItem: ({ children }) => <li>{children}</li>,
	ListItemPrefix: ({ children }) => <div>{children}</div>,

	// importante: propagamos src para testear avatars
	Avatar: ({ alt, src }) => <img alt={alt} src={src} data-testid='avatar-img' />,

	Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('@heroicons/react/24/solid', () => ({
	EyeIcon: () => <svg data-testid='eye-icon' />,
}));

// ─── Datos Mock ──────────────────────────────────────────────────────────────

const mockCharacters = [
	{
		id: 10,
		name: 'Arador el Valiente',
		image: null,
	},
	{
		id: 11,
		name: 'Lira la Maga',
		image: 'https://example.com/lira.jpg',
	},
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CampaignCharacterList — Tests Unitarios', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ── Empty states ────────────────────────────────────────────────────────

	test('muestra el mensaje de estado vacío si no hay personajes', () => {
		render(<CampaignCharacterList characters={[]} />);

		expect(screen.getByText('character.list.withoutCharacters')).toBeInTheDocument();
	});

	test('muestra el mensaje de estado vacío si characters es null', () => {
		render(<CampaignCharacterList characters={null} />);

		expect(screen.getByText('character.list.withoutCharacters')).toBeInTheDocument();
	});

	// ── Renderizado ─────────────────────────────────────────────────────────

	test('renderiza la lista de personajes correctamente con contador', () => {
		render(<CampaignCharacterList characters={mockCharacters} />);

		expect(screen.getByText(/character.characters/)).toBeInTheDocument();

		expect(screen.getByText('Arador el Valiente')).toBeInTheDocument();

		expect(screen.getByText('Lira la Maga')).toBeInTheDocument();
	});

	// ── Avatares ────────────────────────────────────────────────────────────

	test('usa avatar fallback si el personaje no tiene imagen', () => {
		render(<CampaignCharacterList characters={[mockCharacters[0]]} />);

		const avatar = screen.getByTestId('avatar-img');

		expect(avatar).toHaveAttribute('src', expect.stringContaining('ui-avatars.com'));
	});

	test('usa la imagen del personaje si existe', () => {
		render(<CampaignCharacterList characters={[mockCharacters[1]]} />);

		expect(screen.getByTestId('avatar-img')).toHaveAttribute('src', 'https://example.com/lira.jpg');
	});

	// ── Interacciones ───────────────────────────────────────────────────────

	test('abre el diálogo con el ID correcto al pulsar el primer personaje', async () => {
		render(<CampaignCharacterList characters={mockCharacters} />);

		const buttons = screen.getAllByRole('button');

		await userEvent.click(buttons[0]);

		expect(screen.getByTestId('mock-detail-dialog')).toBeInTheDocument();

		expect(screen.getByText('Viendo personaje: 10')).toBeInTheDocument();
	});

	test('abre el diálogo con el segundo personaje correcto', async () => {
		render(<CampaignCharacterList characters={mockCharacters} />);

		const buttons = screen.getAllByRole('button');

		await userEvent.click(buttons[1]);

		expect(screen.getByText('Viendo personaje: 11')).toBeInTheDocument();
	});

	test('cierra el diálogo al ejecutar handleClose', async () => {
		render(<CampaignCharacterList characters={mockCharacters} />);

		const buttons = screen.getAllByRole('button');

		await userEvent.click(buttons[0]);

		expect(screen.getByTestId('mock-detail-dialog')).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: /close/i }));

		expect(screen.queryByTestId('mock-detail-dialog')).not.toBeInTheDocument();
	});
});
