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
	StarIcon,
} from '@heroicons/react/24/outline';
import { getTheme } from '../../utils/themeUtils';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { ProfileCampaignList } from '../../components/profile/ProfileCampaignList';
import { ProfileCharacterList } from '../../components/profile/ProfileCharacterList';
import CharacterDetailDialog from '../../components/character/CharacterDetailDialog';
import { CreateProfileModal } from '../../components/profile/CreateProfileModal';
import ReviewList from '../../components/reviews/ReviewList';
import StarRatingBadge from '../../components/reviews/StarRatingBadge';

// --- UTILIDADES PARA AVATARES DINÁMICOS ---
const getInitials = name => {
	if (!name) return '?';
	const parts = name.trim().split(' ');
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = name => {
	if (!name) return '#94a3b8'; // slate-400 fallback
	const colors = [
		'#ef4444',
		'#f97316',
		'#f59e0b',
		'#84cc16',
		'#10b981',
		'#06b6d4',
		'#3b82f6',
		'#6366f1',
		'#8b5cf6',
		'#d946ef',
		'#f43f5e',
	];
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return colors[Math.abs(hash) % colors.length];
};

// --- COMPONENTE AVATAR DINÁMICO ---
function DynamicAvatar({ src, name, className }) {
	// Si hay una imagen válida (y no es el default antiguo), la mostramos
	if (src && !src.includes('default-avatar')) {
		return <Avatar src={src} alt={name} variant='circular' className={className} />;
	}

	// Si no hay imagen, mostramos las iniciales
	const initials = getInitials(name);
	const bgColor = getAvatarColor(name);

	return (
		<div
			className={`flex items-center justify-center rounded-full text-white font-bold select-none ${className}`}
			style={{ backgroundColor: bgColor }}
		>
			{initials}
		</div>
	);
}
// ------------------------------------------

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
	const [openCreate, setOpenCreate] = useState(false);
	const [selectedCharacterId, setSelectedCharacterId] = useState(null);
	const [openCharacterDetail, setOpenCharacterDetail] = useState(false);
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

			setProfileData(prev => ({ ...prev, ...data }));

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

	const hasTabletop = userData?.profiles?.some(p => p.roleType === 'TABLETOP');
	const canCreateProfile = userData?.profiles?.length < 2;
	const missingType = hasTabletop ? 'WRITTEN' : 'TABLETOP';

	const handleCreateProfile = async formData => {
		try {
			const newProfile = await profileService.createProfile(missingType, formData);

			const completedNewProfile = {
				...newProfile,
				profileName: newProfile.profileName || formData.profileName,
				roleType: newProfile.roleType || missingType,
				image: newProfile.image || formData.image,
			};

			const updatedProfiles = [...userData.profiles, completedNewProfile];

			setUserData(prev => ({
				...prev,
				profiles: updatedProfiles,
			}));

			const newAvailableProfiles = updatedProfiles.map(p => {
				let finalRoleType = p.roleType || p.type;
				if (!finalRoleType && p.profileName === activeProfile.name) {
					finalRoleType = activeProfile.type;
				}

				return {
					email: userData?.email || '',
					profileName: p.profileName,
					roleType: finalRoleType,
					image: p.image || null,
				};
			});

			localStorage.setItem('availableProfiles', JSON.stringify(newAvailableProfiles));

			setOpenCreate(false);
			toast.success(t('profile.create.success'));

			setTimeout(() => {
				window.location.reload();
			}, 1000);
		} catch (error) {
			console.error('Error al crear:', error);
			toast.error(t('profile.create.error'));
			throw error;
		}
	};

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

	const currentName = profileData?.profileName || activeProfile.name;

	return (
		<div className='max-w-7xl mx-auto px-4 py-8'>
			{/* Header del Perfil */}
			<Card className='mb-8 overflow-hidden'>
				<div className={`h-32 bg-gradient-to-r ${theme.banner}`} />
				<CardBody className='relative flex flex-col md:flex-row items-center gap-6 -mt-16'>
					{/* AVATAR PRINCIPAL MODIFICADO */}
					<DynamicAvatar
						src={profileData?.image}
						name={currentName}
						className={`
                            border-4 border-white shadow-xl bg-white
                            w-28 h-28 text-4xl        /* Tamaño en móvil */
                            md:w-40 md:h-40 md:text-6xl /* Tamaño en tablet */
                            lg:w-48 lg:h-48 lg:text-7xl /* Tamaño en PC */
                        `}
					/>

					<div className='flex-1 text-center md:text-left mt-4 md:mt-8'>
						<div className='flex flex-col md:flex-row items-center md:items-end gap-3 mb-2 justify-center md:justify-start'>
							<Typography variant='h3' color='blue-gray'>
								{currentName}
							</Typography>

							<StarRatingBadge
								averageRating={profileData?.reviewSummary?.average || 0}
								totalReviews={profileData?.reviewSummary?.count || 0}
								size='md'
							/>
						</div>

						<Typography variant='paragraph' className='font-normal text-blue-gray-500 max-w-2xl mx-auto md:mx-0'>
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
					<Card className='border border-blue-gray-50 shadow-sm'>
						<CardBody className='p-4'>
							<Typography variant='h6' color='blue-gray' className='mb-4 flex items-center gap-2'>
								<IdentificationIcon className={`w-5 h-5 ${theme.textPrimary}`} /> {t('profile.accountInfo')}
							</Typography>
							<div className='space-y-3'>
								<div>
									<Typography variant='small' className='font-bold text-blue-gray-400 uppercase text-[10px]'>
										{t('profile.email')}
									</Typography>
									<Typography variant='small' className='text-blue-gray-800 break-all'>
										{userData?.email || ''}
									</Typography>
								</div>
								<div className='flex items-center gap-2'>
									<GlobeAltIcon className='w-4 h-4 text-gray-400' />
									<Typography variant='small' className='text-blue-gray-600'>
										{userData?.timeZone || ''}
									</Typography>
								</div>
							</div>
						</CardBody>
					</Card>

					<Card className='border border-blue-gray-50 shadow-sm'>
						<CardBody className='p-4'>
							<div className='flex justify-between items-center mb-4'>
								<Typography variant='h6' color='blue-gray' className='flex items-center gap-2'>
									<ArrowsRightLeftIcon className={`w-5 h-5 ${theme.textSecondary}`} />
									{t('profile.yourProfiles')}
								</Typography>
							</div>

							<div className='space-y-3'>
								{userData?.profiles?.map(p => {
									const isCurrent = p.profileName === activeProfile.name;
									return (
										<button
											key={p.id}
											onClick={() => {
												if (!isCurrent) {
													setLoading(true);
													handleSwitchProfile(p);
												}
											}}
											disabled={isCurrent}
											className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
												isCurrent
													? `${theme.bgLight} border ${theme.lightborder} cursor-default`
													: 'hover:bg-gray-50 cursor-pointer'
											}`}
										>
											{/* AVATARES SECUNDARIOS MODIFICADOS */}
											<DynamicAvatar src={p.image} name={p.profileName} className='w-9 h-9 text-sm shrink-0' />

											<div className='flex-1 overflow-hidden'>
												<div className='flex items-center justify-between'>
													<Typography variant='small' className='font-bold text-blue-gray-800 truncate'>
														{p.profileName}
													</Typography>
													<Typography variant='small' className='text-[9px] text-gray-400 font-mono'>
														{p.roleType}
													</Typography>
												</div>
												{isCurrent && (
													<Chip
														value={t('profile.current')}
														size='sm'
														variant='ghost'
														color={theme.primary}
														className='py-0 px-2 text-[8px] inline-block'
													/>
												)}
											</div>
										</button>
									);
								})}

								{canCreateProfile && (
									<button
										onClick={() => setOpenCreate(true)}
										className='border-2 border-dashed border-gray-100 rounded-lg p-3 flex items-center gap-3 text-gray-400 hover:border-blue-200 hover:text-blue-300 transition-all cursor-pointer group w-full text-left bg-transparent'
									>
										<div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50'>
											<span className='text-xl'>+</span>
										</div>
										<Typography variant='small' className='font-medium italic'>
											{t('profile.createType', { type: missingType })}
										</Typography>
									</button>
								)}
							</div>
						</CardBody>
					</Card>
				</div>

				{/* COLUMNA DERECHA: Pestañas de Juego */}
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
							<Tab value='reviews' className='font-medium'>
								<div className='flex items-center gap-2'>
									<StarIcon className='w-5 h-5' /> {t('profile.reviews', 'Reseñas')}
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
							<TabPanel value='reviews'>
								<div className='pt-4'>
									<ReviewList
										targetId={profileData?.id || 0}
										targetType='PROFILE'
										canWrite={false} // En este caso, no permitimos escribir reseñas en el propio perfil
										averageRating={profileData?.reviewSummary?.average || 0}
										totalReviews={profileData?.reviewSummary?.count || 0}
									/>
								</div>
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

			<CreateProfileModal
				open={openCreate}
				handler={() => setOpenCreate(!openCreate)}
				type={missingType}
				onCreate={handleCreateProfile}
				theme={theme}
			/>
		</div>
	);
}
