import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Typography, Button } from '@material-tailwind/react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';
import CampaignMiniCard from './CampaignMiniCard';

export default function CampaignDashboardSection({ campaigns, role }) {
	const { t } = useTranslation('global');
	const navigate = useNavigate();
	const theme = getTheme();
	const isMaster = role === 'master';

	const sectionConfig = {
		master: {
			title: t('home.masterCampaigns.title'),
			emptyMsg: t('home.masterCampaigns.emptyMessage'),
			btnText: t('home.masterCampaigns.createButton'),
			btnIcon: <PlusIcon className='h-4 w-4' />,
			btnVariant: 'filled',
			actionRoute: '/create-campaign',
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
			<div className='mb-4 px-1'>
				<Typography
					variant='h6'
					className={`font-bold flex items-center gap-2 ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}
				>
					{config.title}
				</Typography>
			</div>

			{campaigns.length > 0 ? (
				<div
					className='flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-1 scrollbar-hide'
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
				>
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
