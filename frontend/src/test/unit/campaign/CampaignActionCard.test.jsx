import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import CampaignActionCard from '../../../components/campaign/detail/CampaignActionCard'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@material-tailwind/react', () => ({
	Card:     ({ children }) => <div>{children}</div>,
	CardBody: ({ children }) => <div>{children}</div>,
	Typography: ({ children }) => <div>{children}</div>,
	Button:   ({ children, onClick, disabled }) => (
		<button onClick={onClick} disabled={disabled}>{children}</button>
	),
	Progress: ({ value }) => <div data-testid='progress' data-value={value} />,
	Avatar:   ({ alt }) => <img alt={alt} />,
	Select:   ({ children, label }) => <select aria-label={label}>{children}</select>,
	Option:   ({ children, value }) => <option value={value}>{children}</option>,
}))

vi.mock('@heroicons/react/24/outline', () => ({
	PencilSquareIcon:  () => null,
	DocumentCheckIcon: () => null,
	DocumentPlusIcon:  () => null,
	ClockIcon:         () => null,
	UserCircleIcon:    () => null,
}))

// JoinCampaignModal → lo neutralizamos, ya tiene sus propios tests
vi.mock('../../../components/campaign/detail/JoinCampaignModal', () => ({
	default: ({ isOpen }) => isOpen ? <div data-testid='join-modal' /> : null,
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

const t           = key => key
const navigate    = vi.fn()
const onRefresh   = vi.fn()
const onStatusChange = vi.fn()

const themeColor = {
	primary:     'blue',
	textPrimary: 'text-blue-900',
	bgLight:     'bg-blue-50',
	border:      'border-blue-200',
}

const buildProps = (overrides = {}) => ({
	campaign: {
		id:             1,
		status:         'OPEN',
		type:           'TABLETOP',
		userRelation:   'VISITOR',
		currentPlayers: 2,
		maxPlayers:     5,
		...overrides.campaign,
	},
	campaignTemplate: null,
	t,
	navigate,
	isFull:          false,
	progress:        40,
	themeColor,
	onRefreshData:   onRefresh,
	onStatusChange,
	...overrides,
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CampaignActionCard — Tests Unitarios', () => {

	beforeEach(() => vi.clearAllMocks())

	// ── Vista OWNER ───────────────────────────────────────────────────────────

	test('OWNER: muestra el botón de editar campaña', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'OWNER' } })} />)
		expect(screen.getByRole('button', { name: /common.edit/i })).toBeInTheDocument()
	})

	test('OWNER: muestra el botón de crear plantilla si no tiene template', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'OWNER' } })} />)
		expect(screen.getByRole('button', { name: /character.templateBuilder.createTemplate/i })).toBeInTheDocument()
	})

	test('OWNER: muestra el botón de editar plantilla si ya tiene template', () => {
		render(
			<CampaignActionCard
				{...buildProps({ campaign: { userRelation: 'OWNER' } })}
				campaignTemplate={{ id: 99 }}
			/>
		)
		expect(screen.getByRole('button', { name: /character.templateBuilder.editTemplate/i })).toBeInTheDocument()
	})

	// ── Vista MEMBER ──────────────────────────────────────────────────────────

	test('MEMBER sin personaje: muestra el botón de crear personaje', () => {
		render(
			<CampaignActionCard
				{...buildProps({ campaign: { userRelation: 'MEMBER', characterId: null } })}
			/>
		)
		expect(screen.getByRole('button', { name: /character.createCharacter/i })).toBeInTheDocument()
	})

	test('MEMBER con personaje: muestra el botón de editar personaje', () => {
		render(
			<CampaignActionCard
				{...buildProps({
					campaign: {
						userRelation:    'MEMBER',
						characterId:     42,
						characterName:   'Gandalf',
						characterImage:  null,
					},
				})}
			/>
		)
		expect(screen.getByRole('button', { name: /character.editCharacter/i })).toBeInTheDocument()
		expect(screen.getByText('Gandalf')).toBeInTheDocument()
	})

	// ── Vista VISITANTE ───────────────────────────────────────────────────────

	test('VISITANTE: muestra el botón de unirse si la campaña está abierta', () => {
		render(<CampaignActionCard {...buildProps()} />)
		expect(screen.getByRole('button', { name: /campaign.detail.join/i })).toBeInTheDocument()
	})

	test('VISITANTE: botón deshabilitado si la campaña está llena', () => {
		render(
			<CampaignActionCard
				{...buildProps({
					isFull:   true,
					progress: 100,
					campaign: { userRelation: 'VISITOR', currentPlayers: 5, maxPlayers: 5 },
				})}
			/>
		)
		expect(screen.getByRole('button', { name: /campaign.detail.joinFull/i })).toBeDisabled()
	})

	test('VISITANTE PENDING: botón deshabilitado con texto "pendiente"', () => {
		render(
			<CampaignActionCard
				{...buildProps({ campaign: { userRelation: 'PENDING', status: 'OPEN' } })}
			/>
		)
		expect(screen.getByRole('button', { name: /campaign.detail.pending/i })).toBeDisabled()
	})

	test('VISITANTE: muestra la barra de progreso de jugadores', () => {
		render(<CampaignActionCard {...buildProps()} />)
		expect(screen.getByTestId('progress')).toBeInTheDocument()
	})
})
