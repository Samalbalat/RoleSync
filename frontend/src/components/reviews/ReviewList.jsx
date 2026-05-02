import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-tailwind/react';
import ReviewItem from './ReviewItem';
import ReviewModal from './ReviewModal';

// --- DATOS MOCK ---
const MOCK_REVIEWS = [
	{
		id: 1,
		rating: 5,
		content:
			'¡Una campaña increíble! El DM prepara unos mapas brutales en Foundry y la trama engancha desde el minuto uno. Mi bárbaro casi muere en la última sesión, ¡10/10!',
		createdAt: '2026-04-20T10:30:00Z',
		author: {
			profileId: 'p-101',
			profileName: 'Grog El Destructor',
			roleType: 'TABLETOP',
			avatarUrl: 'https://docs.material-tailwind.com/img/face-3.jpg',
		},
	},
	{
		id: 2,
		rating: 4,
		content:
			'Muy buena experiencia narrativa. Los tiempos de respuesta en los hilos son rápidos y el lore del mundo es súper profundo. Le quito una estrella porque a veces el sistema de magia es confuso.',
		createdAt: '2026-04-24T16:15:00Z',
		author: {
			profileId: 'p-102',
			profileName: 'Elara Moonwhisper',
			roleType: 'WRITTEN',
			avatarUrl: 'https://docs.material-tailwind.com/img/face-4.jpg',
		},
	},
];

export default function ReviewList({ targetId, targetType }) {
	// En un futuro, aquí harías un useEffect para cargar las reviews reales
	const reviews = MOCK_REVIEWS;

	// Calculamos la nota media para darle un poco de salsa a la UI
	const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

	return (
		<div className='flex flex-col gap-6 w-full'>
			{/* Cabecera del listado con estadísticas y el botón de añadir */}
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-blue-gray-100 pb-4'>
				<div>
					<Typography variant='h5' color='blue-gray'>
						Reseñas de la comunidad
					</Typography>
					<div className='flex items-center gap-2 mt-1'>
						<Typography variant='h4' color='blue-gray' className='font-bold'>
							{averageRating.toFixed(1)}
						</Typography>
						<Typography variant='small' color='gray'>
							de 5 ({reviews.length} valoraciones)
						</Typography>
					</div>
				</div>

				{/* Aquí reciclamos el modal que hicimos antes */}
				<ReviewModal targetId={targetId} targetType={targetType} />
			</div>

			{/* Renderizado de los comentarios */}
			<div className='flex flex-col gap-4'>
				{reviews.length > 0 ? (
					reviews.map(review => <ReviewItem key={review.id} review={review} />)
				) : (
					<Typography variant='small' color='gray' className='text-center py-8 italic'>
						Aún no hay reseñas. ¡Sé el primero en contar tu experiencia!
					</Typography>
				)}
			</div>
		</div>
	);
}

ReviewList.propTypes = {
	targetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	targetType: PropTypes.string.isRequired,
};
