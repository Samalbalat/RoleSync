import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, describe, expect, beforeEach } from 'vitest';
import CampaignFilterBar from '../../../components/campaign/CampaignFilterBar';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: key => key }),
}));

vi.mock('@material-tailwind/react', () => ({
	Input: ({ label, value, onChange, onKeyDown, icon }) => (
		<div className='flex'>
			<input aria-label={label} value={value} onChange={onChange} onKeyDown={onKeyDown} />
			{icon && <span data-testid={`icon-${label}`}>{icon}</span>}
		</div>
	),
	Select: ({ children, label, onChange, value }) => (
		<select aria-label={label} value={value ?? ''} onChange={e => onChange?.(e.target.value)}>
			<option value=''>--</option>
			{children}
		</select>
	),
	Option: ({ children, value }) => <option value={value}>{children}</option>,
	Button: ({ children, onClick, className }) => (
		<button className={className} onClick={onClick}>
			{children}
		</button>
	),
	Typography: ({ children }) => <div>{children}</div>,
}));

vi.mock('@heroicons/react/24/outline', () => ({
	AdjustmentsHorizontalIcon: () => null,
	MagnifyingGlassIcon: ({ onClick }) => (
		<button onClick={onClick} data-testid='search-icon'>
			Search
		</button>
	),
	TrashIcon: () => null,
	XMarkIcon: () => null,
}));

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const tabletopTheme = { primary: 'blue' };
const writtenTheme = { primary: 'indigo' };

const defaultFilters = {
	search: '',
	type: 'TABLETOP',
	system: '',
	language: '',
	timeZone: '',
	themes: '',
	location: '',
	dayWeek: '',
	duration: '',
	communication: '',
};

