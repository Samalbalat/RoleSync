import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import { toast } from 'react-hot-toast';
import CreateGeneralPost from '../../../components/forum/CreateGeneralPost';
import ForumService from '../../../services/ForumService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/ForumService', () => ({
	default: { createGeneralThread: vi.fn() },
}));

vi.mock('react-i18next', () => {
	const t = key => key;
	return {
		useTranslation: () => ({ t }),
	};
});

vi.mock('react-hot-toast', () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({ primary: 'indigo', textPrimary: 'text-indigo-900' }),
}));

vi.mock('@material-tailwind/react', () => {
	const React = require('react'); // Necesario para forwardRef dentro del mock
	return {
		Dialog: ({ open, children }) => (open ? <div role='dialog'>{children}</div> : null),
		DialogHeader: ({ children }) => <div>{children}</div>,
		DialogBody: ({ children }) => <div>{children}</div>,
		DialogFooter: ({ children }) => <div>{children}</div>,
		Typography: ({ children }) => <div>{children}</div>,

		Input: React.forwardRef(({ label, ...rest }, ref) => <input aria-label={label} ref={ref} {...rest} />),
		Button: ({ children, onClick, type, disabled, loading }) => (
			<button type={type || 'button'} onClick={onClick} disabled={disabled || loading}>
				{children}
			</button>
		),
		Chip: ({ value }) => <span>{value}</span>,
		IconButton: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
	};
});

vi.mock('@heroicons/react/24/outline', async importOriginal => {
	const actual = await importOriginal();
	return {
		...actual,
		PaperAirplaneIcon: () => null,
		XMarkIcon: () => <span data-testid='x-icon' />,
		ChatBubbleLeftEllipsisIcon: () => null,
		PhotoIcon: () => null,
		LinkIcon: () => null,
		AdjustmentsHorizontalIcon: () => null,
	};
});

// ─── Helper ──────────────────────────────────────────────────────────────────

const handleClose = vi.fn();
const onSuccess = vi.fn();

