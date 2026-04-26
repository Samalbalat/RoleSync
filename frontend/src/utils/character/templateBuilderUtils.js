import { validateMinMax, validateRequired } from '../validators';

export const generateInternalKey = label => {
	const cleanLabel = label
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036f]/g, '')
		.replaceAll(/\s+/g, '_')
		.replaceAll(/[^a-z0-9_]/g, '');

	const randomSuffix = Math.random().toString(36).substring(2, 6);

	return `${cleanLabel}_${randomSuffix}`;
};

export const validateField = currentField => {
	const labelError = validateRequired(currentField.label);
	if (labelError) return { label: labelError };
	
	const minMaxError = validateMinMax(
		currentField.min,
		currentField.max
	);

	if (minMaxError) {
		return { minMax: minMaxError };
	}

	return null;
};

export const buildTemplatePayload = ({
	fields,
	templateName,
	campaignId,
	templateId,
	isEditMode,
}) => ({
	name: templateName,
	avatar_url: '',
	campaign_id: Number(campaignId),
	template_id: isEditMode
		? Number(templateId)
		: null,
	attributes: fields.map(field => ({
		key: field.key,
		label: field.label,
		type: field.type,
		required: field.required,
		min: field.min,
		max: field.max,
	})),
});

export const mapBackendSchemaToFields = schema =>
	(schema || []).map(attr => ({
		key: attr.key,
		label: attr.label,
		type: attr.type,
		required: attr.required || false,
		min: attr.min ?? '',
		max: attr.max ?? '',
	}));

export const rangeMin = field =>
	field.min !== '' && field.min !== null
		? field.min
		: '-';

export const rangeMax = field =>
	field.max !== '' && field.max !== null
		? field.max
		: '-';