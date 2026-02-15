import React, { useState, useEffect } from 'react';
import { Typography, Spinner, Button } from '@material-tailwind/react';
import { getTheme } from '../../utils/themeUtils';
import { useTranslation } from 'react-i18next';
import CampaignFilterBar from '../../components/campaign/CampaignFilterBar';
import CampaignCard from '../../components/campaign/CampaignCard';
// Asegúrate de importar tu servicio (mock o real)
import { searchCampaignsInBackend } from '../../services/CampaignService';

export default function FindCampaignPage() {
	const { t } = useTranslation('global');
	const theme = getTheme();
	const [campaigns, setCampaigns] = useState([]);
	const [loading, setLoading] = useState(true);

	// 1. Lógica para obtener el tipo base (extraída para reusarla)
	const getDefaultType = () => {
		const stored = localStorage.getItem('activeProfile');
		if (stored) {
			try {
				return JSON.parse(stored).type || 'TABLETOP';
			} catch (e) {
				console.error('Error leyendo perfil', e);
			}
		}
		return 'TABLETOP';
	};

	// 2. Estado inicial
	const [filters, setFilters] = useState({
		name: '',
		type: getDefaultType(),
		system: '',
		language: '',
		timeZone: '',
		theme: [],
		location: '',
		schedule: '',
		duration: '',
	});

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Enviamos los filtros limpios al backend/mock
				const results = await searchCampaignsInBackend(filters);
				setCampaigns(results);
			} catch (error) {
				console.error('Error fetching campaigns:', error);
				setCampaigns([]);
			} finally {
				setLoading(false);
			}
		};

		const timeoutId = setTimeout(fetchData, 500); // Debounce
		return () => clearTimeout(timeoutId);
	}, [filters]);

	// 3. CORRECCIÓN DE HANDLE CLEAN
	const handleClean = () => {
		// En lugar de usar "...prev", creamos un objeto NUEVO y LIMPIO.
		// Solo mantenemos el 'type' del perfil del usuario.
		setFilters({
			name: '',
			type: getDefaultType(), // Reseteamos al tipo de perfil original
			system: '',
			language: '',
			timeZone: '',
			theme: [], // Importante: Array vacío para tags
			location: '',
			schedule: '',
			duration: '',
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

			{/* Pasamos handleClean corregido */}
			<CampaignFilterBar filters={filters} setFilters={setFilters} onClean={handleClean} theme={theme} />

			{loading ? (
				<div className='flex justify-center mt-20'>
					<Spinner className={`h-12 w-12 text-${theme.primary}-500`} />
				</div>
			) : (
				<>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{campaigns.map(campana => (
							<CampaignCard key={campana.id} campana={campana} theme={theme} />
						))}
					</div>

					{campaigns.length === 0 && (
						<div className='text-center py-20'>
							<Typography color='gray'>{t('campaign.noResultsFound')}</Typography>
							<Button variant='text' color={theme.primary} onClick={handleClean}>
								{t('campaign.cleanFilters')}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
