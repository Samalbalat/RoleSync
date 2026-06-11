import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Input, Textarea, Button, Typography, Select, Option, Chip } from '@material-tailwind/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

// 1. CONSTANTES FUERA DEL COMPONENTE
const LIMITS = {
	NAME: 100,
	DESCRIPTION: 255,
	IMAGE: 255,
	SHORT_TEXT: 50,
	TAG: 30,
};
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

// 2. FUNCIONES DE VALIDACIÓN EXTERNAS (Reducen drásticamente las líneas del componente)
const performValidation = (formData, campaignType, t) => {
	const errs = {};
	if (!formData.name.trim()) errs.name = t('errors.required');
	if (!formData.communication) errs.communication = t('errors.required');
	if (!formData.language) errs.language = t('errors.required');
	if (!formData.timeZone) errs.timeZone = t('errors.required');

	if (!formData.description.trim()) {
		errs.description = t('errors.required');
	} else if (formData.description.length > LIMITS.DESCRIPTION) {
		errs.description = t('errors.tooLong255');
	}

	if (!formData.maxPlayers) {
		errs.maxPlayers = t('errors.required');
	} else if (Number.isNaN(formData.maxPlayers) || Number(formData.maxPlayers) <= 0) {
		errs.maxPlayers = t('errors.invalidNumber');
	}

	if (campaignType === 'TABLETOP') {
		['system', 'location', 'dayWeek', 'duration', 'frequency'].forEach(field => {
			if (!formData[field]) errs[field] = t('errors.required');
		});
	}
	return errs;
};

// 3. SUB-COMPONENTE PARA TAGS
export const TagSection = ({ themes, tagInput, setTagInput, onAdd, onRemove, theme, t }) => (
	<div className='mb-4'>
		<div className='relative flex w-full'>
			<Input
				label={t('campaign.themes')}
				value={tagInput}
				onChange={e => setTagInput(e.target.value)}
				onKeyDown={onAdd}
				maxLength={LIMITS.TAG}
				color={theme.primary}
				className='pr-10'
			/>
			<div className='absolute right-2 top-2.5'>
				<PlusIcon className='h-5 w-5 text-gray-400' />
			</div>
		</div>
		<Typography variant='small' className='text-gray-500 mt-1.5 ml-1 flex justify-between'>
			<span>{t('campaign.tagHelper')}</span>
			<span>{themes.length}/6</span>
		</Typography>
		<div className='flex flex-wrap gap-2 mt-3'>
			{themes.map((tag, i) => (
				<Chip
					key={i}
					value={tag}
					onClose={() => onRemove(tag)}
					color={theme.primary}
					variant='ghost'
					className='rounded-full'
				/>
			))}
		</div>
	</div>
);

