import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import toast from 'react-hot-toast';

import TemplateBuilder from '../../../components/character/TemplateBuilder';
import CharacterService from '../../../services/CharacterService';

// ----------------------------------
// MOCKS
// ----------------------------------

if (!HTMLElement.prototype.animate) {
	HTMLElement.prototype.animate = vi.fn();
}

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams('campaignId=99');

vi.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
	useSearchParams: () => [mockSearchParams],
	useLocation: () => ({ pathname: '/' }),
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
		getTemplateById: vi.fn(),
		createTemplate: vi.fn(),
		updateTemplate: vi.fn(),
	},
}));

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({
		primary: 'blue',
		border: 'border-blue-500',
	}),
}));

vi.mock('../../../utils/character/templatePresets', () => ({
	TEMPLATE_PRESETS: {
		mock_preset: {
			name: 'Plantilla de Prueba Preset',
			schema: [{ key: 'preset_str', label: 'Fuerza Preset', type: 'number' }],
		},
	},
}));

vi.mock('../../../utils/character/templateBuilderUtils', () => ({
	generateInternalKey: vi.fn(() => 'mock_key'),
	validateField: vi.fn(field => {
		if (!field.label?.trim()) return { label: 'errors.required' };

		if (field.min !== '' && field.max !== '' && Number(field.min) > Number(field.max)) {
			return { minMax: 'errors.invalidRange' };
		}

		return null;
	}),
	buildTemplatePayload: vi.fn(p => p),
	mapBackendSchemaToFields: vi.fn(schema =>
		schema.map(s => ({
			key: s.key,
			label: s.label,
			type: s.type,
			required: false,
			min: '',
			max: '',
		})),
	),
	rangeMin: vi.fn(f => (f.min ? f.min : '-')),
	rangeMax: vi.fn(f => (f.max ? f.max : '-')),
}));

// ----------------------------------
// TESTS
// ----------------------------------