const buildProps = (themeOverride = tabletopTheme, filtersOverride = {}) => ({
	filters: { ...defaultFilters, ...filtersOverride },
	setFilters: vi.fn(),
	onClean: vi.fn(),
	onSearch: vi.fn(),
	theme: themeOverride,
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CampaignFilterBar — Tests Unitarios', () => {
	beforeEach(() => vi.clearAllMocks());

	// 1️⃣  Renderizado básico
	test('muestra el campo de búsqueda y los botones principales', () => {
		render(<CampaignFilterBar {...buildProps()} />);
		expect(screen.getByRole('button', { name: /common.search/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /filter.filter/i })).toBeInTheDocument();
	});

	// 2️⃣  El panel de filtros está oculto por defecto
	test('el panel de filtros avanzados está oculto por defecto', () => {
		render(<CampaignFilterBar {...buildProps()} />);
		expect(screen.queryByText('filter.cleanFilters')).not.toBeInTheDocument();
	});

	// 3️⃣  Abrir panel de filtros
	test('abre el panel de filtros al hacer click en "Filtros"', async () => {
		render(<CampaignFilterBar {...buildProps()} />);
		await userEvent.click(screen.getByRole('button', { name: /filter.filter/i }));
		expect(screen.getByText('filter.cleanFilters')).toBeInTheDocument();
	});

	// 4️⃣  Botón buscar llama a onSearch
	test('llama a onSearch al hacer click en el botón buscar', async () => {
		const props = buildProps();
		render(<CampaignFilterBar {...props} />);
		await userEvent.click(screen.getByRole('button', { name: /common.search/i }));
		expect(props.onSearch).toHaveBeenCalledOnce();
	});

	// 5️⃣  Enter en el input llama a onSearch
	test('llama a onSearch al pulsar Enter en el campo de búsqueda', async () => {
		const props = buildProps();
		render(<CampaignFilterBar {...props} />);
		await userEvent.type(screen.getByRole('textbox', { name: /filter.searchLabel/i }), '{Enter}');
		expect(props.onSearch).toHaveBeenCalledOnce();
	});

	// 6️⃣  Botón limpiar llama a onClean
	test('llama a onClean al hacer click en "limpiar filtros"', async () => {
		const props = buildProps();
		render(<CampaignFilterBar {...props} />);
		await userEvent.click(screen.getByRole('button', { name: /filter.filter/i }));
		await userEvent.click(screen.getByRole('button', { name: /filter.cleanFilters/i }));
		expect(props.onClean).toHaveBeenCalledOnce();
	});

	// 7️⃣  Campos TABLETOP visibles para tema 'blue'
	test('muestra los campos exclusivos de TABLETOP en modo tabletop', async () => {
		render(<CampaignFilterBar {...buildProps(tabletopTheme)} />);
		await userEvent.click(screen.getByRole('button', { name: /filter.filter/i }));
		expect(screen.getByRole('textbox', { name: /campaign.system/i })).toBeInTheDocument();
	});

	// 8️⃣  Campos TABLETOP ocultos para tema 'indigo' (WRITTEN)
	test('oculta los campos exclusivos de TABLETOP en modo narrativo', async () => {
		render(<CampaignFilterBar {...buildProps(writtenTheme)} />);
		await userEvent.click(screen.getByRole('button', { name: /filter.filter/i }));
		expect(screen.queryByRole('textbox', { name: /campaign.system/i })).not.toBeInTheDocument();
	});

	// 9️⃣ Escribir en el buscador llama a setFilters
	test('actualiza el estado al escribir en el buscador', async () => {
		const props = buildProps();
		render(<CampaignFilterBar {...props} />);
		const searchInput = screen.getByRole('textbox', { name: /filter.searchLabel/i });
		await userEvent.type(searchInput, 'Dragones');
		expect(props.setFilters).toHaveBeenCalled();
	});

	// 🔟 Clic en el icono de la lupa del input llama a onSearch
	test('llama a onSearch al hacer clic en el icono de la lupa del input', async () => {
		const props = buildProps();
		render(<CampaignFilterBar {...props} />);
		const iconButton = screen.getAllByTestId('search-icon')[0]; // El primero es el del input
		await userEvent.click(iconButton);
		expect(props.onSearch).toHaveBeenCalledOnce();
	});

	// 1️⃣1️⃣ Actualizar los inputs del panel llama a setFilters
	test('actualiza el estado al escribir en los inputs de filtros avanzados', async () => {
		const props = buildProps();
		render(<CampaignFilterBar {...props} />);
		await userEvent.click(screen.getByRole('button', { name: /filter.filter/i }));

		const themesInput = screen.getByRole('textbox', { name: /campaign.themes/i });
		await userEvent.type(themesInput, 'Fantasía');
		expect(props.setFilters).toHaveBeenCalled();
	});

	// 1️⃣2️⃣ Actualizar los selects del panel llama a setFilters
	test('actualiza el estado al cambiar un select', async () => {
		const props = buildProps();
		render(<CampaignFilterBar {...props} />);
		await userEvent.click(screen.getByRole('button', { name: /filter.filter/i }));

		const languageSelect = screen.getByRole('combobox', { name: /campaign.language/i });
		await userEvent.selectOptions(languageSelect, 'English');
		expect(props.setFilters).toHaveBeenCalled();
	});

	// 1️⃣3️⃣ La opción de comunicación "Here" solo aparece en Narrativo (isWritten)
	test('muestra la opción de comunicación "here" solo en modo narrativo', async () => {
		const props = buildProps(writtenTheme);
		render(<CampaignFilterBar {...props} />);
		await userEvent.click(screen.getByRole('button', { name: /filter.filter/i }));

		const communicationSelect = screen.getByRole('combobox', { name: /campaign.communication/i });
		expect(communicationSelect).toHaveTextContent('communication.here');
	});

	// 1️⃣4️⃣ Botón Cancelar cierra el panel
	test('cierra el panel al hacer clic en Cancelar', async () => {
		render(<CampaignFilterBar {...buildProps()} />);
		await userEvent.click(screen.getByRole('button', { name: /filter.filter/i }));
		await userEvent.click(screen.getByRole('button', { name: /common.cancel/i }));

		expect(screen.queryByText('filter.cleanFilters')).not.toBeInTheDocument();
	});

	// 1️⃣5️⃣ Botón Aplicar llama a onSearch y cierra el panel
	test('llama a onSearch y cierra el panel al hacer clic en Aplicar Filtros', async () => {
		const props = buildProps();
		render(<CampaignFilterBar {...props} />);
		await userEvent.click(screen.getByRole('button', { name: /filter.filter/i }));
		await userEvent.click(screen.getByRole('button', { name: /filter.applyFilters/i }));

		expect(props.onSearch).toHaveBeenCalled();
		expect(screen.queryByText('filter.cleanFilters')).not.toBeInTheDocument();
	});

	// 1️⃣6️⃣ Clic fuera del componente cierra el panel
	test('cierra el panel al hacer clic fuera del componente', async () => {
		render(<CampaignFilterBar {...buildProps()} />);
		await userEvent.click(screen.getByRole('button', { name: /filter.filter/i }));

		fireEvent.mouseDown(document.body);

		expect(screen.queryByText('filter.cleanFilters')).not.toBeInTheDocument();
	});
});
