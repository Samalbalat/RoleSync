import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest'; 
import { server } from './mocks/server';

// Gestión del servidor para los tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());