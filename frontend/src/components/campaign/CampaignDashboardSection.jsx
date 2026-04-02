import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, IconButton } from '@material-tailwind/react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';
import CampaignMiniCard from './CampaignMiniCard';

export default function CampaignDashboardSection({ campaigns, role }) {
	const { t } = useTranslation('global');
	const navigate = useNavigate();
	const theme = getTheme();
	const isMaster = role === 'master';

	// Referencia para controlar el scroll
	const scrollRef = useRef(null);

	// Función para deslizar a izquierda o derecha
	const scroll = direction => {
		if (scrollRef.current) {
			const scrollAmount = 300; // Aproximadamente el ancho de una tarjeta + el gap
			scrollRef.current.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth',
			});
		}
	};

	const sectionConfig = {
		master: {
			title: t('home.masterCampaigns.title'),
			emptyMsg: t('home.masterCampaigns.emptyMessage'),
			btnText: t('home.masterCampaigns.createButton'),
			btnIcon: <PlusIcon className='h-4 w-4' />,
			btnVariant: 'filled',
			actionRoute: '/campaigns/create',
		},
		player: {
			title: t('home.playerCampaigns.title'),
			emptyMsg: t('home.playerCampaigns.emptyMessage'),
			btnText: t('home.playerCampaigns.findButton'),
			btnIcon: <MagnifyingGlassIcon className='h-4 w-4' />,
			btnVariant: 'outlined',
			actionRoute: '/find-campaign',
		},
	};

	const config = sectionConfig[role];

	return (
		<section className='animate-fade-in-up w-full'>
			<div className='flex items-center justify-between mb-4 px-1'>
				<Typography
					variant='h6'
					className={`font-bold flex items-center gap-2 ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}
				>
					{config.title}
				</Typography>

				{/* Controles de navegación: Se muestran solo en PC si hay campañas */}
				{campaigns.length > 0 && (
					<div className='hidden sm:flex gap-2'>
						<IconButton
							variant='text'
							size='sm'
							color={theme.isDark ? 'white' : 'blue-gray'}
							onClick={() => scroll('left')}
							className={`rounded-full ${theme.isDark ? 'hover:bg-blue-gray-800' : 'bg-gray-50 hover:bg-gray-200'}`}
						>
							<ChevronLeftIcon className='h-5 w-5' />
						</IconButton>
						<IconButton
							variant='text'
							size='sm'
							color={theme.isDark ? 'white' : 'blue-gray'}
							onClick={() => scroll('right')}
							className={`rounded-full ${theme.isDark ? 'hover:bg-blue-gray-800' : 'bg-gray-50 hover:bg-gray-200'}`}
						>
							<ChevronRightIcon className='h-5 w-5' />
						</IconButton>
					</div>
				)}
			</div>

			{campaigns.length > 0 ? (
				<div ref={scrollRef} className='flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-1 custom-scrollbar'>
					{campaigns.map(campaign => (
						<div key={campaign.id} className='min-w-[260px] sm:min-w-[280px] snap-start flex-shrink-0'>
							<CampaignMiniCard
								campaign={campaign}
								isMaster={isMaster}
								theme={theme}
								onClick={() => navigate(`/campaigns/${campaign.id}`)}
							/>
						</div>
					))}
				</div>
			) : (
				<div
					className={`p-8 rounded-xl border border-dashed text-center ${theme.isDark ? 'bg-blue-gray-900/30 border-gray-700' : 'bg-white border-gray-300'}`}
				>
					<Typography color='gray' className='mb-2'>
						{config.emptyMsg}
					</Typography>
					<Button
						size='sm'
						variant={config.btnVariant}
						color={theme.primary}
						className='flex items-center gap-2 mx-auto'
						onClick={() => navigate(config.actionRoute)}
					>
						{config.btnIcon} {config.btnText}
					</Button>
				</div>
			)}
		</section>
	);
}

CampaignDashboardSection.propTypes = {
	campaigns: PropTypes.array.isRequired,
	role: PropTypes.oneOf(['master', 'player']).isRequired,
};
