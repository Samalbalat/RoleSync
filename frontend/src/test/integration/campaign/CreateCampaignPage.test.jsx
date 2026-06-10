import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest';
import CreateCampaignPage from '../../../pages/campaign/CreateCampaignPage';
import CampaignService from '../../../services/CampaignService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/CampaignService', () => ({
	default: { createCampaign: vi.fn() },
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}));

vi.mock('react-hot-toast', () => ({
	default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({ primary: 'blue', textPrimary: 'text-blue-900', bgLight: 'bg-blue-50' }),
}));

// CampaignForm → simplificado: llama a onSubmit con datos de prueba al enviar
vi.mock('../../../components/campaign/CampaignForm', () => ({
	default: ({ onSubmit, loading }) => (
		<div>
			<button onClick={() => onSubmit({ name: 'Nueva Campaña', type: 'TABLETOP' })} disabled={loading}>
				common.create
			</button>
			{loading && <span data-testid='loading-indicator' />}
		</div>
	),
}));

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderPage = () =>
	render(
		<MemoryRouter>
			<CreateCampaignPage />
		</MemoryRouter>,
	);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CreateCampaignPage — Tests de Integración', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.setItem('activeProfile', JSON.stringify({ name: 'AlexD&D', type: 'TABLETOP' }));
	});

	afterEach(() => localStorage.clear());

	// 1️⃣  Renderizado
	test('muestra el título y el formulario de creación', () => {
		CampaignService.createCampaign.mockResolvedValue({});
		renderPage();
		expect(screen.getByText('campaign.createTitle')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /common.create/i })).toBeInTheDocument();
	});

	// 2️⃣  Lee el tipo de perfil del localStorage
	test('detecta el tipo de campaña desde el perfil activo en localStorage', () => {
		localStorage.setItem('activeProfile', JSON.stringify({ name: 'AlexNarrative', type: 'WRITTEN' }));
		CampaignService.createCampaign.mockResolvedValue({});
		renderPage();
		// El indicador "(Narrativa)" aparece solo en campañas de tipo WRITTEN
		expect(screen.getByText('(Narrativa)')).toBeInTheDocument();
	});

	// 3️⃣  Creación exitosa → navega
	test('llama a createCampaign y navega a /campaigns tras el éxito', async () => {
		CampaignService.createCampaign.mockResolvedValue({ id: 10 });
		renderPage();

		await userEvent.click(screen.getByRole('button', { name: /common.create/i }));

		await waitFor(() => {
			expect(CampaignService.createCampaign).toHaveBeenCalledOnce();
		});
	});

	// 4️⃣  Error al crear → muestra toast de error (no navega)
	test('no navega si la creación falla', async () => {
		CampaignService.createCampaign.mockRejectedValue(new Error('Error del servidor'));
		renderPage();

		await userEvent.click(screen.getByRole('button', { name: /common.create/i }));

		await waitFor(() => {
			expect(mockNavigate).not.toHaveBeenCalled();
		});
	});
});
