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
		dayWeek: '',
		duration: '',
		location: '',
		themes: [],
		frequency: '',
		...initialValues,
	});

	const [tagInput, setTagInput] = useState('');

	const [errors, setErrors] = useState({});
	useEffect(() => {
		if (initialValues) {
			setFormData(prev => ({ ...prev, ...initialValues }));
		}
	}, [initialValues]);

	// Esto es para evitar ataques de manipulación de campos CODACY
	const ALLOWED_FIELDS = new Set([
		'name',
		'description',
		'image',
		'system',
		'maxPlayers',
		'language',
		'timeZone',
		'dayWeek',
		'duration',
		'location',
		'communication',
		'themes',
		'frequency',
	]);

	const updateField = (fieldName, value) => {
		if (!ALLOWED_FIELDS.has(fieldName)) {
			console.warn(`Campo ignorado por seguridad: ${fieldName}`);
			return;
		}

		setFormData(prev => ({ ...prev, [fieldName]: value }));
		if (errors[fieldName]) {
			setErrors(prev => ({ ...prev, [fieldName]: null }));
		}
	};

	const handleChange = e => {
		updateField(e.target.name, e.target.value);
	};

	const handleSelectChange = (name, value) => {
		updateField(name, value);
	};

	const handleAddTag = e => {
		if (e.key === 'Enter' && tagInput.trim() !== '') {
			e.preventDefault(); // Evita que el form se envíe al dar Enter
			if (formData.themes.length >= 6) {
				setErrors(prev => ({ ...prev, themes: t('errors.maxTags') }));
				return;
			}
			if (!formData.themes.includes(tagInput.trim())) {
				setFormData(prev => ({
					...prev,
					themes: [...prev.themes, tagInput.trim()],
				}));
			}
			setTagInput('');
		}
	};

	const removeTag = tagToRemove => {
		setFormData(prev => ({
			...prev,
			themes: prev.themes.filter(tag => tag !== tagToRemove),
		}));
	};

	const validateCommonFields = () => {
		let errs = {};

		if (!formData.name.trim()) errs.name = t('errors.required');
		if (!formData.communication) errs.communication = t('errors.required');
		if (!formData.language) errs.language = t('errors.required');
		if (!formData.timeZone) errs.timeZone = t('errors.required');

		if (!formData.description.trim()) {
			errs.description = t('errors.required');
		} else if (formData.description.length > LIMITS.DESCRIPTION) {
			errs.description = t('errors.tooLong1000');
		}

		return errs;
	};

	// datos numéricos
	const validatePlayers = () => {
		let errs = {};

		if (!formData.maxPlayers) {
			errs.maxPlayers = t('errors.required');
		} else if (Number.isNaN(formData.maxPlayers) || Number(formData.maxPlayers) <= 0) {
			errs.maxPlayers = t('errors.invalidNumber');
		}

		return errs;
	};

	const validateTabletopFields = () => {
		let errs = {};

		if (campaignType === 'TABLETOP') {
			if (!formData.system) errs.system = t('errors.required');
			if (!formData.location) errs.location = t('errors.required');
			if (!formData.dayWeek) errs.dayWeek = t('errors.required');
			if (!formData.duration) errs.duration = t('errors.required');
			if (!formData.frequency) errs.frequency = t('errors.required');
		}

		return errs;
	};

	const validateForm = () => {
		const commonErrors = validateCommonFields();
		const playerErrors = validatePlayers();
		const tabletopErrors = validateTabletopFields();

		const tempErrors = {
			...commonErrors,
			...playerErrors,
			...tabletopErrors,
		};

		setErrors(tempErrors);
		const isValid = Object.keys(tempErrors).length === 0;
		return isValid;
	};

	const handleSubmit = e => {
		e.preventDefault();

		if (validateForm()) {
			onSubmit(formData);
		} else {
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
							<Option value='Deutsch'>Deutsch</Option>
							<Option value='Italiano'>Italiano</Option>
							<Option value='Português'>Português</Option>
							<Option value='Other'>{t('common.other')}</Option>
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
							{[
								isWritten ? (
									<Option key='rolesync' value='RoleSync'>
										RoleSync
									</Option>
								) : null,
								<Option key='discord' value='Discord'>
									Discord
								</Option>,
								<Option key='twitter' value='Twitter'>
									Twitter / X
								</Option>,
								<Option key='telegram' value='Telegram'>
									Telegram
								</Option>,
								<Option key='whatsapp' value='WhatsApp'>
									WhatsApp
								</Option>,
								<Option key='in-person' value='In-person'>
									{t('communication.inPerson')}
								</Option>,
								<Option key='other' value='Other'>
									{t('communication.other')}
								</Option>,
							].filter(Boolean)}
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
						<span className='bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700'>
							{t('common.enter')}
						</span>{' '}
						<span className='text-xs'>{formData.themes.length}/6</span>
					</Typography>

					<div className='flex flex-wrap gap-2 mt-3'>
						{formData.themes.map((tag, index) => (
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
							{t('campaign.detail.infoTitle')}
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
								placeholder={t('campaign.placeholder.location')}
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
							<Select
								label={t('campaign.dayWeek')}
								name='dayWeek'
								value={formData.dayWeek}
								onChange={val => handleSelectChange('dayWeek', val)}
								maxLength={LIMITS.SHORT_TEXT}
								color={theme.primary}
								error={!!errors.dayWeek}
							>
								<Option value='monday'>{t('dayWeek.monday')}</Option>
								<Option value='tuesday'>{t('dayWeek.tuesday')}</Option>
								<Option value='wednesday'>{t('dayWeek.wednesday')}</Option>
								<Option value='thursday'>{t('dayWeek.thursday')}</Option>
								<Option value='friday'>{t('dayWeek.friday')}</Option>
								<Option value='saturday'>{t('dayWeek.saturday')}</Option>
								<Option value='sunday'>{t('dayWeek.sunday')}</Option>
							</Select>
							{errors.dayWeek && (
								<Typography variant='small' color='red' className='mt-1'>
									⚠ {errors.dayWeek}
								</Typography>
							)}
						</div>

						<div>
							<Select
								label={t('campaign.frequency')}
								name='frequency'
								value={formData.frequency}
								onChange={val => handleSelectChange('frequency', val)}
								maxLength={LIMITS.SHORT_TEXT}
								color={theme.primary}
								error={!!errors.frequency}
							>
								<Option value='oneShot'>{t('frequency.oneShot')}</Option>
								<Option value='weekly'>{t('frequency.weekly')}</Option>
								<Option value='biweekly'>{t('frequency.biweekly')}</Option>
								<Option value='monthly'>{t('frequency.monthly')}</Option>
							</Select>

							{errors.frequency && (
								<Typography variant='small' color='red' className='mt-1'>
									⚠ {errors.frequency}
								</Typography>
							)}
						</div>

						<Input
							label={t('campaign.duration')}
							name='duration'
							placeholder={t('campaign.placeholder.duration')}
							value={formData.duration}
							onChange={handleChange}
							maxLength={LIMITS.SHORT_TEXT}
							color={theme.primary}
						/>
					</div>
				)}

				<Button type='submit' fullWidth color={theme.primary} disabled={loading} className='mt-4 flex justify-center'>
					{loading ? t('common.loading') : initialValues ? t('common.save') : t('common.create')}
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
