import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import PublicRoute from '../../../components/auth/PublicRoute';
import { useAuth } from '../../../utils/AuthContext';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../utils/AuthContext', () => ({
	useAuth: vi.fn(),
}));

vi.mock('@material-tailwind/react', () => ({
	Spinner: () => <div data-testid='spinner' />,
}));

vi.mock('../../../components/layout/ServerWakingLoader', () => ({
	default: () => <div data-testid='server-waking-loader' />,
}));

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Renderiza PublicRoute dentro de un router de prueba.
 * Simula que el usuario intenta acceder a /login (ruta pública).
 */
const renderPublicRoute = () => {
	render(
		<MemoryRouter initialEntries={['/login']}>
			<Routes>
				{/* Rutas públicas (login, register...) */}
				<Route element={<PublicRoute />}>
					<Route path='/login' element={<div>Página de Login</div>} />
				</Route>

				{/* Destino si ya está autenticado */}
				<Route path='/' element={<div>Página de Inicio</div>} />
			</Routes>
		</MemoryRouter>,
	);
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('PublicRoute — Tests Unitarios', () => {
	// 1️⃣  Estado de carga
	test('muestra el spinner mientras la sesión está cargando', () => {
		useAuth.mockReturnValue({ account: null, loading: true });

		renderPublicRoute();

		expect(screen.getByTestId('spinner')).toBeInTheDocument();
	});

	// 2️⃣  Usuario ya autenticado → redirige al inicio
	test('redirige a / si el usuario ya tiene sesión iniciada', () => {
		useAuth.mockReturnValue({
			account: { email: 'alex@email.com' },
			loading: false,
		});

		renderPublicRoute();

		expect(screen.getByText('Página de Inicio')).toBeInTheDocument();
	});

	// 3️⃣  Sin sesión → muestra la ruta pública
	test('muestra el contenido público si el usuario no está autenticado', () => {
		useAuth.mockReturnValue({ account: null, loading: false });

		renderPublicRoute();

		expect(screen.getByText('Página de Login')).toBeInTheDocument();
	});

	// 4️⃣  Con spinner no debe aparecer el contenido de la ruta
	test('no muestra el contenido de la ruta mientras está cargando', () => {
		useAuth.mockReturnValue({ account: null, loading: true });

		renderPublicRoute();

		expect(screen.queryByText('Página de Login')).not.toBeInTheDocument();
	});
});
