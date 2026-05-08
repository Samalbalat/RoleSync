import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeAll, afterEach, describe, test, expect } from 'vitest';
import DynamicCharacterForm from '../../../components/character/DynamicCharacterForm';
import CharacterService from '../../../services/CharacterService';
import toast from 'react-hot-toast';

// --- MOCKS ---

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key, options) => {
			if (key.includes('maximum') || key.includes('max')) {
				console.log('Traducción llamada con:', key, options);
			}
			if (options && options.max !== undefined) return `${key} ${options.max}`;
			if (options && options.min !== undefined) return `${key} ${options.min}`;
			return key;
		},
	}),
}));

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({ primary: 'blue' }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
}));

vi.mock('../../../services/CharacterService', () => ({
	default: {
		createCharacter: vi.fn(),
	},
}));

vi.mock('react-hot-toast', () => ({
	default: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

beforeAll(() => {
	HTMLElement.prototype.animate = vi.fn().mockImplementation(() => ({
		finished: Promise.resolve(),
		cancel: vi.fn(),
		play: vi.fn(),
		pause: vi.fn(),
	}));
});

const getMTInput = labelText => {
	const label = screen.getByText(labelText, { exact: false });
	return label.previousElementSibling;
};

describe('DynamicCharacterForm', () => {
	afterEach(() => {
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	const mockTemplateData = {
		id: 10,
		campaign_id: 5,
		schema_definition: [
			{ key: 'clase', label: 'Clase', type: 'short_text', required: true },
			{ key: 'fuerza', label: 'Fuerza', type: 'number', required: true, min: 1, max: 20 },
			{ key: 'historia', label: 'Historia', type: 'long_text', required: false },
			{ key: 'is_hero', label: 'Es un héroe', type: 'boolean', required: false },
		],
	};

	// 1️⃣ Test para mostrar spinner cuando no hay schema_definition
	test('muestra un spinner si schema_definition no existe', () => {
		const { container } = render(<DynamicCharacterForm templateData={{ id: 1 }} />);
		expect(container.querySelector('.flex.justify-center.mt-20')).toBeInTheDocument();
	});

	// 2️⃣ Test para renderizar el formulario con campos fijos y dinámicos
	test('renderiza el formulario con campos fijos y dinámicos cuando hay datos', () => {
		render(<DynamicCharacterForm templateData={mockTemplateData} />);

		// Campos fijos
		expect(getMTInput('character.form.name')).toBeInTheDocument();
		expect(getMTInput('character.form.image')).toBeInTheDocument();

		// Campos dinámicos
		expect(getMTInput('Clase *')).toBeInTheDocument();
		expect(getMTInput('Fuerza *')).toBeInTheDocument();
		expect(getMTInput('Historia')).toBeInTheDocument();
		expect(screen.getByLabelText('Es un héroe')).toBeInTheDocument();
	});

	// 3️⃣ Test para validar campos requeridos y mostrar errores
	test('no envía la petición si faltan campos requeridos', async () => {
		const user = userEvent.setup();
		render(<DynamicCharacterForm templateData={mockTemplateData} />);

		const submitButton = screen.getByRole('button', { name: 'character.form.submit' });
		await user.click(submitButton);

		await waitFor(() => {
			expect(CharacterService.createCharacter).not.toHaveBeenCalled();
			const errorMessages = screen.getAllByText('errors.required');
			expect(errorMessages.length).toBeGreaterThan(0);
		});
	});

	// 4️⃣ Test para formatear atributos, llamar al servicio y navegar al éxito
	test('formatea los atributos dinámicos, llama al servicio y navega al éxito', async () => {
		const user = userEvent.setup();
		CharacterService.createCharacter.mockResolvedValueOnce({});

		render(<DynamicCharacterForm templateData={mockTemplateData} />);

		await user.type(getMTInput('character.form.name'), 'Gimli');
		await user.type(getMTInput('Clase *'), 'Guerrero');
		await user.type(getMTInput('Fuerza *'), '18');
		await user.type(getMTInput('Historia'), 'Hijo de Glóin');
		await user.click(screen.getByLabelText('Es un héroe'));

		const submitButton = screen.getByRole('button', { name: 'character.form.submit' });
		await user.click(submitButton);

		// ¡ATENCIÓN! El orden del array ahora es idéntico a schema_definition para evitar fallos
		await waitFor(() => {
			expect(CharacterService.createCharacter).toHaveBeenCalledWith({
				name: 'Gimli',
				avatar_url: '',
				campaign_id: 5,
				template_id: 10,
				attributes: [
					{ key: 'clase', label: 'Clase', type: 'short_text', required: true, min: null, max: null, value: 'Guerrero' },
					{ key: 'fuerza', label: 'Fuerza', type: 'number', required: true, min: 1, max: 20, value: 18 },
					{
						key: 'historia',
						label: 'Historia',
						type: 'long_text',
						required: false,
						min: null,
						max: null,
						value: 'Hijo de Glóin',
					},
					{ key: 'is_hero', label: 'Es un héroe', type: 'boolean', required: false, min: null, max: null, value: true },
				],
			});
		});

		expect(toast.success).toHaveBeenCalledWith('character.message.successCreating');

		await waitFor(
			() => {
				expect(mockNavigate).toHaveBeenCalledWith('/campaign/5');
			},
			{ timeout: 2000 },
		);
	});

	// 5️⃣ Test para manejar error en creación y no navegar
	test('muestra toast de error y no navega si la creación falla', async () => {
		const user = userEvent.setup();
		CharacterService.createCharacter.mockRejectedValueOnce(new Error('API Error'));

		render(<DynamicCharacterForm templateData={mockTemplateData} />);

		await user.type(getMTInput('character.form.name'), 'Legolas');
		await user.type(getMTInput('Clase *'), 'Arquero');
		await user.type(getMTInput('Fuerza *'), '14');

		const submitButton = screen.getByRole('button', { name: 'character.form.submit' });
		await user.click(submitButton);

		await waitFor(
			() => {
				expect(CharacterService.createCharacter).toHaveBeenCalled();
				expect(toast.error).toHaveBeenCalledWith('character.message.errorCreating');
			},
			{ timeout: 2000 },
		);

		expect(mockNavigate).not.toHaveBeenCalled();
	});
});
