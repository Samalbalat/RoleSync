import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Typography, Spinner } from '@material-tailwind/react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getTheme } from '../utils/themeUtils';
import CampaignDashboardSection from '../components/campaign/CampaignDashboardSection';
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
	const { t } = useTranslation('global');
	const location = useLocation();
	const navigate = useNavigate();
	const theme = getTheme();

	const [loading, setLoading] = useState(true);
	const [myCampaigns, setMyCampaigns] = useState({ asMaster: [], asPlayer: [] });

	// Toast
	useEffect(() => {
		if (location.state?.message) {
			toast.success(location.state.message, { style: { background: '#333', color: '#fff' } });
			window.history.replaceState({}, document.title);
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
			>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
					<Typography variant='h4' className={`font-bold ${theme.isDark ? 'text-white' : 'text-gray-900'}`}>
						RoleSync <span className={`text-${theme.primary}-500`}>Dashboard</span>
					</Typography>
				</div>
			</header>

			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* partidas como Master */}
				<CampaignDashboardSection
					title={t('home.masterCampaigns.title')}
					subtitle={t('home.masterCampaigns.subtitle')}
					campaigns={activeMasterCampaigns}
					isMaster={true}
					theme={theme}
					onCardClick={id => navigate(`/campaigns/${id}`)}
					emptyState={{
						message: t('home.masterCampaigns.emptyMessage'),
						btnText: t('home.masterCampaigns.createButton'),
						icon: <PlusIcon className='h-4 w-4' />,
						action: () => navigate('/create-campaign'),
						btnVariant: 'filled',
					}}
				/>

				{/* partidas como Jugador */}
				<CampaignDashboardSection
					title={t('home.playerCampaigns.title')}
					subtitle={t('home.playerCampaigns.subtitle')}
					campaigns={activePlayerCampaigns}
					isMaster={false}
					theme={theme}
					onCardClick={id => navigate(`/campaigns/${id}`)}
					emptyState={{
						message: t('home.playerCampaigns.emptyMessage'),
						btnText: t('home.playerCampaigns.findButton'),
						icon: <MagnifyingGlassIcon className='h-4 w-4' />,
						action: () => navigate('/find-campaign'),
						btnVariant: 'outlined',
					}}
				/>
			</main>
		</div>
	);
}
