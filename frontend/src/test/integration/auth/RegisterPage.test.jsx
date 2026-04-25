import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RegisterPage from '../../../pages/auth/RegisterPage';
import AuthService from '../../../services/AuthService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// RegisterPage llama a AuthService directamente (sin AuthContext)
vi.mock('../../../services/AuthService', () => ({
	default: {
		register: vi.fn(),
	},
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}));

vi.mock('../../../components/auth/AuthLayout', () => ({
	default: ({ children }) => <div>{children}</div>,
}));

// TIMEZONES: solo necesitamos una opción para los tests
vi.mock('../../../data/timezones', () => ({
	TIMEZONES: [{ value: 'Europe/Madrid', label: 'Europe/Madrid' }],
}));

// Material Tailwind:
// - Input: usa `inputRef` en lugar de `ref`. Filtramos `label` y `labelProps`.
// - Select: lo sustituimos por un <select> nativo con aria-label para poder
//   localizarlo en los tests. El Controller de react-hook-form le pasa
//   `value` y `onChange`, que mapeamos al comportamiento nativo.
// - Option → <option> nativa.
// - Alert → div con role="alert" para poder buscarlo con getByRole.
vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
	Input: ({ inputRef, error: _e, labelProps: _lp, label: _l, icon: _i, ...rest }) => <input ref={inputRef} {...rest} />,
	Button: ({ children, disabled, type }) => (
		<button type={type} disabled={disabled}>
			{children}
		</button>
	),
	Select: ({ children, onChange, value, label, error: _e }) => (
		<select aria-label={label} value={value ?? ''} onChange={e => onChange(e.target.value)}>
			<option value=''>-- selecciona --</option>
			{children}
		</select>
	),
	Option: ({ children, value }) => <option value={value}>{children}</option>,
	Alert: ({ children }) => <div role='alert'>{children}</div>,
}));

