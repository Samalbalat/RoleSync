import { useEffect, useState } from 'react';
import { Typography, Spinner, Card, CardBody, Avatar } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';
import { useAuth } from '../../utils/AuthContext';
import characterService from '../../services/CharacterService';
import CharacterDetailDialog from '../../components/character/CharacterDetailDialog';
import { UserCircleIcon } from '@heroicons/react/24/outline';

function LoadingScreen() {
	const theme = getTheme();
	return (
		<div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
			<Spinner className={`h-12 w-12 ${theme.textSecondary}`} color={theme.secondary} />
		</div>
	);
}

export default function MyCharactersPage() {
	const { activeProfile } = useAuth();
	const { t } = useTranslation('global');
	const theme = getTheme();

	const [characters, setCharacters] = useState([]);
	const [loading, setLoading] = useState(true);

	// Estados para el modal de detalle del personaje
	const [selectedCharacterId, setSelectedCharacterId] = useState(null);
	const [openCharacterDetail, setOpenCharacterDetail] = useState(false);

	useEffect(() => {
		const fetchCharacters = async () => {
			try {
				setLoading(true);
				const charData = await characterService.getMyCharacters();
				setCharacters(Array.isArray(charData) ? charData : []);
			} catch (error) {
				console.error('Error cargando personajes', error);
			} finally {
				setLoading(false);
			}
		};

		if (activeProfile) {
			fetchCharacters();
		}
	}, [activeProfile]);

	const handleOpenCharacter = id => {
		setSelectedCharacterId(id);
		setOpenCharacterDetail(true);
	};

	if (loading) return <LoadingScreen />;

	return (
		<div className='max-w-7xl mx-auto px-4 py-8'>
			<div className='mb-8 border-b border-gray-200 pb-4'>
				<Typography variant='h3' color='blue-gray' className='flex items-center gap-3'>
					<UserCircleIcon className={`w-8 h-8 ${theme.textPrimary}`} />
					{t('home.playerCharacters.title', 'Mis Personajes')}
				</Typography>
				<Typography variant='paragraph' className='text-gray-500 mt-2'>
					{t('home.playerCharacters.description', 'Aquí puedes ver y gestionar todos tus personajes.')}
				</Typography>
			</div>

			<div className='bg-white rounded-xl shadow-sm border border-blue-gray-50 p-6'>
				{characters.length > 0 ? (
					/* --- GRID RESPONSIVO PARA LAS CARTAS --- */
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'>
						{characters.map(char => (
							<Card
								key={char.id}
								className='w-full cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden'
								onClick={() => handleOpenCharacter(char.id)}
							>
								<CardBody className='flex flex-col items-center text-center p-6'>
									<Avatar
										src={char.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random`}
										alt={char.name}
										className='h-24 w-24 mb-4 shadow-md border-2 border-white ring-2 ring-indigo-50'
										onError={e => {
											e.target.onerror = null;
											e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random`;
										}}
									/>
									<Typography variant='h5' color='blue-gray' className='mb-1 w-full truncate text-lg'>
										{char.name}
									</Typography>

									{char.campaign_name ? (
										<div
											className={`bg-blue-50 ${theme.textPrimary} px-3 py-1.5 rounded-full text-xs font-medium w-full truncate mt-2`}
										>
											{char.campaign_name}
										</div>
									) : (
										<div className='bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium w-full truncate mt-2'>
											{t('home.playerCharacters.noCampaign', 'Sin campaña')}
										</div>
									)}
								</CardBody>
							</Card>
						))}
					</div>
				) : (
					<div className='text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
						<Typography className='italic text-gray-500'>
							{t('profile.noCharacters', 'No tienes personajes creados todavía.')}
						</Typography>
					</div>
				)}
			</div>

			{/* Modal de detalle */}
			<CharacterDetailDialog
				open={openCharacterDetail}
				handleClose={() => setOpenCharacterDetail(false)}
				characterId={selectedCharacterId}
			/>
		</div>
	);
}
