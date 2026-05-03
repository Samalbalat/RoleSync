import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardBody, Typography, Input, Textarea, Button, Checkbox, Spinner } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService';
import { buildCharacterPayload } from '../../utils/character/dynamicCharacterFormUtils';

export default function EditCharacterForm({ characterData }) {
	const { t } = useTranslation('global');
	const theme = getTheme();
	const navigate = useNavigate();
	const location = useLocation();
	const schema = characterData.schema;

	const returnUrl = location.state?.from || `/myCharacters`;

	// En el backend, si cuardamos un min/max null pasa a ser 0, lo que puede causar problemas al validar el formulario.
	const cleanSchema = schema?.map(field => {
		if (field.type === 'number') {
			let safeMin = field.min;
			let safeMax = field.max;

			// Si max es 0 y es menor que el min (ej: min=4, max=0), el max no es válido.
			if (safeMax === 0 && safeMin > safeMax) {
				safeMax = undefined;
			}

			// Por si acaso pasa lo mismo al revés con el min
			if (safeMin === 0 && safeMin > safeMax) {
				safeMin = undefined;
			}

			return { ...field, min: safeMin, max: safeMax };
		}
		return field;
	});

	const initialAttributes = {};
	if (cleanSchema && Array.isArray(cleanSchema)) {
		cleanSchema.forEach(field => {
			if (field.type === 'boolean') {
				initialAttributes[field.key] = field.value === true || field.value === 'true' || field.value === '1';
			} else {
				initialAttributes[field.key] = field.value || '';
			}
		});
	}

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			name: characterData.name || '',
			avatar_url: characterData.avatarUrl || characterData.characterImage || '',
			attributes: initialAttributes,
		},
	});

	if (!schema) {
		return (
			<div className='flex flex-col items-center justify-center mt-20 text-center'>
				<Spinner color={theme.primary} className='mb-4' />
				<Typography color='red'>No se pudo cargar el esquema de la plantilla del personaje.</Typography>
			</div>
		);
	}

	const onSubmit = async formData => {
		const payload = buildCharacterPayload({
			data: formData,
			templateData: {
				...characterData.template,
				schema: cleanSchema,
			},
		});
		try {
			await CharacterService.updateCharacter(characterData.id, payload);

			toast.success(
				t('character.message.successUpdating', {
					name: formData.name,
					defaultValue: 'Personaje actualizado correctamente',
				}),
			);

			setTimeout(() => navigate(returnUrl), 1500);
		} catch (error) {
			console.error('Error al actualizar personaje:', error);
			toast.error(t('character.message.errorUpdating', 'Error al actualizar el personaje'));
		}
	};

	return (
		<div className='w-full max-w-4xl mx-auto p-4'>
			<Card className='shadow-lg border border-blue-gray-50'>
				<CardBody>
					<div className='mb-6 text-center'>
						<Typography variant='h3' color='blue-gray'>
							{t('character.form.editTitle', 'Editar Personaje')}
						</Typography>
						<Typography color='gray' className='mt-1 font-normal'>
							{t('character.form.editDescription', 'Modifica los atributos de tu personaje y guarda los cambios.')}
						</Typography>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
						{/* 1. CAMPOS FIJOS */}
						<section className='space-y-4'>
							<Typography variant='h5' color='blue-gray' className='border-b pb-2'>
								{t('character.form.basicInfo', 'Información Básica')}
							</Typography>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<Input
										label={t('character.form.name', 'Nombre')}
										{...register('name', { required: t('errors.required', 'Este campo es obligatorio') })}
										error={!!errors.name}
									/>
									{errors.name && (
										<Typography variant='small' color='red' className='mt-1'>
											{errors.name.message}
										</Typography>
									)}
								</div>
								<div>
									<Input label={t('character.form.image', 'URL del Avatar')} type='url' {...register('avatar_url')} />
								</div>
							</div>
						</section>

						{/* 2. CAMPOS DINÁMICOS */}
						{schema.length > 0 && (
							<section className='space-y-4'>
								<Typography variant='h5' color='blue-gray' className='border-b pb-2'>
									{t('character.form.attributes', 'Atributos')}
								</Typography>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{cleanSchema.map(field => {
										const fieldPath = `attributes.${field.key}`;

										return (
											<div key={field.key} className={field.type === 'long_text' ? 'md:col-span-2' : ''}>
												{field.type === 'short_text' && (
													<div>
														<Input
															label={`${field.label} ${field.required ? '*' : ''}`}
															{...register(fieldPath, {
																required: field.required ? t('errors.required', 'Requerido') : false,
															})}
															error={!!errors?.attributes?.[field.key]}
														/>
														{errors?.attributes?.[field.key] && (
															<Typography variant='small' color='red' className='mt-1'>
																{errors.attributes[field.key].message}
															</Typography>
														)}
													</div>
												)}

												{field.type === 'long_text' && (
													<div>
														<Textarea
															label={`${field.label} ${field.required ? '*' : ''}`}
															{...register(fieldPath, {
																required: field.required ? t('errors.required', 'Requerido') : false,
															})}
															error={!!errors?.attributes?.[field.key]}
														/>
														{errors?.attributes?.[field.key] && (
															<Typography variant='small' color='red' className='mt-1'>
																{errors.attributes[field.key].message}
															</Typography>
														)}
													</div>
												)}

												{field.type === 'number' && (
													<div>
														<Input
															type='number'
															label={`${field.label} ${field.required ? '*' : ''}`}
															// Solo inyectamos el prop min/max en el HTML si no son undefined
															{...(field.min !== undefined ? { min: field.min } : {})}
															{...(field.max !== undefined ? { max: field.max } : {})}
															{...register(fieldPath, {
																required: field.required ? t('errors.required', 'Requerido') : false,
																valueAsNumber: true,
																// Solo pasamos la validación a react-hook-form si existen
																...(field.min !== undefined && {
																	min: { value: field.min, message: `${t('common.minimum')} ${field.min}` },
																}),
																...(field.max !== undefined && {
																	max: { value: field.max, message: `${t('common.maximum')} ${field.max}` },
																}),
															})}
															error={!!errors?.attributes?.[field.key]}
														/>
														{errors?.attributes?.[field.key] && (
															<Typography variant='small' color='red' className='mt-1'>
																{errors.attributes[field.key].message}
															</Typography>
														)}
													</div>
												)}

												{field.type === 'boolean' && (
													<div className='flex items-center mt-2'>
														<Checkbox label={field.label} {...register(fieldPath)} />
													</div>
												)}
											</div>
										);
									})}
								</div>
							</section>
						)}

						{/* BOTONES DE ENVÍO */}
						<div className='flex justify-between pt-4 border-t border-blue-gray-50'>
							<Button variant='text' color='red' onClick={() => navigate(-1)} disabled={isSubmitting}>
								{t('common.cancel', 'Cancelar')}
							</Button>
							<Button type='submit' color='blue' size='lg' disabled={isSubmitting} className='flex items-center gap-2'>
								{isSubmitting && <Spinner className='h-4 w-4' />}
								{t('character.form.submitEdit', 'Guardar Cambios')}
							</Button>
						</div>
					</form>
				</CardBody>
			</Card>
		</div>
	);
}

EditCharacterForm.propTypes = {
	characterData: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		campaign_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		name: PropTypes.string,
		avatar_url: PropTypes.string,
		avatarUrl: PropTypes.string,
		characterImage: PropTypes.string,
		attributes: PropTypes.object,
		template: PropTypes.object,
		schema: PropTypes.array,
	}).isRequired,
};