const renderModal = (open = true) =>
	render(<CreateGeneralPost open={open} handleClose={handleClose} onSuccess={onSuccess} />);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CreateGeneralPost — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Visibilidad
	test('muestra el modal cuando open es true', () => {
		renderModal(true);
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	test('no muestra el modal cuando open es false', () => {
		renderModal(false);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	// 2️⃣  Campos del formulario
	test('renderiza los campos de título, tags y contenido', () => {
		renderModal();
		expect(screen.getByRole('textbox', { name: /forum.general.create.title/i })).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: /forum.general.create.tags/i })).toBeInTheDocument();
	});

	// 3️⃣  Validación: formulario vacío
	test('muestra errores de validación si se envía el formulario vacío', async () => {
		renderModal();
		await userEvent.click(screen.getByRole('button', { name: /forum.general.create.submit/i }));

		await waitFor(() => {
			expect(screen.getByText('forum.general.create.titleRequired')).toBeInTheDocument();
			expect(screen.getByText('forum.general.create.contentRequired')).toBeInTheDocument();
		});
	});

	// 4️⃣  Validación: título demasiado corto
	test('muestra error si el título es demasiado corto', async () => {
		renderModal();
		await userEvent.type(screen.getByRole('textbox', { name: /forum.general.create.title/i }), 'Hola');
		await userEvent.click(screen.getByRole('button', { name: /forum.general.create.submit/i }));

		await waitFor(() => {
			expect(screen.getByText('forum.general.create.titleMinLength')).toBeInTheDocument();
		});
	});

	test('muestra preview de tags separados por comas', async () => {
		renderModal();
		await userEvent.type(screen.getByRole('textbox', { name: /forum.general.create.tags/i }), 'rol, mesa, dnd');

		await waitFor(() => {
			// Buscamos con el '#' porque el componente lo añade al renderizar el Chip
			expect(screen.getByText('#rol')).toBeInTheDocument();
			expect(screen.getByText('#mesa')).toBeInTheDocument();
			expect(screen.getByText('#dnd')).toBeInTheDocument();
		});
	});

	// 6️⃣  Envío exitoso → llama a onSuccess y handleClose
	test('al enviar correctamente llama a onSuccess y handleClose', async () => {
		ForumService.createGeneralThread.mockResolvedValue({ id: 99 });

		renderModal();

		await userEvent.type(screen.getByRole('textbox', { name: /forum.general.create.title/i }), 'Mi primer hilo de rol');

		await userEvent.type(
			screen.getByPlaceholderText('forum.general.create.contentPlaceholder'),
			'Este es el contenido del hilo con más de diez caracteres.',
		);

		await userEvent.click(screen.getByRole('button', { name: /forum.general.create.submit/i }));

		await waitFor(() => {
			expect(ForumService.createGeneralThread).toHaveBeenCalledOnce();
			expect(onSuccess).toHaveBeenCalledOnce();
			expect(handleClose).toHaveBeenCalledOnce();
		});
	});

	// 7️⃣  Cancelar → llama a handleClose
	test('el botón cancelar llama a handleClose', async () => {
		renderModal();
		await userEvent.click(screen.getByRole('button', { name: /common.cancel/i }));
		expect(handleClose).toHaveBeenCalledOnce();
	});

	// 8️⃣ Mostrar/Ocultar menús de formato e imagen
	test('despliega los menús de formato y de añadir imagen al hacer clic', async () => {
		renderModal();

		const formatBtn = screen.getByRole('button', { name: /Formato/i });
		await userEvent.click(formatBtn);
		expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();

		const imageBtn = screen.getByRole('button', { name: /forum.general.create.addImage/i });
		await userEvent.click(imageBtn);
		expect(screen.getByRole('textbox', { name: /forum.general.create.imageUrl/i })).toBeInTheDocument();
	});

	// 9️⃣ Insertar formato Markdown
	test('inserta las etiquetas markdown correctas en el textarea', async () => {
		renderModal();
		await userEvent.click(screen.getByRole('button', { name: /Formato/i }));

		const textarea = screen.getByPlaceholderText('forum.general.create.contentPlaceholder');

		// Negrita
		await userEvent.click(screen.getByRole('button', { name: 'B' }));
		expect(textarea.value).toBe('**texto**');
		await userEvent.clear(textarea);

		// Cursiva
		await userEvent.click(screen.getByRole('button', { name: 'I' }));
		expect(textarea.value).toBe('*texto*');
		await userEvent.clear(textarea);

		// Tachado
		await userEvent.click(screen.getByRole('button', { name: 'S' }));
		expect(textarea.value).toBe('~~texto~~');
		await userEvent.clear(textarea);

		// Cita
		await userEvent.click(screen.getByRole('button', { name: /forum.quote/i }));
		expect(textarea.value).toBe('> texto');
	});

	// 🔟 Manejar imagen (Previsualización, onLoad, onError y Limpiar)
	test('maneja el input de imagen, sus eventos de carga/error y permite borrarla', async () => {
		renderModal();
		await userEvent.click(screen.getByRole('button', { name: /forum.general.create.addImage/i }));

		const inputImage = screen.getByRole('textbox', { name: /forum.general.create.imageUrl/i });
		await userEvent.type(inputImage, 'http://ejemplo.com/foto.jpg');

		const img = await screen.findByAltText('Preview');
		expect(img).toBeInTheDocument();

		fireEvent.load(img);
		expect(img.style.display).toBe('block');

		fireEvent.error(img);
		expect(img.style.display).toBe('none');
		expect(toast.error).toHaveBeenCalledWith('forum.general.create.invalidImageUrl');

		const clearIcons = screen.getAllByTestId('x-icon');
		const clearBtn = clearIcons[clearIcons.length - 1].closest('button');
		await userEvent.click(clearBtn);

		await waitFor(() => {
			expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
		});
	});

	// 1️⃣1️⃣ Error en el envío (Catch)
	test('muestra toast de error si la creación del hilo falla en el servicio', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		ForumService.createGeneralThread.mockRejectedValue(new Error('API Error'));

		renderModal();

		await userEvent.type(screen.getByRole('textbox', { name: /forum.general.create.title/i }), 'Mi primer hilo');
		await userEvent.type(
			screen.getByPlaceholderText('forum.general.create.contentPlaceholder'),
			'Contenido lo suficientemente largo para validar',
		);

		await userEvent.click(screen.getByRole('button', { name: /forum.general.create.submit/i }));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('forum.general.create.error');
		});

		consoleSpy.mockRestore();
	});

	// 1️⃣2️⃣ Envío exitoso sin prop onSuccess definida
	test('no rompe la aplicación si se envía el formulario y onSuccess no está definido', async () => {
		ForumService.createGeneralThread.mockResolvedValue({ id: 100 });

		render(<CreateGeneralPost open={true} handleClose={handleClose} />);

		await userEvent.type(screen.getByRole('textbox', { name: /forum.general.create.title/i }), 'Mi primer hilo');
		await userEvent.type(
			screen.getByPlaceholderText('forum.general.create.contentPlaceholder'),
			'Contenido de prueba muy interesante',
		);

		await userEvent.click(screen.getByRole('button', { name: /forum.general.create.submit/i }));

		await waitFor(() => {
			expect(handleClose).toHaveBeenCalledOnce();
		});
	});
});
