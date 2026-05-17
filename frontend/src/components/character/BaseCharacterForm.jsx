import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Card, CardBody, Typography, Input, Textarea, Button, Checkbox, Spinner } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';

export default function BaseCharacterForm({ schema, defaultValues, onSubmit, onCancel, title, description, submitLabel }) {
	const { t } = useTranslation('global');
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({ defaultValues });

	return (
		<div className='w-full max-w-4xl mx-auto p-4'>
			<Card className='shadow-lg border border-blue-gray-50'>
				<CardBody>
					<div className='mb-6 text-center'>
						<Typography variant='h3' color='blue-gray'>
							{title}
						</Typography>
						<Typography color='gray' className='mt-1 font-normal'>
							{description}
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
						{schema && schema.length > 0 && (
							<section className='space-y-4'>
								<Typography variant='h5' color='blue-gray' className='border-b pb-2'>
									{t('character.form.attributes', 'Atributos')}
								</Typography>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{schema.map(field => {
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
															{...(field.min !== undefined ? { min: field.min } : {})}
															{...(field.max !== undefined ? { max: field.max } : {})}
															{...register(fieldPath, {
																required: field.required ? t('errors.required', 'Requerido') : false,
																valueAsNumber: true,
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

						{/* BOTONES */}
						<div className={`flex pt-4 ${onCancel ? 'justify-between border-t border-blue-gray-50' : 'justify-end'}`}>
							{onCancel && (
								<Button variant='text' color='red' onClick={onCancel} disabled={isSubmitting}>
									{t('common.cancel', 'Cancelar')}
								</Button>
							)}
							<Button type='submit' color='blue' size='lg' disabled={isSubmitting} className='flex items-center gap-2'>
								{isSubmitting && <Spinner className='h-4 w-4' />}
								{submitLabel}
							</Button>
						</div>
					</form>
				</CardBody>
			</Card>
		</div>
	);
}

BaseCharacterForm.propTypes = {
	schema: PropTypes.array.isRequired,
	defaultValues: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	onCancel: PropTypes.func,
	title: PropTypes.string.isRequired,
	description: PropTypes.string,
	submitLabel: PropTypes.string.isRequired,
};
