import React from 'react';
import { Drawer, Typography, IconButton } from '@material-tailwind/react';
import {
	ChevronRightIcon,
	XMarkIcon,
	ChatBubbleLeftRightIcon,
	MagnifyingGlassIcon,
	DocumentTextIcon,
	UserGroupIcon,
	GlobeAltIcon,
	BookOpenIcon,
} from '@heroicons/react/24/solid';
import PropTypes from 'prop-types';

const narrativeFeatures = [
	{
		icon: <MagnifyingGlassIcon className='h-6 w-6 text-blue-400' />,
		title: 'Busca tu Historia',
		desc: 'Encuentra universos y campañas narrativas que busquen escritores como tú y solicita unirte a la trama.',
	},
	{
		icon: <UserGroupIcon className='h-6 w-6 text-blue-400' />,
		title: 'Crea tu Universo',
		desc: 'Funda tus campañas. Establece plantillas de fichas para mantener la coherencia en el lore de tu mundo.',
	},
	{
		icon: <DocumentTextIcon className='h-6 w-6 text-blue-400' />,
		title: 'Biblioteca de Personajes',
		desc: 'Diseña protagonistas para campañas específicas o crea personajes libres esperando su momento.',
	},
	{
		icon: <GlobeAltIcon className='h-6 w-6 text-blue-400' />,
		title: 'Foro de la Comunidad',
		desc: 'Participa en discusiones, comparte tus mejores escritos o debate sobre la creación de mundos.',
	},
	{
		icon: <BookOpenIcon className='h-7 w-7 text-cyan-100' />,
		title: 'Crónicas Integradas',
		desc: 'Rolea directamente en nuestra plataforma mediante un sistema de texto adaptado para la inmersión total.',
		highlight: true,
	},
];

export function NarrativeDrawer({ open, onClose, openDrawer }) {
	return (
		<>
			{/* --- BARRA LATERAL VISIBLE (TRIGGER) --- */}
			<div
				onMouseEnter={openDrawer}
				className='hidden lg:flex group relative w-20 hover:w-24 h-screen bg-gray-900/85 backdrop-blur-md border-r border-white/10 text-white flex-col items-center justify-center shrink-0 sticky top-0 z-20 cursor-pointer shadow-2xl transition-all duration-300 ease-out'
			>
				<div className='absolute left-0 h-full w-1 bg-gradient-to-b from-transparent via-blue-500/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity' />
				<div className='flex flex-col items-center gap-3 transition-transform duration-300 group-hover:scale-105'>
					<div className='absolute w-12 h-12 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500' />
					<ChatBubbleLeftRightIcon className='h-8 w-8 text-blue-100 z-10 drop-shadow-lg' />
					<span className='text-[10px] font-bold tracking-widest uppercase text-blue-200 opacity-60 group-hover:opacity-100 transition-all'>
						Narrativo
					</span>
				</div>
				<div className='absolute -right-3 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300'>
					<div className='bg-blue-600 text-white w-6 h-12 rounded-r-md flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]'>
						<ChevronRightIcon className='h-4 w-4 stroke-2' />
					</div>
				</div>
			</div>

			{/* --- DRAWER EXPANDIDO --- */}
			<Drawer
				placement='left'
				open={open}
				onClose={onClose}
				className='p-0 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 text-white shadow-2xl flex flex-col'
				overlayProps={{ className: 'fixed inset-0 h-screen w-screen bg-black/60 backdrop-blur-sm z-[9999]' }}
				size={
					window.innerWidth > 1280
						? 1150
						: window.innerWidth > 1024
							? 960
							: window.innerWidth > 720
								? 600
								: window.innerWidth
				}
				transition={{ type: 'tween', duration: 0.5 }}
			>
				<div className='p-6 md:px-10 md:py-6 flex items-center justify-between border-b border-white/10 shrink-0'>
					<div className='flex items-center gap-4'>
						<ChatBubbleLeftRightIcon className='h-10 w-10 text-blue-500 drop-shadow-md' />
						<Typography variant='h3' color='white' className='font-bold tracking-wide'>
							Rol Narrativo
						</Typography>
					</div>
					<IconButton variant='text' color='white' onClick={onClose} className='hover:bg-white/10'>
						<XMarkIcon strokeWidth={2} className='h-8 w-8' />
					</IconButton>
				</div>

				<div className='flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8'>
					<div className='w-full rounded-2xl bg-gray-800 border border-white/10 overflow-hidden relative shadow-lg'>
						<img src={'DrawerNarrative.png'} alt='El Espejo del Personaje' className='w-full h-auto block opacity-80' />
						<div className='absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent'></div>
					</div>

					<Typography variant='lead' className='text-gray-300 font-medium leading-relaxed text-center max-w-4xl mx-auto'>
						Donde las palabras cobran vida. Gestiona tus personajes, encuentra co-escritores y desarrolla tramas profundas a
						tu propio ritmo.
					</Typography>

					{/* Grid de Tarjetas compactas */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center'>
						{narrativeFeatures.map((feature, idx) => (
							<div
								key={idx}
								className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 shadow-lg ${
									feature.highlight
										? 'bg-gradient-to-br from-blue-900/40 to-gray-900/80 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:-translate-y-1 hover:border-blue-400'
										: 'bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1'
								}`}
							>
								<div className='flex items-center gap-3 mb-3'>
									<div
										className={`p-2.5 rounded-xl shadow-inner ${feature.highlight ? 'bg-blue-500/30' : 'bg-gray-800/80'}`}
									>
										{feature.icon}
									</div>
									<Typography color='white' className='font-bold text-lg leading-tight'>
										{feature.title}
									</Typography>
								</div>
								<Typography
									className={`${feature.highlight ? 'text-blue-100/90' : 'text-gray-400'} text-sm leading-relaxed`}
								>
									{feature.desc}
								</Typography>
							</div>
						))}
					</div>
				</div>
			</Drawer>
		</>
	);
}

NarrativeDrawer.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	openDrawer: PropTypes.func.isRequired,
};
