import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Typography, Chip, Badge } from '@material-tailwind/react';
import { UserIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function CampaignMiniCard({ campaign, isMaster, theme }) {
	const navigate = useNavigate();
	return (
		<Card
			className={`w-full overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border group 
                ${theme.isDark ? 'bg-blue-gray-900 border-blue-gray-800' : 'bg-white border-gray-100'}`}
			onClick={() => navigate(`/campaign/${campaign.id}`)}
		>
			<div className='relative h-32 overflow-hidden'>
				<img
					src={campaign.image}
					alt={campaign.name}
					className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent' />

				<div className='absolute top-2 right-2'>
					<Chip
						value={campaign.status}
						size='sm'
						color={campaign.status === 'OPEN' ? 'green' : 'blue'}
						className='rounded-full shadow-sm text-[10px]'
					/>
				</div>
			</div>

			<CardBody className='p-4'>
				<div className='flex justify-between items-start mb-1'>
					<Typography variant='h6' color={theme.isDark ? 'white' : 'blue-gray'} className='leading-tight truncate pr-2'>
						{campaign.name}
					</Typography>

					{isMaster && campaign.pendingRequests > 0 && (
						<Badge content={campaign.pendingRequests} className='min-w-[18px] min-h-[18px] bg-red-500 text-white'>
							<BellAlertIcon className='h-5 w-5 text-gray-400 group-hover:text-white transition-colors' />
						</Badge>
					)}
				</div>

				<Typography variant='small' className={`${theme.isDark ? 'text-gray-400' : 'text-gray-500'} font-medium mb-3`}>
					{campaign.system}
				</Typography>

				<div
					className={`flex items-center justify-between pt-2 border-t mt-2 ${theme.isDark ? 'border-blue-gray-800' : 'border-gray-100'}`}
				>
					{isMaster ? (
						<Typography variant='small' className='text-xs text-gray-400 flex items-center gap-1'>
							<UserIcon className='h-3 w-3' /> Master (Tú)
						</Typography>
					) : (
						<div className='flex items-center gap-2'>
							<Typography variant='small' className='text-xs text-gray-400 truncate max-w-[100px]'>
								{campaign.ownerName}
							</Typography>
						</div>
					)}
				</div>
			</CardBody>
		</Card>
	);
}

CampaignMiniCard.propTypes = {
	campaign: PropTypes.shape({
		image: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		status: PropTypes.string.isRequired,
		system: PropTypes.string.isRequired,
		pendingRequests: PropTypes.number,
		ownerName: PropTypes.string,
	}).isRequired,
	isMaster: PropTypes.bool.isRequired,
	theme: PropTypes.shape({
		isDark: PropTypes.bool,
	}).isRequired,
};
