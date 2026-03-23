import React, { useEffect, useState } from 'react';
import {
	Card,
	CardBody,
	Typography,
	Input,
	Select,
	Option,
	Button,
	Checkbox,
	IconButton,
	Spinner,
} from '@material-tailwind/react';
import { TrashIcon, PlusIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { validateMinMax, validateRequired } from '../../utils/validators';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService';

export default function TemplateBuilder() {
	const { t } = useTranslation('global');
	const navigate = useNavigate();

	// --- PARÁMETROS DE LA URL ---
	const [searchParams] = useSearchParams();
	const campaignId = searchParams.get('campaignId');
	const templateId = searchParams.get('templateId');
	const isEditMode = !!templateId;

	const theme = getTheme();

	// --- ESTADOS GENERALES ---
	const [isLoading, setIsLoading] = useState(isEditMode);
	const [templateName, setTemplateName] = useState('');
	const [fields, setFields] = useState([]);
	const [editingIndex, setEditingIndex] = useState(null);
	const [errors, setErrors] = useState({});

	const [currentField, setCurrentField] = useState({
		label: '',
		type: 'short_text',
		required: false,
		min: '',
		max: '',
	});

	const fieldTypes = [
		{ value: 'short_text', label: t('character.templateBuilder.shortTextDes') },
		{ value: 'long_text', label: t('character.templateBuilder.longTextDes') },
		{ value: 'number', label: t('character.templateBuilder.numberDes') },
		{ value: 'boolean', label: t('character.templateBuilder.checkboxDes') },
	];

	useEffect(() => {
		if (isEditMode) {
			const fetchTemplateData = async () => {
				try {
					const data = await CharacterService.getTemplateById(templateId);
					setTemplateName(data.name || '');

					// Mapeamos los atributos del backend a nuestro formato del frontend
					if (data.schema && data.schema.length > 0) {
						const mappedFields = data.schema.map(attr => ({
							key: attr.key,
							label: attr.label,
							type: attr.type,
							// Si el backend te devuelve required, min y max, los usamos. Si no, valores por defecto.
							required: attr.required || false,
							min: attr.min ?? '',
							max: attr.max ?? '',
						}));
						setFields(mappedFields);
					}
				} catch (error) {
					console.error('Error al cargar la plantilla:', error);
					toast.error(t('character.templateBuilder.errorLoadCharacter'));
				} finally {
					setIsLoading(false);
				}
			};

			fetchTemplateData();
		}
	}, [templateId, isEditMode, t]);

	const generateInternalKey = label => {
		const cleanLabel = label
			.toLowerCase()
			.normalize('NFD')
			.replaceAll(/[\u0300-\u036f]/g, '')
			.replaceAll(/\s+/g, '_')
			.replaceAll(/[^a-z0-9_]/g, '');

		const randomSuffix = Math.random().toString(36).substring(2, 6);
		return `${cleanLabel}_${randomSuffix}`;
	};

	const handleChange = (name, value) => {
		const allowedKeys = ['label', 'type', 'required', 'min', 'max'];
		if (!allowedKeys.includes(name)) return;

		setCurrentField(prev => ({ ...prev, [name]: value }));

		if (Object.hasOwn(errors, name)) {
			setErrors(prev => ({ ...prev, [name]: null }));
		}
	};

	const saveField = () => {
		const labelError = validateRequired(currentField.label);
		const minMaxError = validateMinMax(currentField.min, currentField.max);

		if (labelError) {
			setErrors({ label: labelError });
			return;
		}

		if (minMaxError) {
			setErrors({ minMax: minMaxError });
			return;
		}

		if (typeof editingIndex === 'number') {
			setFields(prevFields => prevFields.map((field, idx) => (idx === editingIndex ? currentField : field)));
			setEditingIndex(null);
		} else {
			const newFieldWithKey = {
				...currentField,
				key: generateInternalKey(currentField.label),
			};
			setFields([...fields, newFieldWithKey]);
		}
		resetForm();
	};

	const resetForm = () => {
		setCurrentField({ label: '', type: 'short_text', required: false, min: '', max: '' });
		setEditingIndex(null);
		setErrors({});
	};

	const startEditing = index => {
		const fieldToEdit = fields.find((_, idx) => idx === index);

		if (fieldToEdit) {
			setCurrentField(fieldToEdit);
			setEditingIndex(index);
			setErrors({});
		}
	};

	const removeField = indexToRemove => {
		setFields(fields.filter((_, index) => index !== indexToRemove));
		if (editingIndex === indexToRemove) {
			resetForm();
		}
	};
	const isEditing = typeof editingIndex === 'number';

	// --- MANEJADOR DE ENVÍO CONECTADO AL BACKEND ---
	const handleSubmitTemplate = async e => {
		e.preventDefault();

		if (!templateName.trim()) {
			toast.error(t('character.templateBuilder.errorNoName'));
			return;
		}

		if (fields.length === 0) {
			toast.error(t('character.templateBuilder.errorNoFields'));
			return;
		}

		if (!campaignId) {
			toast.error(t('character.templateBuilder.errorNoCampaignId'));
			return;
		}

		const mappedAttributes = fields.map(field => ({
			key: field.key,
			label: field.label,
			type: field.type,
			required: field.required,
			min: field.min,
			max: field.max,
		}));

		const payload = {
			name: templateName,
			avatar_url: '',
			campaign_id: Number(campaignId),
			template_id: isEditMode ? Number(templateId) : null,
			attributes: mappedAttributes,
		};

		try {
			// --- DECISIÓN: ¿CREAR O ACTUALIZAR? ---
			if (isEditMode) {
				await CharacterService.updateTemplate(templateId, payload);
				toast.success(t('character.templateBuilder.successUpdate'));
			} else {
				await CharacterService.createTemplate(payload);
				toast.success(t('character.templateBuilder.successSave'));
			}

			setTimeout(() => {
				navigate(`/campaign/${campaignId}`);
			}, 1000);
		} catch (error) {
			console.error('Error al guardar la plantilla:', error);
			toast.error(t('character.templateBuilder.errorSave'));
		}
	};

	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center h-[60vh] gap-4'>
				<Spinner className={`h-10 w-10 ${theme.primary}`} />
				<Typography variant='h5' color='blue-gray'>
					{t('character.templateBuilder.loadigData')}
				</Typography>
			</div>
		);
	}
	const rangeMin = field => (field.min !== '' && field.min !== null ? field.min : '-');
	const rangeMax = field => (field.max !== '' && field.max !== null ? field.max : '-');

	return (
		<div className='w-full max-w-4xl mx-auto p-4 space-y-6'>
			<div className='text-center'>
				<Typography variant='h3' color='blue-gray'>
					{isEditMode ? t('character.templateBuilder.titleEdit') : t('character.templateBuilder.title')}
				</Typography>
				<Typography color='gray' className='mt-1 font-normal'>
					{t('character.templateBuilder.description')}
				</Typography>
			</div>

			<Card className='w-full shadow-sm border border-blue-gray-100'>
				<CardBody>
					<Input
						label={t('character.templateBuilder.templateName')}
						value={templateName}
						onChange={e => setTemplateName(e.target.value)}
						required
					/>
				</CardBody>
			</Card>

			{fields.length > 0 && (
				<Card className='w-full border border-blue-gray-100 shadow-sm'>
					<CardBody className='flex flex-col gap-4'>
						<Typography variant='h5' color='blue-gray' className='mb-2'>
							{t('character.templateBuilder.fields', { count: fields.length })}
						</Typography>
						{fields.map((field, index) => (
							<div
								key={field.key || index}
								className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
									editingIndex === index ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
								}`}
							>
								<div>
									<Typography variant='h6' color='blue-gray'>
										{field.label} {field.required && <span className='text-red-500'>*</span>}
									</Typography>
									<Typography variant='small' color='gray' className='font-mono'>
										{t('character.templateBuilder.type')}: {fieldTypes.find(t => t.value === field.type)?.label}
										{field.type === 'number' &&
											(field.min !== '' || field.max !== '')(
												<>
													{t('character.templateBuilder.range')}: {rangeMin(field)} - {rangeMax(field)}
												</>,
											)}
									</Typography>
								</div>
								<div className='flex gap-2'>
									<IconButton
										color='blue'
										variant='text'
										onClick={() => startEditing(index)}
										disabled={editingIndex === index}
									>
										<PencilIcon className='h-5 w-5' />
									</IconButton>
									<IconButton color='red' variant='text' onClick={() => removeField(index)}>
										<TrashIcon className='h-5 w-5' />
									</IconButton>
								</div>
							</div>
						))}
					</CardBody>
				</Card>
			)}

			{/* FORMULARIO PARA AÑADIR/EDITAR CAMPO */}
			<Card className={`w-full shadow-md border-t-4 ${isEditing ? theme.border : 'border-t-transparent'}`}>
				<CardBody className='flex flex-col gap-4'>
					<div className='flex justify-between items-center'>
						<Typography variant='h5' color={editingIndex === null ? 'blue-gray' : 'blue'}>
							{editingIndex === null
								? t('character.templateBuilder.newField')
								: `${t('character.templateBuilder.editing')}: ${currentField.label}`}
						</Typography>
						{isEditing && (
							<Button size='sm' variant='text' color='gray' onClick={resetForm} className='flex gap-2'>
								<XMarkIcon className='h-4 w-4' /> {t('character.templateBuilder.cancel')}
							</Button>
						)}
					</div>

					{/* INPUT DEL NOMBRE CON MANEJO DE ERRORES */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
						<Input
							label={t('character.templateBuilder.nameField')}
							value={currentField.label}
							onChange={e => handleChange('label', e.target.value)}
							error={!!errors.label}
						/>
						{errors.label && (
							<Typography variant='small' color='red' className='mt-1 flex items-center gap-1 font-normal'>
								<span className='font-medium'>{t(errors.label)}</span>
							</Typography>
						)}
						<div className='w-full'>
							<Select
								label={t('character.templateBuilder.type')}
								value={currentField.type}
								onChange={val => handleChange('type', val)}
							>
								{fieldTypes.map(type => (
									<Option key={type.value} value={type.value}>
										{type.label}
									</Option>
								))}
							</Select>
						</div>
					</div>

					<div className='flex items-center mt-2'>
						<Checkbox
							label={t('character.templateBuilder.requiredField')}
							checked={currentField.required}
							onChange={e => handleChange('required', e.target.checked)}
						/>
					</div>

					{currentField.type === 'number' && (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-gray-50/50 rounded-lg border border-blue-gray-100 mt-2'>
							<Input
								type='number'
								label={t('character.templateBuilder.minValue')}
								value={currentField.min}
								onChange={e => handleChange('min', e.target.value)}
							/>
							<Input
								type='number'
								label={t('character.templateBuilder.maxValue')}
								value={currentField.max}
								onChange={e => handleChange('max', e.target.value)}
							/>
						</div>
					)}

					<Button
						className='flex items-center justify-center gap-2 mt-4'
						onClick={saveField}
						color={editingIndex === null ? 'gray' : 'blue'}
					>
						{editingIndex === null ? (
							<>
								<PlusIcon className='h-5 w-5' /> {t('character.templateBuilder.addField')}
							</>
						) : (
							<>
								<CheckIcon className='h-5 w-5' /> {t('character.templateBuilder.updateField')}
							</>
						)}
					</Button>
				</CardBody>
			</Card>

			<form onSubmit={handleSubmitTemplate} className='flex justify-end mt-8 border-t pt-6'>
				<Button type='submit' color='green' size='lg' disabled={fields.length === 0}>
					{isEditMode ? t('character.templateBuilder.updateTemplate') : t('character.templateBuilder.saveTemplate')}
				</Button>
			</form>
		</div>
	);
}
