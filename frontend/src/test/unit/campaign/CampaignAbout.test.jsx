import { render, screen } from '@testing-library/react';
import { vi, test, describe, expect } from 'vitest';
import CampaignAbout from '../../../components/campaign/detail/CampaignAbout';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@material-tailwind/react', () => ({
	Card: ({ children }) => <div>{children}</div>,
	CardBody: ({ children }) => <div>{children}</div>,
	Typography: ({ children }) => <div>{children}</div>,
	Chip: ({ value }) => <span>{value}</span>,
}));

vi.mock('@heroicons/react/24/outline', () => ({
	BookOpenIcon: () => null,
}));

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const t = key => key;

const campaignConTemas = {
	description: 'Una épica aventura en las tierras de Barovia.',
	themes: ['Horror', 'Fantasy', 'Misterio'],
};

const campaignSinTemas = {
	description: 'Descripción sin temas.',
	themes: [],
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CampaignAbout — Tests Unitarios', () => {
	// 1️⃣  Descripción
	test('renderiza la descripción de la campaña', () => {
		render(<CampaignAbout campaign={campaignConTemas} t={t} />);
		expect(screen.getByText('Una épica aventura en las tierras de Barovia.')).toBeInTheDocument();
	});

	// 2️⃣  Tags / Temas
	test('renderiza todos los tags con el símbolo #', () => {
		render(<CampaignAbout campaign={campaignConTemas} t={t} />);
		expect(screen.getByText('#Horror')).toBeInTheDocument();
		expect(screen.getByText('#Fantasy')).toBeInTheDocument();
		expect(screen.getByText('#Misterio')).toBeInTheDocument();
	});

	// 3️⃣  Sin temas → no rompe
	test('no falla si el array de themes está vacío', () => {
		render(<CampaignAbout campaign={campaignSinTemas} t={t} />);
		expect(screen.getByText('Descripción sin temas.')).toBeInTheDocument();
		// No debe aparecer ningún tag
		expect(screen.queryByText(/#/)).not.toBeInTheDocument();
	});

	// 4️⃣  Títulos de sección
	test('muestra los títulos de sección correctos', () => {
		render(<CampaignAbout campaign={campaignConTemas} t={t} />);
		expect(screen.getByText('campaign.detail.about')).toBeInTheDocument();
		expect(screen.getByText('campaign.detail.tags')).toBeInTheDocument();
	});
});
