export const HISTORY_LABELS = ['historia', 'history'];

export const DESCRIPTION_LABELS = [
	'descripción',
	'descripcion',
	'description',
];

export const parseCharacterFields = schema => {
	let history = null;
	let description = null;
	const standardAttributes = [];

	(schema || []).forEach(attr => {
		const label = attr.label || attr.key;
		const labelLower = label.toLowerCase();

		if (HISTORY_LABELS.includes(labelLower)) {
			history = attr.value;
			return;
		}

		if (DESCRIPTION_LABELS.includes(labelLower)) {
			description = attr.value;
			return;
		}

		standardAttributes.push({
			key: label,
			value: attr.value,
		});
	});

	return {
		history,
		description,
		standardAttributes,
	};
};

export const getDisplayValue = (value, t) => {
	if (typeof value === 'boolean') {
		return value
			? t('common.yes')
			: t('common.no');
	}

	if (
		value === null ||
		value === undefined ||
		value === ''
	) {
		return '-';
	}

	return value;
};

export const buildAvatarFallback = name =>
	`https://ui-avatars.com/api/?name=${encodeURIComponent(
		name
	)}&background=random`;