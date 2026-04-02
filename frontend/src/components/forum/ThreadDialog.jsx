import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogHeader, DialogBody, IconButton, Typography } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import PostCard from './PostCard';
import PostEditor from './PostEditor';
import ForumService from '../../services/ForumService';

const ThreadDialog = ({ open, handleClose, isOwner, isTabletop, post, myCharacter, characters = [] }) => {
	const { t } = useTranslation('global');

	const [replies, setReplies] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (open && post?.id) {
			const fetchReplies = async () => {
				setLoading(true);
				try {
					const data = await ForumService.getReplies(post.id);
					console.log('Respuestas obtenidas del servicio:', data.data);
					const fetchedReplies = Array.isArray(data.data) ? data.data : [];
					setReplies(fetchedReplies);
				} catch (error) {
					console.error('Error al cargar las respuestas:', error);
					toast.error(t('forum.errors.fetchReplies'));
				} finally {
					setLoading(false);
				}
			};
			fetchReplies();
		} else {
			setReplies([]);
		}
	}, [open, post?.id, t]);

	const otherCharacters = characters.filter(c => c.id !== myCharacter?.id);

	const handleReplyCreated = newReply => {
		setReplies(prevReplies => [...prevReplies, newReply]);
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
			{post ? (
				<>
					{/* CABECERA DEL DIALOG */}
					<DialogHeader className='flex justify-between items-center border-b border-gray-200 bg-white p-4 rounded-t-lg shrink-0'>
						<Typography variant='h5' color='blue-gray' className='font-bold'>
							{t('forum.dialog.title')}
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
									{t('forum.dialog.originalMessage')}
								</Typography>
								<PostCard post={post} isTimelineView={false} />
							</div>

							{/* SEPARADOR VISUAL */}
							<div className='flex items-center gap-4 py-2'>
								<div className='h-px bg-gray-300 flex-1'></div>
								<Typography variant='small' className='text-gray-500 font-medium'>
									{replies.length} {t('forum.replies')}
								</Typography>
								<div className='h-px bg-gray-300 flex-1'></div>
							</div>

							{/* 2. LISTA DE RESPUESTAS */}
							<div className='space-y-4 pl-4 md:pl-8 border-l-2 border-indigo-50'>
								{loading && <Typography className='text-center text-gray-500 py-4'>Cargando respuestas...</Typography>}
								{replies.map(reply => (
									<PostCard key={reply.id} post={reply} isTimelineView={false} />
								))}

								{replies.length === 0 && (
									<Typography className='text-center text-gray-400 py-4 italic'>{t('forum.noReplies')}</Typography>
								)}
							</div>
						</div>

						{/* 3. ZONA PARA RESPONDER (Fijada abajo) */}
						{post.isLocked ? (
							<div className='p-4 bg-gray-100 border-t border-gray-200 text-center italic text-gray-500 shrink-0'>
								{t('forum.dialog.locked')}
							</div>
						) : (
							<div className='p-4 bg-white border-t border-gray-200 shrink-0'>
								<Typography variant='small' className='text-gray-600 font-bold mb-2 ml-1'>
									{t('forum.dialog.replyToThread')}
								</Typography>

								<PostEditor
									campaignId={post.campaignId}
									myCharacter={myCharacter}
									otherCharacters={otherCharacters}
									isOwner={isOwner}
									isTabletop={isTabletop}
									parentPostId={post.id}
									typePost='REPLY'
									onPostCreated={handleReplyCreated}
								/>
							</div>
						)}
					</DialogBody>
				</>
			) : (
				<div /> /* <-- ESTO ES LO QUE SOLUCIONA EL ERROR DE LA CONSOLA */
			)}
		</Dialog>
	);
};

ThreadDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	isOwner: PropTypes.bool,
	isTabletop: PropTypes.bool,
	post: PropTypes.object,
	myCharacter: PropTypes.object.isRequired,
	characters: PropTypes.array,
};

export default ThreadDialog;
