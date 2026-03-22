import { useEffect, useState } from 'react';
import {
	Typography,
	Card,
	CardBody,
	Avatar,
	Button,
	Tabs,
	TabsHeader,
	TabsBody,
	Tab,
	TabPanel,
	Chip,
	Spinner,
} from '@material-tailwind/react';
import { useAuth } from '../../utils/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import profileService from '../../services/ProfileService';
import campaignService from '../../services/CampaignService';
import characterService from '../../services/CharacterService';
import {
	UserCircleIcon,
	TrophyIcon,
	IdentificationIcon,
	GlobeAltIcon,
	ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { getTheme } from '../../utils/themeUtils';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { ProfileCampaignList } from '../../components/profile/ProfileCampaignList';
import { ProfileCharacterList } from '../../components/profile/ProfileCharacterList';
import CharacterDetailDialog from '../../components/character/CharacterDetailDialog';

function LoadingScreen() {
	const theme = getTheme();
	return (
		<div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
			<Spinner className={`h-12 w-12 ${theme.textSecondary}`} color={theme.secondary} />
		</div>
	);
}

export function ProfileDetailsPage() {
	const { activeProfile, setActiveProfile } = useAuth();
	const [profileData, setProfileData] = useState(null);
	const [campaigns, setCampaigns] = useState({ asMaster: [], asPlayer: [] });
	const [characters, setCharacters] = useState([]);
	const [userData, setUserData] = useState(null);

	const [loading, setLoading] = useState(true);
	const [openEdit, setOpenEdit] = useState(false);
	const [selectedCharacterId, setSelectedCharacterId] = useState(null);
	const [openCharacterDetail, setOpenCharacterDetail] = useState(false);
	//const [openEditAccount, setOpenEditAccount] = useState(false);
	const { t } = useTranslation('global');
	const theme = getTheme();

	useEffect(() => {
		const fetchAllData = async () => {
			try {
				setProfileData(null);
				const [pData, cData, charData, uData] = await Promise.all([
					profileService.getProfile(activeProfile.type),
					campaignService.getMyCampaigns(),
					characterService.getMyCharacters(),
					profileService.getUserInfo(),
				]);

				setProfileData(pData);
				setUserData(uData);
				setCampaigns(cData || { asMaster: [], asPlayer: [] });
				setCharacters(Array.isArray(charData) ? charData : []);
			} catch (error) {
				console.error('Error cargando datos del perfil', error);
			} finally {
				setLoading(false);
			}
		};

		if (activeProfile) fetchAllData();
	}, [activeProfile]);

	const handleSaveProfile = async data => {
		try {
			await profileService.updateProfile(activeProfile.type, data);

			// 1. Actualizamos la info visual de esta página
			setProfileData(prev => ({ ...prev, ...data }));

			// 2. Si el nombre o imagen cambiaron, actualizamos el "perfil activo" global
			const updatedActive = {
				...activeProfile,
				name: data.profileName,
				image: data.image,
			};
			localStorage.setItem('activeProfile', JSON.stringify(updatedActive));
			setActiveProfile(updatedActive);

			const storedAvailable = JSON.parse(localStorage.getItem('availableProfiles') || '[]');
			const updatedAvailable = storedAvailable.map(p => {
				if (p.roleType === activeProfile.type) {
					return {
						...p,
						profileName: data.profileName,
						image: data.image,
					};
				}
				return p;
			});

			localStorage.setItem('availableProfiles', JSON.stringify(updatedAvailable));

			setOpenEdit(false);
			toast.success(t('profile.edit.saveSuccess'));
		} catch (error) {
			console.error('Error al guardar el perfil', error);
			toast.error(t('profile.edit.saveError'));
			throw error;
		}
	};

	// const handleSaveAccount = async data => {
	// 	try {
	// 		await profileService.updateUserInfo(data);
	// 		setUserData(prev => ({ ...prev, ...data }));
	// 		setOpenEditAccount(false);
	// 		toast.success(t('profile.account.saveSuccess'));
	// 	} catch (error) {
	// 		console.error('Error al guardar la cuenta', error);
	// 		toast.error(t('profile.account.saveError'));
	// 	}
	// };

	const handleSwitchProfile = targetProfile => {
		const storedAvailable = JSON.parse(localStorage.getItem('availableProfiles') || '[]');
		const fullProfileData = storedAvailable.find(p => p.profileName === targetProfile.profileName);

		if (fullProfileData) {
			const newProfile = {
				name: fullProfileData.profileName,
				type: fullProfileData.roleType,
				image: fullProfileData.image,
			};

			localStorage.setItem('activeProfile', JSON.stringify(newProfile));

			window.location.reload();
		} else {
			console.error('No se encontró la información completa del perfil seleccionado');
		}
	};

	const handleOpenCharacter = id => {
		setSelectedCharacterId(id);
		setOpenCharacterDetail(true);
	};

	if (loading) return <LoadingScreen />;

	return (
		<div className='max-w-7xl mx-auto px-4 py-8'>
			{/* Header del Perfil */}
			<Card className='mb-8 overflow-hidden'>
				<div className={`h-32 bg-gradient-to-r ${theme.banner}`} />
				<CardBody className='relative flex flex-col md:flex-row items-center gap-6 -mt-16'>
					<Avatar
						src={profileData?.image || '/default-avatar.png'}
						alt='avatar'
						variant='circular'
						className={`
        border-4 border-white shadow-xl bg-white
        w-28 h-28        /* Tamaño en móvil (aprox 112px) */
        md:w-40 md:h-40  /* Tamaño en tablet (aprox 160px) */
        lg:w-48 lg:h-48  /* Tamaño en PC (aprox 192px) */
    `}
					/>
					<div className='flex-1 text-center md:text-left mt-4 md:mt-8'>
						<Typography variant='h3' color='blue-gray'>
							{profileData?.profileName || activeProfile.name}
						</Typography>
						<Typography variant='paragraph' className='font-normal text-blue-gray-500 max-w-2xl'>
							{profileData?.description || t('profile.noDescription')}
						</Typography>
					</div>
					<Button variant='outlined' size='sm' onClick={() => setOpenEdit(true)}>
						{t('profile.edit.button')}
					</Button>
				</CardBody>
			</Card>
			<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
				{/* COLUMNA IZQUIERDA: Información de Cuenta y Otros Perfiles */}
				<div className='lg:col-span-1 space-y-6'>
					{/* Card de Cuenta */}
					<Card className='border border-blue-gray-50 shadow-sm'>
						<CardBody className='p-4'>
							<Typography variant='h6' color='blue-gray' className='mb-4 flex items-center gap-2'>
								<IdentificationIcon className={`w-5 h-5 ${theme.textPrimary}`} /> {t('profile.accountInfo')}
							</Typography>
							{/* <Button variant='text' size='sm' className='p-2' onClick={() => setOpenEditAccount(true)}>
								<GlobeAltIcon className='w-4 h-4 text-blue-gray-400' />
							</Button> */}
							<div className='space-y-3'>
								<div>
									<Typography variant='small' className='font-bold text-blue-gray-400 uppercase text-[10px]'>
										{t('profile.email')}
									</Typography>
									<Typography variant='small' className='text-blue-gray-800 break-all'>
										{userData?.email}
									</Typography>
								</div>
								<div className='flex items-center gap-2'>
									<GlobeAltIcon className='w-4 h-4 text-gray-400' />
									<Typography variant='small' className='text-blue-gray-600'>
										{userData?.timeZone}
									</Typography>
								</div>
							</div>
						</CardBody>
					</Card>

					{/* Card de Otros Perfiles */}
					<Card className='border border-blue-gray-50 shadow-sm'>
						<CardBody className='p-4'>
							<Typography variant='h6' color='blue-gray' className='mb-4 flex items-center gap-2'>
								<ArrowsRightLeftIcon className={`w-5 h-5 ${theme.textSecondary}`} /> {t('profile.yourProfiles')}
							</Typography>
							<div className='space-y-3'>
								{userData?.profiles?.map(p => {
									const isCurrent = p.profileName === activeProfile.name;
									return (
										<div
											key={p.id}
											onClick={() => {
												if (!isCurrent) {
													setLoading(true);
													handleSwitchProfile(p);
												}
											}}
											className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isCurrent ? `${theme.bgLight} border ${theme.lightborder}` : 'hover:bg-gray-50 cursor-pointer'}`}
										>
											<Avatar src={p.image || '/default-avatar.png'} size='sm' />
											<div className='flex-1 overflow-hidden'>
												<Typography variant='small' className='font-bold text-blue-gray-800 truncate'>
													{p.profileName}
												</Typography>
												{isCurrent && (
													<Chip
														value={t('profile.current')}
														size='sm'
														variant='ghost'
														color={theme.primary}
														className='py-0 px-2 text-[8px]'
													/>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</CardBody>
					</Card>
				</div>

				{/* COLUMNA DERECHA: Pestañas de Juego (Campañas/Personajes) */}
				<div className='lg:col-span-3'>
					<Tabs value='campaigns'>
						<TabsHeader
							className='bg-transparent'
							indicatorProps={{ className: 'bg-gray-900/10 shadow-none !text-gray-900' }}
						>
							<Tab value='campaigns' className='font-medium'>
								<div className='flex items-center gap-2'>
									<TrophyIcon className='w-5 h-5' /> {t('campaign.campaigns')}
								</div>
							</Tab>
							<Tab value='characters' className='font-medium'>
								<div className='flex items-center gap-2'>
									<UserCircleIcon className='w-5 h-5' /> {t('character.characters')}
								</div>
							</Tab>
						</TabsHeader>
						<TabsBody>
							<TabPanel value='campaigns'>
								<ProfileCampaignList campaigns={campaigns} type='master' />
								<ProfileCampaignList campaigns={campaigns} type='player' />
								{campaigns.asMaster.length === 0 && campaigns.asPlayer.length === 0 && (
									<Typography className='italic text-gray-500'>{t('profile.noCampaigns')}</Typography>
								)}
							</TabPanel>

							<TabPanel value='characters'>
								<ProfileCharacterList characters={characters} onCharacterClick={handleOpenCharacter} />
							</TabPanel>
						</TabsBody>
					</Tabs>
				</div>
			</div>

			{profileData && (
				<EditProfileModal
					open={openEdit}
					handler={() => setOpenEdit(!openEdit)}
					profileData={profileData}
					onSave={handleSaveProfile}
					theme={theme}
				/>
			)}

			<CharacterDetailDialog
				open={openCharacterDetail}
				handleClose={() => setOpenCharacterDetail(false)}
				characterId={selectedCharacterId}
			/>

			{/* <EditAccountModal
				open={openEditAccount}
				handler={() => setOpenEditAccount(!openEditAccount)}
				userData={userData}
				onSave={handleSaveAccount}
				theme={theme}
			/> */}
		</div>
	);
}
