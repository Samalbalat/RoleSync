import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import CampaignActionCard from '../../../components/campaign/detail/CampaignActionCard';

// ─── Mocks ───────────────────────────────────────────────────────────────────
vi.mock('react-router-dom', () => ({
	useLocation: () => ({ pathname: '/' }),
}));

vi.mock('../../../components/campaign/detail/CreateTemplateModal', () => ({
	default: ({ isOpen }) => (isOpen ? <div data-testid='create-template-modal'>Modal</div> : null),
}));

vi.mock('@material-tailwind/react', () => ({
	Dialog: ({ children, open }) => (open ? <div data-testid='dialog'>{children}</div> : null),
	DialogHeader: ({ children }) => <header>{children}</header>,
	DialogBody: ({ children }) => <main>{children}</main>,
	DialogFooter: ({ children }) => <footer>{children}</footer>,
	Card: ({ children }) => <div>{children}</div>,
	CardBody: ({ children }) => <div>{children}</div>,
	Typography: ({ children }) => <div>{children}</div>,
	Button: ({ children, onClick, disabled }) => (
		<button onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
	IconButton: ({ children, onClick, disabled }) => (
		<button onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
	Progress: ({ value }) => <div data-testid='progress' data-value={value} />,
	Avatar: ({ alt }) => <img alt={alt} />,

	Select: ({ children, label, value, onChange }) => (
		<select aria-label={label} value={value} onChange={e => onChange(e.target.value)}>
			{children}
		</select>
	),
	Option: ({ children, value }) => <option value={value}>{children}</option>,
}));

vi.mock('@heroicons/react/24/outline', () => ({
	PencilSquareIcon: () => null,
	DocumentCheckIcon: () => null,
	DocumentDuplicateIcon: () => null,
	DocumentPlusIcon: () => null,
	ClockIcon: () => null,
	UserCircleIcon: () => null,
	XMarkIcon: () => null,
	BookOpenIcon: () => null,
	EyeIcon: () => null,
}));

// JoinCampaignModal
vi.mock('../../../components/campaign/detail/JoinCampaignModal', () => ({
	default: ({ isOpen, onClose }) =>
		isOpen ? (
			<div data-testid='join-modal'>
				<button onClick={onClose} data-testid='close-modal'>
					Cerrar
				</button>
			</div>
		) : null,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const t = key => key;
const navigate = vi.fn();
const onRefresh = vi.fn();
const onStatusChange = vi.fn();

const themeColor = {
	primary: 'blue',
	textPrimary: 'text-blue-900',
	bgLight: 'bg-blue-50',
	border: 'border-blue-200',
};

const buildProps = (overrides = {}) => ({
	campaign: {
		id: 1,
		status: 'OPEN',
		type: 'TABLETOP',
		userRelation: 'VISITOR',
		currentPlayers: 2,
		maxPlayers: 5,
		...overrides.campaign,
	},
	campaignTemplate: null,
	t,
	navigate,
	isFull: false,
	progress: 40,
	themeColor,
	onRefreshData: onRefresh,
	onStatusChange,
	...overrides,
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CampaignActionCard — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// ── Vista OWNER ───────────────────────────────────────────────────────────

	test('OWNER: muestra el botón de editar campaña', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'OWNER' } })} />);
		expect(screen.getByRole('button', { name: /common.edit/i })).toBeInTheDocument();
	});

	test('OWNER: muestra el botón de crear plantilla si no tiene template', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'OWNER' } })} />);
		expect(screen.getByRole('button', { name: /character.templateBuilder.createTemplate/i })).toBeInTheDocument();
	});

	test('OWNER: muestra el botón de editar plantilla si ya tiene template', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'OWNER' } })} campaignTemplate={{ id: 99 }} />);
		expect(screen.getByRole('button', { name: /character.templateBuilder.editTemplate/i })).toBeInTheDocument();
	});

	test('OWNER: cambia el estado de la campaña llama a onStatusChange', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'OWNER' } })} />);
		const select = screen.getByRole('combobox', { name: /campaign.status.status/i });
		fireEvent.change(select, { target: { value: 'ACTIVE' } });
		expect(onStatusChange).toHaveBeenCalledWith('ACTIVE');
	});

	test('OWNER: navega al editar campaña al hacer clic', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'OWNER', id: 1 } })} />);
		fireEvent.click(screen.getByRole('button', { name: /common.edit/i }));
		expect(navigate).toHaveBeenCalledWith('/campaigns/edit/1');
	});

	test('OWNER: abre el modal de crear plantilla al hacer clic', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'OWNER', id: 1 } })} />);
		fireEvent.click(screen.getByRole('button', { name: /character.templateBuilder.createTemplate/i }));
		expect(screen.getByTestId('create-template-modal')).toBeInTheDocument();
	});

	test('OWNER: navega a editar plantilla al hacer clic', () => {
		render(
			<CampaignActionCard {...buildProps({ campaign: { userRelation: 'OWNER', id: 1 } })} campaignTemplate={{ id: 99 }} />,
		);
		fireEvent.click(screen.getByRole('button', { name: /character.templateBuilder.editTemplate/i }));
		expect(navigate).toHaveBeenCalledWith('/character/templateBuilder?&templateId=99', {
			state: { from: '/' },
		});
	});

	// ── Vista MEMBER ──────────────────────────────────────────────────────────

	test('MEMBER sin personaje: muestra el botón de crear personaje', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'MEMBER', characterId: null } })} />);
		expect(screen.getByRole('button', { name: /character.createCharacter/i })).toBeInTheDocument();
	});

	test('MEMBER con personaje: muestra el botón de editar personaje', () => {
		render(
			<CampaignActionCard
				{...buildProps({
					campaign: {
						userRelation: 'MEMBER',
						characterId: 42,
						characterName: 'Gandalf',
						characterImage: null,
					},
				})}
			/>,
		);
		expect(screen.getByRole('button', { name: /character.editCharacter/i })).toBeInTheDocument();
		expect(screen.getByText('Gandalf')).toBeInTheDocument();
	});

	test('MEMBER: navega a crear personaje al hacer clic', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'MEMBER', characterId: null, id: 1 } })} />);
		fireEvent.click(screen.getByRole('button', { name: /character.createCharacter/i }));
		expect(navigate).toHaveBeenCalledWith('/createCharacter?campaignId=1');
	});

	test('MEMBER: navega a editar personaje al hacer clic', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'MEMBER', characterId: 42 } })} />);
		fireEvent.click(screen.getByRole('button', { name: /character.editCharacter/i }));
		expect(navigate).toHaveBeenCalledWith('/character/edit/42', {
			state: { from: '/' },
		});
	});

	// ── Vista VISITANTE ───────────────────────────────────────────────────────

	test('VISITANTE: muestra el botón de unirse si la campaña está abierta', () => {
		render(<CampaignActionCard {...buildProps()} />);
		expect(screen.getByRole('button', { name: /campaign.detail.join/i })).toBeInTheDocument();
	});

	test('VISITANTE: botón deshabilitado si la campaña está llena', () => {
		render(
			<CampaignActionCard
				{...buildProps({
					isFull: true,
					progress: 100,
					campaign: { userRelation: 'VISITOR', currentPlayers: 5, maxPlayers: 5 },
				})}
			/>,
		);
		expect(screen.getByRole('button', { name: /campaign.detail.joinFull/i })).toBeDisabled();
	});

	test('VISITANTE PENDING: botón deshabilitado con texto "pendiente"', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'PENDING', status: 'OPEN' } })} />);
		expect(screen.getByRole('button', { name: /campaign.detail.pending/i })).toBeDisabled();
	});

	test('VISITANTE: muestra la barra de progreso de jugadores', () => {
		render(<CampaignActionCard {...buildProps()} />);
		expect(screen.getByTestId('progress')).toBeInTheDocument();
	});

	test('VISITANTE: muestra texto de cerrado si la campaña no permite unirse', () => {
		render(<CampaignActionCard {...buildProps({ campaign: { userRelation: 'VISITOR', status: 'FINISHED' } })} />);
		expect(screen.getByRole('button', { name: /campaign.detail.closed/i })).toBeDisabled();
	});

	test('VISITANTE: permite unirse a campañas no-TABLETOP en estado ACTIVE', () => {
		render(
			<CampaignActionCard {...buildProps({ campaign: { userRelation: 'VISITOR', type: 'VIDEOCALL', status: 'ACTIVE' } })} />,
		);
		expect(screen.getByRole('button', { name: /campaign.detail.join/i })).not.toBeDisabled();
	});

	test('VISITANTE: abre y cierra el modal de unirse a la campaña', () => {
		render(<CampaignActionCard {...buildProps()} />);

		fireEvent.click(screen.getByRole('button', { name: /campaign.detail.join/i }));
		expect(screen.getByTestId('join-modal')).toBeInTheDocument();

		fireEvent.click(screen.getByTestId('close-modal'));
		expect(screen.queryByTestId('join-modal')).not.toBeInTheDocument();
	});
});
