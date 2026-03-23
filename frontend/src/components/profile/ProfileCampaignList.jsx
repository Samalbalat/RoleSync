import PropTypes from 'prop-types';
import { Badge, Card, CardBody, Chip, Typography } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function ProfileCampaignList({ campaigns, type }) {
	const { t } = useTranslation('global');
	const navigate = useNavigate();

	const list = type === 'master' ? campaigns.asMaster : campaigns.asPlayer;
	const title = type === 'master' ? t('home.masterCampaigns.title') : t('home.playerCampaigns.title');

	const getStatusConfig = status => {
		switch (status) {
			case 'OPEN':
				return { color: 'green', label: t('status.open') };
			case 'ACTIVE':
				return { color: 'blue', label: t('status.active') };
			case 'BREAK':
				return { color: 'amber', label: t('status.break') };
			case 'FINISHED':
				return { color: 'gray', label: t('status.finished') };
			default:
				return { color: 'red', label: status };
		}
	};

	if (list.length === 0 && type === 'player') return null;

	return (
		<div className='mb-6'>
			<Typography variant='h6' color='blue-gray' className='mb-2'>
				{title}
			</Typography>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{list.map(camp => {
					const status = getStatusConfig(camp.status);
					const hasPending = type === 'master' && camp.pendingRequests > 0;

					return (
						<Card
							key={camp.id}
							className='border border-blue-gray-50 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
							onClick={() => navigate(`/campaign/${camp.id}`)}
						>
							<CardBody className='p-4'>
								<div className='flex justify-between items-start mb-1'>
									<Typography variant='h6' className='truncate pr-2'>
										{camp.name}
									</Typography>

									{hasPending && (
										<Badge content={camp.pendingRequests} color='red'>
											<UserPlusIcon className='h-5 w-5 text-red-400' />
										</Badge>
									)}
								</div>

								<div className='flex justify-between items-center'>
									{/* Chip de estado */}
									<Chip variant='ghost' size='sm' color={status.color} value={status.label} className='rounded-full' />
								</div>
							</CardBody>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

ProfileCampaignList.propTypes = {
	campaigns: PropTypes.shape({
		asMaster: PropTypes.array.isRequired,
		asPlayer: PropTypes.array.isRequired,
	}).isRequired,
	type: PropTypes.oneOf(['master', 'player']).isRequired,
};
