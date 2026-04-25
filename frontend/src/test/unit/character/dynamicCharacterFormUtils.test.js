import {
	normalizeAttributeValue,
	buildDynamicAttribute,
	formatDynamicAttributes,
	buildCharacterPayload,
} from '../../../utils/character/dynamicCharacterFormUtils';

describe('dynamicCharacterFormUtils', () => {
	test('normalizeAttributeValue devuelve null para NaN numérico', () => {
		expect(
			normalizeAttributeValue(
				{ type: 'number' },
				Number.NaN
			)
		).toBeNull();
	});

	test('normalizeAttributeValue devuelve false para boolean undefined', () => {
		expect(
			normalizeAttributeValue(
				{ type: 'boolean' },
				undefined
			)
		).toBe(false);
	});

	test('normalizeAttributeValue devuelve string vacío para undefined genérico', () => {
		expect(
			normalizeAttributeValue(
				{ type: 'short_text' },
				undefined
			)
		).toBe('');
	});

	test('buildDynamicAttribute formatea correctamente', () => {
		const field = {
			key:'strength',
			label:'Strength',
			type:'number',
			required:true,
			min:1,
			max:20,
		};

		expect(
			buildDynamicAttribute(field,{
				strength:18
			})
		).toEqual({
			key:'strength',
			label:'Strength',
			type:'number',
			required:true,
			min:1,
			max:20,
			value:18,
		});
	});

	test('formatDynamicAttributes procesa schema completo', () => {
		const schema=[
			{
				key:'hero',
				label:'Hero',
				type:'boolean'
			}
		];

		expect(
			formatDynamicAttributes(schema,{})
		).toEqual([
			{
				key:'hero',
				label:'Hero',
				type:'boolean',
				required:false,
				min:0,
				max:0,
				value:false
			}
		]);
	});

	test('buildCharacterPayload genera payload completo', () => {
		const payload=buildCharacterPayload({
			data:{
				name:'Gimli',
				avatar_url:'',
				attributes:{
					fuerza:18
				}
			},
			templateData:{
				id:10,
				campaign_id:5,
				schema_definition:[
					{
						key:'fuerza',
						label:'Fuerza',
						type:'number'
					}
				]
			}
		});

		expect(payload).toEqual({
			name:'Gimli',
			avatar_url:'',
			campaign_id:5,
			template_id:10,
			attributes:[
				{
					key:'fuerza',
					label:'Fuerza',
					type:'number',
					required:false,
					min:0,
					max:0,
					value:18
				}
			]
		});
	});
});