import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import LoginPage from '../../../pages/auth/LoginPage';
import { useAuth } from '../../../utils/AuthContext';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../utils/AuthContext', () => ({
	useAuth: vi.fn(),
}));

// react-i18next → devolvemos la clave como texto para poder buscarlo en pantalla
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: key => key,
	}),
}));

// react-hot-toast → evitamos errores por el portal de toast
vi.mock('react-hot-toast', () => ({
	default: { success: vi.fn(), error: vi.fn() },
}));

// AuthLayout → wrapper neutro para no tener que montar toda la estructura visual
vi.mock('../../../components/auth/AuthLayout', () => ({
	default: ({ children }) => <div>{children}</div>,
}));

// Material Tailwind → sustituimos por elementos HTML nativos.
// Input: usa `inputRef` en lugar de `ref` (patrón de Material Tailwind).
// Filtramos `error` para que React no lance advertencias por prop no estándar.
vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children, color: _color, variant: _v, ...rest }) => <div {...rest}>{children}</div>,
	Input: ({ id, type, placeholder, inputRef, error: _error, ...rest }) => (
		<input id={id} type={type} placeholder={placeholder} ref={inputRef} {...rest} />
	),
	Button: ({ children, disabled, type }) => (
		<button type={type} disabled={disabled}>
			{children}
		</button>
	),
	Spinner: () => <div data-testid='spinner' />,
}));

vi.mock('@heroicons/react/24/solid', () => ({
	EyeIcon: () => <span>Mostrar</span>,
	EyeSlashIcon: () => <span>Ocultar</span>,
}));

// useNavigate → capturamos las llamadas para verificar a qué ruta navega
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderLoginPage = () => {
	render(
		<MemoryRouter initialEntries={['/login']}>
			<LoginPage />
		</MemoryRouter>,
	);
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LoginPage — Tests de Integración', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	// 1️⃣  Renderizado inicial
	test('muestra el formulario con los campos de email y contraseña', () => {
		useAuth.mockReturnValue({ login: vi.fn(), setActiveProfile: vi.fn() });

		renderLoginPage();

		expect(screen.getByPlaceholderText('name@mail.com')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('********')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /auth\.login/i })).toBeInTheDocument();
	});

	// 2️⃣  Validación del formulario vacío
	test('muestra errores de validación si se envía el formulario vacío', async () => {
		useAuth.mockReturnValue({ login: vi.fn(), setActiveProfile: vi.fn() });

		renderLoginPage();

		await userEvent.click(screen.getByRole('button', { name: /auth\.login/i }));

		await waitFor(() => {
			// Las claves de traducción actúan como texto porque t() devuelve la clave
			expect(screen.getByText('auth.emailRequired')).toBeInTheDocument();
			expect(screen.getByText('auth.passwordRequired')).toBeInTheDocument();
		});
	});

	// 3️⃣  Login con 1 perfil → auto-login y navega a /
	test('con 1 perfil: guarda activeProfile en localStorage y navega a /', async () => {
		const mockLogin = vi.fn().mockResolvedValue([{ email: 'alex@email.com', profileName: 'AlexD&D', roleType: 'TABLETOP' }]);
		const mockSetActiveProfile = vi.fn();
		useAuth.mockReturnValue({ login: mockLogin, setActiveProfile: mockSetActiveProfile });

		renderLoginPage();

		await userEvent.type(screen.getByPlaceholderText('name@mail.com'), 'alex@email.com');
		await userEvent.type(screen.getByPlaceholderText('********'), 'password123');
		await userEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			// Comprueba que login se llamó con los datos del formulario
			expect(mockLogin).toHaveBeenCalledWith('alex@email.com', 'password123');

			// Comprueba que se guardó el perfil activo en localStorage
			const savedProfile = JSON.parse(localStorage.getItem('activeProfile'));
			expect(savedProfile).toEqual({ name: 'AlexD&D', type: 'TABLETOP' });

			// Comprueba que setActiveProfile se llamó con el perfil correcto
			expect(mockSetActiveProfile).toHaveBeenCalledWith({ name: 'AlexD&D', type: 'TABLETOP' });

			// Comprueba la navegación
			expect(mockNavigate).toHaveBeenCalledWith('/', expect.objectContaining({ state: expect.anything() }));
		});
	});

	// 4️⃣  Login con 2 perfiles → guarda disponibles y navega al selector
	test('con 2 perfiles: guarda availableProfiles en localStorage y navega a /profile-selection', async () => {
		const mockProfiles = [
			{ email: 'alex@email.com', profileName: 'AlexD&D', roleType: 'TABLETOP' },
			{ email: 'alex@email.com', profileName: 'AlexNarrative', roleType: 'WRITTEN' },
		];
		const mockLogin = vi.fn().mockResolvedValue(mockProfiles);
		useAuth.mockReturnValue({ login: mockLogin, setActiveProfile: vi.fn() });

		renderLoginPage();

		await userEvent.type(screen.getByPlaceholderText('name@mail.com'), 'alex@email.com');
		await userEvent.type(screen.getByPlaceholderText('********'), 'password123');
		await userEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			// Comprueba que se guardaron los perfiles disponibles
			const savedProfiles = JSON.parse(localStorage.getItem('availableProfiles'));
			expect(savedProfiles).toHaveLength(2);
			expect(savedProfiles[0].profileName).toBe('AlexD&D');
			expect(savedProfiles[1].profileName).toBe('AlexNarrative');

			// Comprueba la navegación al selector
			expect(mockNavigate).toHaveBeenCalledWith('/profile-selection');
		});
	});

	// 5️⃣  Error 403 → credenciales incorrectas
	test('muestra mensaje de error si el servidor responde con 403', async () => {
		const mockLogin = vi.fn().mockRejectedValue({ response: { status: 403 } });
		useAuth.mockReturnValue({ login: mockLogin, setActiveProfile: vi.fn() });

		renderLoginPage();

		await userEvent.type(screen.getByPlaceholderText('name@mail.com'), 'alex@email.com');
		await userEvent.type(screen.getByPlaceholderText('********'), 'wrongpassword');
		await userEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			expect(screen.getByText('auth.errorInvalidCredentials')).toBeInTheDocument();
		});
	});

	// 6️⃣  Error 500 → error del servidor
	test('muestra mensaje de error si el servidor responde con 500', async () => {
		const mockLogin = vi.fn().mockRejectedValue({ response: { status: 500 } });
		useAuth.mockReturnValue({ login: mockLogin, setActiveProfile: vi.fn() });

		renderLoginPage();

		await userEvent.type(screen.getByPlaceholderText('name@mail.com'), 'alex@email.com');
		await userEvent.type(screen.getByPlaceholderText('********'), 'password123');
		await userEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			expect(screen.getByText('auth.errorServer')).toBeInTheDocument();
		});
	});

	// 7️⃣  No navega si el login falla
	test('no navega a ninguna ruta si el login falla', async () => {
		const mockLogin = vi.fn().mockRejectedValue({ response: { status: 403 } });
		useAuth.mockReturnValue({ login: mockLogin, setActiveProfile: vi.fn() });

		renderLoginPage();

		await userEvent.type(screen.getByPlaceholderText('name@mail.com'), 'alex@email.com');
		await userEvent.type(screen.getByPlaceholderText('********'), 'wrongpassword');
		await userEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			expect(mockNavigate).not.toHaveBeenCalled();
		});
	});
});
