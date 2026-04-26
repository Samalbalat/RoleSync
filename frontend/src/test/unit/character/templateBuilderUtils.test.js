import {
	generateInternalKey,
	mapBackendSchemaToFields,
	buildTemplatePayload,
	rangeMin,
	rangeMax,
	validateField,
} from '../../../utils/character/templateBuilderUtils';
import { vi, test, describe, expect, beforeAll } from 'vitest';

describe('templateBuilderUtils', () => {
	beforeAll(() => {
		vi.spyOn(Math, 'random').mockReturnValue(0.123456);
	});

	test('generateInternalKey normaliza texto correctamente', () => {
		const key = generateInternalKey('Fuerza Máxima!');

		expect(key.startsWith('fuerza_maxima_')).toBe(true);
		expect(key.length).toBeGreaterThan('fuerza_maxima_'.length);
	});

	test('mapBackendSchemaToFields mapea correctamente schema backend', () => {
		const result = mapBackendSchemaToFields([
			{
				key: 'str',
				label: 'Strength',
				type: 'number',
			},
		]);

		expect(result).toEqual([
			{
				key: 'str',
				label: 'Strength',
				type: 'number',
				required: false,
				min: '',
				max: '',
			},
		]);
	});

	test('buildTemplatePayload construye payload correcto', () => {
		const payload = buildTemplatePayload({
			templateName: 'DnD',
			campaignId: '4',
			templateId: '2',
			isEditMode: true,
			fields: [
				{
					key: 'str',
					label: 'Strength',
					type: 'number',
					required: true,
					min: 1,
					max: 20,
				},
			],
		});

		expect(payload).toEqual({
			name: 'DnD',
			avatar_url: '',
			campaign_id: 4,
			template_id: 2,
			attributes: [
				{
					key: 'str',
					label: 'Strength',
					type: 'number',
					required: true,
					min: 1,
					max: 20,
				},
			],
		});
	});

	test('rangeMin devuelve fallback correcto', () => {
		expect(rangeMin({ min: '' })).toBe('-');
		expect(rangeMin({ min: 5 })).toBe(5);
	});

	test('rangeMax devuelve fallback correcto', () => {
		expect(rangeMax({ max: '' })).toBe('-');
		expect(rangeMax({ max: 10 })).toBe(10);
	});

	test('validateField detecta errores', () => {
		expect(validateField({ label: '' })).toEqual({
			label: 'errors.required',
		});

		expect(validateField({ label: 'Test', min: 10, max: 5 })).toEqual({
			minMax: 'errors.minMaxOrder',
		});

		expect(
			validateField({
				label: 'OK',
				min: 1,
				max: 10,
			}),
		).toBeNull();
	});
});