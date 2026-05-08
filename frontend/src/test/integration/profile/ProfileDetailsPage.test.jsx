import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ProfileDetailsPage } from '../../../pages/profile/ProfileDetailsPage';
import profileService from '../../../services/ProfileService';
import campaignService from '../../../services/CampaignService';
import characterService from '../../../services/CharacterService';
import { useAuth } from '../../../utils/AuthContext';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/ProfileService', () => ({
	default: {
		getProfile: vi.fn(),
		getUserInfo: vi.fn(),
		updateProfile: vi.fn(),
		createProfile: vi.fn(),
	},
}));

vi.mock('../../../services/CampaignService', () => ({
	default: { getMyCampaigns: vi.fn() },
}));

vi.mock('../../../services/CharacterService', () => ({
	default: { getMyCharacters: vi.fn() },
}));

vi.mock('../../../utils/AuthContext', () => ({
	useAuth: vi.fn(),
}));

vi.mock('../../../components/reviews/ReviewList', () => ({
	default: () => <div data-testid='mock-review-list' />,
}));

vi.mock('../../../components/reviews/StarRatingBadge', () => ({
	default: () => <div data-testid='mock-star-rating-badge' />,
}));

vi.mock('react-i18next', () => {
	const t = key => key;
	return {
		useTranslation: () => ({ t }),
	};
});

vi.mock('react-hot-toast', () => ({
	default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({
		primary: 'blue',
		secondary: 'blue',
		textPrimary: 'text-blue-900',
		textSecondary: 'text-blue-600',
		bgLight: 'bg-blue-50',
		lightborder: 'border-blue-200',
		banner: 'from-blue-500 to-blue-700',
	}),
}));

// Componentes hijos complejos → neutralizados
vi.mock('../../../components/profile/EditProfileModal', () => ({
	EditProfileModal: ({ open, onSave }) =>
		open ? (
			<div role='dialog' data-testid='edit-profile-modal'>
				<button
					onClick={async () => {
						try {
							await onSave({ profileName: 'AlexModificado', description: '', image: '' });
						} catch (e) {}
					}}
				>
					common.save
				</button>
			</div>
		) : null,
}));

vi.mock('../../../components/profile/CreateProfileModal', () => ({
	CreateProfileModal: ({ open, onCreate }) =>
		open ? (
			<div role='dialog' data-testid='create-profile-modal'>
				<button
					onClick={async () => {
						try {
							await onCreate({ profileName: 'NuevoPerfil' });
						} catch (e) {}
					}}
				>
					common.create
				</button>
			</div>
		) : null,
}));

vi.mock('../../../components/profile/ProfileCampaignList', () => ({
	ProfileCampaignList: ({ campaigns, type }) => (
		<div data-testid={`campaign-list-${type}`}>
			{type === 'master'
				? campaigns.asMaster.map(c => <div key={c.id}>{c.name}</div>)
				: campaigns.asPlayer.map(c => <div key={c.id}>{c.name}</div>)}
		</div>
	),
}));

vi.mock('../../../components/profile/ProfileCharacterList', () => ({
	ProfileCharacterList: ({ characters, onCharacterClick }) => (
		<div data-testid='character-list'>
			{characters.map(c => (
				<button key={c.id} onClick={() => onCharacterClick(c.id)}>
					{c.name}
				</button>
			))}
		</div>
	),
}));

vi.mock('../../../components/character/CharacterDetailDialog', () => ({
	default: ({ open, characterId }) => (open ? <div data-testid='character-dialog'>Character {characterId}</div> : null),
}));

// Mockear window.location.reload para que no rompa el entorno de tests
Object.defineProperty(window, 'location', {
	configurable: true,
	value: { reload: vi.fn() },
});

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
	Card: ({ children }) => <div>{children}</div>,
	CardBody: ({ children }) => <div>{children}</div>,
	Avatar: ({ alt }) => <img alt={alt} />,
	Button: ({ children, onClick, disabled, variant: _v }) => (
		<button onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
	Spinner: () => <div data-testid='spinner' />,
	Chip: ({ value }) => <span>{value}</span>,
	Tabs: ({ children }) => <div>{children}</div>,
	TabsHeader: ({ children }) => <div>{children}</div>,
	TabsBody: ({ children }) => <div>{children}</div>,
	Tab: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
	TabPanel: ({ children }) => <div>{children}</div>,
}));

