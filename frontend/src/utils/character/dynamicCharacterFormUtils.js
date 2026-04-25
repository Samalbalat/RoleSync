export const normalizeAttributeValue = (field, rawValue) => {
	if (field.type === 'number' && Number.isNaN(rawValue)) {
		return null;
	}

	if (field.type === 'boolean' && rawValue === undefined) {
		return false;
	}

	if (rawValue === undefined) {
		return '';
	}

	return rawValue;
};

export const buildDynamicAttribute = (field, userAttributes) => ({
	key: field.key,
	label: field.label,
	type: field.type,
	required: !!field.required,
	min: field.min || 0,
	max: field.max || 0,
	value: normalizeAttributeValue(field, userAttributes[field.key]),
});

export const formatDynamicAttributes = (schemaDefinition, userAttributes = {}) =>
	schemaDefinition.map(field => buildDynamicAttribute(field, userAttributes));

export const buildCharacterPayload = ({ data, templateData }) => ({
	name: data.name,
	avatar_url: data.avatar_url || '',
	campaign_id: Number(templateData.campaign_id),
	template_id: Number(templateData.id),
	attributes: formatDynamicAttributes(
		templateData.schema_definition,
		data.attributes || {},
	),
});