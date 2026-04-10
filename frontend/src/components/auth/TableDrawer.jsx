import React from 'react';
import { Drawer, Typography, IconButton } from '@material-tailwind/react';
import {
	ChevronLeftIcon,
	XMarkIcon,
	CubeTransparentIcon,
	MagnifyingGlassIcon,
	DocumentTextIcon,
	UserGroupIcon,
	GlobeAltIcon,
	ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/solid';
import PropTypes from 'prop-types';

const tableFeatures = [
	{
		icon: <MagnifyingGlassIcon className='h-6 w-6 text-red-400' />,
		title: 'Encuentra tu Grupo',
		desc: 'Busca campañas activas que encajen con tus gustos, horarios y sistema de juego, y solicita unirte.',
	},
	{
		icon: <UserGroupIcon className='h-6 w-6 text-red-400' />,
		title: 'Domina la Mesa',
		desc: 'Crea y gestiona tus propias campañas. Diseña plantillas personalizadas para las fichas de tus jugadores.',
	},
	{
		icon: <DocumentTextIcon className='h-6 w-6 text-red-400' />,
		title: 'Forja de Personajes',
		desc: 'Construye héroes usando plantillas o crea personajes libres para tu colección personal.',
	},
	{
		icon: <GlobeAltIcon className='h-6 w-6 text-red-400' />,
		title: 'La Taberna Global',
		desc: 'Únete a nuestro foro. Comparte anécdotas, resuelve dudas o busca inspiración para tu sesión.',
	},
	{
		icon: <ChatBubbleBottomCenterTextIcon className='h-7 w-7 text-red-100' />,
		title: 'Foro de Campaña',
		desc: 'Un espacio exclusivo dentro de tu campaña para debatir estrategias y cuadrar horarios entre sesiones.',
		highlight: true, // <--- Propiedad mágica para destacar
	},
];

export function TableDrawer({ open, onClose, openDrawer }) {
	return (
		<>
			{/* --- BARRA LATERAL VISIBLE (TRIGGER) --- */}
			<div
				onMouseEnter={openDrawer}
				className='hidden lg:flex group relative w-20 hover:w-24 h-screen bg-gray-900/85 backdrop-blur-md border-l border-white/10 text-white flex-col items-center justify-center shrink-0 sticky top-0 z-20 cursor-pointer shadow-2xl transition-all duration-300 ease-out'
			>
				<div className='absolute right-0 h-full w-1 bg-gradient-to-b from-transparent via-red-500/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity' />
				<div className='flex flex-col items-center gap-3 transition-transform duration-300 group-hover:scale-105'>
					<div className='absolute w-12 h-12 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500' />
					<CubeTransparentIcon className='h-8 w-8 text-red-100 z-10 drop-shadow-lg' />
					<span className='text-[10px] font-bold tracking-widest uppercase text-red-200 opacity-60 group-hover:opacity-100 transition-all'>
						Mesa
					</span>
				</div>
				<div className='absolute -left-3 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 translate-x-[10px] group-hover:translate-x-0 transition-all duration-300'>
					<div className='bg-red-600 text-white w-6 h-12 rounded-l-md flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]'>
						<ChevronLeftIcon className='h-4 w-4 stroke-2' />
					</div>
				</div>
			</div>

			{/* --- DRAWER EXPANDIDO --- */}
			<Drawer
				placement='right'
				open={open}
				onClose={onClose}
				className='p-0 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 text-white shadow-2xl flex flex-col'
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
				{/* Cabecera */}
				<div className='p-6 md:px-10 md:py-6 flex items-center justify-between border-b border-white/10 shrink-0'>
					<div className='flex items-center gap-4'>
						<CubeTransparentIcon className='h-10 w-10 text-red-500 drop-shadow-md' />
						<Typography variant='h3' color='white' className='font-bold tracking-wide'>
							Rol de Mesa
						</Typography>
					</div>
					<IconButton variant='text' color='white' onClick={onClose} className='hover:bg-white/10'>
						<XMarkIcon strokeWidth={2} className='h-8 w-8' />
					</IconButton>
				</div>

				{/* Contenido scrolleable */}
				<div className='flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8'>
					{/* Imagen Principal */}
					<div className='w-full h-56 rounded-2xl bg-gray-800 border border-white/10 overflow-hidden relative flex items-center justify-center shadow-lg'>
						<span className='text-gray-500 italic text-lg'>Aquí irá la imagen de los dados/taberna</span>
						<div className='absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent'></div>
					</div>

					<Typography variant='lead' className='text-gray-300 font-medium leading-relaxed text-center max-w-4xl mx-auto'>
						Prepara los dados y el mapa. RoleSync te ofrece todas las herramientas para organizar tus partidas presenciales o
						por VTT de forma magistral.
					</Typography>

					{/* Grid de Tarjetas compactas */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center'>
						{tableFeatures.map((feature, idx) => (
							<div
								key={idx}
								className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 shadow-lg ${
									feature.highlight
										? 'bg-gradient-to-br from-red-900/40 to-gray-900/80 border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:-translate-y-1 hover:border-red-400'
										: 'bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1'
								}`}
							>
								<div className='flex items-center gap-3 mb-3'>
									<div className={`p-2.5 rounded-xl shadow-inner ${feature.highlight ? 'bg-red-500/30' : 'bg-gray-800/80'}`}>
										{feature.icon}
									</div>
									<Typography color='white' className='font-bold text-lg leading-tight'>
										{feature.title}
									</Typography>
								</div>
								<Typography className={`${feature.highlight ? 'text-red-100/90' : 'text-gray-400'} text-sm leading-relaxed`}>
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

TableDrawer.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	openDrawer: PropTypes.func.isRequired,
};
