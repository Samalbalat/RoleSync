import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Rating, Typography } from '@material-tailwind/react';

export default function StarRatingBadge({
	averageRating = 0,
	totalReviews = 0,
	showCount = true,
	size = 'sm',
	textColor = 'text-blue-gray-900',
}) {
	const { t } = useTranslation('global');
	const roundedRating = Math.round(averageRating);

	if (totalReviews === 0) {
		return (
			<Typography variant='small' className={`text-xs italic ${textColor}`}>
				{t('reviews.noReviews')}
			</Typography>
		);
	}

	return (
		<div className='flex items-center gap-1.5'>
			<Rating value={roundedRating} readonly className='text-amber-500' />
			<div className='flex items-center gap-1'>
				<Typography className={`font-medium ${size === 'sm' ? 'text-sm' : 'text-base'} ${textColor}`}>
					{averageRating.toFixed(1)}
				</Typography>
				{showCount && (
					<Typography
						variant='small'
						className={`font-normal ${size === 'sm' ? 'text-xs' : 'text-sm'} opacity-80 ${textColor}`}
					>
						({totalReviews})
					</Typography>
				)}
			</div>
		</div>
	);
}

StarRatingBadge.propTypes = {
	averageRating: PropTypes.number,
	totalReviews: PropTypes.number,
	showCount: PropTypes.bool,
	size: PropTypes.oneOf(['sm', 'md', 'lg']),
	textColor: PropTypes.string,
};
