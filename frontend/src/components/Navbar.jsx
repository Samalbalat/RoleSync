import React from 'react';
import { Navbar, Button, IconButton, Collapse } from '@material-tailwind/react';
import { navList } from '../data/menuList';

export default function NavbarDefault() {
	const [openNav, setOpenNav] = React.useState(false);

	React.useEffect(() => {
		window.addEventListener(
			'resize',
			() => window.innerWidth >= 720 && setOpenNav(false),
		);
	}, []);

	return (
		<Navbar
			className='fixed top-0 left-0 z-50 w-full !max-w-none px-0 pb-0 pt-2 lg:px-8 lg:py-4 bg-gray-200 border-0 rounded-none'
			style={{ margin: 0 }}
		>
			<div className='container mx-auto flex items-center justify-between text-gray-900'>
				<div className='flex shrink-0 items-center ml-4'>
					<img
						alt='RolSync Logo'
						src='https://i0.wp.com/www.dicegeeks.com/wp-content/uploads/2022/11/DnD-Symbol.png?fit=3840%2C2160&ssl=1'
						className='h-8 w-auto'
					/>
					<span className='ml-4 text-2xl font-bold text-gray-900 font-mono tracking-tight select-none'>
						RolSync
					</span>
				</div>

				<div className='flex items-center gap-x-1'>
					<Button
						variant='text'
						size='sm'
						className='hidden md:inline-block text-gray-900'
					>
						<span>Log In</span>
					</Button>
					<Button
						variant='gradient'
						size='sm'
						className='hidden md:inline-block'
						color='red'
					>
						<span>Sign in</span>
					</Button>
					<IconButton
						variant='text'
						className='ml-auto mr-6 h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent md:hidden'
						ripple={false}
						onClick={() => setOpenNav(!openNav)}
					>
						{openNav ? (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								className='h-6 w-6'
								viewBox='0 0 24 24'
								stroke='currentColor'
								strokeWidth={2}
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						) : (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-6 w-6'
								fill='none'
								stroke='currentColor'
								strokeWidth={2}
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M4 6h16M4 12h16M4 18h16'
								/>
							</svg>
						)}
					</IconButton>
				</div>
			</div>

			<Collapse className='w-full bg-gradient-to-b mt-2 ' open={openNav}>
				<div className='container mx-auto mt-2'>
					<div className=''>{navList}</div>

					<div className='flex items-center gap-x-1 pb-3 px-1'>
						<Button
							fullWidth
							variant='outlined'
							size='sm'
							color='red'
							className=''
						>
							<span>Log In</span>
						</Button>
						<Button
							fullWidth
							variant='gradient'
							size='sm'
							color='red'
							className=''
						>
							<span>Sign in</span>
						</Button>
					</div>
				</div>
			</Collapse>
		</Navbar>
	);
}
