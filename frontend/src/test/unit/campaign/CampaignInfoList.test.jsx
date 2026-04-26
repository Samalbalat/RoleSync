import { render, screen } from '@testing-library/react';
import { vi, test, describe, expect } from 'vitest';
import CampaignInfoList from '../../../components/campaign/detail/CampaignInfoList';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@material-tailwind/react', () => ({
	Typography: ({ children }) => <span>{children}</span>,
}));

vi.mock('@heroicons/react/24/outline', () => ({
	LanguageIcon: () => null,
	GlobeAmericasIcon: () => null,
	ChatBubbleLeftRightIcon: () => null,
	BookOpenIcon: () => null,
	MapPinIcon: () => null,
	ClockIcon: () => null,
	CalendarDaysIcon: () => null,
}));

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const t = key => key;

const campaignCompleta = {
	language: 'Español',
	timeZone: 'CET',
	communication: 'Discord',
	system: 'D&D 5e',
	location: 'Online',
	frequency: 'weekly',
	dayWeek: 'friday',
	duration: '3h',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CampaignInfoList — Tests Unitarios', () => {
	// 1️⃣  Campos comunes (siempre visibles)
	test('muestra los campos comunes: idioma, zona horaria y comunicación', () => {
		render(<CampaignInfoList campaign={campaignCompleta} isWritten={false} t={t} />);

		expect(screen.getByText('Español')).toBeInTheDocument();
		expect(screen.getByText('CET')).toBeInTheDocument();
		expect(screen.getByText('Discord')).toBeInTheDocument();
	});

	// 2️⃣  Campos TABLETOP visibles cuando isWritten=false
	test('muestra los campos exclusivos de TABLETOP cuando isWritten es false', () => {
		render(<CampaignInfoList campaign={campaignCompleta} isWritten={false} t={t} />);

		expect(screen.getByText('D&D 5e')).toBeInTheDocument();
		expect(screen.getByText('Online')).toBeInTheDocument();
		expect(screen.getByText('weekly')).toBeInTheDocument();
		expect(screen.getByText('friday')).toBeInTheDocument();
		expect(screen.getByText('3h')).toBeInTheDocument();
	});

	// 3️⃣  Campos TABLETOP ocultos cuando isWritten=true
	test('oculta los campos exclusivos de TABLETOP cuando isWritten es true', () => {
		render(<CampaignInfoList campaign={campaignCompleta} isWritten={true} t={t} />);

		expect(screen.queryByText('D&D 5e')).not.toBeInTheDocument();
		expect(screen.queryByText('Online')).not.toBeInTheDocument();
	});

	// 4️⃣  Campos vacíos no se renderizan (InfoRow retorna null si no hay value)
	test('no renderiza filas con valores vacíos o nulos', () => {
		const campaignConHuecos = {
			language: 'English',
			timeZone: '',
			communication: 'Discord',
			system: null,
			location: '',
			frequency: '',
			dayWeek: '',
			duration: null,
		};

		render(<CampaignInfoList campaign={campaignConHuecos} isWritten={false} t={t} />);

		// Sí aparece
		expect(screen.getByText('English')).toBeInTheDocument();
		// No aparece porque es null/vacío
		expect(screen.queryByText('null')).not.toBeInTheDocument();
	});
});
