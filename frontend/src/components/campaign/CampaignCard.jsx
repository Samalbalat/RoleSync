import React from 'react';
import { Card, CardBody, Typography, Chip, Tooltip } from '@material-tailwind/react';
import { UserGroupIcon, CalendarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export default function CampaignCard({ campana, theme }) {
	const navigate = useNavigate();
	const { t } = useTranslation('global');

	const campaignStatus = () => {
		if (campana.status === 'OPEN') {
			return t('status.open');
		} else if (campana.status === 'ACTIVE') {
			return t('status.active');
		} else if (campana.status === 'BREAK') {
			return t('status.break');
		} else if (campana.status === 'FINISHED') {
			return t('status.finished');
		}
	};
	const campaignStatusColor = () => {
		if (campana.status === 'OPEN') {
			return 'green';
		} else if (campana.status === 'ACTIVE') {
			return 'blue';
		} else if (campana.status === 'BREAK') {
			return 'yellow';
		} else if (campana.status === 'FINISHED') {
			return 'gray';
		}
	};
	return (
		<Card
			className='w-full overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100'
			onClick={() => navigate(`/campaign/${campana.id}`)}
		>
			<div className='relative h-48 overflow-hidden'>
				<img
					src={campana.image || '/default_image.png'}
					alt={campana.name}
					className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
					onError={e => {
						e.target.onerror = null;
						e.target.src = '/default_image.png';
					}}
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60' />

				<div className='absolute top-3 right-3'>
					<Chip
						size='sm'
						value={campaignStatus()}
						color={campaignStatusColor()}
						className='font-bold shadow-md border-white border'
					/>
				</div>

				<div className='absolute bottom-3 left-3'>
					<Chip
						size='sm'
						variant='ghost'
						value={campana.system || ''}
						className='bg-white/90 text-gray-900 font-bold backdrop-blur-sm'
					/>
				</div>
			</div>

			<CardBody className='p-5'>
				<Typography variant='h5' className={`mb-2 font-bold ${theme.textPrimary} line-clamp-1`}>
					{campana.name}
				</Typography>

				<div className='flex flex-wrap gap-1 mb-3'>
					{Array.isArray(campana.themes) ? (
						campana.themes.slice(0, 3).map((tag, index) => (
							<span
								key={index}
								className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${theme.bgLight} text-${theme.primary}-700 border ${theme.lightborder}`}
							>
								{tag}
							</span>
						))
					) : (
						<span className='text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded'>{campana.theme}</span>
					)}
				</div>
				{/* ----------------------------------------------- */}

				<div className='flex items-center justify-between pt-2 border-t border-gray-100'>
					<Tooltip content={t('campaign.message.currentMaxPlayers')}>
						<div className='flex items-center gap-1.5 text-gray-600 font-medium text-xs'>
							<UserGroupIcon className={`h-4 w-4 text-${theme.primary}-500`} />
							{campana.currentPlayers}/{campana.maxPlayers}
						</div>
					</Tooltip>

					{campana.type === 'TABLETOP' ? (
						<div className='flex items-center gap-1.5 text-gray-600 font-medium text-xs'>
							<CalendarIcon className={`h-4 w-4 text-${theme.primary}-500`} />
							{campana.schedule}
						</div>
					) : (
						<div className='flex items-center gap-1.5 text-gray-600 font-medium text-xs'>
							<ChatBubbleLeftRightIcon className={`h-4 w-4 text-${theme.primary}-500`} />
							{campana.communication}
						</div>
					)}
				</div>
			</CardBody>
		</Card>
	);
}

CampaignCard.propTypes = {
	campana: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
};
