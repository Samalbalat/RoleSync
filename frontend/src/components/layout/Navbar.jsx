import React from 'react';
import { Navbar as MTNavbar, Button, IconButton, Collapse, Typography } from '@material-tailwind/react';
import { NavLink } from 'react-router-dom';
import { menuItems } from '../../data/menuList';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
	const { t } = useTranslation('global');
	const [openNav, setOpenNav] = React.useState(false);

	React.useEffect(() => {
		const handleResize = () => {
			// CAMBIO: Ahora usamos 1024px (lg) como límite
			if (window.innerWidth >= 1024) {
				setOpenNav(false);
			}
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Lista del menú (igual que antes)
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
									isActive ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-900 hover:text-blue-500'
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
		<MTNavbar className='fixed top-0 left-0 z-50 w-full max-w-none px-4 py-2 lg:px-8 lg:py-4 bg-gray-200 border-0 rounded-none'>
			<div className='flex items-center justify-between text-gray-900'>
				{/* LOGO */}
				<div className='flex items-center cursor-pointer'>
					<img alt='RolSync Logo' src={'/DnD-Symbol.png'} className='h-8 w-auto' />
					<span className='ml-3 text-xl font-bold font-mono tracking-tight'>RolSync</span>
				</div>

				{/* BOTONES DESKTOP: Ocultos en móviles y tablets (lg:flex) */}
				<div className='hidden lg:flex items-center gap-x-2'>
					<Button variant='text' size='sm' className='text-gray-900'>
						{t('auth.login')}
					</Button>
					<Button variant='gradient' size='sm' color='red'>
						{t('auth.register')}
					</Button>
				</div>

				{/* BOTÓN HAMBURGUESA: Visible hasta 1024px (lg:hidden) */}
				<IconButton
					variant='text'
					className='ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden'
					ripple={false}
					onClick={() => setOpenNav(!openNav)}
				>
					{openNav ? (
						<svg xmlns='http://www.w3.org/2000/svg' fill='none' className='h-6 w-6' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
							<path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
						</svg>
					) : (
						<svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' stroke='currentColor' strokeWidth={2}>
							<path strokeLinecap='round' strokeLinejoin='round' d='M4 6h16M4 12h16M4 18h16' />
						</svg>
					)}
				</IconButton>
			</div>

			{/* MENÚ MÓVIL/TABLET */}
			<Collapse open={openNav}>
				<div className='container mx-auto mt-4 pb-2'>
					{navList}
					<div className='flex flex-col gap-2 mt-4'>
						<Button fullWidth variant='outlined' size='sm' color='red'>
							{t('auth.login')}
						</Button>
						<Button fullWidth variant='gradient' size='sm' color='red'>
							{t('auth.register')}
						</Button>
					</div>
				</div>
			</Collapse>
		</MTNavbar>
	);
}
