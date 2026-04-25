import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CharacterDetailDialog from '../../../components/character/CharacterDetailDialog';
import CharacterService from '../../../services/CharacterService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/CharacterService', () => ({
	default: { getCharacterById: vi.fn() },
}));

// 🔥 FIX: Creamos una referencia estable para 't' y evitamos el bucle infinito
const mockT = key => key;
vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: mockT }),
}));

vi.mock('react-hot-toast', () => ({
	default: { error: vi.fn() },
}));

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({ primary: 'blue', textPrimary: 'text-blue-900', bgLight: 'bg-blue-50' }),
}));

vi.mock('@material-tailwind/react', () => ({
	Dialog: ({ children, open }) => (open ? <div data-testid='dialog'>{children}</div> : null),
	DialogHeader: ({ children }) => <header>{children}</header>,
	DialogBody: ({ children }) => <main>{children}</main>,
	DialogFooter: ({ children }) => <footer>{children}</footer>,
	Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
	Typography: ({ children }) => <span>{children}</span>,
	Avatar: ({ alt }) => <img alt={alt} data-testid='avatar' />,
	Spinner: () => <span data-testid='spinner'>Cargando...</span>,
}));

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockCharacterComplete = {
	id: 1,
	name: 'Gimli',
	campaign: { name: 'El Señor de los Anillos' },
	schema: [
		{ label: 'Fuerza', value: 18 },
		{ label: 'Destreza', value: 12 },
		{ label: 'Historia', value: 'Hijo de Glóin.' },
		{ label: 'Descripción', value: 'Enano robusto con hacha.' },
	],
};

const mockCharacterEmpty = {
	id: 2,
	name: 'Aldeano',
	campaign: null,
	schema: [],
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CharacterDetailDialog — Tests Unitarios', () => {
	const handleCloseMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('no llama al servicio si el modal está cerrado', () => {
		render(<CharacterDetailDialog open={false} handleClose={handleCloseMock} characterId={1} />);
		expect(CharacterService.getCharacterById).not.toHaveBeenCalled();
		expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
	});

	test('muestra el estado de carga al abrir el modal', async () => {
		CharacterService.getCharacterById.mockImplementation(() => new Promise(() => {}));
		render(<CharacterDetailDialog open={true} handleClose={handleCloseMock} characterId={1} />);
		expect(screen.getByTestId('spinner')).toBeInTheDocument();
		expect(screen.getByText('character.message.loadingCharacter')).toBeInTheDocument();
	});

	test('renderiza correctamente la historia, descripción y atributos estandar', async () => {
		CharacterService.getCharacterById.mockResolvedValue(mockCharacterComplete);
		render(<CharacterDetailDialog open={true} handleClose={handleCloseMock} characterId={1} />);

		await waitFor(() => {
			expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
		});

		expect(screen.getByText('Gimli')).toBeInTheDocument();
		expect(screen.getByText('campaign.campaign: El Señor de los Anillos')).toBeInTheDocument();
		expect(screen.getByText('Hijo de Glóin.')).toBeInTheDocument();
		expect(screen.getByText('Enano robusto con hacha.')).toBeInTheDocument();
		expect(screen.getByText('Fuerza')).toBeInTheDocument();
		expect(screen.getByText('18')).toBeInTheDocument();
	});

	test('muestra mensaje vacío si el personaje no tiene atributos, historia ni descripción', async () => {
		CharacterService.getCharacterById.mockResolvedValue(mockCharacterEmpty);
		render(<CharacterDetailDialog open={true} handleClose={handleCloseMock} characterId={2} />);

		await waitFor(() => {
			expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
		});

		expect(screen.getByText('character.noAttributes')).toBeInTheDocument();
		expect(screen.getByText('campaign.campaign: home.playerCharacters.noCampaign')).toBeInTheDocument();
	});

	test('muestra error y cierra el modal si falla el fetch', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const { default: toast } = await import('react-hot-toast');
		CharacterService.getCharacterById.mockRejectedValue(new Error('Network error'));

		render(<CharacterDetailDialog open={true} handleClose={handleCloseMock} characterId={99} />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('errors.fetchCharacter');
			expect(handleCloseMock).toHaveBeenCalled();
		});

		consoleSpy.mockRestore();
	});

	test('el botón cerrar ejecuta handleClose', async () => {
		CharacterService.getCharacterById.mockResolvedValue(mockCharacterComplete);

		render(<CharacterDetailDialog open={true} handleClose={handleCloseMock} characterId={1} />);

		await screen.findByText('Gimli');

		await userEvent.click(
			screen.getByRole('button', {
				name: /common.close/i,
			}),
		);

		expect(handleCloseMock).toHaveBeenCalled();
	});

	test('renderiza atributos booleanos usando common.yes/common.no', async () => {
		CharacterService.getCharacterById.mockResolvedValue({
			...mockCharacterComplete,
			schema: [
				{ label: 'Mágico', value: true },
				{ label: 'Maldito', value: false },
			],
		});

		render(<CharacterDetailDialog open handleClose={handleCloseMock} characterId={1} />);

		await screen.findByText('common.yes');
		expect(screen.getByText('common.no')).toBeInTheDocument();
	});

	test('muestra guion cuando atributo está vacío', async () => {
		CharacterService.getCharacterById.mockResolvedValue({
			...mockCharacterComplete,
			schema: [{ label: 'Clase', value: '' }],
		});

		render(<CharacterDetailDialog open handleClose={handleCloseMock} characterId={1} />);

		await screen.findByText('-');
	});

	test('vuelve a pedir datos si cambia characterId', async () => {
		CharacterService.getCharacterById.mockResolvedValueOnce(mockCharacterComplete).mockResolvedValueOnce({
			...mockCharacterComplete,
			name: 'Legolas',
		});

		const { rerender } = render(<CharacterDetailDialog open handleClose={handleCloseMock} characterId={1} />);

		await screen.findByText('Gimli');

		rerender(<CharacterDetailDialog open handleClose={handleCloseMock} characterId={2} />);

		await screen.findByText('Legolas');

		expect(CharacterService.getCharacterById).toHaveBeenCalledTimes(2);
	});
});
