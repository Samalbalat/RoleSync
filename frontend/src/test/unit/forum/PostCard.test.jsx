import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import PostCard from '../../../components/forum/PostCard';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// DOMPurify y marked usan APIs de navegador → los simplificamos
vi.mock('dompurify', () => ({
	default: { sanitize: html => html },
}));

vi.mock('marked', () => ({
	marked: { parse: text => `<p>${text}</p>`, use: vi.fn() },
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}));

vi.mock('@heroicons/react/24/outline', () => ({
	LockClosedIcon: () => <span data-testid='lock-icon' />,
	LockOpenIcon: () => <span data-testid='unlock-icon' />,
	ChatBubbleLeftIcon: () => <span data-testid='chat-icon' />,
	EyeSlashIcon: () => <span data-testid='eye-slash-icon' />,
	MegaphoneIcon: () => <span data-testid='megaphone-icon' />,
}));

vi.mock('react-icons/tb', () => ({
	TbPinnedFilled: () => <span data-testid='pin-filled-icon' />,
	TbPinned: () => <span data-testid='pin-icon' />,
}));

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const basePost = {
	id: 1,
	content: 'Este es el contenido del mensaje.',
	createdAt: '2024-01-15T10:00:00Z',
	isPinned: false,
	isLocked: false,
	isEdited: false,
	isDm: false,
	isOoc: false,
	visibleToCharacterIds: [],
	authorCharacterName: 'Arador el Valiente',
	authorCharacterImage: null,
};

const onClickThread = vi.fn();
const onTogglePin = vi.fn();
const onToggleLock = vi.fn();

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('PostCard — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Renderizado básico
	test('muestra el nombre del personaje autor', () => {
		render(<PostCard post={basePost} isCurrentUserDM={false} />);
		expect(screen.getByText('Arador el Valiente')).toBeInTheDocument();
	});

	test('muestra el nombre "Master" si el post es del DM', () => {
		render(<PostCard post={{ ...basePost, isDm: true }} isCurrentUserDM={true} ownerImage={null} />);
		expect(screen.getByText('Master')).toBeInTheDocument();
	});

	// 2️⃣  Post fijado → muestra icono de pin
	test('muestra el icono de pin relleno si el post está fijado y el usuario es DM', () => {
		render(
			<PostCard
				post={{ ...basePost, isPinned: true }}
				isCurrentUserDM={true}
				onTogglePin={onTogglePin}
				onToggleLock={onToggleLock}
			/>,
		);
		expect(screen.getByTestId('pin-filled-icon')).toBeInTheDocument();
	});

	test('muestra el icono de pin vacío si el post NO está fijado y el usuario es DM', () => {
		render(<PostCard post={basePost} isCurrentUserDM={true} onTogglePin={onTogglePin} onToggleLock={onToggleLock} />);
		expect(screen.getByTestId('pin-icon')).toBeInTheDocument();
	});

	// 3️⃣  Post bloqueado → solo visible para DM no-tabletop
	test('muestra el icono de candado cerrado si el post está bloqueado y el usuario es DM', () => {
		render(
			<PostCard
				post={{ ...basePost, isLocked: true }}
				isCurrentUserDM={true}
				isTabletop={false}
				onTogglePin={onTogglePin}
				onToggleLock={onToggleLock}
			/>,
		);
		expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
	});

	// 4️⃣  Vista timeline narrativa → muestra enlace "abrir hilo"
	test('muestra el enlace de abrir hilo en vista timeline narrativa', () => {
		render(
			<PostCard
				post={basePost}
				isTimelineView={true}
				isTabletop={false}
				onClickThread={onClickThread}
				isCurrentUserDM={false}
			/>,
		);
		expect(screen.getByTestId('chat-icon')).toBeInTheDocument();
	});

	// 5️⃣  Click en el card → llama a onClickThread en modo timeline narrativo
	test('llama a onClickThread al hacer click en modo timeline narrativo', async () => {
		render(
			<PostCard
				post={basePost}
				isTimelineView={true}
				isTabletop={false}
				onClickThread={onClickThread}
				isCurrentUserDM={false}
			/>,
		);
		// El div exterior tiene el onClick
		const card = screen.getByText('Arador el Valiente').closest('div[class*="p-4"]');
		if (card) await userEvent.click(card);
		expect(onClickThread).toHaveBeenCalledWith(basePost);
	});

	// 6️⃣  Anuncio del DM → muestra badge de "noticeMaster"
	test('muestra el badge de anuncio del master si isDm y isOoc son true', () => {
		render(
			<PostCard
				post={{ ...basePost, isDm: true, isOoc: true }}
				isCurrentUserDM={true}
				isTabletop={false}
				onTogglePin={onTogglePin}
				onToggleLock={onToggleLock}
			/>,
		);
		expect(screen.getByTestId('megaphone-icon')).toBeInTheDocument();
	});

	// 7️⃣  Post editado → muestra "(Editado)"
	test('muestra "(Editado)" si el post ha sido editado', () => {
		render(<PostCard post={{ ...basePost, isEdited: true }} isCurrentUserDM={false} />);
		expect(screen.getByText('(Editado)')).toBeInTheDocument();
	});
});
