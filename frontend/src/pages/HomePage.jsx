import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Typography, Spinner, Button } from '@material-tailwind/react';
import { getTheme } from '../utils/themeUtils';
import CampaignDashboardSection from '../components/campaign/CampaignDashboardSection';
import UserCharacterCarousel from '../components/character/UserCharacterCarousel';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
// Asegúrate de importar tu servicio (ajusta la ruta si es necesario)
import campaignService from '../services/CampaignService';

export default function HomePage() {
	const location = useLocation();
	const navigate = useNavigate();
	const theme = getTheme();
	const { t } = useTranslation('global');

	const [loading, setLoading] = useState(true);
	const [myCampaigns, setMyCampaigns] = useState({ asMaster: [], asPlayer: [] });

	// Toast (Mensajes flotantes)
	useEffect(() => {
		if (location.state?.message) {
			toast.success(location.state.message, { style: { background: '#333', color: '#fff' } });
			globalThis.history.replaceState({}, document.title);
		}
	}, [location.state]);

	// Carga de datos real desde el Backend
	useEffect(() => {
		const fetchCampaigns = async () => {
			try {
				// Llamamos a tu método de Axios
				const data = await campaignService.getMyCampaigns();

				// data tendrá la forma: { asMaster: [...], asPlayer: [...] }
				// pero si el backend devuelve un null o items vacíos, nos protegemos
				setMyCampaigns({
					asMaster: data.asMaster || [],
					asPlayer: data.asPlayer || [],
				});
			} catch (error) {
				console.error('Error cargando las campañas del home:', error);
				toast.error(t('common.errorLoadingData') || 'Error al cargar las campañas');
				// Si falla, dejamos las listas vacías para que no explote el render
				setMyCampaigns({ asMaster: [], asPlayer: [] });
			} finally {
				// Tanto si va bien como si falla, quitamos el spinner
				setLoading(false);
			}
		};

		fetchCampaigns();
	}, [t]);

	// Ojo: Filtramos las campañas que no tengan ID nulo, por cómo está tu mapeo en el Backend
	const activeMasterCampaigns = myCampaigns.asMaster.filter(c => c.id && ['OPEN', 'ACTIVE'].includes(c.status));
	const activePlayerCampaigns = myCampaigns.asPlayer.filter(c => c.id && ['OPEN', 'ACTIVE'].includes(c.status));

	if (loading) {
		return (
			<div className={`min-h-screen ${theme.background} flex justify-center items-center`}>
				<Spinner className={`h-12 w-12 text-${theme.primary}-500`} />
			</div>
		);
	}

	return (
		<div className={`min-h-screen ${theme.background} transition-colors duration-300`}>
			{/* El header estaba vacío, pero mantengo tu estructura */}
			<header
				className={`${theme.isDark ? 'bg-blue-gray-900/50 border-b border-blue-gray-800' : 'bg-white shadow-sm'} sticky top-0 z-10 backdrop-blur-md`}
			></header>

			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<div className='flex justify-between items-end mb-6 px-2'>
					<div>
						<Typography variant='h4' color='blue-gray' className={theme.isDark ? 'text-white' : ''}>
							{t('home.yourCampaigns')}
						</Typography>
						<Typography color='gray' className='font-normal mt-1'>
							{t('home.campaignPhrase')}
						</Typography>
					</div>
					{/* Movemos los botones aquí para agrupar tu lógica de JSX original */}
					<div className='flex gap-4'>
						<Button
							variant='text'
							color={theme.secondary}
							className='hidden sm:flex items-center gap-2'
							onClick={() => navigate('/myCampaigns')}
						>
							{t('common.viewAll')} <ArrowRightIcon className='h-4 w-4' />
						</Button>
					</div>
				</div>

				{/* Grid de 2 columnas para PC */}
				<div className='grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12'>
					<div className='min-w-0'>
						<CampaignDashboardSection campaigns={activeMasterCampaigns} role='master' />
					</div>
					<div className='min-w-0'>
						<CampaignDashboardSection campaigns={activePlayerCampaigns} role='player' />
					</div>
				</div>

				{/* Botón móvil global de campañas */}
				<div className='mb-12 sm:hidden flex justify-center px-2'>
					<Button variant='outlined' color={theme.secondary} fullWidth onClick={() => navigate('/myCampaigns')}>
						{t('common.viewAll')} {t('home.yourCampaigns')}
					</Button>
				</div>

				<UserCharacterCarousel />
			</main>
		</div>
	);
}
