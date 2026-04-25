import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import FindCampaignPage from '../../../pages/campaign/FindCampaignPage'
import CampaignService from '../../../services/CampaignService'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/CampaignService', () => ({
	default: { getCampaigns: vi.fn() },
}))

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}))

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({ primary: 'blue', textPrimary: 'text-blue-900', bgLight: 'bg-blue-50', isDark: false }),
}))

// CampaignCard → simplificado para mostrar el nombre y ser clicable
vi.mock('../../../components/campaign/CampaignCard', () => ({
	default: ({ campana }) => <div data-testid='campaign-card'>{campana.name}</div>,
}))

// CampaignFilterBar → simplificado con botón de búsqueda y limpieza accesibles
vi.mock('../../../components/campaign/CampaignFilterBar', () => ({
	default: ({ onSearch, onClean }) => (
		<div>
			<button onClick={onSearch}>common.search</button>
			<button onClick={onClean}>filter.cleanFilters</button>
		</div>
	),
}))

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
	Spinner:    () => <div data-testid='spinner' />,
	Button:     ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}))

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderPage = () =>
	render(
		<MemoryRouter>
			<FindCampaignPage />
		</MemoryRouter>
	)

const mockCampaigns = [
	{ id: 1, name: 'La Maldición de Strahd', status: 'OPEN', type: 'TABLETOP', themes: [], currentPlayers: 2, maxPlayers: 5 },
	{ id: 2, name: 'El Camino de Seda',       status: 'ACTIVE', type: 'TABLETOP', themes: [], currentPlayers: 3, maxPlayers: 4 },
]

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FindCampaignPage — Tests de Integración', () => {

	beforeEach(() => {
		vi.clearAllMocks()
		localStorage.setItem('activeProfile', JSON.stringify({ name: 'AlexD&D', type: 'TABLETOP' }))
	})

	afterEach(() => localStorage.clear())

	// 1️⃣  Spinner mientras carga
	test('muestra el spinner mientras se cargan las campañas', () => {
		// La promesa nunca resuelve → loading queda en true
		CampaignService.getCampaigns.mockReturnValue(new Promise(() => {}))
		renderPage()
		expect(screen.getByTestId('spinner')).toBeInTheDocument()
	})

	// 2️⃣  Lista de campañas
	test('muestra las campañas recibidas del servicio', async () => {
		CampaignService.getCampaigns.mockResolvedValue(mockCampaigns)
		renderPage()

		await waitFor(() => {
			expect(screen.getByText('La Maldición de Strahd')).toBeInTheDocument()
			expect(screen.getByText('El Camino de Seda')).toBeInTheDocument()
		})
	})

	// 3️⃣  Sin resultados
	test('muestra mensaje de sin resultados cuando la lista está vacía', async () => {
		CampaignService.getCampaigns.mockResolvedValue([])
		renderPage()

		await waitFor(() => {
			expect(screen.getByText('campaign.noResultsFound')).toBeInTheDocument()
		})
	})

	// 4️⃣  Error de API → lista vacía sin romper
	test('muestra lista vacía si el servicio falla', async () => {
		CampaignService.getCampaigns.mockRejectedValue(new Error('Error de red'))
		renderPage()

		await waitFor(() => {
			expect(screen.getByText('campaign.noResultsFound')).toBeInTheDocument()
		})
	})

	// 5️⃣  Botón buscar re-ejecuta la búsqueda
	test('al hacer click en buscar llama de nuevo al servicio', async () => {
		CampaignService.getCampaigns.mockResolvedValue(mockCampaigns)
		renderPage()

		await waitFor(() => screen.getAllByTestId('campaign-card'))

		await userEvent.click(screen.getByRole('button', { name: /common.search/i }))

		await waitFor(() => {
			expect(CampaignService.getCampaigns).toHaveBeenCalledTimes(2)
		})
	})

	// 6️⃣  Botón limpiar re-ejecuta la búsqueda
	test('al limpiar filtros llama de nuevo al servicio', async () => {
		CampaignService.getCampaigns.mockResolvedValue([])
		renderPage()
		await waitFor(() => screen.getByText('campaign.noResultsFound'))

		await userEvent.click(screen.getByRole('button', { name: /filter.cleanFilters/i }))

		await waitFor(() => {
			expect(CampaignService.getCampaigns).toHaveBeenCalledTimes(2)
		})
	})
})
