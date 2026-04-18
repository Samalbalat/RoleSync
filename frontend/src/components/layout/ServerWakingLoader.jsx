import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-tailwind/react';

const ServerWakingLoader = ({ isLoading }) => {
	const [isWakingUp, setIsWakingUp] = useState(false);

	useEffect(() => {
		let timeoutId;
		if (isLoading) {
			timeoutId = setTimeout(() => {
				setIsWakingUp(true);
			}, 10000);
		} else {
			setIsWakingUp(false);
			clearTimeout(timeoutId);
		}
		return () => clearTimeout(timeoutId);
	}, [isLoading]);

	if (!isWakingUp) return null;

	return (
		<div className='mt-6 p-4 bg-blue-gray-50 rounded-xl border border-blue-gray-100 text-center shadow-sm animate-pulse'>
			<Typography variant='h6' color='blue-gray' className='mb-2'>
				Servidor despertando... 🥱
			</Typography>
			<Typography variant='small' color='gray' className='mb-4'>
				Debido a la inactividad prolongada en nuestra web, se ha puesto a dormir. Le tomará unos minutos recobrar el sentido,
				disculpad la espera.
			</Typography>

			<img src='/dice-loading.gif' alt='Dado girando' className='w-16 h-16 mx-auto object-contain' />
		</div>
	);
};

ServerWakingLoader.propTypes = {
	isLoading: PropTypes.bool.isRequired,
};

export default ServerWakingLoader;
