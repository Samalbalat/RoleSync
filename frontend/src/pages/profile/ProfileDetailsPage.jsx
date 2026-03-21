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

				console.log('Datos de usuario:', uData);

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
			setActiveProfile(newProfile);

			window.location.reload();
		} else {
			console.error('No se encontró la información completa del perfil seleccionado');
		}
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
							{profileData?.description || 'Sin descripción de bardo todavía...'}
						</Typography>
					</div>
					<div className='mt-8'>
						<Button variant='outlined' size='sm'>
							Editar Perfil
						</Button>
					</div>
				</CardBody>
			</Card>
			<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
				{/* COLUMNA IZQUIERDA: Información de Cuenta y Otros Perfiles */}
				<div className='lg:col-span-1 space-y-6'>
					{/* Card de Cuenta */}
					<Card className='border border-blue-gray-50 shadow-sm'>
						<CardBody className='p-4'>
							<Typography variant='h6' color='blue-gray' className='mb-4 flex items-center gap-2'>
								<IdentificationIcon className={`w-5 h-5 ${theme.textPrimary}`} /> {'Cuenta'}
							</Typography>
							<div className='space-y-3'>
								<div>
									<Typography variant='small' className='font-bold text-blue-gray-400 uppercase text-[10px]'>
										Email
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
								<ArrowsRightLeftIcon className={`w-5 h-5 ${theme.textSecondary}`} /> {'Tus Perfiles'}
							</Typography>
							<div className='space-y-3'>
								{userData?.profiles?.map(p => {
									const isCurrent = p.profileName === activeProfile.name;
									return (
										<div
											key={p.id}
											onClick={() => !isCurrent && handleSwitchProfile(p) && setLoading(true)}
											className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isCurrent ? `${theme.bgLight} border ${theme.lightborder}` : 'hover:bg-gray-50 cursor-pointer'}`}
										>
											<Avatar src={p.image || '/default-avatar.png'} size='sm' />
											<div className='flex-1 overflow-hidden'>
												<Typography variant='small' className='font-bold text-blue-gray-800 truncate'>
													{p.profileName}
												</Typography>
												{isCurrent && (
													<Chip
														value='Actual'
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
									<TrophyIcon className='w-5 h-5' /> Campañas
								</div>
							</Tab>
							<Tab value='characters' className='font-medium'>
								<div className='flex items-center gap-2'>
									<UserCircleIcon className='w-5 h-5' /> Personajes
								</div>
							</Tab>
						</TabsHeader>
						<TabsBody>
							<TabPanel value='campaigns'>
								<div className='space-y-6'>
									{/* SECCIÓN MASTER */}
									{campaigns.asMaster.length > 0 && (
										<div>
											<Typography variant='h6' color='blue-gray' className='mb-2'>
												Director de Juego
											</Typography>
											<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
												{campaigns.asMaster.map(camp => (
													<Card key={camp.id} className='border border-blue-100 shadow-sm'>
														<CardBody>
															<Typography variant='h6'>{camp.name}</Typography>
															<Typography variant='small' className='text-blue-600 font-medium'>
																{camp.system}
															</Typography>
														</CardBody>
													</Card>
												))}
											</div>
										</div>
									)}

									{/* SECCIÓN JUGADOR */}
									<div>
										<Typography variant='h6' color='blue-gray' className='mb-2'>
											Mis Aventuras
										</Typography>
										<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
											{campaigns.asPlayer.map(camp => (
												<Card key={camp.id} className='border border-gray-200 shadow-sm'>
													<CardBody>
														<Typography variant='h6'>{camp.name}</Typography>
														<Typography variant='small' className='text-orange-700'>
															{camp.system}
														</Typography>
													</CardBody>
												</Card>
											))}

											{campaigns.asMaster.length === 0 && campaigns.asPlayer.length === 0 && (
												<Typography className='italic text-gray-500'>
													No participas en ninguna campaña aún. ¡Es hora de empezar una!
												</Typography>
											)}
										</div>
									</div>
								</div>
							</TabPanel>
							<TabPanel value='characters'>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									{characters.map(char => (
										<Card key={char.id}>
											<CardBody>
												<Typography variant='h6'>{char.name}</Typography>
												<Typography variant='small'>
													{char.race} - {char.class}
												</Typography>
											</CardBody>
										</Card>
									))}
									{characters.length === 0 && <Typography>Aún no has forjado a tus héroes.</Typography>}
								</div>
							</TabPanel>
						</TabsBody>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
