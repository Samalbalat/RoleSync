// src/test/setup.js
import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Arranca el servidor antes de todos los tests
beforeAll(() => server.listen())

// Resetea handlers modificados en cada test
afterEach(() => server.resetHandlers())

// Para el servidor al acabar
afterAll(() => server.close())