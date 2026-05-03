import React, { useEffect, useState } from 'react';
import { Typography, Spinner, Tabs, TabsHeader, TabsBody, Tab, TabPanel } from '@material-tailwind/react';
import { ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../utils/AuthContext';
import { getTheme } from '../../utils/themeUtils';
import campaignService from '../../services/CampaignService';
import CampaignCard from '../../components/campaign/CampaignCard';

export default function MyCampaignsPage() {
	const { t } = useTranslation('global');
	const theme = getTheme();
	const { activeProfile } = useAuth();

	const [campaigns, setCampaigns] = useState({ asMaster: [], asPlayer: [] });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCampaigns = async () => {
			try {
				setLoading(true);
				const data = await campaignService.getMyCampaigns();
				setCampaigns(data || { asMaster: [], asPlayer: [] });
			} catch (error) {
				console.error('Error cargando mis campañas:', error);
			} finally {
				setLoading(false);
			}
		};

		if (activeProfile) {
			fetchCampaigns();
		}
	}, [activeProfile]);

	if (loading) {
		return (
			<div className='flex justify-center items-center h-[60vh]'>
				<Spinner className={`h-12 w-12 text-${theme.primary}-500`} />
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			<div className='mb-8'>
				<Typography variant='h2' color='blue-gray' className='font-bold'>
					{t('menu.myCampaigns', 'Mis Campañas')}
				</Typography>
				<Typography variant='paragraph' className='text-gray-500 mt-2'>
					{t('myCampaigns.description', 'Gestiona las campañas que diriges y en las que participas.')}
				</Typography>
			</div>

			{/* SECCIÓN DE PESTAÑAS */}
			<Tabs value='master' className='w-full'>
				<TabsHeader
					className='bg-gray-100/80 p-1'
					indicatorProps={{
						className: 'bg-white shadow-sm rounded-md',
					}}
				>
					<Tab value='master' className='flex items-center gap-2 py-3'>
						<span className='font-semibold'>{t('home.masterCampaigns.title', 'Dirigiendo (DM)')}</span>
						{/* Pequeño badge con el número de campañas */}
						<span className='ml-1 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full'>
							{campaigns.asMaster.length}
						</span>
					</Tab>
					<Tab value='player' className='flex items-center gap-2 py-3'>
						<span className='font-semibold'>{t('home.playerCampaigns.title', 'Jugando')}</span>
						<span className='ml-1 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full'>
							{campaigns.asPlayer.length}
						</span>
					</Tab>
				</TabsHeader>

				<TabsBody
					animate={{
						initial: { y: 10, opacity: 0 },
						mount: { y: 0, opacity: 1 },
						unmount: { y: 10, opacity: 0 },
					}}
				>
					{/* PANEL: COMO MASTER */}
					<TabPanel value='master' className='px-0 py-6'>
						{campaigns.asMaster.length === 0 ? (
							<div className='text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300'>
								<ShieldCheckIcon className='w-12 h-12 text-gray-400 mx-auto mb-3' />
								<Typography color='gray' className='italic'>
									{t('home.masterCampaigns.emptyMessage', 'No estás dirigiendo ninguna campaña actualmente.')}
								</Typography>
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
								{campaigns.asMaster.map(campaign => (
									<CampaignCard key={campaign.id} campana={campaign} theme={theme} pageType='me' isMaster={true} />
								))}
							</div>
						)}
					</TabPanel>

					{/* PANEL: COMO JUGADOR */}
					<TabPanel value='player' className='px-0 py-6'>
						{campaigns.asPlayer.length === 0 ? (
							<div className='text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300'>
								<UserIcon className='w-12 h-12 text-gray-400 mx-auto mb-3' />
								<Typography color='gray' className='italic'>
									{t('home.playerCampaigns.emptyMessage', 'No estás jugando en ninguna campaña actualmente.')}
								</Typography>
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
								{campaigns.asPlayer.map(campaign => (
									<CampaignCard key={campaign.id} campana={campaign} theme={theme} pageType='me' isMaster={false} />
								))}
							</div>
						)}
					</TabPanel>
				</TabsBody>
			</Tabs>
		</div>
	);
}
