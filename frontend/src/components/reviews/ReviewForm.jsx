import React from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { Button, Textarea, Typography, Rating } from '@material-tailwind/react';

export default function ReviewForm({ initialData, onSubmit, onCancel }) {
	const {
		control,
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			rating: initialData?.rating || 0,
			content: initialData?.content || '',
		},
	});

	const handleFormSubmit = async data => {
		// Aquí el onSubmit simulará la llamada a la API
		await onSubmit(data);
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-4'>
			{/* Sistema de Estrellas con Controller */}
			<div className='flex flex-col gap-1'>
				<Typography variant='small' color='blue-gray' className='font-medium'>
					Puntuación
				</Typography>
				<Controller
					name='rating'
					control={control}
					rules={{ required: 'Por favor, selecciona una puntuación.', min: 1 }}
					render={({ field: { onChange, value } }) => (
						<Rating
							value={value}
							onChange={onChange}
							className='text-amber-500' // Color dorado típico para el rol
						/>
					)}
				/>
				{errors.rating && (
					<Typography variant='small' color='red'>
						{errors.rating.message || 'La puntuación no puede ser 0.'}
					</Typography>
				)}
			</div>

			{/* Campo de Texto */}
			<div className='flex flex-col gap-1'>
				<Typography variant='small' color='blue-gray' className='font-medium'>
					Tu Reseña
				</Typography>
				<Textarea
					{...register('content', {
						required: 'El contenido de la reseña es obligatorio.',
						minLength: {
							value: 10,
							message: 'Por favor, escribe al menos 10 caracteres.',
						},
					})}
					label='¿Qué te ha parecido?'
					error={!!errors.content}
				/>
				{errors.content && (
					<Typography variant='small' color='red'>
						{errors.content.message}
					</Typography>
				)}
			</div>

			{/* Botonera */}
			<div className='flex justify-end gap-2 mt-4'>
				<Button variant='text' color='red' onClick={onCancel} disabled={isSubmitting}>
					Cancelar
				</Button>
				<Button variant='gradient' color='blue' type='submit' loading={isSubmitting}>
					{initialData ? 'Actualizar' : 'Publicar'}
				</Button>
			</div>
		</form>
	);
}

ReviewForm.propTypes = {
	initialData: PropTypes.shape({
		rating: PropTypes.number,
		content: PropTypes.string,
	}),
	onSubmit: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
};
