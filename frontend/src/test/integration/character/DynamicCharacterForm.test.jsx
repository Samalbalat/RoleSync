import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeAll, afterEach, describe, test, expect } from 'vitest';
import DynamicCharacterForm from '../../../components/character/DynamicCharacterForm';
import CharacterService from '../../../services/CharacterService';
import toast from 'react-hot-toast';

// --- MOCKS ---

// Mock de i18n: devuelve la misma clave que recibe para facilitar los asserts
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: key => key,
	}),
}));

// Mock del tema
vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({ primary: 'blue' }),
}));

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
}));

// Mock de CharacterService
vi.mock('../../../services/CharacterService', () => ({
	default: {
		createCharacter: vi.fn(),
	},
}));

// Mock de toast
vi.mock('react-hot-toast', () => ({
	default: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// 1️⃣ FIX MOCK ANIMACIÓN: Evita el crash de Material Tailwind
beforeAll(() => {
	HTMLElement.prototype.animate = vi.fn().mockImplementation(() => ({
		finished: Promise.resolve(),
		cancel: vi.fn(),
		play: vi.fn(),
		pause: vi.fn(),
	}));
});

// 2️⃣ HELPER PARA MATERIAL TAILWIND
// Busca el label exacto y coge el input que tiene justo encima
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
			{ key: 'fuerza', label: 'Fuerza', type: 'number', required: true, min: 1, max: 20 },
			{ key: 'historia', label: 'Historia', type: 'long_text', required: false },
			{ key: 'is_hero', label: 'Es un héroe', type: 'boolean' },
		],
	};

	test('muestra un spinner si schema_definition no existe', () => {
		// Mock de un contenedor de spinner genérico basado en la clase de tu div
		const { container } = render(<DynamicCharacterForm templateData={{ id: 1 }} />);
		expect(container.querySelector('.flex.justify-center.mt-20')).toBeInTheDocument();
	});

	test('renderiza el formulario con campos fijos y dinámicos cuando hay datos', () => {
		render(<DynamicCharacterForm templateData={mockTemplateData} />);

		// Campos fijos (i18n devuelve la clave)
		expect(getMTInput('character.form.name')).toBeInTheDocument();
		expect(getMTInput('character.form.image')).toBeInTheDocument();

		// Campos dinámicos
		expect(getMTInput('Fuerza *')).toBeInTheDocument(); // Tiene asterisco por ser required
		expect(getMTInput('Historia')).toBeInTheDocument(); // Textarea
		expect(screen.getByLabelText('Es un héroe')).toBeInTheDocument(); // Checkbox normal (Suele funcionar con getByLabelText)
	});

	test('no envía la petición si faltan campos requeridos', async () => {
		const user = userEvent.setup();
		render(<DynamicCharacterForm templateData={mockTemplateData} />);

		const submitButton = screen.getByRole('button', { name: 'character.form.submit' });
		await user.click(submitButton);

		// Esperamos que NO se haya llamado al servicio y aparezcan errores
		await waitFor(() => {
			expect(CharacterService.createCharacter).not.toHaveBeenCalled();
			// Errores de react-hook-form (clave i18n mockeada)
			const errorMessages = screen.getAllByText('errors.required');
			expect(errorMessages.length).toBeGreaterThan(0);
		});
	});

	test('formatea los atributos dinámicos, llama al servicio y navega al éxito', async () => {
		// 1. userEvent limpio, sin temporizadores falsos
		const user = userEvent.setup();
		CharacterService.createCharacter.mockResolvedValueOnce({});

		render(<DynamicCharacterForm templateData={mockTemplateData} />);

		// 2. Rellenar campos fijos
		await user.type(getMTInput('character.form.name'), 'Gimli');

		// 3. Rellenar campos dinámicos
		await user.type(getMTInput('Fuerza *'), '18');
		await user.type(getMTInput('Historia'), 'Hijo de Glóin');
		await user.click(screen.getByLabelText('Es un héroe'));

		// 4. Enviar
		const submitButton = screen.getByRole('button', { name: 'character.form.submit' });
		await user.click(submitButton);

		// 5. Verificamos la llamada al servicio
		await waitFor(() => {
			expect(CharacterService.createCharacter).toHaveBeenCalledWith({
				name: 'Gimli',
				avatar_url: '',
				campaign_id: 5,
				template_id: 10,
				attributes: [
					{ key: 'fuerza', label: 'Fuerza', type: 'number', required: true, min: 1, max: 20, value: 18 },
					{ key: 'historia', label: 'Historia', type: 'long_text', required: false, min: 0, max: 0, value: 'Hijo de Glóin' },
					{ key: 'is_hero', label: 'Es un héroe', type: 'boolean', required: false, min: 0, max: 0, value: true },
				],
			});
		});

		// Verificamos el toast
		expect(toast.success).toHaveBeenCalledWith('character.message.successCreating');

		// 6. Magia aquí: Esperamos a la navegación dándole un margen mayor a tus 1500ms reales
		await waitFor(
			() => {
				expect(mockNavigate).toHaveBeenCalledWith('/campaign/5');
			},
			{ timeout: 2000 },
		);
	});

	test('muestra toast de error y no navega si la creación falla', async () => {
		const user = userEvent.setup();
		// Aseguramos que rechace la promesa
		CharacterService.createCharacter.mockRejectedValueOnce(new Error('API Error'));

		render(<DynamicCharacterForm templateData={mockTemplateData} />);

		// Rellenar lo mínimo para pasar la validación
		await user.type(getMTInput('character.form.name'), 'Legolas');
		await user.type(getMTInput('Fuerza *'), '14');

		const submitButton = screen.getByRole('button', { name: 'character.form.submit' });
		await user.click(submitButton);

		// Aumentamos un poquito el timeout por si RHF tarda en procesar el error
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
