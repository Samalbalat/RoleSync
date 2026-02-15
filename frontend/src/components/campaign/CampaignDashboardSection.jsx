import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Button } from '@material-tailwind/react';
import CampaignMiniCard from './CampaignMiniCard';

export default function CampaignDashboardSection({ title, subtitle, campaigns, isMaster, theme, onCardClick, emptyState }) {
	return (
		<section className='animate-fade-in-up mb-12'>
			<div className='mb-6'>
				<Typography
					variant='h5'
					className={`font-bold flex items-center gap-2 ${theme.isDark ? 'text-gray-200' : 'text-gray-800'}`}
				>
					{title}
				</Typography>
				<Typography variant='small' className='text-gray-500'>
					{subtitle}
				</Typography>
			</div>

			{campaigns.length > 0 ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
					{campaigns.slice(0, 4).map(campaign => (
						<CampaignMiniCard
							key={campaign.id}
							campaign={campaign}
							isMaster={isMaster}
							theme={theme}
							onClick={() => onCardClick(campaign.id)}
						/>
					))}
				</div>
			) : (
				/* Estado Vacío */
				<div
					className={`p-8 rounded-xl border border-dashed text-center ${theme.isDark ? 'bg-blue-gray-900/30 border-gray-700' : 'bg-white border-gray-300'}`}
				>
					<Typography color='gray' className='mb-2'>
						{emptyState.message}
					</Typography>
					<Button
						size='sm'
						variant={emptyState.btnVariant || 'filled'}
						color={theme.primary}
						className='flex items-center gap-2 mx-auto'
						onClick={emptyState.action}
					>
						{emptyState.icon} {emptyState.btnText}
					</Button>
				</div>
			)}
		</section>
	);
}

CampaignDashboardSection.propTypes = {
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.string.isRequired,
	campaigns: PropTypes.array.isRequired,
	isMaster: PropTypes.bool.isRequired,
	theme: PropTypes.object.isRequired,
	onCardClick: PropTypes.func.isRequired,
	emptyState: PropTypes.shape({
		message: PropTypes.string.isRequired,
		btnVariant: PropTypes.string,
		action: PropTypes.func.isRequired,
		icon: PropTypes.node,
		btnText: PropTypes.string.isRequired,
	}).isRequired,
};
