export const WEEKDAY_ENUM = {
	MONDAY: 'Lunes',
	TUESDAY: 'Martes',
	WEDNESDAY: 'Miércoles',
	THURSDAY: 'Jueves',
	FRIDAY: 'Viernes',
	SATURDAY: 'Sábado',
	SUNDAY: 'Domingo',
};

export default function parseWeekday(weekday) {
	return WEEKDAY_ENUM[weekday] || weekday || '';
}
