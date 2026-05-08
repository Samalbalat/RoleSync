import React from 'react';
import {
	Navbar as MTNavbar,
	Button,
	IconButton,
	Collapse,
	Typography,
	Menu,
	MenuHandler,
	MenuList,
	MenuItem,
	Chip,
	Switch,
} from '@material-tailwind/react';
import {
	ArrowRightStartOnRectangleIcon,
	ChevronDownIcon,
	UserIcon,
	ChatBubbleLeftRightIcon,
	Bars3Icon,
	MapIcon,
	UserGroupIcon,
	DocumentDuplicateIcon,
} from '@heroicons/react/24/solid';
import { FaDiceD20 } from 'react-icons/fa';
import { LuBookOpenText } from 'react-icons/lu';
import { NavLink, useNavigate } from 'react-router-dom';
import { menuItems } from '../../data/menuList';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';
import { useAuth } from '../../utils/AuthContext';

export default function Navbar() {
	const { t } = useTranslation('global');
	const navigate = useNavigate();
	const theme = getTheme();
	const { activeProfile, logout } = useAuth();
	const [openNav, setOpenNav] = React.useState(false);
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);

	// --- CAMBIO DE PERFIL ---
	const availableProfilesStr = localStorage.getItem('availableProfiles');
	let availableProfiles = [];
	try {
		if (availableProfilesStr) availableProfiles = JSON.parse(availableProfilesStr);
	} catch (e) {
		console.error('Error leyendo perfiles disponibles', e);
	}

	const hasMultipleProfiles = availableProfiles.length > 1;

	const handleSwitchProfile = () => {
		const currentType = activeProfile?.type;
		const nextProfile = availableProfiles.find(p => p.roleType !== currentType);

		if (nextProfile) {
			const newActive = { name: nextProfile.profileName, type: nextProfile.roleType };
			localStorage.setItem('activeProfile', JSON.stringify(newActive));
			globalThis.location.reload();
		}
	};

	// ----------------

	React.useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) {
				setOpenNav(false);
			}
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const ProfileIndicator = () => {
		if (hasMultipleProfiles) {
			const isTabletop = activeProfile?.type === 'TABLETOP';
			return (
				<div className='flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full border border-gray-300 shadow-sm backdrop-blur-sm'>
					<LuBookOpenText className={`h-4 w-4 transition-colors ${!isTabletop ? theme.textPrimary : 'text-gray-400'}`} />
					<Switch
						id='profile-switch'
						color={theme.badge}
						checked={isTabletop}
						onChange={handleSwitchProfile}
						className='cursor-pointer'
					/>
					<FaDiceD20 className={`h-4 w-4 transition-colors ${isTabletop ? theme.textPrimary : 'text-gray-400'}`} />
				</div>
			);
		}

		return (
			<Chip
				value={activeProfile?.type === 'WRITTEN' ? t('menu.narrativeRoleplay') : t('menu.tabletopRoleplay')}
				color={theme.badge}
				size='sm'
				variant='ghost'
				className='rounded-full border border-current'
			/>
		);
	};

	// Lista del menú lateral que se muestra en móvil
	const navList = (
		<ul className='mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6'>
			{menuItems.map(({ icon, label, path }) => {
				const Icon = icon;
				return (
					<Typography key={label} as='li' variant='small' color='blue-gray' className='p-1 font-normal'>
						<NavLink
							to={path}
							className={({ isActive }) =>
								`flex items-center gap-x-2 p-1 rounded transition-colors ${
									isActive ? `${theme.textPrimary} bg-blue-50 font-medium` : `text-gray-900 hover:${theme.textPrimary}`
								}`
							}
						>
							<Icon className='h-5 w-5' />
							{t(label)}
						</NavLink>
					</Typography>
				);
			})}
		</ul>
	);

	return (
		<MTNavbar className='fixed top-0 left-0 z-50 w-full max-w-none px-4 py-2 lg:px-8 lg:py-3 bg-gray-200 border-0 rounded-none'>
			<div className='flex items-center justify-between text-gray-900'>
				{/* LADO IZQUIERDO: LOGO E INDICADOR DE ROL */}
				<div className='flex items-center gap-4'>
					<button
						className='flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity'
						onClick={() => navigate('/')}
						type='button'
					>
						<img alt='RolSync Logo' src={'/simpleLogo.png'} className='h-10 w-auto' />
						<span className='text-xl font-bold font-mono tracking-tight'>RolSync</span>
					</button>
				</div>

				{/* LADO DERECHO: DROPDOWN DE USUARIO (DESKTOP) */}
				<div className='hidden lg:flex items-center gap-x-2'>
					<div className='hidden sm:block'>
						<ProfileIndicator />
					</div>
					<Menu open={isMenuOpen} handler={setIsMenuOpen} placement='bottom-end'>
						<MenuHandler>
							<Button variant='text' className='flex items-center gap-2 text-gray-900 capitalize hover:bg-gray-300/50 pr-2'>
								{activeProfile?.type === 'WRITTEN' ? (
									<LuBookOpenText className={`h-6 w-6 ${theme.textPrimary}`} />
								) : (
									<FaDiceD20 className={`h-6 w-6 ${theme.textPrimary}`} />
								)}
								<Typography variant='small' className='font-bold'>
									{activeProfile?.name}
								</Typography>
								<ChevronDownIcon
									strokeWidth={2.5}
									className={`h-3.5 w-3.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
								/>
							</Button>
						</MenuHandler>
						<MenuList className='p-2 border-gray-200 shadow-lg'>
							<MenuItem onClick={() => navigate('/profile')} className='flex items-center gap-2'>
								<UserIcon className='h-4 w-4 text-blue-gray-500' />
								<Typography variant='small' className='font-medium'>
									{t('menu.profile')}
								</Typography>
							</MenuItem>
							<MenuItem onClick={() => navigate('/myCampaigns')} className='flex items-center gap-2'>
								<MapIcon className='h-4 w-4 text-blue-gray-500' />
								<Typography variant='small' className='font-medium'>
									{t('menu.myCampaigns')}
								</Typography>
							</MenuItem>
							<MenuItem onClick={() => navigate('/myCharacters')} className='flex items-center gap-2'>
								<UserGroupIcon className='h-4 w-4 text-blue-gray-500' />
								<Typography variant='small' className='font-medium'>
									{t('menu.myCharacters')}
								</Typography>
							</MenuItem>
							<MenuItem onClick={() => navigate('/myTemplates')} className='flex items-center gap-2'>
								<DocumentDuplicateIcon className='h-4 w-4 text-blue-gray-500' />
								<Typography variant='small' className='font-medium'>
									{t('home.myTemplates.title', 'Mis Plantillas')}
								</Typography>
							</MenuItem>
							<MenuItem onClick={() => navigate('/forum/my-posts')} className='flex items-center gap-2'>
								<ChatBubbleLeftRightIcon className='h-4 w-4 text-blue-gray-500' />
								<Typography variant='small' className='font-medium'>
									{t('menu.myPosts')}
								</Typography>
							</MenuItem>
							<hr className='my-2 border-blue-gray-50' />
							<MenuItem
								onClick={handleLogout}
								className='flex items-center gap-2 text-red-500 hover:bg-red-50/10 focus:bg-red-50/10 active:bg-red-50/10'
							>
								<ArrowRightStartOnRectangleIcon className='h-4 w-4 text-red-500' />
								<Typography variant='small' className='font-medium'>
									{t('auth.logout')}
								</Typography>
							</MenuItem>
						</MenuList>
					</Menu>
				</div>

				{/* BOTÓN HAMBURGUESA: Visible hasta 1024px */}

				<div className='flex items-center gap-3 ml-auto lg:hidden'>
					{activeProfile?.type === 'WRITTEN' ? (
						<LuBookOpenText className={`h-6 w-6 ${theme.textPrimary}`} />
					) : (
						<FaDiceD20 className={`h-6 w-6 ${theme.textPrimary}`} />
					)}

					<IconButton
						variant='text'
						className='h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent'
						ripple={false}
						onClick={() => setOpenNav(!openNav)}
					>
						{openNav ? <ChevronDownIcon className='h-6 w-6 ' /> : <Bars3Icon className='h-6 w-6 ' />}
					</IconButton>
				</div>
			</div>

			{/* MENÚ MÓVIL/TABLET */}
			<Collapse open={openNav}>
				<div className='container mx-auto mt-4 pb-2'>
					{navList}

					{/* Opciones de Perfil adaptadas para Móvil (Se separan con un borde superior) */}
					<div className='flex flex-col gap-1 mt-4 pt-4 border-t border-gray-300'>
						<div className='flex justify-center mb-4'>
							<ProfileIndicator />
						</div>
						<Button
							variant='text'
							className='flex items-center justify-start gap-3 text-gray-800'
							onClick={() => {
								navigate('/profile');
								setOpenNav(false);
							}}
						>
							<UserIcon className='h-5 w-5' /> {t('menu.profile')}
						</Button>
						<Button
							variant='text'
							className='flex items-center justify-start gap-3 text-gray-800'
							onClick={() => {
								navigate('/forum/my-posts');
								setOpenNav(false);
							}}
						>
							<ChatBubbleLeftRightIcon className='h-5 w-5' /> {t('menu.myPosts')}
						</Button>
						<Button
							variant='text'
							className='flex items-center justify-start gap-3 text-gray-800'
							onClick={() => {
								navigate('/myCampaigns');
								setOpenNav(false);
							}}
						>
							<MapIcon className='h-5 w-5' /> {t('menu.myCampaigns')}
						</Button>
						<Button
							variant='text'
							className='flex items-center justify-start gap-3 text-gray-800'
							onClick={() => {
								navigate('/myCharacters');
								setOpenNav(false);
							}}
						>
							<UserGroupIcon className='h-5 w-5' /> {t('menu.myCharacters')}
						</Button>
						<Button
							variant='text'
							className='flex items-center justify-start gap-3 text-gray-800'
							onClick={() => {
								navigate('/myTemplates');
								setOpenNav(false);
							}}
						>
							<DocumentDuplicateIcon className='h-5 w-5' /> {t('home.myTemplates.title', 'Mis Plantillas')}
						</Button>

						<Button
							fullWidth
							variant='gradient'
							color='red'
							className='flex items-center justify-center gap-2 mt-4'
							onClick={handleLogout}
						>
							<ArrowRightStartOnRectangleIcon className='h-4 w-4' />
							{t('auth.logout')}
						</Button>
					</div>
				</div>
			</Collapse>
		</MTNavbar>
	);
}