// 4. COMPONENTE PRINCIPAL
export default function CampaignForm({ initialValues, onSubmit, loading, theme, campaignType }) {
	const { t } = useTranslation('global');
	const [tagInput, setTagInput] = useState('');
	const [errors, setErrors] = useState({});
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

	useEffect(() => {
		if (initialValues) setFormData(prev => ({ ...prev, ...initialValues }));
	}, [initialValues]);

	const updateField = (name, value) => {
		if (!ALLOWED_FIELDS.has(name)) return;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
	};

	const handleAddTag = e => {
		if (e.key === 'Enter' && tagInput.trim() !== '') {
			e.preventDefault();
			if (formData.themes.length >= 6) return setErrors(prev => ({ ...prev, themes: t('errors.maxTags') }));
			if (!formData.themes.includes(tagInput.trim())) {
				updateField('themes', [...formData.themes, tagInput.trim()]);
			}
			setTagInput('');
		}
	};

	const handleSubmit = e => {
		e.preventDefault();
		const vErrors = performValidation(formData, campaignType, t);
		setErrors(vErrors);
		if (Object.keys(vErrors).length === 0) onSubmit(formData);
	};

	const isWritten = campaignType === 'WRITTEN';

	const baseOptions = [
		<Option key='discord' value='Discord'>
			Discord
		</Option>,
		<Option key='inperson' value='In-person'>
			{t('communication.inPerson')}
		</Option>,
	];

	const communicationOptions = isWritten
		? [
				<Option key='rolesync' value='RoleSync'>
					RoleSync
				</Option>,
				...baseOptions,
			]
		: baseOptions;

	return (
		<Card className='p-6 w-full bg-white shadow-sm border border-gray-200'>
			<form onSubmit={handleSubmit} className='flex flex-col gap-6'>
				{/* Nombre y Descripción */}
				<div className='flex flex-col gap-4'>
					<Input
						label={t('campaign.name')}
						name='name'
						value={formData.name}
						onChange={e => updateField('name', e.target.value)}
						maxLength={LIMITS.NAME}
						color={theme.primary}
						error={!!errors.name}
					/>

					<Textarea
						label={t('campaign.description')}
						name='description'
						value={formData.description}
						onChange={e => updateField('description', e.target.value)}
						maxLength={LIMITS.DESCRIPTION}
						color={theme.primary}
						error={!!errors.description}
					/>
				</div>

				<Input
					label={t('campaign.image')}
					name='image'
					value={formData.image}
					onChange={e => updateField('image', e.target.value)}
					color={theme.primary}
					placeholder='https://...'
				/>

				{/* Grid de Configuración */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<Input
						label={t('campaign.maxPlayers')}
						name='maxPlayers'
						type='number'
						value={formData.maxPlayers}
						onChange={e => updateField('maxPlayers', e.target.value)}
						color={theme.primary}
						error={!!errors.maxPlayers}
					/>

					<Select
						label={t('campaign.language')}
						value={formData.language}
						onChange={v => updateField('language', v)}
						color={theme.primary}
					>
						<Option value='Español'>Español</Option>
						<Option value='English'>English</Option>
						<Option value='Other'>{t('common.other')}</Option>
					</Select>

					<Select
						label={t('campaign.timeZone')}
						value={formData.timeZone}
						onChange={v => updateField('timeZone', v)}
						color={theme.primary}
					>
						<Option value='GMT'>GMT</Option>
						<Option value='CET'>CET</Option>
					</Select>

					<Select
						label={t('campaign.communication')}
						value={formData.communication}
						onChange={v => updateField('communication', v)}
						color={theme.primary}
					>
						{communicationOptions}
					</Select>
				</div>

				<TagSection
					themes={formData.themes}
					tagInput={tagInput}
					setTagInput={setTagInput}
					onAdd={handleAddTag}
					onRemove={tag =>
						updateField(
							'themes',
							formData.themes.filter(t => t !== tag),
						)
					}
					theme={theme}
					t={t}
				/>

				{!isWritten && (
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border'>
						<Input
							label={t('campaign.system')}
							value={formData.system}
							onChange={e => updateField('system', e.target.value)}
							color={theme.primary}
							error={!!errors.system}
						/>
						<Input
							label={t('campaign.location')}
							value={formData.location}
							onChange={e => updateField('location', e.target.value)}
							color={theme.primary}
							error={!!errors.location}
						/>
						<Select
							label={t('campaign.dayWeek')}
							value={formData.dayWeek}
							onChange={v => updateField('dayWeek', v)}
							color={theme.primary}
							error={!!errors.dayWeek}
						>
							<Option value='Lunes'>Lunes</Option>
							<Option value='Martes'>Martes</Option>
							<Option value='Miércoles'>Miércoles</Option>
							<Option value='Jueves'>Jueves</Option>
							<Option value='Viernes'>Viernes</Option>
							<Option value='Sábado'>Sábado</Option>
							<Option value='Domingo'>Domingo</Option>
						</Select>

						{/* Frecuencia */}
						<Select
							label={t('campaign.frequency')}
							value={formData.frequency}
							onChange={v => updateField('frequency', v)}
							color={theme.primary}
							error={!!errors.frequency}
						>
							<Option value='Semanal'>Semanal</Option>
							<Option value='Quincenal'>Quincenal</Option>
							<Option value='Mensual'>Mensual</Option>
						</Select>

						{/* Duración */}
						<Input
							label={t('campaign.duration')}
							value={formData.duration}
							onChange={e => updateField('duration', e.target.value)}
							color={theme.primary}
							error={!!errors.duration}
							placeholder='Ej: 3 horas'
						/>
					</div>
				)}

				<Button type='submit' fullWidth color={theme.primary} disabled={loading}>
					{loading ? t('common.loading') : initialValues ? t('common.save') : t('common.create')}
				</Button>
			</form>
		</Card>
	);
}

TagSection.propTypes = {
	themes: PropTypes.array,
	tagInput: PropTypes.string,
	setTagInput: PropTypes.func,
	onAdd: PropTypes.func,
	onRemove: PropTypes.func,
	theme: PropTypes.shape({
		primary: PropTypes.string,
	}),
	t: PropTypes.func,
};

CampaignForm.propTypes = {
	initialValues: PropTypes.object,
	onSubmit: PropTypes.func,
	loading: PropTypes.bool,
	theme: PropTypes.shape({
		primary: PropTypes.string,
	}),
	campaignType: PropTypes.oneOf(['TABLETOP', 'WRITTEN']),
};
