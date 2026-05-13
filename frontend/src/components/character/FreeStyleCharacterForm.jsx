import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Typography, Input, Button, IconButton, Textarea } from '@material-tailwind/react';
import { PlusIcon, TrashIcon, CheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService';
import { formatAttributes } from '../../utils/character/characterFormUtils';

export default function FreeStyleCharacterForm() {
	const navigate = useNavigate();
	const theme = getTheme();
	const { t } = useTranslation('global');
	const timerRef = useRef(null);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

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
	const [attributes, setAttributes] = useState([{ key: '', value: '', type: 'short_text' }]);

	// Añadir una nueva fila
	const handleAddAttribute = (fieldType = 'short_text') => {
		setAttributes([...attributes, { key: '', value: '', type: fieldType }]);
	};

	// Eliminar una fila por su índice
	const handleRemoveAttribute = indexToRemove => {
		setAttributes(attributes.filter((_, index) => index !== indexToRemove));
	};

	const ALLOWED_ATTRIBUTE_FIELDS = new Set(['key', 'value']);

	// Actualizar el nombre (key) o el valor (value) de un atributo
	const handleAttributeChange = (index, field, newValue) => {
		if (!ALLOWED_ATTRIBUTE_FIELDS.has(field)) {
			console.warn(`Campo de atributo no permitido: ${field}`);
			return;
		}

		setAttributes(prev => prev.map((attr, i) => (i === index ? { ...attr, [field]: newValue } : attr)));
	};

	const onSubmit = async data => {
		const payload = {
			name: data.name.trim(),
			avatar_url: (data.avatarUrl || '').trim(),
			campaign_id: null,
			template_id: null,
			attributes: formatAttributes(attributes),
		};

		try {
			await CharacterService.createCharacter(payload);

			toast.success(t('character.message.successCreating', { name: payload.name }));

			timerRef.current = setTimeout(() => navigate('/characters'), 1500);
		} catch (error) {
			console.error('Error al guardar el personaje:', error);

			toast.error(t('character.message.errorCreating'));
		}
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
										{...register('name', {
											required: t('errors.required'),
											maxLength: { value: 50, message: t('errors.maxLength50', { max: 50 }) },
										})}
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
									<Input
										label={t('character.form.image')}
										size='lg'
										color='blue'
										{...register('avatarUrl', {
											maxLength: { value: 2000, message: t('errors.maxLength2000', { max: 2000 }) },
										})}
									/>
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
										{/* INPUT KEY (Nombre del atributo) */}
										<div className='w-full sm:w-1/3'>
											<Input
												label={t('character.form.attributeName')}
												size='lg'
												value={attr.key}
												maxLength={50}
												onChange={e => handleAttributeChange(index, 'key', e.target.value)}
												color='blue'
											/>
										</div>

										{/* CONDICIONAL: VALUE (Input vs Textarea) */}
										<div className='w-full sm:w-2/3 flex-grow'>
											{attr.type === 'long_text' ? (
												<Textarea
													label={t('character.form.value')}
													size='lg'
													value={attr.value}
													maxLength={2000} // Límite amplio para historias/notas
													onChange={e => handleAttributeChange(index, 'value', e.target.value)}
													color='blue'
												/>
											) : (
												<Input
													label={t('character.form.value')}
													size='lg'
													value={attr.value}
													maxLength={255} // Límite estándar para texto corto
													onChange={e => handleAttributeChange(index, 'value', e.target.value)}
													color='blue'
												/>
											)}
										</div>

										{/* BOTÓN ELIMINAR */}
										<IconButton
											variant='text'
											color='red'
											onClick={() => handleRemoveAttribute(index)}
											className='shrink-0 self-end sm:self-auto mb-1 sm:mb-0 mt-2 sm:mt-0' // Ajuste de margen para alinear con Textarea
											disabled={attributes.length === 1 && !attr.key && !attr.value}
										>
											<TrashIcon className='h-5 w-5' />
										</IconButton>
									</div>
								))}

								{/* BOTONERA PARA AÑADIR ATRIBUTOS */}
								<div className='flex flex-wrap gap-3 mt-2'>
									<Button
										variant='outlined'
										color='blue'
										className='flex items-center gap-2'
										onClick={() => handleAddAttribute('short_text')}
									>
										<PlusIcon className='h-4 w-4' /> {t('character.templateBuilder.addField') || 'Añadir Atributo Corto'}
									</Button>
									<Button
										variant='outlined'
										color='blue-gray'
										className='flex items-center gap-2'
										onClick={() => handleAddAttribute('long_text')}
									>
										<DocumentTextIcon className='h-4 w-4' />{' '}
										{t('character.templateBuilder.addLongField') || 'Añadir Texto Largo'}
									</Button>
								</div>
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
