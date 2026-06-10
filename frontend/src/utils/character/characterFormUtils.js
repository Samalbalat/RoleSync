export const buildRandomSuffix = () =>
	Math.random()
		.toString(36)
		.substring(2,6);

export const buildSafeKey = key =>
	key
		.trim()
		.toLowerCase()
		.replaceAll(/[^a-z0-9]/g,'');


export const buildCharacterAttribute = attr => ({
	key: `${buildSafeKey(attr.key)}_${buildRandomSuffix()}`,
	label: attr.key.trim(),
	type: attr.type,
	required: false,
	min:0,
	max:0,
	value: attr.value || '',
});


export const formatAttributes = attrs =>
	attrs
		.filter(a=>a.key.trim() !== '')
		.map(buildCharacterAttribute);