import React from 'react';
import { Drawer, Typography, IconButton } from '@material-tailwind/react';
import { ChevronLeftIcon, XMarkIcon, CubeTransparentIcon } from '@heroicons/react/24/solid';
import PropTypes from 'prop-types';

export function TableDrawer({ open, onClose, openDrawer }) {
	return (
		<>
			{/* --- BARRA LATERAL VISIBLE (TRIGGER DERECHO) --- */}
			<div
				onMouseEnter={openDrawer}
				className='hidden lg:flex group relative w-20 hover:w-24 h-screen bg-gray-900/85 backdrop-blur-md border-l border-white/10 text-white flex-col items-center justify-center shrink-0 sticky top-0 z-20 cursor-pointer shadow-2xl transition-all duration-300 ease-out'
			>
				<div className='absolute right-0 h-full w-1 bg-gradient-to-b from-transparent via-red-500/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity' />
				<div className='flex flex-col items-center gap-3 transition-transform duration-300 group-hover:scale-105'>
					<div className='absolute w-12 h-12 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500' />
					<CubeTransparentIcon className='h-8 w-8 text-red-100 z-10 drop-shadow-lg' />
					<span className='text-[10px] font-bold tracking-widest uppercase text-red-200 opacity-60 group-hover:opacity-100 transition-all'>Mesa</span>
				</div>
				<div className='absolute -left-3 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 translate-x-[10px] group-hover:translate-x-0 transition-all duration-300'>
					<div className='bg-red-600 text-white w-6 h-12 rounded-l-md flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]'>
						<ChevronLeftIcon className='h-4 w-4 stroke-2' />
					</div>
				</div>
			</div>

			{/* --- DRAWER EXPANDIDO (DERECHA) --- */}
			<Drawer
				placement='right'
				open={open}
				onClose={onClose}
				className='p-4 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 text-white shadow-2xl'
				overlayProps={{ className: 'fixed inset-0 h-screen w-screen bg-black/60 backdrop-blur-sm z-[9999]' }}
				size={window.innerWidth > 720 ? window.innerWidth * 0.8 : window.innerWidth}
				transition={{ type: 'tween', duration: 0.75 }}
			>
				<div className='mb-8 flex items-center justify-between border-b border-white/10 pb-4'>
					<div className='flex items-center gap-3'>
						<CubeTransparentIcon className='h-6 w-6 text-red-500' />
						<Typography variant='h5' color='white' className='font-bold tracking-wide'>
							Detalles de la Mesa
						</Typography>
					</div>
					<IconButton variant='text' color='white' onClick={onClose} className='hover:bg-white/10 focus:bg-white/10'>
						<XMarkIcon strokeWidth={2} className='h-6 w-6 text-blue-gray-100' />
					</IconButton>
				</div>

				{/* Contenido */}
				<div className='h-full overflow-y-auto pr-2 custom-scrollbar'>
					<Typography className='text-gray-300 leading-relaxed font-normal text-lg'>
						Aquí encontrarás las herramientas de gestión de la partida: tiradas de dados, mapas, fichas de personajes y control de turnos...
					</Typography>
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
