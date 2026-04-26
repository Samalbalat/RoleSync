import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, test, describe, expect } from 'vitest';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { useAuth } from '../../../utils/AuthContext';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../utils/AuthContext', () => ({
	useAuth: vi.fn(),
}));

// Spinner de Material Tailwind → div simple con data-testid para localizarlo
vi.mock('@material-tailwind/react', () => ({
	Spinner: () => <div data-testid='spinner' />,
}));

// ServerWakingLoader no aporta lógica al test → lo neutralizamos
vi.mock('../../../components/layout/ServerWakingLoader', () => ({
	default: () => <div data-testid='server-waking-loader' />,
}));

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Renderiza ProtectedRoute dentro de un router de prueba con rutas ficticias.
 * @param {string} initialPath - Ruta inicial del test (por defecto /dashboard)
 */
const renderProtectedRoute = (initialPath = '/dashboard') => {
	render(
		<MemoryRouter initialEntries={[initialPath]}>
			<Routes>
				{/* Ruta protegida de ejemplo */}
				<Route element={<ProtectedRoute />}>
					<Route path='/dashboard' element={<div>Contenido protegido</div>} />
				</Route>

				{/* Destinos de redirección */}
				<Route path='/login' element={<div>Página de Login</div>} />
				<Route path='/profile-selection' element={<div>Selector de Perfil</div>} />
			</Routes>
		</MemoryRouter>,
	);
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProtectedRoute — Tests Unitarios', () => {
	// 1️⃣  Estado de carga
	test('muestra el spinner mientras la sesión está cargando', () => {
		useAuth.mockReturnValue({ account: null, activeProfile: null, loading: true });

		renderProtectedRoute();

		expect(screen.getByTestId('spinner')).toBeInTheDocument();
	});

	// 2️⃣  Sin cuenta → redirige al login
	test('redirige a /login si el usuario no está autenticado', () => {
		useAuth.mockReturnValue({ account: null, activeProfile: null, loading: false });

		renderProtectedRoute();

		expect(screen.getByText('Página de Login')).toBeInTheDocument();
	});

	// 3️⃣  Cuenta sin perfil activo → redirige al selector de perfiles
	test('redirige a /profile-selection si hay cuenta pero no hay perfil activo', () => {
		useAuth.mockReturnValue({
			account: { email: 'alex@email.com' },
			activeProfile: null,
			loading: false,
		});

		renderProtectedRoute();

		expect(screen.getByText('Selector de Perfil')).toBeInTheDocument();
	});

	// 4️⃣  En /profile-selection sin perfil activo → NO redirige (permite estar ahí)
	test('no redirige si ya estamos en /profile-selection aunque no haya perfil activo', () => {
		useAuth.mockReturnValue({
			account: { email: 'alex@email.com' },
			activeProfile: null,
			loading: false,
		});

		render(
			<MemoryRouter initialEntries={['/profile-selection']}>
				<Routes>
					<Route element={<ProtectedRoute />}>
						<Route path='/profile-selection' element={<div>Selector de Perfil</div>} />
					</Route>
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getByText('Selector de Perfil')).toBeInTheDocument();
	});

	// 5️⃣  Cuenta + perfil activo → muestra el contenido protegido
	test('renderiza el contenido protegido cuando el usuario está autenticado y tiene perfil', () => {
		useAuth.mockReturnValue({
			account: { email: 'alex@email.com' },
			activeProfile: { name: 'AlexNarrative', type: 'WRITTEN' },
			loading: false,
		});

		renderProtectedRoute();

		expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
	});
});
