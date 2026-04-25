import {
	parseCharacterFields,
	getDisplayValue,
	buildAvatarFallback,
} from '../../../utils/character/characterDetailUtils';

describe('characterDetailUtils', () => {

	const t=(k)=>k;

	test('detecta historia y descripción', ()=>{

		const result=parseCharacterFields([
			{
				label:'Historia',
				value:'Lore'
			},
			{
				label:'Descripción',
				value:'Warrior'
			}
		]);

		expect(result.history).toBe('Lore');
		expect(result.description).toBe('Warrior');
	});

	test('mete atributos estándar', ()=>{

		const result=parseCharacterFields([
			{
				label:'Strength',
				value:18
			}
		]);

		expect(
			result.standardAttributes
		).toEqual([
			{
				key:'Strength',
				value:18
			}
		]);
	});

	test('boolean true se traduce yes',()=>{
		expect(
			getDisplayValue(true,t)
		).toBe('common.yes');
	});

	test('boolean false se traduce no',()=>{
		expect(
			getDisplayValue(false,t)
		).toBe('common.no');
	});

	test('vacíos devuelven guion',()=>{
		expect(
			getDisplayValue('',t)
		).toBe('-');
	});

	test('buildAvatarFallback genera url',()=>{
		expect(
			buildAvatarFallback('Gimli')
		).toContain('Gimli');
	});
});