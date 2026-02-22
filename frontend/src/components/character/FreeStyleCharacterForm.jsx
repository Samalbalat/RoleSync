import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Typography, Input, Button, IconButton } from '@material-tailwind/react';
import { PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { getTheme } from '../../utils/themeUtils';

export default function FreeStyleCharacterForm() {
	const navigate = useNavigate();
	const theme = getTheme();
	const { t } = useTranslation('global');

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			avatarUrl: '',
		},
	});

	// Atributos dinámicos
	const [attributes, setAttributes] = useState([{ key: '', value: '' }]);

	// Añadir una nueva fila
	const handleAddAttribute = () => {
		setAttributes([...attributes, { key: '', value: '' }]);
	};

	// Eliminar una fila por su índice
	const handleRemoveAttribute = indexToRemove => {
		setAttributes(attributes.filter((_, index) => index !== indexToRemove));
	};

	// Actualizar el nombre (key) o el valor (value) de un atributo
	const handleAttributeChange = (index, field, newValue) => {
		const updatedAttributes = [...attributes];
		updatedAttributes[index][field] = newValue;
		setAttributes(updatedAttributes);
	};

	const onSubmit = data => {
		// Transformación: Convertimos el array en el objeto JSONB final
		const formattedAttributes = {};
		attributes.forEach(attr => {
			if (attr.key.trim() !== '') {
				formattedAttributes[attr.key.trim()] = attr.value;
			}
		});

		// Construimos el JSON final para el backend
		const payload = {
			name: data.name.trim(),
			avatar_url: data.avatarUrl.trim() || null,
			campaign_id: null,
			template_id: null,
			attributes: formattedAttributes,
		};

		// Simulación de envío
		console.log('JSON enviado al backend:', JSON.stringify(payload, null, 2));

		toast.success(`¡Personaje ${data.name} creado con éxito!`);
		setTimeout(() => navigate('/characters'), 1500);
	};

	return (
		<div className='max-w-3xl mx-auto py-8 px-4 animate-fade-in-up'>
			<div className='mb-8 text-center'>
				<Typography variant='h3' color='blue-gray' className='font-bold'>
					{t('character.form.freeCreation')}
				</Typography>
				<Typography color='gray' className='mt-2'>
					{t('character.form.freeCreationDescription')}
				</Typography>
			</div>

			<Card className='border border-gray-100 shadow-lg'>
				<CardBody className='p-6 sm:p-8'>
					<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
						{/* DATOS BÁSICOS */}
						<div>
							<Typography variant='h6' color='blue-gray' className='mb-4 flex items-center gap-2'>
								<span className={`bg-blue-50 ${theme.textPrimary} p-2 rounded-lg`}>1</span>
								{t('character.form.basicInfo')}
							</Typography>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								{/* INPUT NOMBRE CON VALIDACIÓN */}
								<div className='flex flex-col'>
									<Input
										label={t('character.form.name')}
										size='lg'
										color='blue'
										{...register('name', { required: t('errors.required') })}
										error={!!errors.name}
									/>
									{errors.name && (
										<Typography variant='small' color='red' className='mt-1 ml-1 flex items-center gap-1 font-medium'>
											{errors.name.message}
										</Typography>
									)}
								</div>

								{/* INPUT AVATAR */}
								<div className='flex flex-col'>
									<Input label={t('character.form.image')} size='lg' color='blue' {...register('avatarUrl')} />
								</div>
							</div>
						</div>

						<hr className='border-gray-200' />

						{/* ATRIBUTOS DINÁMICOS */}
						<div>
							<Typography variant='h6' color='blue-gray' className='mb-1 flex items-center gap-2'>
								<span className={`bg-blue-50 ${theme.textPrimary} p-2 rounded-lg`}>2</span>
								{t('character.form.personalAttributes')}
							</Typography>
							<Typography variant='small' color='gray' className='mb-4 ml-11'>
								{t('character.form.atributesDescription')}
							</Typography>

							<div className='flex flex-col gap-4 ml-0 sm:ml-11'>
								{attributes.map((attr, index) => (
									<div key={index} className='flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-fade-in'>
										<div className='w-full sm:w-1/3'>
											<Input
												label={t('character.form.attributeName')}
												size='lg'
												value={attr.key}
												onChange={e => handleAttributeChange(index, 'key', e.target.value)}
												color='blue'
											/>
										</div>
										<div className='w-full sm:w-2/3 flex-grow'>
											<Input
												label={t('character.form.value')}
												size='lg'
												value={attr.value}
												onChange={e => handleAttributeChange(index, 'value', e.target.value)}
												color='blue'
											/>
										</div>
										<IconButton
											variant='text'
											color='red'
											onClick={() => handleRemoveAttribute(index)}
											className='shrink-0 self-end sm:self-auto mb-1 sm:mb-0'
											disabled={attributes.length === 1 && !attr.key && !attr.value}
										>
											<TrashIcon className='h-5 w-5' />
										</IconButton>
									</div>
								))}

								<Button
									variant='outlined'
									color='blue'
									className='flex items-center gap-2 w-fit mt-2'
									onClick={handleAddAttribute}
								>
									<PlusIcon className='h-4 w-4' /> {t('character.templateBuilder.addField')}
								</Button>
							</div>
						</div>

						{/* BOTONERA */}
						<div className='flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100'>
							<Button variant='text' color='gray' onClick={() => navigate(-1)}>
								{t('common.cancel')}
							</Button>
							<Button type='submit' color='blue' className='flex items-center gap-2'>
								<CheckIcon className='h-5 w-5' /> {t('character.form.submit')}
							</Button>
						</div>
					</form>
				</CardBody>
			</Card>
		</div>
	);
}
