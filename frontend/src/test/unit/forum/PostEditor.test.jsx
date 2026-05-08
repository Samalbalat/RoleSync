import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import toast from 'react-hot-toast';
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

	test('en modo foro general maneja fallback si el usuario no tiene nombre', () => {
		render(
			<PostEditor
				{...buildProps({
					isGeneralForum: true,
					currentUser: null,
					myCharacter: null,
				})}
			/>,
		);
		expect(screen.getByText('Usuario')).toBeInTheDocument();
	});

	// 3️⃣  Botón enviar deshabilitado con textarea vacío y sin imagen
	test('el botón enviar está deshabilitado si el contenido está vacío', () => {
		render(<PostEditor {...buildProps()} />);
		expect(screen.getByRole('button', { name: /common.send/i })).toBeDisabled();
	});

	// 4️⃣  Botón enviar habilitado al escribir contenido o añadir imagen
	test('el botón enviar se habilita al escribir en el textarea o añadir imagen', async () => {
		const { rerender } = render(<PostEditor {...buildProps()} />);

		await userEvent.type(screen.getByRole('textbox', { hidden: true }), 'Hola a todos!');
		expect(screen.getByRole('button', { name: /common.send/i })).not.toBeDisabled();

		rerender(<PostEditor {...buildProps()} />);

		await userEvent.click(screen.getByTitle('forum.postEditor.addImage'));
		const inputUrl = screen.getByLabelText('forum.postEditor.imagePlaceholder');
		await userEvent.type(inputUrl, 'http://foto.com/img.png');
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
	test('llama a ForumService.createGeneralReply al enviar en modo foro general con imagen', async () => {
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

		// Añadimos texto
		await userEvent.type(screen.getByRole('textbox', { hidden: true }), 'Mi respuesta al foro');

		// Añadimos imagen
		await userEvent.click(screen.getByTitle('forum.postEditor.addImage'));
		await userEvent.type(screen.getByLabelText('forum.postEditor.imagePlaceholder'), 'http://img.com/foto.png');

		await userEvent.click(screen.getByRole('button', { name: /common.send/i }));

		await waitFor(() => {
			expect(ForumService.createGeneralReply).toHaveBeenCalledOnce();
			expect(ForumService.createGeneralReply).toHaveBeenCalledWith(
				expect.objectContaining({
					content: 'Mi respuesta al foro',
					mediaUrls: ['http://img.com/foto.png'],
				}),
			);
		});
	});

	// 7️⃣  Tras envío exitoso → llama a onPostCreated manejando data anidada
	test('llama a onPostCreated con el nuevo post (manejando response.data)', async () => {
		// Simulamos un backend que devuelve la respuesta dentro de "data"
		ForumService.createPost.mockResolvedValue({ data: { id: 99, content: 'Data anidada' } });
		render(<PostEditor {...buildProps()} />);

		await userEvent.type(screen.getByRole('textbox', { hidden: true }), 'Hola a todos!');
		await userEvent.click(screen.getByRole('button', { name: /common.send/i }));

		await waitFor(() => {
			expect(onPostCreated).toHaveBeenCalledOnce();
			expect(onPostCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
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

	// 9️⃣  Modos y OOC
	test('muestra el switch de modo OOC en campañas narrativas para jugadores', () => {
		render(<PostEditor {...buildProps({ isTabletop: false, isOwner: false, isGeneralForum: false })} />);
		expect(screen.getByRole('switch')).toBeInTheDocument();
	});

	test('no muestra el switch OOC en modo tabletop', () => {
		render(<PostEditor {...buildProps({ isTabletop: true })} />);
		expect(screen.queryByRole('switch')).not.toBeInTheDocument();
	});

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

	// 🔟 Manejo de errores
	test('llama a toast.error y no a onPostCreated si el servicio falla', async () => {
		ForumService.createPost.mockRejectedValue(new Error('Error del servidor'));
		render(<PostEditor {...buildProps()} />);

		await userEvent.type(screen.getByRole('textbox', { hidden: true }), 'Mensaje de prueba');
		await userEvent.click(screen.getByRole('button', { name: /common.send/i }));

		await waitFor(() => {
			expect(onPostCreated).not.toHaveBeenCalled();
			expect(toast.error).toHaveBeenCalledWith('forum.postEditor.creationError');
		});
	});

	// 1️⃣2️⃣ Gestión de Imágenes: Mostrar, ocultar, y limpiar
	test('permite abrir, previsualizar y cerrar el input de imagen', async () => {
		render(<PostEditor {...buildProps()} />);

		// Abrir
		await userEvent.click(screen.getByTitle('forum.postEditor.addImage'));
		const inputUrl = screen.getByLabelText('forum.postEditor.imagePlaceholder');
		await userEvent.type(inputUrl, 'http://foto.com/pjs.png');

		// Previsualizar
		const previewImg = screen.getByAltText('Preview');
		expect(previewImg.src).toBe('http://foto.com/pjs.png');

		// Los mocks renderizan el componente Text "XMarkIcon". Hay dos (cerrar input y borrar imagen).
		// Hacemos clic en el de la previsualización para borrar la URL
		const closeBtns = screen.getAllByText('XMarkIcon');
		await userEvent.click(closeBtns[1]); // El botón de la previsualización es el segundo

		expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();

		// Clicar de nuevo en el icono de imagen cierra el menú
		await userEvent.click(screen.getByTitle('forum.postEditor.addImage'));
		expect(screen.queryByLabelText('forum.postEditor.imagePlaceholder')).not.toBeInTheDocument();
	});

	// 1️⃣3️⃣ Eventos de imagen (Load / Error)
	test('la imagen de preview maneja eventos de carga y error', async () => {
		render(<PostEditor {...buildProps()} />);

		await userEvent.click(screen.getByTitle('forum.postEditor.addImage'));
		await userEvent.type(screen.getByLabelText('forum.postEditor.imagePlaceholder'), 'test.jpg');

		const previewImg = screen.getByAltText('Preview');

		fireEvent.error(previewImg);
		expect(previewImg.style.display).toBe('none');

		fireEvent.load(previewImg);
		expect(previewImg.style.display).toBe('block');
	});

	// 1️⃣4️⃣ Menú de Susurros Completo
	test('permite seleccionar, deseleccionar y enviar personajes para susurros', async () => {
		ForumService.createPost.mockResolvedValue({ id: 100 });
		const otherCharacters = [{ id: 10, name: 'Legolas' }];
		render(<PostEditor {...buildProps({ otherCharacters, myCharacter: { id: 1, name: 'Arador' } })} />);

		// Abrir menú de susurros
		await userEvent.click(screen.getByTitle('forum.whisper'));

		const checkbox = screen.getByLabelText('Legolas');

		// Seleccionar
		await userEvent.click(checkbox);
		expect(checkbox.checked).toBe(true);
		expect(screen.getByText('forum.whisper')).toBeInTheDocument(); // Tag de "Susurro" arriba

		// Deseleccionar clickeando otra vez
		await userEvent.click(checkbox);
		expect(checkbox.checked).toBe(false);

		// Volver a seleccionar y usar el botón público para limpiar
		await userEvent.click(checkbox);
		await userEvent.click(screen.getByText('forum.public')); // Limpia el array
		expect(checkbox.checked).toBe(false);

		// Volver a seleccionar para probar el envío final
		await userEvent.click(checkbox);
		await userEvent.type(screen.getByRole('textbox', { hidden: true }), 'Secreto');
		await userEvent.click(screen.getByRole('button', { name: /common.send/i }));

		await waitFor(() => {
			// Debería mandar el ID del destinatario y el ID del autor
			expect(ForumService.createPost).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					visibleToCharacterIds: [10, 1],
				}),
			);
		});
	});

	test('muestra mensaje de vacío si no hay personajes para susurrar', async () => {
		render(<PostEditor {...buildProps({ otherCharacters: [] })} />);
		await userEvent.click(screen.getByTitle('forum.whisper'));
		expect(screen.getByText('forum.postEditor.noMoreCharacters')).toBeInTheDocument();
	});

	// 1️⃣5️⃣ Fallbacks de Placeholders y avatares
	test('usa avatar por defecto si el personaje no tiene uno', () => {
		render(<PostEditor {...buildProps({ myCharacter: { id: 1, name: 'Master' } })} />);
		const img = screen.getByAltText('Avatar');
		expect(img.src).toContain('ui-avatars.com');
	});

	test('muestra el placeholder correcto según el rol y modo', () => {
		// Tabletop DM
		const { rerender } = render(<PostEditor {...buildProps({ isTabletop: true, isOwner: true })} />);
		expect(screen.getByPlaceholderText('forum.postEditor.tabletopDmPlaceholder')).toBeInTheDocument();

		// Tabletop Player
		rerender(<PostEditor {...buildProps({ isTabletop: true, isOwner: false })} />);
		expect(screen.getByPlaceholderText('forum.postEditor.tabletopPlayerPlaceholder')).toBeInTheDocument();

		// DM Narrativo
		rerender(<PostEditor {...buildProps({ isTabletop: false, isOwner: true })} />);
		expect(screen.getByPlaceholderText('forum.postEditor.dmPlaceholder')).toBeInTheDocument();

		// Default Narrativo Player
		rerender(<PostEditor {...buildProps({ isTabletop: false, isOwner: false })} />);
		expect(screen.getByPlaceholderText('forum.postEditor.defaultPlaceholder')).toBeInTheDocument();
	});
});
