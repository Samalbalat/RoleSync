import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogHeader, DialogBody } from '@material-tailwind/react';
import ReviewForm from './ReviewForm';

export default function ReviewModal({
	targetId,
	targetType, // Puede ser "CAMPAIGN" o "PROFILE"
	existingReview = null, // Si le pasamos una review, pasará a modo "Editar"
}) {
	const [open, setOpen] = useState(false);

	const handleOpen = () => setOpen(!open);

	const handleSubmit = async formData => {
		console.log(`Simulando guardado para ${targetType} con ID ${targetId}...`, formData);

		// Simulamos el delay del servidor
		await new Promise(resolve => setTimeout(resolve, 1000));

		// Aquí en el futuro llamaremos a ReviewService.create() o .update()
		console.log('¡Reseña guardada mock!');

		handleOpen();
	};

	return (
		<>
			<Button onClick={handleOpen} variant='outlined' color='blue'>
				{existingReview ? 'Editar Reseña' : 'Escribir Reseña'}
			</Button>

			<Dialog open={open} handler={handleOpen} size='sm'>
				<DialogHeader>{existingReview ? 'Editar tu reseña' : 'Cuéntanos tu experiencia'}</DialogHeader>
				<DialogBody>
					<ReviewForm initialData={existingReview} onSubmit={handleSubmit} onCancel={handleOpen} />
				</DialogBody>
			</Dialog>
		</>
	);
}

ReviewModal.propTypes = {
	targetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	targetType: PropTypes.string.isRequired,
	existingReview: PropTypes.object,
};
