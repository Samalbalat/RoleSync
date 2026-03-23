import PropTypes from 'prop-types';
import { Card, CardBody, Typography, Avatar } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';

export function ProfileCharacterList({ characters, onCharacterClick }) {
	const { t } = useTranslation('global');
	const theme = getTheme();

	if (characters.length === 0) {
		return <Typography className='italic text-gray-500'>{t('profile.noCharacters')}</Typography>;
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
			{characters.map(char => (
				<Card
					key={char.id}
					className='border border-blue-gray-50 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
					onClick={() => onCharacterClick(char.id)}
				>
					<CardBody className='p-4 flex items-center gap-4'>
						<Avatar
							src={char.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random`}
							alt={char.name}
							className='h-12 w-12 mb-4 shadow-md border-2 border-white ring-2 ring-indigo-50'
							onError={e => {
								e.target.onerror = null;
								e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random`;
							}}
						/>
						<div className='overflow-hidden'>
							<Typography variant='h6' className='truncate'>
								{char.name}
							</Typography>

							{char.campaign_name ? (
								<div
									className={`bg-blue-50 ${theme.textPrimary} px-3 py-1 rounded-full text-xs font-medium w-full truncate mt-2`}
								>
									{char.campaign_name}
								</div>
							) : (
								<div className='bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium w-full truncate mt-2'>
									{t('home.playerCharacters.noCampaign')}
								</div>
							)}
						</div>
					</CardBody>
				</Card>
			))}
		</div>
	);
}

ProfileCharacterList.propTypes = {
	characters: PropTypes.arrayOf(PropTypes.object).isRequired,
	onCharacterClick: PropTypes.func.isRequired,
};
