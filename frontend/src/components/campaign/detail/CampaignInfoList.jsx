import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-tailwind/react';
import {
	LanguageIcon,
	GlobeAmericasIcon,
	ChatBubbleLeftRightIcon,
	BookOpenIcon,
	MapPinIcon,
	ClockIcon,
	CalendarDaysIcon,
	ClockIcon as ClockOutlineIcon,
} from '@heroicons/react/24/outline';

const InfoRow = ({ icon: IconComponent, color, title, value }) => {
	if (!value) return null;

	const colorMap = new Map([
		['blue', 'bg-blue-50 text-blue-600'],
		['indigo', 'bg-indigo-50 text-indigo-600'],
		['green', 'bg-green-50 text-green-600'],
		['purple', 'bg-purple-50 text-purple-600'],
		['teal', 'bg-teal-50 text-teal-600'],
		['orange', 'bg-orange-50 text-orange-600'],
		['pink', 'bg-pink-50 text-pink-600'],
		['gray', 'bg-gray-100 text-gray-600'],
	]);

	const activeClass = colorMap.get(color) || 'bg-gray-100 text-gray-600';

	return (
		<div className='p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors'>
			<div className={`p-2 rounded-lg ${activeClass}`}>
				<IconComponent className='h-6 w-6' />
			</div>
			<div>
				<Typography variant='small' className='font-bold text-gray-900'>
					{title}
				</Typography>
				<Typography variant='small' className='text-gray-600 font-medium'>
					{value}
				</Typography>
			</div>
		</div>
	);
};

export default function CampaignInfoList({ campaign, isWritten, t }) {
	return (
		<div className='divide-y divide-gray-100'>
			<InfoRow icon={LanguageIcon} color='blue' title={t('campaign.language')} value={campaign.language} />
			<InfoRow icon={GlobeAmericasIcon} color='indigo' title={t('campaign.timeZone')} value={campaign.timeZone} />
			<InfoRow
				icon={ChatBubbleLeftRightIcon}
				color='green'
				title={t('campaign.communication')}
				value={campaign.communication}
			/>
			{!isWritten && (
				<>
					<InfoRow icon={BookOpenIcon} color='purple' title={t('campaign.system')} value={campaign.system} />
					<InfoRow icon={MapPinIcon} color='teal' title={t('campaign.location')} value={campaign.location} />
					<InfoRow icon={ClockOutlineIcon} color='teal' title={t('campaign.frequency')} value={campaign.frequency} />
					<InfoRow icon={CalendarDaysIcon} color='orange' title={t('campaign.dayWeek')} value={campaign.dayWeek} />
					<InfoRow
						icon={ClockIcon}
						color='pink'
						title={t('campaign.duration')}
						value={campaign.duration ? `${campaign.duration}` : null}
					/>
				</>
			)}
		</div>
	);
}

CampaignInfoList.propTypes = {
	campaign: PropTypes.object.isRequired,
	isWritten: PropTypes.bool.isRequired,
	t: PropTypes.func.isRequired,
};

InfoRow.propTypes = {
	icon: PropTypes.elementType.isRequired,
	color: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
