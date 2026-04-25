import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import JoinCampaignModal from '../../../components/campaign/detail/JoinCampaignModal'
import CampaignService from '../../../services/CampaignService'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/CampaignService', () => ({
	default: { applyToCampaign: vi.fn() },
}))

vi.mock('@material-tailwind/react', () => ({
	Dialog:       ({ open, children }) => open ? <div role='dialog'>{children}</div> : null,
	DialogHeader: ({ children }) => <div>{children}</div>,
	DialogBody:   ({ children }) => <div>{children}</div>,
	DialogFooter: ({ children }) => <div>{children}</div>,
	Typography:   ({ children }) => <div>{children}</div>,
	Button:       ({ children, onClick, disabled }) => (
		<button onClick={onClick} disabled={disabled}>{children}</button>
	),
	Textarea: ({ value, onChange, label }) => (
		<textarea aria-label={label} value={value} onChange={onChange} />
	),
}))

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const t         = key => key
const onClose   = vi.fn()
const onSuccess = vi.fn()

const defaultProps = {
	isOpen:     true,
	onClose,
	campaignId: 1,
	onSuccess,
	t,
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('JoinCampaignModal — Tests Unitarios', () => {

	beforeEach(() => vi.clearAllMocks())

	// 1️⃣  Visibilidad: abierto
	test('muestra el modal cuando isOpen es true', () => {
		render(<JoinCampaignModal {...defaultProps} />)
		expect(screen.getByRole('dialog')).toBeInTheDocument()
	})

	// 2️⃣  Visibilidad: cerrado
	test('no muestra el modal cuando isOpen es false', () => {
		render(<JoinCampaignModal {...defaultProps} isOpen={false} />)
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	// 3️⃣  Botón enviar deshabilitado si el textarea está vacío
	test('el botón enviar está deshabilitado si el mensaje está vacío', () => {
		render(<JoinCampaignModal {...defaultProps} />)
		expect(screen.getByRole('button', { name: 'common.send' })).toBeDisabled()
	})

	// 4️⃣  Botón enviar habilitado con texto
	test('el botón enviar se habilita al escribir un mensaje', async () => {
		render(<JoinCampaignModal {...defaultProps} />)
		await userEvent.type(screen.getByRole('textbox'), 'Quiero unirme a esta campaña')
		expect(screen.getByRole('button', { name: 'common.send' })).not.toBeDisabled()
	})

	// 5️⃣  Envío exitoso → llama a onSuccess y onClose
	test('al enviar correctamente llama a onSuccess y onClose', async () => {
		CampaignService.applyToCampaign.mockResolvedValue({})

		render(<JoinCampaignModal {...defaultProps} />)
		await userEvent.type(screen.getByRole('textbox'), 'Quiero unirme!')
		await userEvent.click(screen.getByRole('button', { name: 'common.send' }))

		await waitFor(() => {
			expect(CampaignService.applyToCampaign).toHaveBeenCalledWith(1, 'Quiero unirme!')
			expect(onSuccess).toHaveBeenCalledOnce()
			expect(onClose).toHaveBeenCalledOnce()
		})
	})

	// 6️⃣  Error al enviar → muestra mensaje de error
	test('muestra mensaje de error si la solicitud falla', async () => {
		CampaignService.applyToCampaign.mockRejectedValue(new Error('Error de red'))

		render(<JoinCampaignModal {...defaultProps} />)
		await userEvent.type(screen.getByRole('textbox'), 'Quiero unirme!')
		await userEvent.click(screen.getByRole('button', { name: 'common.send' }))

		await waitFor(() => {
			expect(screen.getByText('campaign.join.error')).toBeInTheDocument()
		})
	})

	// 7️⃣  Cancelar llama a onClose
	test('el botón cancelar llama a onClose', async () => {
		render(<JoinCampaignModal {...defaultProps} />)
		await userEvent.click(screen.getByRole('button', { name: 'common.cancel' }))
		expect(onClose).toHaveBeenCalledOnce()
	})
})
