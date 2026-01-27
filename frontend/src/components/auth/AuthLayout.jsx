import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NarrativeDrawer } from './NarrativeDrawer';
import { TableDrawer } from './TableDrawer';
import { useTranslation } from 'react-i18next';
import { Button } from '@material-tailwind/react';
import { ChatBubbleLeftRightIcon, CubeTransparentIcon } from '@heroicons/react/24/solid';

export const AuthLayout = ({ children }) => {
	const { t } = useTranslation('global');
	const [narrativeOpen, setNarrativeOpen] = useState(false);
	const [tableOpen, setTableOpen] = useState(false);

	return (
		<div className='flex min-h-screen w-full bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/papire-background.jpg')" }}>
			<NarrativeDrawer open={narrativeOpen} onClose={() => setNarrativeOpen(false)} openDrawer={() => setNarrativeOpen(true)} />

			<section className='flex-1 flex flex-col p-4 md:p-8'>
				<div className='w-full flex justify-center mt-4 md:mt-6'>
					<img src='/logo.png' alt='Logo' className='h-40 md:h-72 w-auto object-contain' />
				</div>
				<div className='flex lg:hidden w-full justify-center gap-4 mt-6 z-10 px-4'>
					<Button
						size='sm'
						className='flex items-center gap-2 bg-blue-900/80 border border-blue-500/30 text-blue-100 shadow-lg backdrop-blur-md'
						onClick={() => setNarrativeOpen(true)}
					>
						<ChatBubbleLeftRightIcon className='h-4 w-4' />
						{t('profile.narrative')}
					</Button>

					<Button
						size='sm'
						className='flex items-center gap-2 bg-red-900/80 border border-red-500/30 text-red-100 shadow-lg backdrop-blur-md'
						onClick={() => setTableOpen(true)}
					>
						<CubeTransparentIcon className='h-4 w-4' />
						{t('profile.table')}
					</Button>
				</div>
				<div className='flex-1 flex flex-col mt-5 items-center w-full'>
					<div className='w-full flex justify-center text-center'>
						{/* (Login o Register) */}
						{children}
					</div>
				</div>

				<div className='h-10'></div>
			</section>
			<TableDrawer open={tableOpen} onClose={() => setTableOpen(false)} openDrawer={() => setTableOpen(true)} />
		</div>
	);
};

AuthLayout.propTypes = {
	children: PropTypes.node.isRequired, // 'node' significa cualquier cosa renderizable (HTML, componentes, texto)
};

export default AuthLayout;
