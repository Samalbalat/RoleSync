import PropTypes from 'prop-types';
import { Typography, Button } from '@material-tailwind/react';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';

const AccessDeniedView = ({ t, navigate, type }) => {
	let message = '';

	if (type === 'campaign') {
		message = t('campaign.accessDeniedMessage') || 'No tienes permiso para editar esta campaña.';
	} else if (type === 'character') {
		message = t('character.accessDeniedMessage') || 'No tienes permiso para editar este personaje.';
	} else if (type === 'template') {
		message = t('template.accessDeniedMessage') || 'No tienes permiso para editar esta plantilla.';
	}

	return (
		<div className='flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-fade-in'>
			<div className='p-6 bg-red-50 rounded-full mb-4'>
				<ShieldExclamationIcon className='h-16 w-16 text-red-500' />
			</div>

			<Typography variant='h3' color='blue-gray' className='mb-2'>
				{t('auth.accessDenied') || 'Acceso Denegado'}
			</Typography>

			<Typography className='text-gray-600 max-w-md mb-8'>{message}</Typography>

			{type === 'campaign' && (
				<Button color='gray' variant='outlined' onClick={() => navigate('/find-campaign')}>
					{t('common.back') || 'Volver'}
				</Button>
			)}
		</div>
	);
};

AccessDeniedView.propTypes = {
	t: PropTypes.func.isRequired,
	navigate: PropTypes.func,
	type: PropTypes.string.isRequired,
};

export default AccessDeniedView;
