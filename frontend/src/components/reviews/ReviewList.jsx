import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Typography, Spinner } from '@material-tailwind/react';
import ReviewItem from './ReviewItem';
import ReviewModal from './ReviewModal';
import ReviewService from '../../services/ReviewService';
import { useAuth } from '../../utils/AuthContext';
import { toast } from 'react-hot-toast';

export default function ReviewList({ targetId, targetType, canWrite, averageRating, totalReviews }) {
	const { activeProfile } = useAuth();
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchReviewData = useCallback(async () => {
		if (!targetId) return;

		try {
			setLoading(true);
			const numericId = Number(targetId);

			const listData = await ReviewService.getReviews(targetType, numericId);

			setReviews(listData || []);
		} catch (error) {
			console.error('Error loading reviews:', error);
			toast.error('No se pudieron cargar las reseñas');
		} finally {
			setLoading(false);
		}
	}, [targetId, targetType]);

	useEffect(() => {
		fetchReviewData();
	}, [fetchReviewData]);

	const userHasReviewed = useMemo(() => {
		if (!activeProfile || !reviews.length) return false;

		return reviews.some(review => review.authorName === activeProfile.name);
	}, [reviews, activeProfile]);

	const showWriteButton = canWrite && !userHasReviewed;

	if (loading) {
		return (
			<div className='flex justify-center items-center py-10'>
				<Spinner className='h-8 w-8 text-blue-500' />
			</div>
		);
	}

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
							de 5 ({totalReviews} valoraciones)
						</Typography>
					</div>
				</div>

				{showWriteButton ? (
					<ReviewModal targetId={targetId} targetType={targetType} onSuccess={fetchReviewData} />
				) : (
					activeProfile &&
					userHasReviewed && (
						<Typography variant='small' className='bg-blue-gray-50 px-3 py-1 rounded-lg text-blue-gray-600 italic'>
							Ya has valorado esta {targetType === 'CAMPAIGN' ? 'campaña' : 'experiencia'}
						</Typography>
					)
				)}
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
	canWrite: PropTypes.bool.isRequired,
	averageRating: PropTypes.number,
	totalReviews: PropTypes.number,
};
