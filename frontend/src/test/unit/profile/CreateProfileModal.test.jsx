import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CreateProfileModal } from '../../../components/profile/CreateProfileModal';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => {
	const t = key => key;
	return {
		useTranslation: () => ({ t }),
	};
});

vi.mock('@material-tailwind/react', () => {
	const React = require('react'); // Necesitamos importar React dentro del mock
	return {
		Dialog: ({ open, children }) => (open ? <div role='dialog'>{children}</div> : null),
		DialogHeader: ({ children }) => <div>{children}</div>,
		DialogBody: ({ children }) => <div>{children}</div>,
		DialogFooter: ({ children }) => <div>{children}</div>,
		Typography: ({ children }) => <div>{children}</div>,
		Avatar: ({ alt }) => <img alt={alt} />,
		Chip: ({ value }) => <span>{value}</span>,

		Input: React.forwardRef(({ label, error: _e, ...rest }, ref) => <input aria-label={label} ref={ref} {...rest} />),
		Textarea: React.forwardRef(({ label, error: _e, ...rest }, ref) => <textarea aria-label={label} ref={ref} {...rest} />),

		Button: ({ children, onClick, type, disabled, loading: _l, form }) => (
			<button type={type || 'button'} onClick={onClick} disabled={disabled} form={form}>
				{children}
			</button>
		),
	};
});

// ─── Helper ──────────────────────────────────────────────────────────────────

const handler = vi.fn();
const onCreate = vi.fn();
const theme = { primary: 'blue' };

const renderModal = (type = 'TABLETOP', open = true) =>
	render(<CreateProfileModal open={open} handler={handler} type={type} onCreate={onCreate} theme={theme} />);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CreateProfileModal — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Visibilidad
	test('muestra el modal cuando open es true', () => {
		renderModal();
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	test('no muestra el modal cuando open es false', () => {
		renderModal('TABLETOP', false);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	// 2️⃣  Campos del formulario
	test('renderiza el campo de nombre de perfil', () => {
		renderModal();
		expect(screen.getByRole('textbox', { name: /profile.create.profileName/i })).toBeInTheDocument();
	});

	test('muestra el tipo de perfil en el chip', () => {
		renderModal('WRITTEN');
		expect(screen.getByText('WRITTEN')).toBeInTheDocument();
	});

	// 3️⃣  Validación: nombre requerido
	test('muestra error si se envía el formulario sin nombre', async () => {
		renderModal();
		await userEvent.click(screen.getByRole('button', { name: /common.create/i }));

		await waitFor(() => {
			expect(screen.getByText('profile.create.nameRequired')).toBeInTheDocument();
		});
	});

	// 4️⃣  Validación: nombre demasiado corto
	test('muestra error si el nombre es demasiado corto', async () => {
		renderModal();
		await userEvent.type(screen.getByRole('textbox', { name: /profile.create.profileName/i }), 'Ab');
		await userEvent.click(screen.getByRole('button', { name: /common.create/i }));

		await waitFor(() => {
			expect(screen.getByText('profile.create.nameTooShort')).toBeInTheDocument();
		});
	});

	// 5️⃣  Envío exitoso → llama a onCreate y handler
	test('llama a onCreate con los datos del formulario al enviar correctamente', async () => {
		onCreate.mockResolvedValue({});
		renderModal();

		await userEvent.type(screen.getByRole('textbox', { name: /profile.create.profileName/i }), 'AlexNuevo');
		await userEvent.click(screen.getByRole('button', { name: /common.create/i }));

		await waitFor(() => {
			expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ profileName: 'AlexNuevo' }));
			expect(handler).toHaveBeenCalledOnce();
		});
	});

	// 6️⃣  Error 403 → nombre ya existente
	test('muestra error de nombre duplicado si onCreate lanza 403', async () => {
		onCreate.mockRejectedValue({ response: { status: 403 } });
		renderModal();

		await userEvent.type(screen.getByRole('textbox', { name: /profile.create.profileName/i }), 'NombreExistente');
		await userEvent.click(screen.getByRole('button', { name: /common.create/i }));

		await waitFor(() => {
			expect(screen.getByText('profile.create.errorAlreadyExists')).toBeInTheDocument();
		});
	});

	// 7️⃣  Cancelar → llama a handler
	test('llama a handler al hacer click en cancelar', async () => {
		renderModal();
		await userEvent.click(screen.getByRole('button', { name: /common.cancel/i }));
		expect(handler).toHaveBeenCalledOnce();
	});
});
