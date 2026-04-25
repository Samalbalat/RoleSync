import {
	buildSafeKey,
	formatAttributes
} from '../../../utils/character/characterFormUtils';

describe('characterFormUtils',()=>{

	test('limpia caracteres especiales',()=>{
		expect(
			buildSafeKey(
				' Fuerza Bruta!! '
			)
		).toBe(
			'fuerzabruta'
		);

	});


	test('filtra atributos vacíos',()=>{
		const result =
			formatAttributes([
				{ key:'', value:'' },
				{ key:'HP', value:'20', type:'short_text' }
			]);
		expect(
			result
		).toHaveLength(1);

	});


	test('preserva valores boolean/string',()=>{
		const result =
			formatAttributes([
				{ key:'Heroe', value:true, type:'boolean' }
			]);

		expect(
			result[0].value
		).toBe(true);

	});

});