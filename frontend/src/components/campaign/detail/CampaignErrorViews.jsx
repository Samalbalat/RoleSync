import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Button } from '@material-tailwind/react';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export const NotFoundView = ({ t, navigate }) => (
	<div className='flex flex-col items-center justify-center h-screen animate-fade-in'>
		<Typography variant='h4' color='blue-gray'>
			{t('campaign.noResultsFound')}
		</Typography>
		<Button className='mt-4' onClick={() => navigate('/campaigns')}>
			{t('common.back')}
		</Button>
	</div>
);

export const AccessDeniedView = ({ t, navigate }) => (
	<div className='flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-fade-in'>
		<div className='p-6 bg-red-50 rounded-full mb-4'>
			<ShieldExclamationIcon className='h-16 w-16 text-red-500' />
		</div>
		<Typography variant='h3' color='blue-gray' className='mb-2'>
			{t('auth.accessDenied')}
		</Typography>
		<Typography className='text-gray-600 max-w-md mb-8'>{t('campaign.accessDeniedMessage')}</Typography>
		<Button color='gray' variant='outlined' onClick={() => navigate('/campaigns')}>
			{t('common.back')}
		</Button>
	</div>
);

NotFoundView.propTypes = {
	t: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
};

AccessDeniedView.propTypes = {
	t: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
};
