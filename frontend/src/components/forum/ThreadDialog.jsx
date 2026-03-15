import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogHeader, DialogBody, IconButton, Typography } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PostCard from './PostCard';
import PostEditor from './PostEditor';
import { mockReplies } from '../../data/mockPosts';

const ThreadDialog = ({ open, handleClose, post }) => {
	if (!post) return null;

	const replies = mockReplies;

	const myMockCharacter = {
		id: 'char-mifo',
		name: 'Mifo',
		avatar: 'https://ui-avatars.com/api/?name=Mifo&background=ffe4e6&color=be123c',
	};

	return (
		<Dialog
			open={open}
			handler={handleClose}
			size='xl'
			className='bg-gray-50 flex flex-col max-h-[90vh]'
			animate={{
				mount: { scale: 1, y: 0 },
				unmount: { scale: 0.9, y: -100 },
			}}
		>
			{/* CABECERA DEL DIALOG */}
			<DialogHeader className='flex justify-between items-center border-b border-gray-200 bg-white p-4 rounded-t-lg shrink-0'>
				<Typography variant='h5' color='blue-gray' className='font-bold'>
					Hilo de conversación
				</Typography>
				<IconButton variant='text' color='blue-gray' onClick={handleClose}>
					<XMarkIcon className='h-6 w-6 stroke-2' />
				</IconButton>
			</DialogHeader>

			{/* CUERPO DEL DIALOG (Aquí está la magia del scroll) */}
			<DialogBody className='p-0 flex flex-col flex-1 overflow-hidden'>
				<div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6'>
					{/* 1. MENSAJE PRINCIPAL (Padre) */}
					<div>
						<Typography variant='small' className='text-gray-500 font-bold uppercase tracking-wider mb-2 ml-1'>
							Mensaje Original
						</Typography>
						<PostCard post={post} isTimelineView={false} />
					</div>

					{/* SEPARADOR VISUAL */}
					<div className='flex items-center gap-4 py-2'>
						<div className='h-px bg-gray-300 flex-1'></div>
						<Typography variant='small' className='text-gray-500 font-medium'>
							{replies.length} respuestas
						</Typography>
						<div className='h-px bg-gray-300 flex-1'></div>
					</div>

					{/* 2. LISTA DE RESPUESTAS */}
					<div className='space-y-4 pl-4 md:pl-8 border-l-2 border-indigo-50'>
						{replies.map(reply => (
							<PostCard key={reply.id} post={reply} isTimelineView={false} />
						))}

						{replies.length === 0 && (
							<Typography className='text-center text-gray-400 py-4 italic'>Nadie ha respondido aún. ¡Anímate!</Typography>
						)}
					</div>
				</div>

				{/* 3. ZONA PARA RESPONDER (Fijada abajo) */}
				{post.isLocked ? (
					<div className='p-4 bg-gray-100 border-t border-gray-200 text-center italic text-gray-500 shrink-0'>
						Este hilo ha sido bloqueado por el DM. No se pueden agregar nuevas respuestas.
					</div>
				) : (
					<div className='p-4 bg-white border-t border-gray-200 shrink-0'>
						<Typography variant='small' className='text-gray-600 font-bold mb-2 ml-1'>
							Tu respuesta
						</Typography>

						<PostEditor campaignId={post.campaignId} myCharacter={myMockCharacter} otherCharacters={[]} />
					</div>
				)}
			</DialogBody>
		</Dialog>
	);
};

ThreadDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	post: PropTypes.object,
};

export default ThreadDialog;
