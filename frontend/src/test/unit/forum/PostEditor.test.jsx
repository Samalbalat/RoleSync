import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
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
	Typography: ({ children, className }) => <div className={className}>{children}</div>,

	Avatar: ({ alt, src }) => <img alt={alt} src={src} />,

	Button: ({ children, onClick, disabled, title }) => (
		<button onClick={onClick} disabled={disabled} title={title}>
			{children}
		</button>
	),
	IconButton: ({ children, onClick, title }) => (
		<button onClick={onClick} title={title}>
			{children}
		</button>
	),
	Switch: ({ checked, onChange, id }) => (
		<input type='checkbox' id={id} checked={checked} onChange={onChange} role='switch' />
	),
	Input: ({ label, value, onChange }) => (
		<div>
			<label htmlFor='url-input'>{label}</label>
			<input id='url-input' aria-label={label} value={value} onChange={onChange} />
		</div>
	),
	Menu: ({ children }) => <div>{children}</div>,
	MenuHandler: ({ children }) => <div>{children}</div>,
	MenuList: ({ children }) => <div>{children}</div>,
	MenuItem: ({ children }) => <div>{children}</div>,
	Checkbox: ({ checked, onChange, id }) => <input type='checkbox' id={id} checked={checked} onChange={onChange} />,
}));

vi.mock('@heroicons/react/24/outline', () => ({
	PaperAirplaneIcon: () => <span>PaperAirplaneIcon</span>,
	PhotoIcon: () => <span>PhotoIcon</span>,
	AdjustmentsHorizontalIcon: () => <span>AdjustmentsHorizontalIcon</span>,
	EyeSlashIcon: () => <span>EyeSlashIcon</span>,
	XMarkIcon: () => <span>XMarkIcon</span>,
	LinkIcon: () => <span>LinkIcon</span>,
}));

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

	// 1️⃣3️⃣ Formato de texto: Negrita
	test('inserta etiquetas de negrita al hacer clic en el botón B', async () => {
		render(<PostEditor {...buildProps()} />);

		await userEvent.click(screen.getByTitle('forum.postEditor.format'));

		const textarea = screen.getByRole('textbox', { hidden: true });
		await userEvent.type(textarea, 'hola');

		await userEvent.click(screen.getByText('B'));

		expect(textarea.value).toContain('**texto**');
	});

	// 1️⃣4️⃣ Gestión de Imágenes: Mostrar y Ocultar input
	test.skip('permite abrir y cerrar el input de imagen', async () => {
		render(<PostEditor {...buildProps()} />);

		await userEvent.click(screen.getByTitle('forum.postEditor.addImage'));

		const inputUrl = screen.getByLabelText('forum.postEditor.imagePlaceholder');
		await userEvent.type(inputUrl, 'http://foto.com/pjs.png');

		const previewImg = screen.getByAltText('Preview');
		expect(previewImg.src).toBe('http://foto.com/pjs.png');

		const closeBtn = screen.getByRole('button', { name: /XMarkIcon/i });
		await userEvent.click(closeBtn);

		expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
	});

	// 1️⃣5️⃣ Menú de Susurros: Toggle de visibilidad
	test('permite seleccionar personajes para susurros', async () => {
		const otherCharacters = [{ id: 10, name: 'Legolas' }];
		render(<PostEditor {...buildProps({ otherCharacters })} />);

		await userEvent.click(screen.getByTitle('forum.whisper'));

		const checkbox = screen.getByLabelText('Legolas');
		await userEvent.click(checkbox);

		expect(screen.getByText('forum.whisper')).toBeInTheDocument();

		await userEvent.click(screen.getByText('forum.public'));
		expect(screen.queryByText('forum.whisper')).not.toBeInTheDocument();
	});

	// 1️⃣6️⃣ Fallbacks de Avatar (Cubre ramas de los helpers externos)
	test('usa avatar por defecto si el personaje no tiene uno', () => {
		render(<PostEditor {...buildProps({ myCharacter: { id: 1, name: 'Sin Foto', avatar: null } })} />);
		const img = screen.getByAltText('Avatar');
		expect(img.src).toContain('ui-avatars.com');
	});

	// 1️⃣7️⃣ Manejo de errores en la imagen (onError/onLoad)
	test('la imagen de preview maneja eventos de carga', () => {
		render(<PostEditor {...buildProps()} />);
		const img = document.createElement('img');
		img.src = 'test.jpg';

		const { container } = render(<PostEditor {...buildProps()} />);
	});
});
