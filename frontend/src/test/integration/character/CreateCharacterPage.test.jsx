import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import CreateCharacterPage from '../../../pages/character/CreateCharacterPage';
import CharacterService from '../../../services/CharacterService';

// ---------------- MOCKS ----------------

const mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', () => ({
	useSearchParams: () => [mockSearchParams],
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: key => key,
	}),
}));

vi.mock('../../../utils/themeUtils', () => ({
	getTheme: () => ({
		bgLight: 'bg-light',
		primary: 'blue',
	}),
}));

vi.mock('../../../services/CharacterService', () => ({
	default: {
		getCampaignTemplates: vi.fn(),
	},
}));

vi.mock('../../../components/character/DynamicCharacterForm', () => ({
	default: ({ templateData }) => <div data-testid='dynamic-form'>{templateData?.campaign_name}</div>,
}));

vi.mock('../../../components/character/FreeStyleCharacterForm', () => ({
	default: () => <div data-testid='freestyle-form' />,
}));

// ---------------- TESTS ----------------

describe('CreateCharacterPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('renderiza FreeStyle cuando NO hay campaignId', async () => {
		mockSearchParams.delete('campaignId');

		render(<CreateCharacterPage />);

		expect(screen.getByTestId('freestyle-form')).toBeInTheDocument();
	});

	test('renderiza DynamicCharacterForm cuando hay templates', async () => {
		mockSearchParams.set('campaignId', '1');

		CharacterService.getCampaignTemplates.mockResolvedValue([
			{
				campaign_name: 'Campaña Test',
			},
		]);

		render(<CreateCharacterPage />);

		await waitFor(() => {
			expect(screen.getByTestId('dynamic-form')).toBeInTheDocument();
		});

		expect(screen.getByTestId('dynamic-form')).toBeInTheDocument();
	});

	test('muestra error cuando no hay templates', async () => {
		mockSearchParams.set('campaignId', '1');

		CharacterService.getCampaignTemplates.mockResolvedValue([]);

		render(<CreateCharacterPage />);

		await waitFor(() => {
			expect(screen.getByText('character.message.errorLoading')).toBeInTheDocument();
		});
	});

	test('maneja error de API', async () => {
		mockSearchParams.set('campaignId', '1');

		CharacterService.getCampaignTemplates.mockRejectedValue(new Error('fail'));

		render(<CreateCharacterPage />);

		await waitFor(() => {
			expect(screen.getByText('character.message.errorLoading')).toBeInTheDocument();
		});
	});
});
