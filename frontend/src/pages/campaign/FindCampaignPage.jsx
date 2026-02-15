import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Spinner, Button } from '@material-tailwind/react';
import { getTheme } from '../../utils/themeUtils';
import { useTranslation } from 'react-i18next';
import { mockCampaigns } from '../../data/mockCampaigns';
import CampaignFilterBar from '../../components/campaign/CampaignFilterBar';
import CampaignCard from '../../components/campaign/CampaignCard';

// --- 1. HELPERS ---
// Al estar fuera, no cuentan para la complejidad del componente principal

const checkText = (field, value) => {
	if (!value) return true;
	return field?.toLowerCase().includes(value.toLowerCase());
};

const checkExact = (field, value) => {
	if (!value) return true;
	return field === value;
};

const checkTags = (tagsArray, searchValue) => {
	if (!searchValue) return true;
	if (!tagsArray || !Array.isArray(tagsArray)) return false;
	return tagsArray.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase()));
};

const getInitialProfileType = () => {
	const storedProfile = localStorage.getItem('activeProfile');
	if (!storedProfile) return 'TABLETOP';
	try {
		const parsed = JSON.parse(storedProfile);
		return parsed.type || 'TABLETOP';
	} catch (e) {
		console.error('Error leyendo perfil', e);
		return 'TABLETOP';
	}
};

// --- 2. LÓGICA DE FILTRADO PURA ---
const filterCampaigns = (campaigns, filters) => {
	return campaigns.filter(c => {
		const isTabletop = filters.type === 'TABLETOP';

		let matches =
			checkText(c.name, filters.name) &&
			checkTags(c.theme, filters.theme) &&
			checkExact(c.language, filters.language) &&
			checkExact(c.timeZone, filters.timeZone) &&
			checkExact(c.type, filters.type);

		if (isTabletop) {
			matches =
				matches &&
				checkExact(c.system, filters.system) &&
				checkText(c.location, filters.location) &&
				checkExact(c.schedule, filters.schedule) &&
				checkExact(c.duration, filters.duration);
		}

		return matches;
	});
};

export default function FindCampaignPage() {
	const { t } = useTranslation('global');
	const theme = getTheme();

	const [campaigns, setCampaigns] = useState([]);
	const [loading, setLoading] = useState(true);

	const [filters, setFilters] = useState(() => ({
		name: '',
		type: getInitialProfileType(),
		system: '',
	}));

	useEffect(() => {
		setTimeout(() => {
			setCampaigns(mockCampaigns);
			setLoading(false);
		}, 800);
	}, []);

	const filteredData = useMemo(() => {
		return filterCampaigns(campaigns, filters);
	}, [campaigns, filters]);

	const handleClean = () => {
		setFilters({
			name: '',
			type: getInitialProfileType(),
			system: '',
		});
	};

	return (
		<div className='container mx-auto px-4 py-8 min-h-screen'>
			<div className='mb-8 text-center md:text-left'>
				<Typography variant='h2' color='blue-gray' className='font-bold'>
					{t('campaign.fraseFinder')}
					<span className={`text-${theme.primary}-600`}>{t('campaign.adventure')}</span>
				</Typography>
			</div>

			<CampaignFilterBar filters={filters} setFilters={setFilters} onClean={handleClean} theme={theme} />

			{loading ? (
				<div className='flex justify-center mt-20'>
					<Spinner className={`h-12 w-12 text-${theme.primary}-500`} />
				</div>
			) : (
				<>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{filteredData.map(campana => (
							<CampaignCard key={campana.id} campana={campana} theme={theme} />
						))}
					</div>

					{filteredData.length === 0 && (
						<div className='text-center py-20'>
							<Typography color='gray'>{t('campaign.noResultsFound')}</Typography>
							<Button variant='text' color={theme.primary} onClick={() => setFilters({ name: '', type: '', system: '' })}>
								{t('campaign.cleanFilters')}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