describe('TemplateBuilder', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSearchParams = new URLSearchParams('campaignId=99');
	});

	const templateNameInput = () => screen.getByLabelText('character.templateBuilder.templateName');

	const fieldNameInput = () => screen.getByLabelText('character.templateBuilder.nameField');

	test('renderiza correctamente modo creación', () => {
		render(<TemplateBuilder />);

		expect(screen.getByText('character.templateBuilder.title')).toBeInTheDocument();

		expect(
			screen.getByRole('button', {
				name: 'character.templateBuilder.saveTemplate',
			}),
		).toBeDisabled();
	});

	test('añade campo correctamente', async () => {
		const user = userEvent.setup();

		render(<TemplateBuilder />);

		await user.type(fieldNameInput(), 'Fuerza');

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.addField',
			}),
		);

		expect(screen.getByText('Fuerza')).toBeInTheDocument();
	});

	test('valida campo sin label', async () => {
		const user = userEvent.setup();

		render(<TemplateBuilder />);

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.addField',
			}),
		);

		expect(screen.getByText('errors.required')).toBeInTheDocument();
	});

	test('valida rango incorrecto min/max', async () => {
		const user = userEvent.setup();

		render(<TemplateBuilder />);

		await user.type(fieldNameInput(), 'Vida');

		const typeSelect = screen.getByRole('combobox');
		await user.click(typeSelect);

		await user.click(screen.getByText('character.templateBuilder.numberDes'));

		const inputs = screen.getAllByRole('spinbutton');

		await user.type(inputs[0], '20');
		await user.type(inputs[1], '5');

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.addField',
			}),
		);

		expect(screen.getByText('errors.invalidRange')).toBeInTheDocument();
	});

	test('edita campo correctamente', async () => {
		const user = userEvent.setup();

		render(<TemplateBuilder />);

		await user.type(fieldNameInput(), 'Fuerza');

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.addField',
			}),
		);

		const editBtn = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));

		await user.click(editBtn);

		await user.clear(fieldNameInput());
		await user.type(fieldNameInput(), 'Destreza');

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.updateField',
			}),
		);

		expect(screen.getByText('Destreza')).toBeInTheDocument();
	});

	test('crea plantilla correctamente', async () => {
		const user = userEvent.setup();

		CharacterService.createTemplate.mockResolvedValueOnce({});

		render(<TemplateBuilder />);

		await user.type(templateNameInput(), 'Plantilla DnD');
		await user.type(fieldNameInput(), 'Fuerza');

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.addField',
			}),
		);

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.saveTemplate',
			}),
		);

		await waitFor(() => {
			expect(CharacterService.createTemplate).toHaveBeenCalled();
		});

		expect(toast.success).toHaveBeenCalledWith('character.templateBuilder.successSave');
	});

	test('error sin nombre de plantilla', async () => {
		const user = userEvent.setup();

		render(<TemplateBuilder />);

		await user.type(fieldNameInput(), 'Fuerza');

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.addField',
			}),
		);

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.saveTemplate',
			}),
		);

		expect(toast.error).toHaveBeenCalledWith('character.templateBuilder.errorNoName');
	});

	test('error si API falla', async () => {
		const user = userEvent.setup();

		CharacterService.createTemplate.mockRejectedValueOnce(new Error('fail'));

		render(<TemplateBuilder />);

		await user.type(templateNameInput(), 'Plantilla');
		await user.type(fieldNameInput(), 'Fuerza');

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.addField',
			}),
		);

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.saveTemplate',
			}),
		);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('character.templateBuilder.errorSave');
		});
	});

	test('modo edición carga y actualiza plantilla', async () => {
		mockSearchParams = new URLSearchParams('campaignId=99&templateId=7');

		const user = userEvent.setup();

		CharacterService.getTemplateById.mockResolvedValueOnce({
			name: 'Plantilla vieja',
			schema: [
				{
					key: 'str',
					label: 'Strength',
					type: 'number',
				},
			],
		});

		CharacterService.updateTemplate.mockResolvedValueOnce({});

		render(<TemplateBuilder />);

		await waitFor(() => {
			expect(screen.getByDisplayValue('Plantilla vieja')).toBeInTheDocument();
		});

		await user.click(
			screen.getByRole('button', {
				name: 'character.templateBuilder.updateTemplate',
			}),
		);

		await waitFor(() => {
			expect(CharacterService.updateTemplate).toHaveBeenCalled();
		});

		expect(toast.success).toHaveBeenCalledWith('character.templateBuilder.successUpdate');
	});

	test('error carga plantilla', async () => {
		mockSearchParams = new URLSearchParams('campaignId=99&templateId=7');

		CharacterService.getTemplateById.mockRejectedValueOnce(new Error('fail'));

		render(<TemplateBuilder />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('character.templateBuilder.errorLoadCharacter');
		});
	});

	test('carga datos en modo clonar (cloneId)', async () => {
		mockSearchParams = new URLSearchParams('campaignId=99&cloneId=5');

		CharacterService.getTemplateById.mockResolvedValueOnce({
			name: 'Plantilla Base',
			schema: [{ key: 'str', label: 'Fuerza Clonada', type: 'number' }],
		});

		render(<TemplateBuilder />);

		await waitFor(() => {
			// Verifica que añade "(Copia)" al nombre
			expect(screen.getByDisplayValue('Plantilla Base (Copia)')).toBeInTheDocument();
			expect(screen.getByText('Fuerza Clonada')).toBeInTheDocument();
		});
	});

	test('error al cargar datos en modo clonar', async () => {
		mockSearchParams = new URLSearchParams('campaignId=99&cloneId=5');
		CharacterService.getTemplateById.mockRejectedValueOnce(new Error('fail clone'));

		render(<TemplateBuilder />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('character.templateBuilder.errorLoadCharacter');
		});
	});

	test('carga datos desde preset', async () => {
		mockSearchParams = new URLSearchParams('campaignId=99&preset=mock_preset');

		render(<TemplateBuilder />);

		await waitFor(() => {
			expect(screen.getByDisplayValue('Plantilla de Prueba Preset')).toBeInTheDocument();
			expect(screen.getByText('Fuerza Preset')).toBeInTheDocument();
		});
	});

	test('maneja schema inválido (no array) en edición', async () => {
		mockSearchParams = new URLSearchParams('campaignId=99&templateId=7');

		CharacterService.getTemplateById.mockResolvedValueOnce({
			name: 'Plantilla Rota',
			schema: null, // Simulamos que el backend devuelve null o un objeto malformado
		});

		render(<TemplateBuilder />);

		await waitFor(() => {
			expect(screen.getByDisplayValue('Plantilla Rota')).toBeInTheDocument();
		});

		// No debería haber campos renderizados
		expect(screen.queryByText('character.templateBuilder.fields')).not.toBeInTheDocument();
	});

	test('obtiene campaignId del backend si no está en la URL en edición', async () => {
		mockSearchParams = new URLSearchParams('templateId=7'); // Sin campaignId en URL

		CharacterService.getTemplateById.mockResolvedValueOnce({
			name: 'Plantilla Recuperada',
			campaignId: '42', // Viene del backend
			schema: [],
		});

		render(<TemplateBuilder />);

		await waitFor(() => {
			expect(screen.getByDisplayValue('Plantilla Recuperada')).toBeInTheDocument();
		});
	});

	test('error al guardar sin campaignId', async () => {
		const user = userEvent.setup();
		mockSearchParams = new URLSearchParams(''); // Sin campaignId en URL

		render(<TemplateBuilder />);

		await user.type(templateNameInput(), 'Plantilla Sin Campaña');
		await user.type(fieldNameInput(), 'Fuerza');
		await user.click(screen.getByRole('button', { name: 'character.templateBuilder.addField' }));

		await user.click(screen.getByRole('button', { name: 'character.templateBuilder.saveTemplate' }));

		expect(toast.error).toHaveBeenCalledWith('character.templateBuilder.errorNoCampaignId');
	});

	test('limpia el error de validación al escribir en el campo', async () => {
		const user = userEvent.setup();
		render(<TemplateBuilder />);

		// Forzamos el error de campo requerido
		await user.click(screen.getByRole('button', { name: 'character.templateBuilder.addField' }));
		expect(screen.getByText('errors.required')).toBeInTheDocument();

		// Al escribir, el error debería borrarse del estado gracias a handleChange
		await user.type(fieldNameInput(), 'V');

		// Esperamos que el error desaparezca
		expect(screen.queryByText('errors.required')).not.toBeInTheDocument();
	});

	test('borra un campo mientras se está editando', async () => {
		const user = userEvent.setup();
		render(<TemplateBuilder />);

		// 1. Añadimos campo
		await user.type(fieldNameInput(), 'Inteligencia');
		await user.click(screen.getByRole('button', { name: 'character.templateBuilder.addField' }));

		// 2. Click en Editar (El primer botón IconButton es el de editar)
		const editBtns = screen.getAllByRole('button').filter(btn => btn.className.includes('text-blue-500'));
		await user.click(editBtns[0]);

		// Verificamos que estamos en modo edición
		expect(screen.getByText(/character.templateBuilder.editing:/)).toBeInTheDocument();

		// 3. Click en Borrar (El botón rojo)
		const deleteBtns = screen.getAllByRole('button').filter(btn => btn.className.includes('text-red-500'));
		await user.click(deleteBtns[0]);

		// Verificamos que el campo se borró y que salimos del modo edición (se reseteó el form)
		expect(screen.queryByText('Inteligencia')).not.toBeInTheDocument();
		expect(screen.queryByText(/character.templateBuilder.editing:/)).not.toBeInTheDocument();
	});
});
