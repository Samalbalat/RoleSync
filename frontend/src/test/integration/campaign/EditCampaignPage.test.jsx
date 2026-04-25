import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import EditCampaignPage from '../../../pages/campaign/EditCampaignPage'
import CampaignService from '../../../services/CampaignService'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/CampaignService', () => ({
	default: {
		getCampaignById: vi.fn(),
		updateCampaign:  vi.fn(),
	},
}))

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}))

vi.mock('react-hot-toast', () => ({
	default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({ primary: 'blue', textPrimary: 'text-blue-900', bgLight: 'bg-blue-50' }),
}))

vi.mock('../../../components/campaign/CampaignForm', () => ({
	default: ({ onSubmit, loading, initialValues }) => (
		<div>
			{initialValues && <span data-testid='initial-name'>{initialValues.name}</span>}
			<button onClick={() => onSubmit({ name: 'Campaña Editada' })} disabled={loading}>
				common.save
			</button>
		</div>
	),
}))

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
	Spinner:    () => <div data-testid='spinner' />,
	Button:     ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}))

vi.mock('@heroicons/react/24/outline', () => ({
	ShieldExclamationIcon: () => null,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return { ...actual, useNavigate: () => mockNavigate }
})

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderPage = (id = '1') =>
	render(
		<MemoryRouter initialEntries={[`/campaigns/edit/${id}`]}>
			<Routes>
				<Route path='/campaigns/edit/:id' element={<EditCampaignPage />} />
			</Routes>
		</MemoryRouter>
	)

const mockCampaignOwner = {
	id:           1,
	name:         'La Maldición de Strahd',
	type:         'TABLETOP',
	userRelation: 'OWNER',
	status:       'OPEN',
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('EditCampaignPage — Tests de Integración', () => {

	beforeEach(() => {
		vi.clearAllMocks()
		localStorage.setItem('activeProfile', JSON.stringify({ name: 'AlexD&D', type: 'TABLETOP' }))
	})

	afterEach(() => localStorage.clear())

	// 1️⃣  Spinner inicial
	test('muestra el spinner mientras carga los datos de la campaña', () => {
		CampaignService.getCampaignById.mockReturnValue(new Promise(() => {}))
		renderPage()
		expect(screen.getByTestId('spinner')).toBeInTheDocument()
	})

	// 2️⃣  Formulario con datos precargados
	test('muestra el formulario con los datos de la campaña cuando el usuario es OWNER', async () => {
		CampaignService.getCampaignById.mockResolvedValue(mockCampaignOwner)
		renderPage()

		await waitFor(() => {
			expect(screen.getByTestId('initial-name')).toHaveTextContent('La Maldición de Strahd')
		})
	})

	// 3️⃣  Acceso denegado si no es OWNER
	test('muestra la vista de acceso denegado si el usuario no es OWNER', async () => {
		CampaignService.getCampaignById.mockResolvedValue({
			...mockCampaignOwner,
			userRelation: 'MEMBER',
		})
		renderPage()

		await waitFor(() => {
			expect(screen.getByText('auth.accessDenied')).toBeInTheDocument()
		})
	})

	// 4️⃣  Guardar cambios → navega al detalle
	test('al guardar navega a la página de detalle de la campaña', async () => {
		CampaignService.getCampaignById.mockResolvedValue(mockCampaignOwner)
		CampaignService.updateCampaign.mockResolvedValue({})
		renderPage()

		await waitFor(() => screen.getByRole('button', { name: /common.save/i }))
		await userEvent.click(screen.getByRole('button', { name: /common.save/i }))

		await waitFor(() => {
			expect(CampaignService.updateCampaign).toHaveBeenCalledOnce()
			expect(mockNavigate).toHaveBeenCalledWith('/campaign/1')
		})
	})

	// 5️⃣  Error al cargar → navega a inicio
	test('navega a / si la campaña no existe o hay error al cargar', async () => {
		CampaignService.getCampaignById.mockRejectedValue(new Error('Not found'))
		renderPage()

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith('/')
		})
	})
})
