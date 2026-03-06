import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EyeIcon } from '@heroicons/react/24/solid';
import { Button, List, ListItem, ListItemPrefix, Avatar, Card, Typography, Spinner } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import CharacterDetailDialog from './CharacterDetailDialog';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService'; // <-- Ajusta la ruta a tu servicio
import toast from 'react-hot-toast';

export default function CampaignCharacterList({ campaignId }) {
	const { t } = useTranslation('global');
	const theme = getTheme();

	// Estados del componente
	const [open, setOpen] = useState(false);
	const [selectedCharacterId, setSelectedCharacterId] = useState(null);
	const [characters, setCharacters] = useState([]);
	const [loading, setLoading] = useState(true);

	// Efecto para cargar los personajes cuando el componente se monta o cambia el campaignId
	useEffect(() => {
		if (!campaignId) return;

		const fetchCharacters = async () => {
			try {
				setLoading(true);
				const data = await CharacterService.getCampaignCharacters(campaignId);
				setCharacters(data || []);
			} catch (error) {
				console.error('Error fetching campaign characters:', error);
				toast.error('Error al cargar los personajes de la campaña');
			} finally {
				setLoading(false);
			}
		};

		fetchCharacters();
	}, [campaignId]);

	const handleOpen = id => {
		setSelectedCharacterId(id);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	// Estado de carga (Spinner)
	if (loading) {
		return (
			<Card className='w-full max-w-md shadow-sm border border-blue-gray-50 p-10 flex justify-center items-center'>
				<Spinner className={`h-8 w-8 text-${theme.primary}-500`} />
			</Card>
		);
	}

	// Estado vacío (Sin personajes)
	if (!characters || characters.length === 0) {
		return (
			<Card className='w-full max-w-md shadow-sm border border-blue-gray-50 p-6 text-center'>
				<Typography color='gray' className='italic font-normal'>
					{t('character.list.withoutCharacters')}
				</Typography>
			</Card>
		);
	}

	// Lista de personajes
	return (
		<>
			<Card className='w-full max-w-md shadow-sm border border-blue-gray-50'>
				<div className={`p-4 border-b border-blue-gray-50 ${theme.bgLight} rounded-t-lg`}>
					<Typography variant='h5' color='blue-gray'>
						{t('character.characters')} ({characters.length})
					</Typography>
				</div>
				<List>
					{characters.map(char => (
						<ListItem key={char.id} className='group'>
							<ListItemPrefix>
								<Avatar
									variant='circular'
									alt={char.name}
									src={
										char.avatar_url ||
										`https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random&color=fff`
									}
									onError={e => {
										e.target.onerror = null;
										e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random&color=fff`;
									}}
								/>
							</ListItemPrefix>
							<div>
								<Typography variant='h6' color='blue-gray'>
									{char.name}
								</Typography>
							</div>

							<div className='ml-auto'>
								<Button variant='text' className='hidden group-hover:block p-2' onClick={() => handleOpen(char.id)}>
									<EyeIcon className={`h-5 w-5 ${theme.textPrimary}`} />
								</Button>
							</div>
						</ListItem>
					))}
				</List>
			</Card>

			{/* Diálogo de detalles del personaje */}
			<CharacterDetailDialog open={open} handleClose={handleClose} characterId={selectedCharacterId} />
		</>
	);
}

CampaignCharacterList.propTypes = {
	campaignId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
