export const LANGUAGE_ENUM = {
	SPANISH: 'Español',
	ENGLISH: 'Inglés',
	FRENCH: 'Francés',
	GERMAN: 'Alemán',
	ITALIAN: 'Italiano',
	PORTUGUESE: 'Portugués',
	RUSSIAN: 'Ruso',
	CHINESE: 'Chino',
	JAPANESE: 'Japonés',
	KOREAN: 'Coreano',
	OTHER: 'Otro',
};

export default function parseLanguage(language) {
	return LANGUAGE_ENUM[language] || language || '';
}
