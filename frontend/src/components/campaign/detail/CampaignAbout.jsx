import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Typography, Chip } from '@material-tailwind/react';
import { BookOpenIcon } from '@heroicons/react/24/outline';

export default function CampaignAbout({ campaign, isWritten, isFull, t }) {
	return (
		<>
			{/* Imagen y Cabecera */}
			<div className='relative rounded-2xl overflow-hidden shadow-lg h-[300px] md:h-[400px]'>
				<img
					src={campaign.image || '/default_image.png'}
					alt={campaign.name}
					className='w-full h-full object-cover'
					onError={e => {
						e.target.onerror = null;
						e.target.src = '/default_image.png';
					}}
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8'>
					<div className='flex gap-2 mb-3'>
						<Chip
							value={
								campaign.status === 'OPEN' || campaign.status === 'ACTIVE'
									? t('status.open') || 'Abierta'
									: t('status.full') || 'Cerrada'
							}
							color={isFull ? 'red' : 'green'}
							className='rounded-full'
							size='sm'
						/>
						<Chip
							value={campaign.type}
							color={isWritten ? 'indigo' : 'orange'}
							className='rounded-full border-none bg-white/20 text-white'
							size='sm'
							variant='filled'
						/>
					</div>
					<Typography variant='h2' color='white' className='font-bold text-3xl md:text-4xl'>
						{campaign.name}
					</Typography>
				</div>
			</div>

			{/* Description Section */}
			<Card className='shadow-sm border border-gray-200'>
				<CardBody className='p-6 md:p-8'>
					<Typography variant='h5' color='blue-gray' className='mb-4 font-bold flex items-center gap-2'>
						<BookOpenIcon className='h-6 w-6 text-gray-600' /> {t('campaign.detail.about') || 'Sobre la campaña'}
					</Typography>
					<Typography className='text-gray-600 text-lg leading-relaxed whitespace-pre-line'>
						{campaign.description}
					</Typography>
					<div className='mt-8'>
						<Typography variant='h6' color='blue-gray' className='mb-3'>
							{t('campaign.detail.tags') || 'Etiquetas'}
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
	isWritten: PropTypes.bool.isRequired,
	isFull: PropTypes.bool.isRequired,
	t: PropTypes.func.isRequired,
};
