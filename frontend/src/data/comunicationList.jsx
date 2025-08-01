export const COMUNICATION = {
	LOCAL: 'Local',
	IN_PERSON: 'En Persona',
	DISCORD: 'Discord',
	TWITTER: 'Twitter',
	WHATSAPP: 'WhatsApp',
	TELEGRAM: 'Telegram',
	FACEBOOK: 'Facebook',
	ZOOM: 'Zoom',
	OTHER: 'Otro',
};

export default function parseCommunicationType(type) {
	return COMUNICATION[type] || type || '';
}
