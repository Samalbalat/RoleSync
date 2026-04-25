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
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService';
import { parseCharacterFields, getDisplayValue, buildAvatarFallback } from '../../utils/character/characterDetailUtils';

// --- SUBCOMPONENTE DE CARGA ---
const LoadingContent = ({ theme, t }) => (
	<div className='flex flex-col items-center justify-center h-64 gap-4'>
		<Spinner className={`h-12 w-12 text-${theme.primary}-500`} />
		<Typography color='gray'>{t('character.message.loadingCharacter')}</Typography>
	</div>
);

// --- SUBCOMPONENTE DEL DIALOG HEADER ---
const CharacterHeader = ({ character, theme, t }) => (
	<DialogHeader className={`flex items-center gap-4 border-b border-gray-200 ${theme.bgLight} p-4 rounded-t-lg`}>
		<Avatar
			src={character.image || buildAvatarFallback(character.name)}
			alt={character.name}
			size='xl'
			className={`border-2 ${theme.textPrimary} shadow-sm`}
			onError={e => {
				e.target.onerror = null;
				e.target.src = buildAvatarFallback(character.name);
			}}
		/>
		<div>
			<Typography variant='h4' color={theme.primary}>
				{character.name}
			</Typography>
			<Typography variant='small' color='blue-gray' className='font-normal'>
				{t('campaign.campaign')}: {character.campaign?.name || t('home.playerCharacters.noCampaign')}
			</Typography>
		</div>
	</DialogHeader>
);

// --- SUBCOMPONENTE DEL BODY ---
const CharacterBody = ({ character, theme, t }) => {
	const { history, description, standardAttributes } = parseCharacterFields(character.schema);

	return (
		<DialogBody className='h-[25rem] overflow-y-auto'>
			{history && (
				<div className='mb-6'>
					<Typography variant='h6' color='blue-gray' className='mb-2'>
						{t('character.history')}
					</Typography>
					<Typography className='font-normal text-gray-600 whitespace-pre-line'>{history}</Typography>
				</div>
			)}

			{description && (
				<div className='mb-6'>
					<Typography variant='h6' color='blue-gray' className='mb-2'>
						{t('character.description')}
					</Typography>
					<Typography className='font-normal text-gray-600 whitespace-pre-line'>{description}</Typography>
				</div>
			)}

			{standardAttributes.length > 0 && (
				<>
					<Typography variant='h6' color='blue-gray' className='mb-4'>
						{t('character.attributes')}
					</Typography>

					<div className='grid grid-cols-2 gap-4'>
						{standardAttributes.map((attr, index) => (
							<div
								key={index}
								className='bg-gray-50 p-4 rounded-lg text-center shadow-sm border border-gray-100 flex flex-col justify-center'
							>
								<Typography
									variant='small'
									color='blue-gray'
									className='font-bold uppercase text-xs opacity-70 mb-1 truncate px-2'
									title={attr.key} // Por si el texto es muy largo, al pasar el ratón se ve completo
								>
									{attr.key}
								</Typography>
								<Typography
									variant='h5'
									color={theme.primary}
									className='truncate px-2'
									title={getDisplayValue(attr.value, t)}
								>
									{getDisplayValue(attr.value, t)}
								</Typography>
							</div>
						))}
					</div>
				</>
			)}

			{/* Si el personaje no tiene atributos, historia ni descripción */}
			{!history && !description && standardAttributes.length === 0 && (
				<div className='text-center py-10'>
					<Typography color='gray' className='italic'>
						{t('character.noAttributes')}
					</Typography>
				</div>
			)}
		</DialogBody>
	);
};

// --- COMPONENTE PRINCIPAL ---
export default function CharacterDetailDialog({ open, handleClose, characterId }) {
	const { t } = useTranslation('global');
	const theme = getTheme();
	const [character, setCharacter] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!open || !characterId) return; // Si no está abierto, no hacer nada

		setIsLoading(true);
		CharacterService.getCharacterById(characterId)
			.then(data => setCharacter(data))
			.catch(error => {
				console.error(error);
				toast.error(t('errors.fetchCharacter'));
				handleClose();
			})
			.finally(() => setIsLoading(false));
		return () => {};
	}, [open, characterId, handleClose, t]);

	return (
		<Dialog open={open} handler={handleClose} size='md' dismiss={{ enabled: true }} className='focus:outline-none'>
			{isLoading || !character ? (
				<div className='p-10'>
					<LoadingContent theme={theme} t={t} />
				</div>
			) : (
				<>
					<CharacterHeader character={character} theme={theme} t={t} />
					<CharacterBody character={character} theme={theme} t={t} />
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

LoadingContent.propTypes = {
	theme: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
};

CharacterHeader.propTypes = {
	character: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
};

CharacterBody.propTypes = {
	character: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
};
