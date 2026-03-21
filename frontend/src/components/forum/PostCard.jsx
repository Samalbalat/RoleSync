import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { LockClosedIcon, LockOpenIcon, ChatBubbleLeftIcon, EyeSlashIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { TbPinnedFilled, TbPinned } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';

marked.use({
	breaks: true,
	gfm: true,
});

const PostCard = ({
	post,
	isTimelineView = false,
	onClickThread,
	isCurrentUserDM,
	onTogglePin,
	onToggleLock,
	isTabletop,
}) => {
	const { t } = useTranslation('global');
	// 1. Convertir el contenido Markdown a HTML puro
	const rawHtml = marked.parse(post.content || '');
	// 2. Limpiar el HTML para evitar inyecciones maliciosas (XSS)
	const cleanContent = DOMPurify.sanitize(rawHtml);

	const [isRevealed, setIsRevealed] = useState(false);

	const formattedDate = new Intl.DateTimeFormat('es-ES', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(post.createdAt || Date.now()));

	// TIPOS DE MENSAJE
	const isSecret = post.visibleToCharacterIds && post.visibleToCharacterIds.length > 0;
	const isDmAnnouncement = post.isOoc && post.isDm;
	const isRegularOoc = post.isOoc && !post.isDm;

	// LÓGICA DE OCULTAMIENTO OOC
	const hideInTimeline = isTimelineView && isRegularOoc;
	const blurInThread = !isTimelineView && isRegularOoc && !isRevealed;

	// Estilos segun tipo de mensaje
	let cardStyles = 'p-4 mb-4 rounded-lg shadow-sm border transition-all duration-200 text-left w-full block';

	if (isTimelineView && !isTabletop) {
		cardStyles += ' hover:shadow-md cursor-pointer';
	}

	if (isDmAnnouncement) {
		cardStyles += ' bg-blue-50 border-blue-300 text-blue-900 border-l-4 border-l-blue-600';
	} else if (isRegularOoc) {
		cardStyles += ' bg-gray-100 border-gray-300 text-gray-600 italic';
	} else if (isSecret) {
		cardStyles += ' bg-purple-50 border-purple-200';
	} else {
		cardStyles += ' bg-white border-gray-200 text-gray-800';
	}

	// Recopilar imágenes: Soporta tanto el formato nuevo del editor (imageUrl) como el array antiguo (mediaUrls)
	const imagesToDisplay = [];
	if (post.mediaUrls && post.mediaUrls.length > 0) {
		imagesToDisplay.push(...post.mediaUrls);
	}
	if (post.imageUrl) {
		imagesToDisplay.push(post.imageUrl);
	}

	return (
		<div className={cardStyles} onClick={() => isTimelineView && !isTabletop && onClickThread?.(post)}>
			{/* CABECERA DEL MENSAJE */}
			<div className='flex justify-between items-start mb-3'>
				<div className='flex items-center gap-3'>
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden border ${isDmAnnouncement ? 'bg-blue-200 text-blue-800 border-blue-400' : 'bg-indigo-100 text-indigo-800 border-gray-200'}`}
					>
						{post.authorCharacterImage ? (
							<img src={post.authorCharacterImage} alt='Avatar' className='w-full h-full object-cover' />
						) : (
							'DM'
						)}
					</div>
					<div className='flex flex-col items-start'>
						<span className='font-bold text-sm text-gray-900'>{post.authorCharacterName || 'Master'}</span>
						<div className='flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5'>
							<span>{formattedDate}</span>
							{post.isEdited && <span className='italic'>(Editado)</span>}

							{/* BADGES DINÁMICOS */}
							{isRegularOoc && !isTabletop && (
								<span className='bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase'>OOC</span>
							)}
							{isDmAnnouncement && (
								<span className='bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm'>
									<MegaphoneIcon className='w-3 h-3 text-white' />
									{t('forum.noticeMaster')}
								</span>
							)}
							{isSecret && <span className='text-purple-600 font-bold text-[10px] uppercase'>{t('forum.whisper')}</span>}
						</div>
					</div>
				</div>

				{/* ICONOS DE ESTADO (Pineado, Bloqueado, Secreto) */}
				<div className='flex items-center gap-1.5 text-gray-400'>
					{isSecret && <EyeSlashIcon className='w-5 h-5 text-purple-500' title={t('forum.secretMessage')} />}

					{isCurrentUserDM ? (
						<>
							{/* BOTÓN PIN - Sigue existiendo para los dos modos */}
							<button
								onClick={e => {
									e.stopPropagation();
									onTogglePin?.(e, post.id);
								}}
								className={`flex items-center justify-center p-1.5 rounded-full transition-colors ${post.isPinned ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-500 hover:text-orange-500 hover:bg-gray-100'}`}
								title={post.isPinned ? t('forum.unpinMessage') : t('forum.pinMessage')}
							>
								{post.isPinned ? <TbPinnedFilled className='w-5 h-5' /> : <TbPinned className='w-5 h-5' />}
							</button>

							{/* BOTÓN LOCK - Oculto si es Tabletop */}
							{!isTabletop && (
								<button
									onClick={e => {
										e.stopPropagation();
										onToggleLock?.(e, post.id);
									}}
									className={`flex items-center justify-center p-1.5 rounded-full transition-colors ${post.isLocked ? 'text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'}`}
									title={post.isLocked ? t('forum.unlockResponses') : t('forum.lockResponses')}
								>
									{post.isLocked ? <LockClosedIcon className='w-5 h-5' /> : <LockOpenIcon className='w-5 h-5' />}
								</button>
							)}
						</>
					) : (
						/* VISTA PARA JUGADORES NORMALES */
						<>
							{post.isPinned && <TbPinnedFilled className='w-5 h-5 text-orange-500' title={t('forum.pinned')} />}
							{/* Oculto el icono del candado si es Tabletop */}
							{!isTabletop && post.isLocked && (
								<LockClosedIcon className='w-5 h-5 text-red-500' title={t('forum.blocked')} />
							)}
						</>
					)}
				</div>
			</div>

			{/* CONTENIDO DEL MENSAJE */}
			{hideInTimeline ? (
				// VISTA TIMELINE: Caja resumen en lugar del texto
				<div className='mt-2 p-3 bg-white/50 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-500'>
					<span className='text-sm font-medium'>{t('forum.campaign.oocMessage')}</span>
					<span className='text-xs'>{t('forum.campaign.oocDescription')}</span>
				</div>
			) : (
				// VISTA DENTRO DEL HILO: Contenido normal o difuminado
				<div
					className={`relative mt-2 transition-all duration-300 rounded-md ${blurInThread ? 'cursor-pointer group overflow-hidden' : ''}`}
					onClick={() => blurInThread && setIsRevealed(true)}
				>
					{/* Texto del post */}
					<div
						className={`prose prose-sm max-w-none break-words ${post.isOoc ? 'prose-p:text-gray-600' : 'prose-p:text-gray-800'} prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-50/50 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-700 ${blurInThread ? 'blur-[5px] opacity-60 select-none pointer-events-none' : ''}`}
						dangerouslySetInnerHTML={{ __html: cleanContent }}
					/>

					{/* Imágenes del post */}
					{imagesToDisplay.length > 0 && (
						<div
							className={`mt-4 grid gap-2 ${imagesToDisplay.length > 1 ? 'grid-cols-2' : 'grid-cols-1 sm:w-2/3'} ${blurInThread ? 'blur-[5px] opacity-60 select-none pointer-events-none' : ''}`}
						>
							{imagesToDisplay.map((url, index) => (
								<img
									key={index}
									src={url}
									alt={`Adjunto ${index + 1}`}
									className='rounded-lg object-cover w-full max-h-64 border border-gray-200 shadow-sm transition-transform hover:opacity-95'
								/>
							))}
						</div>
					)}

					{/* Capa/Botón para revelar el contenido (Solo visible si está en modo blur) */}
					{blurInThread && (
						<div className='absolute inset-0 bg-gray-100/20 flex items-center justify-center'>
							<div className='bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-bold shadow-md border border-gray-200 flex items-center gap-2 group-hover:scale-105 transition-transform'>
								<EyeSlashIcon className='w-4 h-4' /> {t('forum.campaign.revealOoc')}
							</div>
						</div>
					)}
				</div>
			)}

			{/* PIE DE TARJETA - Solo visible si NO es Tabletop */}
			{isTimelineView && !isTabletop && (
				<div className='mt-4 pt-3 border-t border-gray-100 flex justify-end'>
					<div className='flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-bold transition-colors'>
						<ChatBubbleLeftIcon className='w-5 h-5' />
						<span>
							{t('forum.campaign.openThread')} {post.isLocked && '(Bloqueado)'}
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

PostCard.propTypes = {
	post: PropTypes.object.isRequired,
	isTimelineView: PropTypes.bool,
	onClickThread: PropTypes.func,
	isCurrentUserDM: PropTypes.bool,
	onTogglePin: PropTypes.func,
	onToggleLock: PropTypes.func,
	isTabletop: PropTypes.bool,
};

export default PostCard;