vi.mock('@heroicons/react/24/solid', () => ({
	EyeIcon: () => <span>Mostrar</span>,
	EyeSlashIcon: () => <span>Ocultar</span>,
	InformationCircleIcon: () => <span>Info</span>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderRegisterPage = () => {
	render(
		<MemoryRouter initialEntries={['/register']}>
			<RegisterPage />
		</MemoryRouter>,
	);
};

/**
 * Rellena todos los campos del formulario con datos válidos.
 * Útil para tests que solo quieren comprobar el resultado final
 * sin repetir la lógica de relleno.
 */
const fillValidForm = async () => {
	await userEvent.type(screen.getByPlaceholderText('MasterDungeon'), 'HeroProfile');

	// Los Select mockeados tienen aria-label con la clave de traducción
	await userEvent.selectOptions(screen.getByRole('combobox', { name: 'profile.roleType' }), 'WRITTEN');
	await userEvent.selectOptions(screen.getByRole('combobox', { name: 'account.timeZone' }), 'Europe/Madrid');

	await userEvent.type(screen.getByPlaceholderText('name@mail.com'), 'test@email.com');

	// Hay dos campos con placeholder '********' (password y confirmPassword)
	const passwordFields = screen.getAllByPlaceholderText('********');
	await userEvent.type(passwordFields[0], 'ValidPass1!');
	await userEvent.type(passwordFields[1], 'ValidPass1!');
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('RegisterPage — Tests de Integración', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	// 1️⃣  Renderizado inicial
	test('muestra todos los campos del formulario de registro', () => {
		renderRegisterPage();

		expect(screen.getByPlaceholderText('MasterDungeon')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('name@mail.com')).toBeInTheDocument();
		expect(screen.getAllByPlaceholderText('********')).toHaveLength(2);
		expect(screen.getByRole('combobox', { name: 'profile.roleType' })).toBeInTheDocument();
		expect(screen.getByRole('combobox', { name: 'account.timeZone' })).toBeInTheDocument();
	});

	// 2️⃣  Validación: formulario vacío
	test('muestra errores de validación si se envía el formulario vacío', async () => {
		renderRegisterPage();

		await userEvent.click(screen.getByRole('button', { name: /auth\.signUp/i }));

		await waitFor(() => {
			// Cada campo requerido vacío muestra 'errors.required' (clave de traducción)
			const requiredErrors = screen.getAllByText('errors.required');
			// profileName, roleType, timeZone, email, password, confirmPassword = 6 campos
			expect(requiredErrors.length).toBeGreaterThanOrEqual(4);
		});
	});

	// 3️⃣  Validación: las contraseñas no coinciden
	test('muestra error si las contraseñas no coinciden', async () => {
		renderRegisterPage();

		const passwordFields = screen.getAllByPlaceholderText('********');
		await userEvent.type(passwordFields[0], 'ValidPass1!');
		await userEvent.type(passwordFields[1], 'Diferente1!');

		await userEvent.click(screen.getByRole('button', { name: /auth\.signUp/i }));

		await waitFor(() => {
			expect(screen.getByText('errors.passwordMatch')).toBeInTheDocument();
		});
	});

	// 4️⃣  Validación: contraseña sin complejidad suficiente
	test('muestra error si la contraseña no cumple los requisitos de complejidad', async () => {
		renderRegisterPage();

		const passwordFields = screen.getAllByPlaceholderText('********');
		// 'sencilla1' tiene 8+ caracteres pero sin mayúsculas ni caracteres especiales
		await userEvent.type(passwordFields[0], 'sencilla1');
		await userEvent.type(passwordFields[1], 'sencilla1');

		await userEvent.click(screen.getByRole('button', { name: /auth\.signUp/i }));

		await waitFor(() => {
			expect(screen.getByText('errors.passwordComplexity')).toBeInTheDocument();
		});
	});

	// 5️⃣  Registro exitoso → navega a /login
	test('tras un registro correcto navega a /login con mensaje de éxito', async () => {
		AuthService.register.mockResolvedValue({});

		renderRegisterPage();
		await fillValidForm();
		await userEvent.click(screen.getByRole('button', { name: /auth\.signUp/i }));

		await waitFor(() => {
			expect(AuthService.register).toHaveBeenCalledOnce();
			expect(mockNavigate).toHaveBeenCalledWith('/login', expect.objectContaining({ state: expect.anything() }));
		});
	});

	// 6️⃣  Error: email ya en uso
	test('muestra error si el email ya está registrado', async () => {
		AuthService.register.mockRejectedValue({
			response: { data: 'Error: Correo  ya en uso' },
		});

		renderRegisterPage();
		await fillValidForm();
		await userEvent.click(screen.getByRole('button', { name: /auth\.signUp/i }));

		await waitFor(() => {
			expect(screen.getByRole('alert')).toBeInTheDocument();
			expect(screen.getByText('auth.errorEmailInUse')).toBeInTheDocument();
		});
	});

	// 7️⃣  Error: nombre de perfil ya en uso
	test('muestra error si el nombre de perfil ya está en uso', async () => {
		AuthService.register.mockRejectedValue({
			response: { data: 'Error: El nombre de perfil ya está en uso' },
		});

		renderRegisterPage();
		await fillValidForm();
		await userEvent.click(screen.getByRole('button', { name: /auth\.signUp/i }));

		await waitFor(() => {
			expect(screen.getByRole('alert')).toBeInTheDocument();
			expect(screen.getByText('auth.errorProfileNameInUse')).toBeInTheDocument();
		});
	});

	// 8️⃣  Error: fallo genérico de conexión
	test('muestra error genérico si el servidor falla de forma inesperada', async () => {
		AuthService.register.mockRejectedValue({
			response: { data: null },
		});

		renderRegisterPage();
		await fillValidForm();
		await userEvent.click(screen.getByRole('button', { name: /auth\.signUp/i }));

		await waitFor(() => {
			expect(screen.getByRole('alert')).toBeInTheDocument();
			expect(screen.getByText('auth.errorConnection')).toBeInTheDocument();
		});
	});
});
