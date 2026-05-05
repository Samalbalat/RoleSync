import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import toast from 'react-hot-toast';
import FreeStyleCharacterForm from '../../../components/character/FreeStyleCharacterForm';
import CharacterService from '../../../services/CharacterService';

// ---------------------------------------------------
// Parches JSDOM
// ---------------------------------------------------

if (!HTMLElement.prototype.animate) {
	HTMLElement.prototype.animate = vi.fn();
}

// ---------------------------------------------------
// Mocks
// ---------------------------------------------------

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: key => key,
	}),
}));

vi.mock('react-hot-toast', () => ({
	default: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock('../../../services/CharacterService', () => ({
	default: {
		createCharacter: vi.fn(),
	},
}));

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({
		textPrimary: 'text-blue-500',
	}),
}));

// Mock Material Tailwind simplificado
vi.mock('@material-tailwind/react', () => ({
	Card: ({ children }) => <div>{children}</div>,
	CardBody: ({ children }) => <div>{children}</div>,
	Typography: ({ children }) => <span>{children}</span>,

	Input: React.forwardRef(({ label, ...props }, ref) => (
		<div>
			<input ref={ref} aria-label={label} {...props} />
			<span>{label}</span>
		</div>
	)),

	Textarea: React.forwardRef(({ label, ...props }, ref) => (
		<div>
			<textarea ref={ref} aria-label={label} {...props} />
			<span>{label}</span>
		</div>
	)),

	Button: ({ children, onClick, type }) => (
		<button type={type} onClick={onClick}>
			{children}
		</button>
	),

	IconButton: ({ children, onClick, disabled }) => (
		<button onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
}));

vi.mock('@heroicons/react/24/outline', () => ({
	PlusIcon: () => <svg />,
	TrashIcon: () => <svg />,
	CheckIcon: () => <svg />,
	DocumentTextIcon: () => <svg />,
}));

// ---------------------------------------------------
// Helpers
// ---------------------------------------------------

const getMTInput = labelText => screen.getByLabelText(labelText);

// ---------------------------------------------------
// Tests
// ---------------------------------------------------

describe('FreeStyleCharacterForm', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('renderiza correctamente el formulario inicial', () => {
		render(<FreeStyleCharacterForm />);

		expect(screen.getByText('character.form.freeCreation')).toBeInTheDocument();

		expect(screen.getByText('character.form.basicInfo')).toBeInTheDocument();

		expect(screen.getByText('character.form.personalAttributes')).toBeInTheDocument();

		expect(screen.getByText('character.form.attributeName')).toBeInTheDocument();
	});

	test('muestra error si se intenta enviar sin nombre', async () => {
		const user = userEvent.setup();

		render(<FreeStyleCharacterForm />);

		await user.click(screen.getByRole('button', { name: 'character.form.submit' }));

		await waitFor(() => {
			expect(screen.getByText('errors.required')).toBeInTheDocument();
		});

		expect(CharacterService.createCharacter).not.toHaveBeenCalled();
	});

	test('permite añadir y eliminar atributos dinámicos', async () => {
		const user = userEvent.setup();

		render(<FreeStyleCharacterForm />);

		expect(screen.getAllByText('character.form.attributeName')).toHaveLength(1);

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.addField',
			}),
		);

		expect(screen.getAllByText('character.form.attributeName')).toHaveLength(2);

		const trashButton = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));

		await user.click(trashButton);

		expect(screen.getAllByText('character.form.attributeName')).toHaveLength(1);
	});

	test('permite añadir atributo long text', async () => {
		const user = userEvent.setup();

		render(<FreeStyleCharacterForm />);

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.addLongField',
			}),
		);

		expect(screen.getAllByText('character.form.attributeName')).toHaveLength(2);
	});

	test('botón eliminar inicial empieza disabled', () => {
		render(<FreeStyleCharacterForm />);

		const buttons = screen.getAllByRole('button');

		const trashButton = buttons.find(btn => btn.querySelector('svg'));

		expect(trashButton).toBeDisabled();
	});

	test('ignora atributos vacíos', async () => {
		const user = userEvent.setup();

		CharacterService.createCharacter.mockResolvedValue({});

		render(<FreeStyleCharacterForm />);

		await user.type(getMTInput('character.form.name'), 'Boromir');

		await user.click(screen.getByRole('button', { name: 'character.form.submit' }));

		await waitFor(() => {
			expect(CharacterService.createCharacter).toHaveBeenCalledWith(
				expect.objectContaining({
					attributes: [],
				}),
			);
		});
	});

	test('trimmea avatar_url antes de enviar', async () => {
		const user = userEvent.setup();

		CharacterService.createCharacter.mockResolvedValue({});

		render(<FreeStyleCharacterForm />);

		await user.type(getMTInput('character.form.name'), 'Conan');

		await user.type(getMTInput('character.form.image'), '  https://foo.com/img.png  ');

		await user.click(screen.getByRole('button', { name: 'character.form.submit' }));

		await waitFor(() => {
			expect(CharacterService.createCharacter).toHaveBeenCalledWith(
				expect.objectContaining({
					avatar_url: 'https://foo.com/img.png',
				}),
			);
		});
	});

	test('formatea atributos, llama API y navega', async () => {
		const user = userEvent.setup();

		vi.spyOn(Math, 'random').mockReturnValue(0.123456);

		CharacterService.createCharacter.mockResolvedValue({});

		render(<FreeStyleCharacterForm />);

		await user.type(getMTInput('character.form.name'), 'Conan');

		const keys = document.querySelectorAll('input[maxlength="50"]');

		const values = document.querySelectorAll('input[maxlength="255"]');

		await user.type(keys[0], 'Fuerza Bruta');

		await user.type(values[0], '18');

		await user.click(screen.getByRole('button', { name: 'character.form.submit' }));

		await waitFor(() => {
			expect(CharacterService.createCharacter).toHaveBeenCalledWith({
				name: 'Conan',
				avatar_url: '',
				campaign_id: null,
				template_id: null,

				attributes: [
					{
						key: expect.stringMatching(/^fuerzabruta_/),
						label: 'Fuerza Bruta',
						type: 'short_text',
						required: false,
						min: 0,
						max: 0,
						value: '18',
					},
				],
			});
		});

		expect(toast.success).toHaveBeenCalledWith('character.message.successCreating');

		await waitFor(
			() => {
				expect(mockNavigate).toHaveBeenCalledWith('/characters');
			},
			{ timeout: 2000 },
		);

		Math.random.mockRestore();
	});

	test('muestra toast si API falla', async () => {
		const user = userEvent.setup();

		CharacterService.createCharacter.mockRejectedValue(new Error('API Failure'));

		render(<FreeStyleCharacterForm />);

		await user.type(getMTInput('character.form.name'), 'Legolas');

		await user.click(screen.getByRole('button', { name: 'character.form.submit' }));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('character.message.errorCreating');
		});

		expect(mockNavigate).not.toHaveBeenCalled();
	});

	test('cancel navega hacia atrás', async () => {
		const user = userEvent.setup();

		render(<FreeStyleCharacterForm />);

		await user.click(screen.getByRole('button', { name: 'common.cancel' }));

		expect(mockNavigate).toHaveBeenCalledWith(-1);
	});

	test('valida maxLength en nombre', async () => {
		const user = userEvent.setup();

		render(<FreeStyleCharacterForm />);

		await user.type(getMTInput('character.form.name'), 'a'.repeat(51));

		await user.click(screen.getByRole('button', { name: 'character.form.submit' }));

		await waitFor(() => {
			expect(screen.getByText('errors.maxLength50')).toBeInTheDocument();
		});
	});
});
