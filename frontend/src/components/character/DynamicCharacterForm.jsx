import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Card, CardBody, Typography, Input, Textarea, Button, Checkbox } from '@material-tailwind/react';
import { getTheme } from '../../utils/themeUtils';

export default function DynamicCharacterForm({ templateData }) {
	const theme = getTheme();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	if (!templateData?.schema_definition) {
		return (
			<div className='flex justify-center mt-20'>
				<Spinner color={theme.primary} />
			</div>
		);
	}

	DynamicCharacterForm.propTypes = {
		templateData: PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			campaign_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			schema_definition: PropTypes.arrayOf(
				PropTypes.shape({
					key: PropTypes.string.isRequired,
					label: PropTypes.string.isRequired,
					type: PropTypes.string.isRequired,
					required: PropTypes.bool,
					min: PropTypes.number,
					max: PropTypes.number,
				}),
			),
		}),
	};

	const { id: template_id, campaign_id, schema_definition } = templateData;

	const onSubmit = data => {
		const payload = {
			...data,
			campaign_id: campaign_id,
			template_id: template_id,
		};

		console.log('JSON PERFECTO para enviar al backend:', JSON.stringify(payload, null, 2));
	};

	return (
		<div className='w-full max-w-4xl mx-auto p-4'>
			<Card className='shadow-lg border border-blue-gray-50'>
				<CardBody>
					<div className='mb-6 text-center'>
						<Typography variant='h3' color='blue-gray'>
							Crear Personaje
						</Typography>
						<Typography color='gray' className='mt-1 font-normal'>
							Rellena los datos para dar vida a tu nuevo personaje.
						</Typography>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
						{/* 1. CAMPOS FIJOS (Siempre están, van en la raíz del JSON) */}
						<section className='space-y-4'>
							<Typography variant='h5' color='blue-gray' className='border-b pb-2'>
								Datos Básicos
							</Typography>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<Input
										label='Nombre del Personaje *'
										{...register('name', { required: 'El nombre es obligatorio' })}
										error={!!errors.name}
									/>
									{errors.name && (
										<Typography variant='small' color='red' className='mt-1'>
											{errors.name.message}
										</Typography>
									)}
								</div>
								<div>
									<Input label='URL del Avatar (Opcional)' type='url' {...register('avatar_url')} />
								</div>
							</div>
						</section>

						{/* 2. CAMPOS DINÁMICOS (Vienen de la plantilla del DM, van dentro de 'attributes') */}
						{schema_definition.length > 0 && (
							<section className='space-y-4'>
								<Typography variant='h5' color='blue-gray' className='border-b pb-2'>
									Atributos de la Campaña
								</Typography>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{schema_definition.map(field => {
										// Generamos el path para el JSON (ej: attributes.fuerza)
										const fieldPath = `attributes.${field.key}`;

										return (
											<div key={field.key} className={field.type === 'long_text' ? 'md:col-span-2' : ''}>
												{/* Renderizamos un Input de Texto */}
												{field.type === 'short_text' && (
													<div>
														<Input
															label={`${field.label} ${field.required ? '*' : ''}`}
															{...register(fieldPath, {
																required: field.required ? 'Este campo es obligatorio' : false,
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

												{/* Renderizamos un Textarea */}
												{field.type === 'long_text' && (
													<div>
														<Textarea
															label={`${field.label} ${field.required ? '*' : ''}`}
															{...register(fieldPath, {
																required: field.required ? 'Este campo es obligatorio' : false,
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

												{/* Renderizamos un Input Numérico con validaciones */}
												{field.type === 'number' && (
													<div>
														<Input
															type='number'
															label={`${field.label} ${field.required ? '*' : ''}`}
															min={field.min}
															max={field.max}
															{...register(fieldPath, {
																required: field.required,
																valueAsNumber: true, // Crucial para que el JSON envíe un número y no un string
																min: { value: field.min, message: `Mínimo ${field.min}` },
																max: { value: field.max, message: `Máximo ${field.max}` },
															})}
															error={!!errors?.attributes?.[field.key]}
														/>
														{/* Mostrar error si se pasa del min/max */}
														{errors?.attributes?.[field.key] && (
															<Typography variant='small' color='red' className='mt-1'>
																{errors.attributes[field.key].message}
															</Typography>
														)}
													</div>
												)}

												{/* Renderizamos un Checkbox */}
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

						{/* BOTÓN DE ENVÍO */}
						<div className='flex justify-end pt-4'>
							<Button type='submit' color='blue' size='lg'>
								Forjar Personaje
							</Button>
						</div>
					</form>
				</CardBody>
			</Card>
		</div>
	);
}
