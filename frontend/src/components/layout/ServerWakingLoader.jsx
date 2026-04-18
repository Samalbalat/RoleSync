import { useState, useEffect } from 'react';
import { Typography } from '@material-tailwind/react';

const ServerWakingLoader = ({ isSubmitting }) => {
	const [isWakingUp, setIsWakingUp] = useState(false);

	useEffect(() => {
		let timeoutId;

		// Si la petición ha empezado, arrancamos el cronómetro de 7 segundos
		if (isSubmitting) {
			timeoutId = setTimeout(() => {
				setIsWakingUp(true);
			}, 10000);
		} else {
			// Si la petición ha terminado (isSubmitting es false), limpiamos todo
			setIsWakingUp(false);
			clearTimeout(timeoutId);
		}

		return () => clearTimeout(timeoutId);
	}, [isSubmitting]);

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

export default ServerWakingLoader;
