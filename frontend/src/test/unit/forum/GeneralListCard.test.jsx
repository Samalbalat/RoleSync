import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import GeneralListCard from '../../../components/forum/GeneralListCard';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('react-i18next', () => {
	const t = key => key;
	return {
		useTranslation: () => ({ t }),
	};
});

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({
		primary: 'indigo',
		textPrimary: 'text-indigo-900',
		textSecondary: 'text-indigo-600',
		bgLight: 'bg-indigo-50',
		lightborder: 'border-indigo-200',
	}),
}));

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children, className }) => <span className={className}>{children}</span>,
	Avatar: ({ alt }) => <img alt={alt} />,
	Chip: ({ value }) => <span>{value}</span>,
}));

vi.mock('@heroicons/react/24/outline', () => ({
	ChatBubbleLeftIcon: () => null,
	LockClosedIcon: () => <span data-testid='lock-icon' />,
}));

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockThread = {
	id: 1,
	title: 'Guía de iniciación al rol de mesa',
	content: 'En este post explico los conceptos básicos para empezar.',
	createdAt: '2024-01-15T10:00:00Z',
	replyCount: 5,
	locked: false,
	edited: false,
	tags: ['rol', 'iniciación'],
	author: {
		profileName: 'AlexTable',
		profileImage: null,
	},
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GeneralListCard — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Título y contenido
	test('renderiza el título del hilo', () => {
		render(<GeneralListCard thread={mockThread} />);
		expect(screen.getByText('Guía de iniciación al rol de mesa')).toBeInTheDocument();
	});

	test('renderiza el resumen del contenido', () => {
		render(<GeneralListCard thread={mockThread} />);
		expect(screen.getByText('En este post explico los conceptos básicos para empezar.')).toBeInTheDocument();
	});

	// 2️⃣  Autor
	test('muestra el nombre del autor', () => {
		render(<GeneralListCard thread={mockThread} />);
		expect(screen.getByText('AlexTable')).toBeInTheDocument();
	});

	// 3️⃣  Tags
	test('renderiza los tags con el símbolo #', () => {
		render(<GeneralListCard thread={mockThread} />);
		expect(screen.getByText('#rol')).toBeInTheDocument();
		expect(screen.getByText('#iniciación')).toBeInTheDocument();
	});

	test('no renderiza la sección de tags si el array está vacío', () => {
		render(<GeneralListCard thread={{ ...mockThread, tags: [] }} />);
		expect(screen.queryByText(/#/)).not.toBeInTheDocument();
	});

	// 5️⃣  Hilo bloqueado → muestra icono de candado
	test('muestra el icono de bloqueado si locked es true', () => {
		render(<GeneralListCard thread={{ ...mockThread, locked: true }} />);
		expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
	});

	test('no muestra el icono de bloqueado si locked es false', () => {
		render(<GeneralListCard thread={mockThread} />);
		expect(screen.queryByTestId('lock-icon')).not.toBeInTheDocument();
	});

	// 6️⃣  Navegación al hacer click
	test('navega al detalle del hilo al hacer click', async () => {
		render(<GeneralListCard thread={mockThread} />);
		await userEvent.click(screen.getByRole('button'));
		expect(mockNavigate).toHaveBeenCalledWith('/forum/1');
	});
});
