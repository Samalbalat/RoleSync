import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Input, Textarea, Button, Typography, Select, Option, Chip } from '@material-tailwind/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const LIMITS = {
	NAME: 100,
	DESCRIPTION: 1000,
	IMAGE: 1000,
	SHORT_TEXT: 50,
	TAG: 30,
};

function CampaignForm({ initialValues, onSubmit, loading, theme, campaignType }) {
	const { t } = useTranslation('global');

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		image: '',
		system: '',
		maxPlayers: '',
		language: '',
		timeZone: '',
		schedule: '',
		duration: '',
		location: '',
		theme: [],
		...initialValues, // Sobrescribe con lo que venga de props (si es edición)
	});

	const [tagInput, setTagInput] = useState('');

	const [errors, setErrors] = useState({});
	useEffect(() => {
		if (initialValues) {
			setFormData(prev => ({ ...prev, ...initialValues }));
		}
	}, [initialValues]);

	// Esto es para evitar ataques de manipulación de campos CODACY
	const ALLOWED_FIELDS = [
		'name',
		'description',
		'image',
		'system',
		'maxPlayers',
		'language',
		'timeZone',
		'schedule',
		'duration',
		'location',
		'communication',
	];

	const handleChange = e => {
		const { name, value } = e.target;
		//Validamos por seguridad (Fix para Codacy)
		if (!ALLOWED_FIELDS.includes(name)) {
			console.warn(`Campo no permitido bloqueado: ${name}`);
			return;
		}

		setFormData(prev => ({ ...prev, [name]: value }));
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: null }));
		}
	};

	const handleSelectChange = (name, value) => {
		if (!ALLOWED_FIELDS.includes(name)) {
			console.warn(`Campo select no permitido bloqueado: ${name}`);
			return;
		}

		setFormData(prev => ({ ...prev, [name]: value }));
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: null }));
		}
	};

	const handleAddTag = e => {
		if (e.key === 'Enter' && tagInput.trim() !== '') {
			e.preventDefault(); // Evita que el form se envíe al dar Enter
			if (formData.theme.length >= 6) {
				setErrors(prev => ({ ...prev, theme: t('errors.maxTags') }));
				return;
			}
			if (!formData.theme.includes(tagInput.trim())) {
				setFormData(prev => ({
					...prev,
					theme: [...prev.theme, tagInput.trim()],
				}));
			}
			setTagInput('');
		}
	};

	const removeTag = tagToRemove => {
		setFormData(prev => ({
			...prev,
			theme: prev.theme.filter(tag => tag !== tagToRemove),
		}));
	};

	const validateForm = () => {
		let tempErrors = {};
		let isValid = true;

		// Validaciones comunes
		if (!formData.name.trim()) tempErrors.name = t('errors.required');
		if (!formData.description.trim()) tempErrors.description = t('errors.required');
		if (formData.description.length > LIMITS.DESCRIPTION) tempErrors.description = t('errors.tooLong1000');
		if (!formData.communication) tempErrors.communication = t('errors.required');
		if (!formData.language) tempErrors.language = t('errors.required');
		if (!formData.timeZone) tempErrors.timeZone = t('errors.required');

		// Validación numérica para Jugadores
		if (!formData.maxPlayers) {
			tempErrors.maxPlayers = t('errors.required');
		} else if (Number.isNaN(formData.maxPlayers) || Number(formData.maxPlayers) <= 0) {
			tempErrors.maxPlayers = t('errors.invalidNumber');
		}

		// Validaciones específicas para TABLETOP
		if (campaignType === 'TABLETOP') {
			if (!formData.system) tempErrors.system = t('errors.required');
			if (!formData.location) tempErrors.location = t('errors.required');
			if (!formData.schedule) tempErrors.schedule = t('errors.required');
		}

		setErrors(tempErrors);
		isValid = Object.keys(tempErrors).length === 0;
		return isValid;
	};

	const handleSubmit = e => {
		e.preventDefault();
		// Solo enviamos si pasa la validación
		if (validateForm()) {
			onSubmit(formData);
		} else {
			// Opcional: Scroll hacia arriba o alerta visual
			console.log('Formulario con errores', errors);
		}
	};

	const isWritten = campaignType === 'WRITTEN';

	return (
		<Card className='p-6 w-full bg-white shadow-sm border border-gray-200'>
			<form onSubmit={handleSubmit} className='flex flex-col gap-6'>
				{/* Nombre */}
				<div>
					<Input
						label={t('campaign.name')}
						name='name'
						value={formData.name}
						onChange={handleChange}
						maxLength={LIMITS.NAME}
						color={theme.primary}
						error={!!errors.name}
					/>
					<Typography variant='small' className='text-gray-400 text-xs text-right mt-1'>
						{formData.name.length}/{LIMITS.NAME}
					</Typography>
					{errors.name && (
						<Typography variant='small' color='red' className='mt-1 flex items-center gap-1'>
							⚠ {errors.name}
						</Typography>
					)}
				</div>

				{/* Descripción */}
				<div>
					<Textarea
						label={t('campaign.description')}
						name='description'
						value={formData.description}
						onChange={handleChange}
						maxLength={LIMITS.DESCRIPTION}
						color={theme.primary}
						error={!!errors.description}
					/>
					<div className='flex justify-between mt-1'>
						{errors.description ? (
							<Typography variant='small' color='red'>
								⚠ {errors.description}
							</Typography>
						) : (
							<span></span>
						)}
						<Typography
							variant='small'
							className={`text-xs ${formData.description.length > LIMITS.DESCRIPTION * 0.9 ? 'text-orange-600 font-bold' : 'text-gray-400'}`}
						>
							{formData.description.length} / {LIMITS.DESCRIPTION}
						</Typography>
					</div>
				</div>

				{/* Imagen URL */}
				<div>
					<Input
						label={t('campaign.image')}
						name='image'
						value={formData.image}
						onChange={handleChange}
						maxLength={LIMITS.IMAGE}
						color={theme.primary}
						placeholder='https://...'
						error={!!errors.image}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					{/* Max Players  */}
					<div>
						<Input
							label={t('campaign.maxPlayers')}
							name='maxPlayers'
							type='number'
							min='1'
							value={formData.maxPlayers}
							onChange={handleChange}
							color={theme.primary}
							error={!!errors.maxPlayers}
						/>
						{errors.maxPlayers && (
							<Typography variant='small' color='red' className='mt-1'>
								⚠ {errors.maxPlayers}
							</Typography>
						)}
					</div>

					{/* Language*/}
					<div>
						<Select
							label={t('campaign.language')}
							value={formData.language}
							onChange={val => handleSelectChange('language', val)}
							color={theme.primary}
							error={!!errors.language}
						>
							<Option value='Español'>Español</Option>
							<Option value='English'>English</Option>
							<Option value='Français'>Français</Option>
						</Select>
						{errors.language && (
							<Typography variant='small' color='red' className='mt-1'>
								⚠ {errors.language}
							</Typography>
						)}
					</div>

					{/* TimeZone */}
					<div>
						<Select
							label={t('campaign.timeZone')}
							value={formData.timeZone}
							onChange={val => handleSelectChange('timeZone', val)}
							color={theme.primary}
							error={!!errors.timeZone}
						>
							<Option value='GMT'>GMT (Europa Occidental)</Option>
							<Option value='CET'>CET (Europa Central)</Option>
							<Option value='EST'>EST (EEUU Costa Este)</Option>
							<Option value='PST'>PST (EEUU Costa Oeste)</Option>
							<Option value='UTC-3'>UTC-3 (Argentina/Uruguay)</Option>
						</Select>
						{errors.timeZone && (
							<Typography variant='small' color='red' className='mt-1'>
								⚠ {errors.timeZone}
							</Typography>
						)}
					</div>

					{/* Communication */}
					<div>
						<Select
							label={t('campaign.communication')}
							value={formData.communication}
							onChange={val => handleSelectChange('communication', val)}
							color={theme.primary}
							error={!!errors.communication}
						>
							<Option value='Discord'>Discord</Option>
							<Option value='Zoom'>Zoom</Option>
							<Option value='Roll20'>Twitter / X</Option>
							<Option value='WhatsApp'>WhatsApp</Option>
						</Select>
						{errors.communication && (
							<Typography variant='small' color='red' className='mt-1'>
								⚠ {errors.communication}
							</Typography>
						)}
					</div>
				</div>

				{/*  TEMÁTICA (TAGS)  */}
				<div>
					<div className='relative flex w-full'>
						<Input
							label={t('campaign.themes')}
							value={tagInput}
							onChange={e => setTagInput(e.target.value)}
							onKeyDown={handleAddTag}
							maxLength={LIMITS.TAG}
							color={theme.primary}
							containerProps={{ className: 'min-w-0' }}
							className='pr-10' // Espacio para el icono si quisieras poner uno
						/>
						<div className='absolute right-2 top-2.5'>
							<PlusIcon className='h-5 w-5 text-gray-400' />
						</div>
					</div>
					<Typography variant='small' className='text-gray-500 mt-1.5 ml-1 flex items-center gap-1'>
						{t('campaign.tagHelper')}
						<span className='bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700'>Enter</span>{' '}
						<span className='text-xs'>{formData.theme.length}/6</span>
					</Typography>

					<div className='flex flex-wrap gap-2 mt-3'>
						{formData.theme.map((tag, index) => (
							<Chip
								key={index}
								value={tag}
								onClose={() => removeTag(tag)}
								color={theme.primary}
								variant='ghost'
								className='rounded-full'
							/>
						))}
					</div>
				</div>

				{/*  CAMPOS ESPECÍFICOS PARA TABLETOP  */}
				{!isWritten && (
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100'>
						<Typography variant='small' className='col-span-full font-bold text-gray-500 uppercase'>
							Detalles de Partida
						</Typography>

						<div>
							<Input
								label={t('campaign.system')}
								name='system'
								value={formData.system}
								onChange={handleChange}
								maxLength={LIMITS.SHORT_TEXT}
								color={theme.primary}
								error={!!errors.system}
							/>
							{errors.system && (
								<Typography variant='small' color='red' className='mt-1'>
									⚠ {errors.system}
								</Typography>
							)}
						</div>

						<div>
							<Input
								label={t('campaign.location')}
								name='location'
								placeholder='Roll20, Foundry, Casa de Juan...'
								value={formData.location}
								onChange={handleChange}
								maxLength={LIMITS.SHORT_TEXT}
								color={theme.primary}
								error={!!errors.location}
							/>
							{errors.location && (
								<Typography variant='small' color='red' className='mt-1'>
									⚠ {errors.location}
								</Typography>
							)}
						</div>

						<div>
							<Input
								label={t('campaign.schedule')}
								name='schedule'
								placeholder='Viernes 20:00'
								value={formData.schedule}
								onChange={handleChange}
								maxLength={LIMITS.SHORT_TEXT}
								color={theme.primary}
								error={!!errors.schedule}
							/>
							{errors.schedule && (
								<Typography variant='small' color='red' className='mt-1'>
									⚠ {errors.schedule}
								</Typography>
							)}
						</div>

						<Input
							label={t('campaign.duration')}
							name='duration'
							placeholder='Ej. 4 horas, Indefinida'
							value={formData.duration}
							onChange={handleChange}
							maxLength={LIMITS.SHORT_TEXT}
							color={theme.primary}
						/>
					</div>
				)}

				<Button type='submit' fullWidth color={theme.primary} disabled={loading} className='mt-4 flex justify-center'>
					{loading ? 'Guardando...' : initialValues ? t('common.save') : t('common.create')}
				</Button>
			</form>
		</Card>
	);
}

CampaignForm.propTypes = {
	initialValues: PropTypes.object,
	onSubmit: PropTypes.func.isRequired,
	loading: PropTypes.bool,
	theme: PropTypes.shape({
		primary: PropTypes.string.isRequired,
	}).isRequired,
	campaignType: PropTypes.string,
};

export default CampaignForm;
