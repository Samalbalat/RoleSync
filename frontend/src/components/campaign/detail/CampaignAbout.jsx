import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { BookOpenIcon } from '@heroicons/react/24/outline';

export default function CampaignAbout({ campaign, t }) {
	return (
		<>
			{/* Description Section */}
			<Card className='shadow-sm border border-gray-200'>
				<CardBody className='p-6 md:p-8'>
					<Typography variant='h5' color='blue-gray' className='mb-4 font-bold flex items-center gap-2'>
						<BookOpenIcon className='h-6 w-6 text-gray-600' /> {t('campaign.detail.about')}
					</Typography>
					<Typography className='text-gray-600 text-lg leading-relaxed whitespace-pre-line'>
						{campaign.description}
					</Typography>
					<div className='mt-8'>
						<Typography variant='h6' color='blue-gray' className='mb-3'>
							{t('campaign.detail.tags')}
						</Typography>
						<div className='flex flex-wrap gap-2'>
							{campaign.themes?.map((tag, i) => (
								<span
									key={i}
									className='bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium border border-gray-200'
								>
									#{tag}
								</span>
							))}
						</div>
					</div>
				</CardBody>
			</Card>
		</>
	);
}

CampaignAbout.propTypes = {
	campaign: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
};
