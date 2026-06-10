import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogHeader, DialogBody } from '@material-tailwind/react';
import ReviewForm from './ReviewForm';
import ReviewService from '../../services/ReviewService';
import toast from 'react-hot-toast';

export default function ReviewModal({
	targetId,
	targetType, // Puede ser "CAMPAIGN" o "PROFILE"
	existingReview = null, // Si le pasamos una review, pasará a modo "Editar"
	onSuccess,
}) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleOpen = () => {
		if (!isSubmitting) setOpen(!open);
	};

	const handleSubmit = async formData => {
		try {
			setIsSubmitting(true);

			const reviewData = {
				targetType: targetType,
				targetId: Number(targetId),
				rating: formData.rating,
				comment: formData.comment || formData.content || formData.text,
			};

			if (existingReview) {
				// TODO: Aquí iría la llamada al PUT si tu compi hace el endpoint de editar
				toast.error('La edición aún no está implementada en el backend');
			} else {
				// CREAR NUEVA RESEÑA
				await ReviewService.createReview(reviewData);
				toast.success('¡Reseña publicada con éxito!');
			}

			handleOpen();
			if (onSuccess) onSuccess();
		} catch (error) {
			toast.error(error.response?.data?.message || 'Error al guardar la reseña');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<Button onClick={handleOpen} variant='outlined' color='blue' size='sm'>
				{existingReview ? 'Editar Reseña' : 'Escribir Reseña'}
			</Button>

			<Dialog open={open} handler={handleOpen} size='sm'>
				<DialogHeader className='text-blue-gray-900'>
					{existingReview ? 'Editar tu reseña' : 'Cuéntanos tu experiencia'}
				</DialogHeader>
				<DialogBody>
					<ReviewForm initialData={existingReview} onSubmit={handleSubmit} onCancel={handleOpen} isLoading={isSubmitting} />
				</DialogBody>
			</Dialog>
		</>
	);
}

ReviewModal.propTypes = {
	targetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	targetType: PropTypes.string.isRequired,
	existingReview: PropTypes.object,
	onSuccess: PropTypes.func,
};