vi.mock('@heroicons/react/24/outline', async importOriginal => {
	const actual = await importOriginal();
	return {
		...actual,
		UserCircleIcon: () => null,
		TrophyIcon: () => null,
		IdentificationIcon: () => null,
		GlobeAltIcon: () => null,
		ArrowsRightLeftIcon: () => null,
	};
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const activeProfile = { name: 'AlexTable', type: 'TABLETOP' };

const mockProfileData = {
	profileName: 'AlexTable',
	description: 'Amante del rol.',
	image: null,
};

const mockUserData = {
	email: 'alex@email.com',
	timeZone: 'Europe/Madrid',
	profiles: [{ id: 1, profileName: 'AlexTable', roleType: 'TABLETOP', image: null }],
};

const mockCampaigns = {
	asMaster: [{ id: 1, name: 'La Maldición de Strahd', status: 'OPEN', pendingRequests: 0 }],
	asPlayer: [],
};

const mockCharacters = [{ id: 10, name: 'Arador el Valiente', image: null, campaign_name: 'Strahd' }];

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderPage = () =>
	render(
		<MemoryRouter>
			<ProfileDetailsPage />
		</MemoryRouter>,
	);

const setupMocks = () => {
	useAuth.mockReturnValue({ activeProfile, setActiveProfile: vi.fn() });
	profileService.getProfile.mockResolvedValue(mockProfileData);
	profileService.getUserInfo.mockResolvedValue(mockUserData);
	campaignService.getMyCampaigns.mockResolvedValue(mockCampaigns);
	characterService.getMyCharacters.mockResolvedValue(mockCharacters);
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProfileDetailsPage — Tests de Integración', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.setItem('activeProfile', JSON.stringify(activeProfile));
		localStorage.setItem(
			'availableProfiles',
			JSON.stringify([{ email: 'alex@email.com', profileName: 'AlexTable', roleType: 'TABLETOP' }]),
		);
	});

	afterEach(() => localStorage.clear());

	// 1️⃣  Spinner mientras carga
	test('muestra el spinner mientras se cargan los datos del perfil', () => {
		useAuth.mockReturnValue({ activeProfile, setActiveProfile: vi.fn() });
		profileService.getProfile.mockReturnValue(new Promise(() => {}));
		profileService.getUserInfo.mockReturnValue(new Promise(() => {}));
		campaignService.getMyCampaigns.mockReturnValue(new Promise(() => {}));
		characterService.getMyCharacters.mockReturnValue(new Promise(() => {}));

		renderPage();
		expect(screen.getByTestId('spinner')).toBeInTheDocument();
	});

	// 2️⃣  Nombre del perfil
	test('muestra el nombre del perfil tras cargarlo', async () => {
		setupMocks();
		renderPage();

		await waitFor(() => {
			const elements = screen.getAllByText('AlexTable');
			expect(elements.length).toBeGreaterThan(0);
			expect(elements[0]).toBeInTheDocument();
		});
	});

	// 3️⃣  Descripción del perfil
	test('muestra la descripción del perfil', async () => {
		setupMocks();
		renderPage();

		await waitFor(() => {
			expect(screen.getByText('Amante del rol.')).toBeInTheDocument();
		});
	});

	// 4️⃣  Email de la cuenta
	test('muestra el email de la cuenta del usuario', async () => {
		setupMocks();
		renderPage();

		await waitFor(() => {
			expect(screen.getByText('alex@email.com')).toBeInTheDocument();
		});
	});

	// 5️⃣  Lista de campañas → visible
	test('muestra la lista de campañas del master', async () => {
		setupMocks();
		renderPage();

		await waitFor(() => {
			expect(screen.getByTestId('campaign-list-master')).toBeInTheDocument();
			expect(screen.getByText('La Maldición de Strahd')).toBeInTheDocument();
		});
	});

	// 6️⃣  Lista de personajes → visible
	test('muestra la lista de personajes del perfil', async () => {
		setupMocks();
		renderPage();

		await waitFor(() => {
			expect(screen.getByTestId('character-list')).toBeInTheDocument();
			expect(screen.getByText('Arador el Valiente')).toBeInTheDocument();
		});
	});

	// 7️⃣  Botón editar perfil → abre modal
	test('abre el modal de editar perfil al hacer click en el botón editar', async () => {
		setupMocks();
		renderPage();

		await waitFor(() => screen.getAllByText('AlexTable'));
		await userEvent.click(screen.getByRole('button', { name: /profile.edit.button/i }));

		expect(screen.getByTestId('edit-profile-modal')).toBeInTheDocument();
	});

	// 8️⃣  Guardar perfil → llama al servicio
	test('llama a updateProfile al guardar cambios del perfil', async () => {
		setupMocks();
		profileService.updateProfile.mockResolvedValue({});
		renderPage();

		// AQUÍ ESTABA EL FALLO: Cambiamos getByText por getAllByText
		await waitFor(() => screen.getAllByText('AlexTable'));

		await userEvent.click(screen.getByRole('button', { name: /profile.edit.button/i }));
		await userEvent.click(screen.getByRole('button', { name: /common.save/i }));

		await waitFor(() => {
			expect(profileService.updateProfile).toHaveBeenCalledOnce();
		});
	});

	// 9️⃣  Botón crear perfil → visible si solo hay 1 perfil
	test('muestra el botón para crear un segundo perfil si solo hay uno', async () => {
		setupMocks();
		renderPage();

		await waitFor(() => {
			// El usuario tiene 1 perfil → puede crear otro
			expect(screen.getByText(/profile.createType/i)).toBeInTheDocument();
		});
	});

	// 🔟  No muestra botón crear si ya tiene 2 perfiles
	test('no muestra el botón de crear perfil si ya tiene 2 perfiles', async () => {
		useAuth.mockReturnValue({ activeProfile, setActiveProfile: vi.fn() });
		profileService.getProfile.mockResolvedValue(mockProfileData);
		profileService.getUserInfo.mockResolvedValue({
			...mockUserData,
			profiles: [
				{ id: 1, profileName: 'AlexTable', roleType: 'TABLETOP', image: null },
				{ id: 2, profileName: 'AlexNarrative', roleType: 'WRITTEN', image: null },
			],
		});
		campaignService.getMyCampaigns.mockResolvedValue(mockCampaigns);
		characterService.getMyCharacters.mockResolvedValue([]);

		renderPage();

		await waitFor(() => screen.getAllByText('AlexTable'));
		expect(screen.queryByText(/profile.createType/i)).not.toBeInTheDocument();
	});

	// 1️⃣1️⃣  Abrir detalle del personaje
	test('abre el modal de detalle de personaje al hacer click en uno', async () => {
		setupMocks();
		renderPage();

		await waitFor(() => screen.getByTestId('character-list'));

		// Hacemos clic en el personaje
		await userEvent.click(screen.getByText('Arador el Valiente'));

		// Comprobamos que el diálogo se abre con el ID correcto (10)
		expect(screen.getByTestId('character-dialog')).toBeInTheDocument();
		expect(screen.getByText('Character 10')).toBeInTheDocument();
	});

	// 1️⃣2️⃣  Cambiar de perfil (Switch Profile)
	test('cambia el perfil activo y recarga la página al hacer click en otro perfil', async () => {
		setupMocks();
		// Le damos dos perfiles, uno activo y otro inactivo
		profileService.getUserInfo.mockResolvedValue({
			...mockUserData,
			profiles: [
				{ id: 1, profileName: 'AlexTable', roleType: 'TABLETOP', image: null },
				{ id: 2, profileName: 'AlexNarrative', roleType: 'WRITTEN', image: null },
			],
		});
		// Preparamos el localStorage con los datos completos
		localStorage.setItem(
			'availableProfiles',
			JSON.stringify([
				{ email: 'alex@email.com', profileName: 'AlexTable', roleType: 'TABLETOP' },
				{ email: 'alex@email.com', profileName: 'AlexNarrative', roleType: 'WRITTEN' },
			]),
		);

		renderPage();

		await waitFor(() => screen.getByText('AlexNarrative'));

		// Hacemos clic en el perfil inactivo
		await userEvent.click(screen.getByText('AlexNarrative'));

		// Verificamos que se guardó en localStorage y se llamó a reload
		const newActive = JSON.parse(localStorage.getItem('activeProfile'));
		expect(newActive.name).toBe('AlexNarrative');
		expect(window.location.reload).toHaveBeenCalled();
	});

	// 1️⃣3️⃣  Crear nuevo perfil
	test('llama a createProfile y recarga al crear un nuevo perfil', async () => {
		setupMocks();
		profileService.createProfile.mockResolvedValue({ id: 3, profileName: 'NuevoPerfil', roleType: 'WRITTEN' });

		renderPage();
		await waitFor(() => {
			expect(screen.getByText(/profile.createType/i)).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText(/profile.createType/i));

		expect(screen.getByTestId('create-profile-modal')).toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: /common.create/i }));

		await waitFor(() => {
			expect(profileService.createProfile).toHaveBeenCalled();
		});

		await waitFor(
			() => {
				expect(window.location.reload).toHaveBeenCalled();
			},
			{ timeout: 3000 },
		);
	});

	// 1️⃣4️⃣  Mensaje cuando no hay campañas
	test('muestra mensaje de vacío cuando no hay campañas en ningún rol', async () => {
		setupMocks();
		// Simulamos que no tiene campañas
		campaignService.getMyCampaigns.mockResolvedValue({ asMaster: [], asPlayer: [] });

		renderPage();

		await waitFor(() => {
			expect(screen.getByText('profile.noCampaigns')).toBeInTheDocument();
		});
	});

	// 1️⃣5️⃣  Manejo de Error al Guardar Perfil
	test('muestra toast de error si falla la actualización del perfil', async () => {
		setupMocks();

		profileService.updateProfile.mockImplementation(() => Promise.reject(new Error('API Down')));

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const toast = await import('react-hot-toast');

		renderPage();

		await waitFor(() => screen.getAllByText('AlexTable'));

		await userEvent.click(screen.getByRole('button', { name: /profile.edit.button/i }));
		await userEvent.click(screen.getByRole('button', { name: /common.save/i }));

		await waitFor(() => {
			expect(toast.default.error).toHaveBeenCalledWith('profile.edit.saveError');
		});

		consoleSpy.mockRestore();
	});

	// 1️⃣6️⃣  Manejo de Error al Cargar Datos Principales
	test('maneja errores en el fetchAllData silenciosamente', async () => {
		useAuth.mockReturnValue({ activeProfile, setActiveProfile: vi.fn() });
		// Rompemos el fetch de la API intencionalmente
		profileService.getProfile.mockRejectedValue(new Error('Fallo crítico'));

		// Espiamos console.error para que no ensucie la terminal y comprobamos que se llama
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		renderPage();

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith('Error cargando datos del perfil', expect.any(Error));
		});

		consoleSpy.mockRestore();
	});
});
