import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Button,
	Typography,
	Avatar,
	Spinner,
} from '@material-tailwind/react';
import { fetchCharacterById } from '../../data/mockCharacters';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';

export default function CharacterDetailDialog({ open, handleClose, characterId }) {
	const { t } = useTranslation('global');
	const theme = getTheme();
	const [character, setCharacter] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	// SIMULAMOS LA API
	useEffect(() => {
		if (open && characterId) {
			setIsLoading(true);
			fetchCharacterById(characterId).then(data => {
				setCharacter(data);
				setIsLoading(false);
			});
		} else {
			setTimeout(() => setCharacter(null), 300);
		}
	}, [open, characterId]);

	const getDisplayValue = value => {
		if (typeof value === 'boolean') {
			return value ? t('common.yes') : t('common.no');
		}
		return value;
	};

	return (
		<Dialog
			open={open}
			handler={handleClose}
			size='md'
			animate={{
				mount: { scale: 1, y: 0 },
				unmount: { scale: 0.9, y: -100 },
			}}
		>
			{isLoading || !character ? (
				<div className='flex flex-col items-center justify-center h-64 gap-4'>
					<Spinner className={`h-12 w-12 text-${theme.primary}-500`} />
					<Typography color='gray'>{t('character.message.loadingCharacter')}</Typography>
				</div>
			) : (
				<>
					<DialogHeader className={`flex items-center gap-4 border-b border-gray-200 ${theme.bgLight} p-4 rounded-t-lg`}>
						<Avatar
							src={character.avatar_url || `https://ui-avatars.com/api/?name=${character.name}&background=random`}
							alt={character.name}
							size='xl'
							className={`border-2 ${theme.textPrimary} shadow-sm`}
							onError={e => {
								e.target.onerror = null;
								e.target.src = `https://ui-avatars.com/api/?name=${character.name}&background=random`;
							}}
						/>
						<div>
							<Typography variant='h4' color={theme.textPrimary}>
								{character.name}
							</Typography>
							<Typography variant='small' color={theme.textSecondary} className='font-normal'>
								{t('campaign.campaign')}: {character.campaign_name}
							</Typography>
						</div>
					</DialogHeader>

					<DialogBody className='h-[25rem] overflow-y-auto'>
						{(character.attributes?.Historia || character.attributes?.History) && (
							<div className='mb-6'>
								<Typography variant='h6' color='blue-gray' className='mb-2'>
									{t('character.history')}
								</Typography>
								<Typography className='font-normal text-gray-600 whitespace-pre-line'>
									{character.attributes.Historia || character.attributes.History}
								</Typography>
							</div>
						)}
						{(character.attributes?.Descripción || character.attributes?.Description) && (
							<div className='mb-6'>
								<Typography variant='h6' color='blue-gray' className='mb-2'>
									{t('character.description')}
								</Typography>
								<Typography className='font-normal text-gray-600 whitespace-pre-line'>
									{character.attributes.Descripción || character.attributes.Description}
								</Typography>
							</div>
						)}

						<Typography variant='h6' color='blue-gray' className='mb-4'>
							{t('character.attributes')}
						</Typography>

						<div className='grid grid-cols-2 gap-4'>
							{Object.entries(character.attributes).map(([key, value]) => {
								if (key === 'Historia' || key === 'Descripción' || key === 'History' || key === 'Description') return null;

								const displayValue = getDisplayValue(value);
								return (
									<div key={key} className='bg-gray-50 p-4 rounded-lg text-center shadow-sm border border-gray-100'>
										<Typography variant='small' color='blue-gray' className='font-bold uppercase text-xs opacity-70 mb-1'>
											{key}
										</Typography>
										<Typography variant='h5' color={theme.primary}>
											{displayValue}
										</Typography>
									</div>
								);
							})}
						</div>
					</DialogBody>

					<DialogFooter className='border-t border-gray-200'>
						<Button variant='text' color='blue-gray' onClick={handleClose}>
							{t('common.close')}
						</Button>
					</DialogFooter>
				</>
			)}
		</Dialog>
	);
}

CharacterDetailDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	characterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
