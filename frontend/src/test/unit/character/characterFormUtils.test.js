import {
    buildSafeKey,
    formatAttributes,
    buildRandomSuffix,
    buildCharacterAttribute
} from '../../../utils/character/characterFormUtils';
import { test, describe, expect } from 'vitest';

describe('characterFormUtils', () => {

    test('limpia caracteres especiales', () => {
        expect(buildSafeKey(' Fuerza Bruta!! ')).toBe('fuerzabruta');
    });

    test('filtra atributos vacíos', () => {
        const result = formatAttributes([
            { key: '', value: '' },
            { key: 'HP', value: '20', type: 'short_text' }
        ]);
        expect(result).toHaveLength(1);
    });

    test('preserva valores boolean/string', () => {
        const result = formatAttributes([
            { key: 'Heroe', value: true, type: 'boolean' }
        ]);
        expect(result[0].value).toBe(true);
    });

    test('buildRandomSuffix genera un string de 4 caracteres alfanuméricos', () => {
        const suffix = buildRandomSuffix();
        expect(typeof suffix).toBe('string');
        expect(suffix).toHaveLength(4);
    });

    describe('buildCharacterAttribute', () => {
        test('asigna un string vacío si no se proporciona value (Rama: attr.value || "")', () => {
            const result = buildCharacterAttribute({ key: 'Fuerza', type: 'number' });
            
            expect(result.value).toBe('');
            expect(result.label).toBe('Fuerza');
            expect(result.type).toBe('number');
            expect(result.key).toMatch(/^fuerza_[a-z0-9]{4}$/);
        });

        test('conserva el valor si se proporciona (Rama opuesta)', () => {
            const result = buildCharacterAttribute({ key: 'Agilidad', value: 'Alta' });
            expect(result.value).toBe('Alta');
        });
    });

    test('formatAttributes ignora atributos cuya key sean solo espacios', () => {
        const result = formatAttributes([
            { key: '   ', value: 'algo' }
        ]);
        expect(result).toHaveLength(0);
    });

});