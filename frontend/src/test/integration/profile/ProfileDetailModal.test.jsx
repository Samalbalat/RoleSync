import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import ProfileDetailModal from '../../../components/profile/ProfileDetailModal';
import profileService from '../../../services/ProfileService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/ProfileService', () => ({
	default: { getProfileByName: vi.fn() },
}));

vi.mock('../../../components/reviews/ReviewList', () => ({
	default: () => <div data-testid='mock-review-list' />,
}));

vi.mock('../../../components/reviews/StarRatingBadge', () => ({
	default: () => <div data-testid='mock-star-rating-badge' />,
}));

vi.mock('@material-tailwind/react', () => ({
	Dialog: ({ open, children }) => (open ? <div role='dialog'>{children}</div> : null),
	DialogHeader: ({ children }) => <div>{children}</div>,
	DialogBody: ({ children }) => <div>{children}</div>,
	Typography: ({ children }) => <div>{children}</div>,
	Avatar: ({ alt }) => <img alt={alt} />,
	Spinner: () => <div data-testid='spinner' />,
	Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('@heroicons/react/24/outline', async importOriginal => {
	const actual = await importOriginal();
	return { ...actual, XMarkIcon: () => <span data-testid='x-icon' /> };
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockProfile = {
	id: 1,
	profileName: 'AlexTable',
	description: 'Un amante del rol desde hace 10 años.',
	image: null,
	reviewSummary: {
		average: 4.5,
		count: 12,
	},
};

const onClose = vi.fn();

const defaultProps = {
	isOpen: true,
	onClose,
	profileName: 'AlexTable',
	roleType: 'TABLETOP',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProfileDetailModal — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Visibilidad
	test('muestra el modal cuando isOpen es true', async () => {
		profileService.getProfileByName.mockResolvedValue(mockProfile);
		render(<ProfileDetailModal {...defaultProps} />);
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	test('no muestra el modal cuando isOpen es false', () => {
		render(<ProfileDetailModal {...defaultProps} isOpen={false} />);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	// 2️⃣  Estado de carga
	test('muestra el spinner mientras se carga el perfil', () => {
		profileService.getProfileByName.mockReturnValue(new Promise(() => {}));
		render(<ProfileDetailModal {...defaultProps} />);
		expect(screen.getByTestId('spinner')).toBeInTheDocument();
	});

	// 3️⃣  Datos cargados → los muestra
	test('muestra el nombre del perfil tras cargarlo', async () => {
		profileService.getProfileByName.mockResolvedValue(mockProfile);
		render(<ProfileDetailModal {...defaultProps} />);

		await waitFor(() => {
			expect(screen.getByText('AlexTable')).toBeInTheDocument();
		});
	});

	test('muestra la descripción del perfil', async () => {
		profileService.getProfileByName.mockResolvedValue(mockProfile);
		render(<ProfileDetailModal {...defaultProps} />);

		await waitFor(() => {
			expect(screen.getByText('"Un amante del rol desde hace 10 años."')).toBeInTheDocument();
		});
	});

	// 4️⃣  Sin descripción → muestra mensaje por defecto
	test('muestra el texto por defecto si el perfil no tiene descripción', async () => {
		profileService.getProfileByName.mockResolvedValue({ ...mockProfile, description: null });
		render(<ProfileDetailModal {...defaultProps} />);

		await waitFor(() => {
			expect(screen.getByText('Este usuario aún no ha escrito una descripción.')).toBeInTheDocument();
		});
	});

	// 5️⃣  Error al cargar → muestra mensaje de error
	test('muestra el mensaje de error si el servicio falla', async () => {
		profileService.getProfileByName.mockRejectedValue(new Error('Error de red'));
		render(<ProfileDetailModal {...defaultProps} />);

		await waitFor(() => {
			expect(screen.getByText('No se pudo cargar la información.')).toBeInTheDocument();
		});
	});

	// 6️⃣  Llama al servicio con los parámetros correctos
	test('llama a getProfileByName con el roleType y profileName correctos', async () => {
		profileService.getProfileByName.mockResolvedValue(mockProfile);
		render(<ProfileDetailModal {...defaultProps} />);

		await waitFor(() => {
			expect(profileService.getProfileByName).toHaveBeenCalledWith('TABLETOP', 'AlexTable');
		});
	});

	// 7️⃣  No llama al servicio si profileName es null
	test('no llama al servicio si profileName es null', () => {
		render(<ProfileDetailModal {...defaultProps} profileName={null} />);
		expect(profileService.getProfileByName).not.toHaveBeenCalled();
	});

	// 8️⃣  Botón cerrar → llama a onClose
	test('llama a onClose al hacer click en el botón cerrar', async () => {
		profileService.getProfileByName.mockResolvedValue(mockProfile);
		render(<ProfileDetailModal {...defaultProps} />);

		await waitFor(() => screen.getByRole('dialog'));
		await userEvent.click(screen.getByTestId('x-icon').closest('button'));
		expect(onClose).toHaveBeenCalledOnce();
	});
});
