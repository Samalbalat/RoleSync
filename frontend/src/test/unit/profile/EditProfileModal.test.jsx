import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import { EditProfileModal } from '../../../components/profile/EditProfileModal';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => {
	const t = key => key;
	return {
		useTranslation: () => ({ t }),
	};
});

vi.mock('@material-tailwind/react', () => {
	const React = require('react');
	return {
		Dialog: ({ open, children }) => (open ? <div role='dialog'>{children}</div> : null),
		DialogHeader: ({ children }) => <div>{children}</div>,
		DialogBody: ({ children }) => <div>{children}</div>,
		DialogFooter: ({ children }) => <div>{children}</div>,
		Typography: ({ children }) => <div>{children}</div>,
		Avatar: ({ alt }) => <img alt={alt} />,

		Input: React.forwardRef(({ label, error: _e, ...rest }, ref) => <input aria-label={label} ref={ref} {...rest} />),
		Textarea: React.forwardRef(({ label, error: _e, ...rest }, ref) => <textarea aria-label={label} ref={ref} {...rest} />),

		Button: ({ children, onClick, type, disabled, loading: _l, form }) => (
			<button type={type || 'button'} onClick={onClick} disabled={disabled} form={form}>
				{children}
			</button>
		),
	};
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const profileData = {
	profileName: 'AlexTable',
	description: 'Amante del rol.',
	image: 'https://example.com/avatar.jpg',
};

const handler = vi.fn();
const onSave = vi.fn();
const theme = { primary: 'blue' };

const renderModal = (open = true, data = profileData) =>
	render(<EditProfileModal open={open} handler={handler} profileData={data} onSave={onSave} theme={theme} />);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('EditProfileModal — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Visibilidad
	test('muestra el modal cuando open es true', () => {
		renderModal();
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	test('no muestra el modal cuando open es false', () => {
		renderModal(false);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	// 2️⃣  Precarga de datos
	test('precarga el nombre del perfil en el formulario', () => {
		renderModal();
		expect(screen.getByRole('textbox', { name: /profile.edit.profileName/i })).toHaveValue('AlexTable');
	});

	test('precarga la descripción en el formulario', () => {
		renderModal();
		expect(screen.getByRole('textbox', { name: /profile.edit.description/i })).toHaveValue('Amante del rol.');
	});

	// 3️⃣  Validación: nombre requerido
	test('muestra error si se borra el nombre y se envía el formulario', async () => {
		renderModal();
		const nameInput = screen.getByRole('textbox', { name: /profile.edit.profileName/i });
		await userEvent.clear(nameInput);
		await userEvent.click(screen.getByRole('button', { name: /common.save/i }));

		await waitFor(() => {
			expect(screen.getByText('profile.edit.profileNameRequired')).toBeInTheDocument();
		});
	});

	// 4️⃣  Envío exitoso → llama a onSave con los datos correctos
	test('llama a onSave con los datos del formulario al guardar', async () => {
		onSave.mockResolvedValue({});
		renderModal();

		const nameInput = screen.getByRole('textbox', { name: /profile.edit.profileName/i });
		await userEvent.clear(nameInput);
		await userEvent.type(nameInput, 'AlexModificado');
		await userEvent.click(screen.getByRole('button', { name: /common.save/i }));

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ profileName: 'AlexModificado' }));
		});
	});

	// 5️⃣  Error 403 → nombre ya existente
	test('muestra error si onSave lanza un error 403 de nombre duplicado', async () => {
		onSave.mockRejectedValue({
			response: {
				status: 403,
				data: 'Profile name already exists and is not the current profile',
			},
		});
		renderModal();

		await userEvent.click(screen.getByRole('button', { name: /common.save/i }));

		await waitFor(() => {
			expect(screen.getByText('profile.edit.errorAlreadyExists')).toBeInTheDocument();
		});
	});

	// 6️⃣  Cancelar → llama a handler
	test('llama a handler al hacer click en cancelar', async () => {
		renderModal();
		await userEvent.click(screen.getByRole('button', { name: /common.cancel/i }));
		expect(handler).toHaveBeenCalledOnce();
	});
});
