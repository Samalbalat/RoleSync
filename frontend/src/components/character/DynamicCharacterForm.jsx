import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardBody, Typography, Input, Textarea, Button, Checkbox } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService';

export default function DynamicCharacterForm({ templateData }) {
	const { t } = useTranslation('global');
	const theme = getTheme();
	const navigate = useNavigate();
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

	const onSubmit = async data => {
		const userAttributes = data.attributes || {};

		const formattedAttributes = schema_definition.map(field => {
			let val = userAttributes[field.key];

			if (field.type === 'number' && Number.isNaN(val)) {
				val = null;
			} else if (field.type === 'boolean' && val === undefined) {
				val = false;
			} else if (val === undefined) {
				val = '';
			}

			return {
				key: field.key,
				label: field.label,
				type: field.type,
				required: !!field.required,
				min: field.min || 0,
				max: field.max || 0,
				value: val,
			};
		});

		const payload = {
			name: data.name,
			avatar_url: data.avatar_url || '',
			campaign_id: Number(campaign_id),
			template_id: Number(template_id),
			attributes: formattedAttributes,
		};

		try {
			await CharacterService.createCharacter(payload);
			toast.success(t('character.message.successCreating', { name: data.name }));
			setTimeout(() => navigate(`/campaign/${campaign_id}`), 1500);
		} catch (error) {
			console.error('Error al crear personaje:', error);
			toast.error(t('character.message.errorCreating'));
		}
	};

	return (
		<div className='w-full max-w-4xl mx-auto p-4'>
			<Card className='shadow-lg border border-blue-gray-50'>
				<CardBody>
					<div className='mb-6 text-center'>
						<Typography variant='h3' color='blue-gray'>
							{t('character.form.title')}
						</Typography>
						<Typography color='gray' className='mt-1 font-normal'>
							{t('character.form.description')}
						</Typography>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
						{/* 1. CAMPOS FIJOS (Siempre están, van en la raíz del JSON) */}
						<section className='space-y-4'>
							<Typography variant='h5' color='blue-gray' className='border-b pb-2'>
								{t('character.form.basicInfo')}
							</Typography>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<Input
										label={t('character.form.name')}
										{...register('name', { required: t('errors.required') })}
										error={!!errors.name}
									/>
									{errors.name && (
										<Typography variant='small' color='red' className='mt-1'>
											{errors.name.message}
										</Typography>
									)}
								</div>
								<div>
									<Input label={t('character.form.image')} type='url' {...register('avatar_url')} />
								</div>
							</div>
						</section>

						{/* 2. CAMPOS DINÁMICOS (Vienen de la plantilla del DM, van dentro de 'attributes') */}
						{schema_definition.length > 0 && (
							<section className='space-y-4'>
								<Typography variant='h5' color='blue-gray' className='border-b pb-2'>
									{t('character.form.attributes')}
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
																required: field.required ? t('errors.required') : false,
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
																required: field.required ? t('errors.required') : false,
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
																required: field.required ? t('errors.required') : false,
																valueAsNumber: true,
																min: { value: field.min, message: `${t('common.minimum')} ${field.min}` },
																max: { value: field.max, message: `${t('common.maximum')} ${field.max}` },
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
								{t('character.form.submit')}
							</Button>
						</div>
					</form>
				</CardBody>
			</Card>
		</div>
	);
}
