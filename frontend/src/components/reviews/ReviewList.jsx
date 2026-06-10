import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Typography, Spinner } from '@material-tailwind/react';
import ReviewItem from './ReviewItem';
import ReviewModal from './ReviewModal';
import ReviewService from '../../services/ReviewService';
import { useAuth } from '../../utils/AuthContext';
import { toast } from 'react-hot-toast';

// 1. Extraemos la lógica de datos a un Custom Hook
function useReviewData(targetType, targetId) {
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchReviews = useCallback(async () => {
		if (!targetId) return;
		try {
			setLoading(true);
			const data = await ReviewService.getReviews(targetType, Number(targetId));
			setReviews(data || []);
		} catch (error) {
			console.error('Error fetching reviews:', error);
			toast.error('No se pudieron cargar las reseñas');
		} finally {
			setLoading(false);
		}
	}, [targetId, targetType]);

	useEffect(() => {
		fetchReviews();
	}, [fetchReviews]);
	return { reviews, loading, fetchReviews };
}

// 2. Sub-componente para la cabecera (limpia el componente principal)
const ReviewHeader = ({ averageRating, totalReviews, children }) => (
	<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-blue-gray-100 pb-4'>
		<div>
			<Typography variant='h5' color='blue-gray'>
				Reseñas de la comunidad
			</Typography>
			<div className='flex items-center gap-2 mt-1'>
				<Typography variant='h4' className='font-bold'>
					{averageRating.toFixed(1)}
				</Typography>
				<Typography variant='small' color='gray'>
					de 5 ({totalReviews} valoraciones)
				</Typography>
			</div>
		</div>
		{children}
	</div>
);

// 3. Componente Principal (ahora mucho más corto)
export default function ReviewList({ targetId, targetType, canWrite, averageRating = 0, totalReviews = 0 }) {
	const { activeProfile } = useAuth();
	const { reviews, loading, fetchReviews } = useReviewData(targetType, targetId);

	const userHasReviewed = useMemo(
		() => activeProfile && reviews.some(r => r.authorName === activeProfile.name),
		[reviews, activeProfile],
	);

	if (loading)
		return (
			<div className='flex justify-center py-10'>
				<Spinner className='h-8 w-8 text-blue-500' />
			</div>
		);

	return (
		<div className='flex flex-col gap-6 w-full'>
			<ReviewHeader averageRating={averageRating} totalReviews={totalReviews}>
				{canWrite && !userHasReviewed ? (
					<ReviewModal targetId={targetId} targetType={targetType} onSuccess={fetchReviews} />
				) : (
					activeProfile &&
					userHasReviewed && (
						<Typography variant='small' className='bg-blue-gray-50 px-3 py-1 rounded-lg italic'>
							Ya has valorado esta {targetType === 'CAMPAIGN' ? 'campaña' : 'experiencia'}
						</Typography>
					)
				)}
			</ReviewHeader>

			<div className='flex flex-col gap-4'>
				{reviews.length > 0 ? (
					reviews.map(review => <ReviewItem key={review.id} review={review} />)
				) : (
					<Typography variant='small' color='gray' className='text-center py-8 italic'>
						Aún no hay reseñas. ¡Sé el primero!
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
