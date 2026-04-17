import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Typography, Avatar, Button, Chip, Spinner } from '@material-tailwind/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PostEditor from '../../components/forum/PostEditor';
import ForumService from '../../services/ForumService';
import { useTranslation } from 'react-i18next';

const getCurrentUser = () => {
	try {
		const storedProfile = localStorage.getItem('activeProfile');
		if (storedProfile) {
			const parsedProfile = JSON.parse(storedProfile);
			return {
				id: parsedProfile.name,
				profileName: parsedProfile.name,
				profileImage: null,
			};
		}
	} catch (error) {
		console.error('Error al parsear activeProfile del localStorage:', error);
	}

	return { id: 'unknown', profileName: 'Usuario', profileImage: null };
};

const renderMarkdown = content => {
	const rawHtml = marked.parse(content || '');
	const cleanHtml = DOMPurify.sanitize(rawHtml);
	return { __html: cleanHtml };
};

const ThreadDetailPage = () => {
	const { t } = useTranslation('global');
	const { id } = useParams();
	const navigate = useNavigate();

	// 1. Añadimos estados para manejar los datos reales de la API
	const [thread, setThread] = useState(null);
	const [replies, setReplies] = useState([]);
	const [loading, setLoading] = useState(true);

	const currentUser = getCurrentUser();

	// 2. Cargamos los datos al montar el componente
	useEffect(() => {
		const fetchThreadAndReplies = async () => {
			setLoading(true);
			try {
				// Obtenemos el post padre
				const threadData = await ForumService.getGeneralThreadDetail(id);
				// Ajusta esto dependiendo de si tu Axios devuelve los datos directamente o anidados en .data
				setThread(threadData.data || threadData);

				// Obtenemos las respuestas (reutilizando el getReplies que ya tenías)
				const repliesData = await ForumService.getReplies(id);
				setReplies(Array.isArray(repliesData.data) ? repliesData.data : []);
			} catch (error) {
				console.error('Error fetching thread details:', error);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchThreadAndReplies();
		}
	}, [id, t]);

	const formatDate = isoString => {
		if (!isoString) return '';
		return new Date(isoString).toLocaleDateString('es-ES', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// 3. Manejamos el estado de carga visualmente
	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center py-20'>
				<Spinner className='h-10 w-10 text-indigo-500' />
				<Typography className='mt-4 text-gray-500'>Cargando hilo...</Typography>
			</div>
		);
	}

	if (!thread) {
		return (
			<div className='p-8 text-center flex flex-col items-center gap-4'>
				<Typography variant='h5' color='blue-gray'>
					Hilo no encontrado
				</Typography>
				<Button variant='text' onClick={() => navigate('/forum')} className='flex items-center gap-2'>
					<ArrowLeftIcon className='w-4 h-4' /> Volver
				</Button>
			</div>
		);
	}

	// 4. He añadido "?" (Optional chaining) en los author.profileName por si algún usuario viene sin perfil
	return (
		<div className='max-w-4xl mx-auto py-8 px-4 w-full flex flex-col gap-6'>
			{/* BOTÓN VOLVER */}
			<div>
				<Button
					variant='text'
					color='blue-gray'
					className='flex items-center gap-2 px-3 py-2'
					onClick={() => navigate('/forum')}
				>
					<ArrowLeftIcon className='w-4 h-4' strokeWidth={2.5} />
					{t('common.back')}
				</Button>
			</div>

			{/* HILO ORIGINAL (POST PADRE) */}
			<div className='bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden'>
				<div className='absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50'></div>

				<div className='relative z-10'>
					<Typography variant='h3' color='blue-gray' className='font-black mb-3 leading-tight'>
						{thread.title}
					</Typography>

					{/* TAGS */}
					{thread.tags && thread.tags.length > 0 && (
						<div className='flex gap-2 mb-6'>
							{thread.tags.map(tag => (
								<Chip
									key={tag}
									value={`#${tag}`}
									size='sm'
									variant='ghost'
									className='rounded-full bg-indigo-50 text-indigo-700 lowercase'
								/>
							))}
						</div>
					)}

					{/* AUTOR DEL HILO */}
					<div className='flex items-center gap-3 mb-6 pb-6 border-b border-gray-100'>
						<Avatar
							src={thread.author?.profileImage || `https://ui-avatars.com/api/?name=${thread.author?.profileName || 'User'}`}
							alt={thread.author?.profileName || 'Usuario'}
							size='md'
						/>
						<div>
							<Typography variant='h6' color='blue-gray' className='text-sm'>
								{thread.author?.profileName || 'Usuario Anónimo'}
							</Typography>
							<Typography variant='small' className='text-gray-500 text-xs'>
								{t('forum.campaign.publishedOn')} {formatDate(thread.createdAt)}
							</Typography>
						</div>
					</div>

					{/* CONTENIDO DEL HILO */}
					<Typography
						as='div'
						className='text-gray-800 leading-relaxed prose prose-sm max-w-none'
						dangerouslySetInnerHTML={renderMarkdown(thread.content)}
					/>
				</div>
			</div>

			{/* RESPUESTAS */}
			<div className='flex flex-col gap-4 mt-4'>
				<Typography variant='h5' color='blue-gray' className='font-bold border-b border-gray-200 pb-2'>
					{t('forum.replies')} ({replies.length})
				</Typography>

				{replies.length > 0 ? (
					replies.map(reply => (
						<div key={reply.id} className='bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4'>
							<div className='flex flex-col items-center shrink-0 w-16'>
								<Avatar
									src={
										reply.author?.profileImage ||
										`https://ui-avatars.com/api/?name=${reply.author?.profileName || 'User'}&background=f3f4f6`
									}
									alt={reply.author?.profileName || 'Usuario'}
									size='sm'
								/>
							</div>

							<div className='flex-1'>
								<div className='flex justify-between items-start mb-2'>
									<Typography variant='small' color='blue-gray' className='font-bold'>
										{reply.author?.profileName || 'Usuario Anónimo'}
									</Typography>
									<Typography variant='small' className='text-gray-400 text-[10px]'>
										{formatDate(reply.createdAt)} {reply.isEdited && '(editado)'}
									</Typography>
								</div>
								<Typography
									as='div'
									className='text-gray-700 text-sm whitespace-pre-wrap prose prose-sm max-w-none'
									dangerouslySetInnerHTML={renderMarkdown(reply.content)}
								/>
							</div>
						</div>
					))
				) : (
					<Typography className='text-gray-500 italic py-4 text-center'>
						{t('forum.campaign.noReplies') || 'No hay respuestas todavía.'}
					</Typography>
				)}
			</div>

			{/* EDITOR PARA RESPONDER */}
			{thread.isLocked ? (
				<div className='mt-8 p-4 bg-red-50 text-red-800 rounded-xl text-center border border-red-200'>
					<Typography className='font-bold'>{t('forum.campaign.lockedThread')}</Typography>
					<Typography variant='small'>{t('forum.campaign.noNewReplies')}</Typography>
				</div>
			) : (
				<div className='mt-8'>
					<Typography variant='h6' color='blue-gray' className='mb-4'>
						{t('forum.yourReply')}
					</Typography>
					<PostEditor
						typePost='REPLY'
						isGeneralForum={true}
						parentPostId={thread.id}
						myCharacter={null}
						currentUser={currentUser}
						onPostCreated={newReply => {
							const replyToRender = {
								...newReply,
								author: newReply.author || {
									profileName: currentUser.profileName,
									profileImage: currentUser.profileImage,
								},
							};
							setReplies([...replies, replyToRender]);
						}}
					/>
				</div>
			)}
		</div>
	);
};

export default ThreadDetailPage;
