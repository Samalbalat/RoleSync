import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Typography, Spinner, Button } from '@material-tailwind/react';
import { getTheme } from '../utils/themeUtils';
import CampaignDashboardSection from '../components/campaign/CampaignDashboardSection';
import UserCharacterCarousel from '../components/character/UserCharacterCarousel';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

// Mock Data (Simulado)
const mockMyCampaigns = {
	asMaster: [
		{
			id: 'c-101',
			name: 'La Maldición de Strahd',
			image: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?ixlib=rb-4.0.3',
			system: 'D&D 5e',
			status: 'OPEN',
			pendingRequests: 3,
		},
	],
	asPlayer: [
		{
			id: 'c-205',
			name: 'Las Máscaras de Nyarlathotep',
			image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?ixlib=rb-4.0.3',
			system: 'CoC 7e',
			status: 'ACTIVE',
			ownerName: 'LovecraftFan',
			ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lovecraft',
		},
	],
};

export default function HomePage() {
	const location = useLocation();
	const navigate = useNavigate();
	const theme = getTheme();
	const { t } = useTranslation('global');

	const [loading, setLoading] = useState(true);
	const [myCampaigns, setMyCampaigns] = useState({ asMaster: [], asPlayer: [] });

	// Toast
	useEffect(() => {
		if (location.state?.message) {
			toast.success(location.state.message, { style: { background: '#333', color: '#fff' } });
			globalThis.history.replaceState({}, document.title);
		}
	}, [location.state]);

	//Carga de datos
	useEffect(() => {
		setTimeout(() => {
			setMyCampaigns(mockMyCampaigns);
			setLoading(false);
		}, 800);
	}, []);

	const activeMasterCampaigns = myCampaigns.asMaster.filter(c => ['OPEN', 'ACTIVE'].includes(c.status));
	const activePlayerCampaigns = myCampaigns.asPlayer.filter(c => ['OPEN', 'ACTIVE'].includes(c.status));

	if (loading) {
		return (
			<div className={`min-h-screen ${theme.background} flex justify-center items-center`}>
				<Spinner className={`h-12 w-12 text-${theme.primary}-500`} />
			</div>
		);
	}

	return (
		<div className={`min-h-screen ${theme.background} transition-colors duration-300`}>
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
					<Button
						variant='text'
						color={theme.secondary}
						className='hidden sm:flex items-center gap-2'
						onClick={() => navigate('/campaigns')}
					>
						{t('common.viewAll')} <ArrowRightIcon className='h-4 w-4' />
					</Button>
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

				{/* Botón móvil global de campañas (opcional, si quieres que se vea en móvil) */}
				<div className='mb-12 sm:hidden flex justify-center px-2'>
					<Button variant='outlined' color={theme.secondary} fullWidth onClick={() => navigate('/campaigns')}>
						{t('common.viewAll')} {t('home.yourCampaigns')}
					</Button>
				</div>

				<UserCharacterCarousel />
			</main>
		</div>
	);
}
