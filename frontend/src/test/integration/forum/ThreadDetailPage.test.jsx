import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest';
import ThreadDetailPage from '../../../pages/forum/ThreadDetailPage';
import ForumService from '../../../services/ForumService';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/ForumService', () => ({
	default: {
		getGeneralThreadDetail: vi.fn(),
		getReplies: vi.fn(),
	},
}));

vi.mock('react-i18next', () => {
	const t = key => key;
	return {
		useTranslation: () => ({ t }),
	};
});

// marked y DOMPurify usan APIs de navegador
vi.mock('marked', () => ({
	marked: { parse: text => `<p>${text}</p>` },
}));

vi.mock('dompurify', () => ({
	default: { sanitize: html => html },
}));

// PostEditor → simplificado, solo muestra el área de respuesta
vi.mock('../../../components/forum/PostEditor', () => ({
	default: ({ onPostCreated }) => (
		<div>
			<button
				onClick={() =>
					onPostCreated({
						id: 99,
						content: 'Nueva respuesta',
						author: { profileName: 'AlexTable' },
						createdAt: new Date().toISOString(),
					})
				}
			>
				common.send
			</button>
		</div>
	),
}));

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children, dangerouslySetInnerHTML, as: As = 'div' }) =>
		dangerouslySetInnerHTML ? <As dangerouslySetInnerHTML={dangerouslySetInnerHTML} /> : <div>{children}</div>,
	Avatar: ({ alt }) => <img alt={alt} />,
	Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
	Chip: ({ value }) => <span>{value}</span>,
	Spinner: () => <div data-testid='spinner' />,
}));

vi.mock('@heroicons/react/24/outline', async importOriginal => {
	const actual = await importOriginal();
	return { ...actual, ArrowLeftIcon: () => null };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockThread = {
	id: 1,
	title: 'Guía completa de D&D 5e para principiantes',
	content: 'Aquí encontrarás todo lo que necesitas para empezar.',
	createdAt: '2024-01-15T10:00:00Z',
	isLocked: false,
	tags: ['dnd', 'guía'],
	author: { profileName: 'AlexTable', profileImage: null },
};

const mockReplies = [
	{ id: 10, content: 'Muy buena guía!', createdAt: '2024-01-16T10:00:00Z', author: { profileName: 'Jugador1' } },
	{ id: 11, content: 'Gracias por esto.', createdAt: '2024-01-17T10:00:00Z', author: { profileName: 'Jugador2' } },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderPage = (id = '1') =>
	render(
		<MemoryRouter initialEntries={[`/forum/${id}`]}>
			<Routes>
				<Route path='/forum/:id' element={<ThreadDetailPage />} />
			</Routes>
		</MemoryRouter>,
	);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ThreadDetailPage — Tests de Integración', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.setItem('activeProfile', JSON.stringify({ name: 'AlexTable', type: 'TABLETOP' }));
	});

	afterEach(() => localStorage.clear());

	// 1️⃣  Spinner mientras carga
	test('muestra el spinner mientras se carga el hilo', () => {
		ForumService.getGeneralThreadDetail.mockReturnValue(new Promise(() => {}));
		ForumService.getReplies.mockResolvedValue({ data: [] });
		renderPage();
		expect(screen.getByTestId('spinner')).toBeInTheDocument();
	});

	// 2️⃣  Título y contenido del hilo
	test('muestra el título del hilo tras cargarlo', async () => {
		ForumService.getGeneralThreadDetail.mockResolvedValue(mockThread);
		ForumService.getReplies.mockResolvedValue({ data: [] });
		renderPage();

		await waitFor(() => {
			expect(screen.getByText('Guía completa de D&D 5e para principiantes')).toBeInTheDocument();
		});
	});

	// 3️⃣  Tags del hilo
	test('muestra los tags del hilo', async () => {
		ForumService.getGeneralThreadDetail.mockResolvedValue(mockThread);
		ForumService.getReplies.mockResolvedValue({ data: [] });
		renderPage();

		await waitFor(() => {
			expect(screen.getByText('#dnd')).toBeInTheDocument();
			expect(screen.getByText('#guía')).toBeInTheDocument();
		});
	});

	// 4️⃣  Lista de respuestas
	test('muestra las respuestas del hilo', async () => {
		ForumService.getGeneralThreadDetail.mockResolvedValue(mockThread);
		ForumService.getReplies.mockResolvedValue({ data: mockReplies });
		renderPage();

		await waitFor(() => {
			expect(screen.getByText('Jugador1')).toBeInTheDocument();
			expect(screen.getByText('Jugador2')).toBeInTheDocument();
		});
	});

	// 5️⃣  Sin respuestas → mensaje vacío
	test('muestra el mensaje de sin respuestas si el hilo no tiene replies', async () => {
		ForumService.getGeneralThreadDetail.mockResolvedValue(mockThread);
		ForumService.getReplies.mockResolvedValue({ data: [] });
		renderPage();

		await waitFor(() => {
			expect(screen.getByText(/forum.campaign.noReplies/i)).toBeInTheDocument();
		});
	});

	// 6️⃣  Hilo bloqueado → no muestra editor de respuesta
	test('no muestra el editor de respuesta si el hilo está bloqueado', async () => {
		ForumService.getGeneralThreadDetail.mockResolvedValue({ ...mockThread, isLocked: true });
		ForumService.getReplies.mockResolvedValue({ data: [] });
		renderPage();

		await waitFor(() => {
			expect(screen.getByText('forum.campaign.lockedThread')).toBeInTheDocument();
			expect(screen.queryByRole('button', { name: /common.send/i })).not.toBeInTheDocument();
		});
	});

	// 7️⃣  Hilo no encontrado → muestra mensaje de error
	test('muestra mensaje de hilo no encontrado si el servicio devuelve error', async () => {
		ForumService.getGeneralThreadDetail.mockRejectedValue(new Error('Not found'));
		ForumService.getReplies.mockResolvedValue({ data: [] });
		renderPage();

		await waitFor(() => {
			expect(screen.getByText('Hilo no encontrado')).toBeInTheDocument();
		});
	});

	// 8️⃣  Nueva respuesta → se añade a la lista sin recargar
	test('añade la nueva respuesta a la lista al enviar', async () => {
		ForumService.getGeneralThreadDetail.mockResolvedValue(mockThread);
		ForumService.getReplies.mockResolvedValue({ data: [] });
		renderPage();

		await waitFor(() => screen.getByText('forum.yourReply'));

		const sendButton = screen.getByRole('button', { name: /common.send/i });
		await sendButton.click();

		await waitFor(() => {
			expect(screen.getByText('Aquí encontrarás todo lo que necesitas para empezar.')).toBeInTheDocument();
		});
	});

	// 9️⃣  Botón volver → navega al foro
	test('navega a /forum al hacer click en volver', async () => {
		ForumService.getGeneralThreadDetail.mockRejectedValue(new Error('Not found'));
		ForumService.getReplies.mockResolvedValue({ data: [] });
		renderPage();

		await waitFor(() => screen.getByText('Hilo no encontrado'));
		await screen.getByRole('button', { name: /volver/i }).click();

		expect(mockNavigate).toHaveBeenCalledWith('/forum');
	});
});
