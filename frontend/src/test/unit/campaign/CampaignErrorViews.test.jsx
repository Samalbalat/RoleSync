import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import { NotFoundView, AccessDeniedView } from '../../../components/campaign/detail/CampaignErrorViews';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <div>{children}</div>,
	Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('@heroicons/react/24/outline', () => ({
	ShieldExclamationIcon: () => null,
}));

const t = key => key;
const navigate = vi.fn();

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CampaignErrorViews — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// ── NotFoundView ──────────────────────────────────────────────────────────

	test('NotFoundView: muestra el mensaje de no encontrado', () => {
		render(<NotFoundView t={t} navigate={navigate} />);
		expect(screen.getByText('campaign.noResultsFound')).toBeInTheDocument();
	});

	test('NotFoundView: el botón volver navega a /campaigns', async () => {
		render(<NotFoundView t={t} navigate={navigate} />);
		await userEvent.click(screen.getByRole('button', { name: 'common.back' }));
		expect(navigate).toHaveBeenCalledWith('/campaigns');
	});

	// ── AccessDeniedView ──────────────────────────────────────────────────────

	test('AccessDeniedView: muestra el mensaje de acceso denegado', () => {
		render(<AccessDeniedView t={t} navigate={navigate} />);
		expect(screen.getByText('auth.accessDenied')).toBeInTheDocument();
		expect(screen.getByText('campaign.accessDeniedMessage')).toBeInTheDocument();
	});

	test('AccessDeniedView: el botón volver navega a /campaigns', async () => {
		render(<AccessDeniedView t={t} navigate={navigate} />);
		await userEvent.click(screen.getByRole('button', { name: 'common.back' }));
		expect(navigate).toHaveBeenCalledWith('/campaigns');
	});
});
