import React, { useState, useEffect } from 'react';
import { Typography, Spinner, Button } from '@material-tailwind/react';
import { getTheme } from '../../utils/themeUtils'; // Importa nuestra utilidad
import { useTranslation } from 'react-i18next';
import { mockCampaigns } from '../../data/mockCampaigns'; // Tus datos
import CampaignFilterBar from '../../components/campaign/CampaignFilterBar';
import CampaignCard from '../../components/campaign/CampaignCard';

export default function FindCampaignPage() {
	const { t } = useTranslation('global');
	const theme = getTheme();

	const [campaigns, setCampaigns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({ name: '', type: '', system: '' });

	useEffect(() => {
		const storedProfile = localStorage.getItem('activeProfile');
		let initialType = 'TABLETOP'; // Fallback por seguridad

		if (storedProfile) {
			try {
				const parsed = JSON.parse(storedProfile);
				initialType = parsed.type;
			} catch (e) {
				console.error('Error leyendo perfil', e);
			}
		}

		setFilters(prev => ({ ...prev, type: initialType }));

		setTimeout(() => {
			setCampaigns(mockCampaigns);
			setLoading(false);
		}, 800);
	}, []);

	// Lógica de Filtrado (Mock Frontend) ACTUALIZADA
	const filteredData = campaigns.filter(c => {
		// 1. Helper texto simple
		const checkText = (field, value) => {
			if (!value) return true;
			return field?.toLowerCase().includes(value.toLowerCase());
		};

		// 2. Helper Exacto (Selects)
		const checkExact = (field, value) => {
			if (!value) return true;
			return field === value;
		};

		// 3. NUEVO: Helper para Arrays (Tags)
		// Devuelve true si ALGUNO de los tags de la campaña coincide con lo que escribiste
		const checkTags = (tagsArray, searchValue) => {
			if (!searchValue) return true;
			if (!tagsArray || !Array.isArray(tagsArray)) return false;

			// Buscamos si el string de búsqueda está incluido en alguno de los tags
			return tagsArray.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase()));
		};

		// Verificamos si es perfil Tabletop para aplicar filtros extra o no
		const isTabletop = filters.type === 'TABLETOP';

		// Lógica Base (Común)
		let matches =
			checkText(c.name, filters.name) &&
			checkTags(c.theme, filters.theme) && // Usamos checkTags aquí
			checkExact(c.language, filters.language) &&
			checkExact(c.timeZone, filters.timeZone) &&
			checkExact(c.type, filters.type); // WRITTEN o TABLETOP

		// Si es Tabletop, aplicamos los filtros extra
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

	const handleClean = () => {
		const storedProfile = localStorage.getItem('activeProfile');
		const defaultType = storedProfile ? JSON.parse(storedProfile).type : 'TABLETOP';
		setFilters({ name: '', type: defaultType, system: '' });
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

			{/* CONTENIDO */}
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
