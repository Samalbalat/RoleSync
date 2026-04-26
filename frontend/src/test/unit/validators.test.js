import { describe, test, expect } from 'vitest';
import { validateEmail, validatePassword, validateRequired, validateMinMax } from '../../utils/validators'; 

describe('Validators Utilities', () => {
    
    describe('validateEmail', () => {
        test('debería retornar error si el email está vacío o no se proporciona', () => {
            expect(validateEmail('')).toBe('errors.required');
            expect(validateEmail(null)).toBe('errors.required');
        });

        test('debería retornar error si el formato del email es inválido', () => {
            expect(validateEmail('correo_sin_arroba.com')).toBe('errors.invalidEmail');
            expect(validateEmail('correo@sinpunto')).toBe('errors.invalidEmail');
            expect(validateEmail('correo@ conespacios.com')).toBe('errors.invalidEmail');
        });

        test('debería retornar null si el email es válido', () => {
            expect(validateEmail('test@ejemplo.com')).toBeNull();
            expect(validateEmail('usuario.nombre@dominio.co')).toBeNull();
        });
    });

    describe('validatePassword', () => {
        test('debería retornar error si la contraseña está vacía', () => {
            expect(validatePassword('')).toBe('errors.required');
            expect(validatePassword(undefined)).toBe('errors.required');
        });

        test('debería retornar error si tiene menos de 8 caracteres', () => {
            expect(validatePassword('Aa1!bcd')).toBe('errors.passwordLength'); 
        });

        test('debería retornar error si no cumple la complejidad', () => {
            expect(validatePassword('solo_minusculas_123')).toBe('errors.passwordComplexity');
            expect(validatePassword('SOLO_MAYUSCULAS_123')).toBe('errors.passwordComplexity');
            expect(validatePassword('SinNumeroNiSimbolo')).toBe('errors.passwordComplexity');
        });

        test('debería retornar null si la contraseña cumple todos los requisitos', () => {
            expect(validatePassword('Test-Pass-123')).toBeNull();
            expect(validatePassword('Valid_Pass_99!')).toBeNull();
        });
    });

    describe('validateRequired', () => {
        test('debería retornar error si el valor está vacío, es null o son solo espacios', () => {
            expect(validateRequired('')).toBe('errors.required');
            expect(validateRequired(null)).toBe('errors.required');
            expect(validateRequired('    ')).toBe('errors.required'); // Prueba el .trim()
        });

        test('debería retornar null si el valor contiene texto', () => {
            expect(validateRequired('Texto válido')).toBeNull();
            expect(validateRequired('a')).toBeNull();
        });
    });

    describe('validateMinMax', () => {
        test('debería retornar null si alguno de los campos está vacío (no hay comparación)', () => {
            expect(validateMinMax('', 10)).toBeNull();
            expect(validateMinMax(5, '')).toBeNull();
            expect(validateMinMax('', '')).toBeNull();
        });

        test('debería retornar error si se pasa un valor estrictamente NaN', () => {
            expect(validateMinMax(Number.NaN, 10)).toBe('errors.invalidMinMax');
            expect(validateMinMax(5, Number.NaN)).toBe('errors.invalidMinMax');
        });

        test('debería retornar error si el mínimo es mayor que el máximo', () => {
            expect(validateMinMax(20, 10)).toBe('errors.minMaxOrder');
            expect(validateMinMax('15', '5')).toBe('errors.minMaxOrder'); 
        });

        test('debería retornar null si el mínimo es menor o igual al máximo', () => {
            expect(validateMinMax(5, 10)).toBeNull();
            expect(validateMinMax(10, 10)).toBeNull();
            expect(validateMinMax('-5', '5')).toBeNull();
        });
    });
});