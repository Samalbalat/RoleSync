import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import PostEditor from '../../../components/forum/PostEditor';
import ForumService from '../../../services/ForumService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/ForumService', () => ({
	default: {
		createPost: vi.fn(),
		createGeneralReply: vi.fn(),
	},
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}));

vi.mock('react-hot-toast', () => ({
	default: { error: vi.fn() },
	toast: { error: vi.fn() },
}));

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
	Avatar: ({ alt }) => <img alt={alt} />,
	Button: ({ children, onClick, disabled, size: _s, color: _c, className: _cl }) => (
		<button onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
	IconButton: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
	Switch: ({ checked, onChange, id }) => (
		<input type='checkbox' id={id} checked={checked} onChange={onChange} role='switch' />
	),
	Input: ({ label, value, onChange }) => <input aria-label={label} value={value} onChange={onChange} />,
	Menu: ({ children }) => <div>{children}</div>,
	MenuHandler: ({ children }) => <div>{children}</div>,
	MenuList: ({ children }) => <div>{children}</div>,
	MenuItem: ({ children }) => <div>{children}</div>,
	Checkbox: ({ checked, onChange, id }) => <input type='checkbox' id={id} checked={checked} onChange={onChange} />,
}));

vi.mock('@heroicons/react/24/outline', async importOriginal => {
	const actual = await importOriginal();
	return {
		...actual,
		PaperAirplaneIcon: () => null,
		PhotoIcon: () => null,
		AdjustmentsHorizontalIcon: () => null,
		EyeSlashIcon: () => null,
		XMarkIcon: () => null,
		LinkIcon: () => null,
	};
});

// ─── Helper ──────────────────────────────────────────────────────────────────

const myCharacter = { id: 1, name: 'Arador el Valiente', avatar: null };
const onPostCreated = vi.fn();

const buildProps = (overrides = {}) => ({
	campaignId: '1',
	myCharacter,
	otherCharacters: [],
	isOwner: false,
	isTabletop: false,
	isGeneralForum: false,
	onPostCreated,
	typePost: 'THREAD_START',
	parentPostId: null,
	...overrides,
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('PostEditor — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Renderizado básico → muestra el nombre del personaje
	test('muestra el nombre del personaje activo', () => {
		render(<PostEditor {...buildProps()} />);
		expect(screen.getByText('Arador el Valiente')).toBeInTheDocument();
	});

	// 2️⃣  Foro general → muestra el nombre del perfil en lugar del personaje
	test('en modo foro general muestra el nombre del perfil de usuario', () => {
		render(
			<PostEditor
				{...buildProps({
					isGeneralForum: true,
					currentUser: { profileName: 'AlexTable', profileImage: null },
					myCharacter: null,
				})}
			/>,
		);
		expect(screen.getByText('AlexTable')).toBeInTheDocument();
	});

	// 3️⃣  Botón enviar deshabilitado con textarea vacío
	test('el botón enviar está deshabilitado si el contenido está vacío', () => {
		render(<PostEditor {...buildProps()} />);
		expect(screen.getByRole('button', { name: /common.send/i })).toBeDisabled();
	});

	// 4️⃣  Botón enviar habilitado al escribir contenido
	test('el botón enviar se habilita al escribir en el textarea', async () => {
		render(<PostEditor {...buildProps()} />);
		await userEvent.type(screen.getByRole('textbox', { hidden: true }), 'Hola a todos!');
		expect(screen.getByRole('button', { name: /common.send/i })).not.toBeDisabled();
	});

	// 5️⃣  Envío en modo campaña → llama a createPost
	test('llama a ForumService.createPost al enviar en modo campaña', async () => {
		ForumService.createPost.mockResolvedValue({ id: 99, content: 'Hola a todos!' });
		render(<PostEditor {...buildProps()} />);

		await userEvent.type(screen.getByRole('textbox', { hidden: true }), 'Hola a todos!');
		await userEvent.click(screen.getByRole('button', { name: /common.send/i }));

		await waitFor(() => {
			expect(ForumService.createPost).toHaveBeenCalledOnce();
			expect(ForumService.createPost).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					content: 'Hola a todos!',
				}),
			);
		});
	});

	// 6️⃣  Envío en modo foro general → llama a createGeneralReply
	test('llama a ForumService.createGeneralReply al enviar en modo foro general', async () => {
		ForumService.createGeneralReply.mockResolvedValue({ id: 99 });
		render(
			<PostEditor
				{...buildProps({
					isGeneralForum: true,
					currentUser: { profileName: 'AlexTable', profileImage: null },
					myCharacter: null,
				})}
			/>,
		);

		await userEvent.type(screen.getByRole('textbox', { hidden: true }), 'Mi respuesta al foro');
		await userEvent.click(screen.getByRole('button', { name: /common.send/i }));

		await waitFor(() => {
			expect(ForumService.createGeneralReply).toHaveBeenCalledOnce();
		});
	});

	// 7️⃣  Tras envío exitoso → llama a onPostCreated
	test('llama a onPostCreated con el nuevo post tras el envío', async () => {
		ForumService.createPost.mockResolvedValue({ id: 99, content: 'Hola a todos!' });
		render(<PostEditor {...buildProps()} />);

		await userEvent.type(screen.getByRole('textbox', { hidden: true }), 'Hola a todos!');
		await userEvent.click(screen.getByRole('button', { name: /common.send/i }));

		await waitFor(() => {
			expect(onPostCreated).toHaveBeenCalledOnce();
		});
	});

	// 8️⃣  Tras envío exitoso → textarea se vacía
	test('vacía el textarea después de enviar correctamente', async () => {
		ForumService.createPost.mockResolvedValue({ id: 99 });
		render(<PostEditor {...buildProps()} />);

		const textarea = screen.getByRole('textbox', { hidden: true });
		await userEvent.type(textarea, 'Mensaje de prueba');
		await userEvent.click(screen.getByRole('button', { name: /common.send/i }));

		await waitFor(() => {
			expect(textarea.value).toBe('');
		});
	});

	// 9️⃣  Modo narrativo no-DM → muestra el switch OOC
	test('muestra el switch de modo OOC en campañas narrativas para jugadores', () => {
		render(<PostEditor {...buildProps({ isTabletop: false, isOwner: false, isGeneralForum: false })} />);
		expect(screen.getByRole('switch')).toBeInTheDocument();
	});

	// 🔟  Modo tabletop → NO muestra el switch OOC
	test('no muestra el switch OOC en modo tabletop', () => {
		render(<PostEditor {...buildProps({ isTabletop: true })} />);
		expect(screen.queryByRole('switch')).not.toBeInTheDocument();
	});

	// 1️⃣1️⃣  Modo foro general → NO muestra el switch OOC
	test('no muestra el switch OOC en modo foro general', () => {
		render(
			<PostEditor
				{...buildProps({
					isGeneralForum: true,
					currentUser: { profileName: 'AlexTable' },
					myCharacter: null,
				})}
			/>,
		);
		expect(screen.queryByRole('switch')).not.toBeInTheDocument();
	});

	// 1️⃣2️⃣  Error al enviar → no llama a onPostCreated
	test('no llama a onPostCreated si el servicio falla', async () => {
		ForumService.createPost.mockRejectedValue(new Error('Error del servidor'));
		render(<PostEditor {...buildProps()} />);

		await userEvent.type(screen.getByRole('textbox', { hidden: true }), 'Mensaje de prueba');
		await userEvent.click(screen.getByRole('button', { name: /common.send/i }));

		await waitFor(() => {
			expect(onPostCreated).not.toHaveBeenCalled();
		});
	});
});
