import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { LockClosedIcon, LockOpenIcon, ChatBubbleLeftIcon, EyeSlashIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { TbPinnedFilled, TbPinned } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';

marked.use({ breaks: true, gfm: true });

// --- AUXILIARES EXTERNOS ---

const formatPostDate = createdAt => {
	return new Intl.DateTimeFormat('es-ES', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(createdAt || Date.now()));
};

const getCardStyles = (isTimelineView, isTabletop, isDmAnnouncement, isRegularOoc, isSecret) => {
	let base = 'p-4 mb-4 rounded-lg shadow-sm border transition-all w-full block text-left';
	if (isTimelineView && !isTabletop) base += ' hover:shadow-md cursor-pointer';
	if (isDmAnnouncement) return `${base} bg-blue-50 border-blue-300 border-l-4 border-l-blue-600`;
	if (isRegularOoc) return `${base} bg-gray-100 border-gray-300 italic`;
	if (isSecret) return `${base} bg-purple-50 border-purple-200`;
	return `${base} bg-white border-gray-200`;
};

// --- CUSTOM HOOKS ---

const usePostMetaData = post => {
	return useMemo(() => {
		const rawHtml = marked.parse(post.content || '');
		const master = post.dm || post.isDm;
		const ooc = post.ooc || post.isOoc;
		const images = [...(post.mediaUrls || [])];
		if (post.imageUrl) images.push(post.imageUrl);

		return {
			isMaster: master,
			isRegularOoc: ooc && !master,
			isDmAnnouncement: ooc && master,
			isSecret: post.visibleToCharacterIds?.length > 0,
			cleanContent: DOMPurify.sanitize(rawHtml),
			imagesToDisplay: images,
		};
	}, [post]);
};

// --- SUB-COMPONENTES ---

const PostHeader = ({ post, isMaster, ownerImage, formattedDate, t, isDmAnnouncement, isSecret }) => {
	let name = 'Sin Nombre';
	let avatarContent = <span className='text-xs font-bold text-red-500'>ERROR</span>;

	if (isMaster) {
		name = 'Master';
		const fallback = 'https://ui-avatars.com/api/?name=DM&background=1e3a8a&color=fff';
		avatarContent = <img src={ownerImage || fallback} alt='Master' className='w-full h-full object-cover' />;
	} else if (post.authorCharacterName || post.authorCharacterImage) {
		name = post.authorCharacterName || 'Sin Nombre';
		avatarContent = (
			<img
				src={post.authorCharacterImage || `https://ui-avatars.com/api/?name=${name}`}
				alt='Char'
				className='w-full h-full object-cover'
			/>
		);
	}

	return (
		<div className='flex items-center gap-3'>
			<div
				className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden border ${isDmAnnouncement ? 'bg-red-200 border-red-400' : 'bg-red-100 border-gray-200'}`}
			>
				{avatarContent}
			</div>
			<div className='flex flex-col items-start'>
				<span className='font-bold text-sm text-gray-900'>{name}</span>
				<div className='flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5'>
					<span>{formattedDate}</span>
					{post.isEdited && <span className='italic'>(Editado)</span>}
					{isDmAnnouncement && (
						<span className='bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1'>
							<MegaphoneIcon className='w-3 h-3' /> {t('forum.noticeMaster')}
						</span>
					)}
					{isSecret && <span className='text-purple-600 font-bold text-[10px] uppercase'>{t('forum.whisper')}</span>}
				</div>
			</div>
		</div>
	);
};

const PostActions = ({ post, isCurrentUserDM, isPostPinned, isPostLocked, onTogglePin, onToggleLock, isTabletop }) => {
	if (!isCurrentUserDM) {
		return (
			<div className='flex items-center gap-1.5 text-gray-400'>
				{isPostPinned && <TbPinnedFilled className='w-5 h-5 text-orange-500' />}
				{!isTabletop && isPostLocked && <LockClosedIcon className='w-5 h-5 text-red-500' />}
			</div>
		);
	}

	return (
		<div className='flex items-center gap-1.5'>
			<button
				onClick={e => {
					e.stopPropagation();
					onTogglePin?.(e, post.id);
				}}
				className={`p-1.5 rounded-full ${isPostPinned ? 'text-orange-500' : 'text-gray-500'}`}
			>
				{isPostPinned ? <TbPinnedFilled className='w-5 h-5' /> : <TbPinned className='w-5 h-5' />}
			</button>
			{!isTabletop && (
				<button
					onClick={e => {
						e.stopPropagation();
						onToggleLock?.(e, post.id);
					}}
					className={`p-1.5 rounded-full ${isPostLocked ? 'text-red-500' : 'text-gray-500'}`}
				>
					{isPostLocked ? <LockClosedIcon className='w-5 h-5' /> : <LockOpenIcon className='w-5 h-5' />}
				</button>
			)}
		</div>
	);
};

const PostContent = ({ cleanContent, imagesToDisplay, blurInThread, setIsRevealed, t }) => {
	return (
		<div
			className={`relative mt-2 ${blurInThread ? 'cursor-pointer' : ''}`}
			onClick={() => blurInThread && setIsRevealed(true)}
		>
			<div
				className={`prose prose-sm max-w-none ${blurInThread ? 'blur-[5px] opacity-60' : ''}`}
				dangerouslySetInnerHTML={{ __html: cleanContent }}
			/>

			{imagesToDisplay.length > 0 && (
				<div
					className={`mt-4 grid gap-2 ${imagesToDisplay.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} ${blurInThread ? 'blur-[5px]' : ''}`}
				>
					{imagesToDisplay.map((url, i) => (
						<img key={i} src={url} className='rounded-lg object-cover w-full max-h-64' alt='Post' />
					))}
				</div>
			)}

			{blurInThread && (
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='bg-white px-4 py-2 rounded-full text-sm font-bold shadow-md flex items-center gap-2'>
						<EyeSlashIcon className='w-4 h-4' /> {t('forum.campaign.revealOoc')}
					</div>
				</div>
			)}
		</div>
	);
};

// --- COMPONENTE PRINCIPAL REFACTORIZADO (< 40 LÍNEAS) ---

const PostCard = ({
	post,
	isTimelineView = false,
	onClickThread,
	isCurrentUserDM,
	onTogglePin,
	onToggleLock,
	isTabletop,
	ownerImage,
}) => {
	const { t } = useTranslation('global');
	const [isRevealed, setIsRevealed] = useState(false);

	const meta = usePostMetaData(post);
	const formattedDate = formatPostDate(post.createdAt);
	const cardStyles = getCardStyles(isTimelineView, isTabletop, meta.isDmAnnouncement, meta.isRegularOoc, meta.isSecret);
	const blurInThread = isTimelineView && meta.isRegularOoc && !isRevealed;

	return (
		<div className={cardStyles} onClick={() => isTimelineView && !isTabletop && onClickThread?.(post)}>
			<div className='flex justify-between items-start mb-3'>
				<PostHeader
					post={post}
					isMaster={meta.isMaster}
					ownerImage={ownerImage}
					formattedDate={formattedDate}
					t={t}
					isDmAnnouncement={meta.isDmAnnouncement}
					isSecret={meta.isSecret}
				/>
				<PostActions
					post={post}
					isCurrentUserDM={isCurrentUserDM}
					isPostPinned={post.pinned || post.isPinned}
					isPostLocked={post.locked || post.isLocked}
					onTogglePin={onTogglePin}
					onToggleLock={onToggleLock}
					isTabletop={isTabletop}
				/>
			</div>

			<PostContent
				cleanContent={meta.cleanContent}
				imagesToDisplay={meta.imagesToDisplay}
				blurInThread={blurInThread}
				setIsRevealed={setIsRevealed}
				t={t}
			/>

			{isTimelineView && !isTabletop && (
				<div className='mt-4 pt-3 border-t border-gray-100 flex justify-end'>
					<div className='flex items-center gap-1 text-sm text-indigo-600 font-bold'>
						<ChatBubbleLeftIcon className='w-5 h-5' /> {t('forum.campaign.openThread')}
					</div>
				</div>
			)}
		</div>
	);
};

// --- VALIDACIONES DE PROPS ---

PostHeader.propTypes = {
	post: PropTypes.object,
	isMaster: PropTypes.bool,
	ownerImage: PropTypes.string,
	formattedDate: PropTypes.string,
	t: PropTypes.func,
	isDmAnnouncement: PropTypes.bool,
	isSecret: PropTypes.bool,
};

PostActions.propTypes = {
	post: PropTypes.object,
	isCurrentUserDM: PropTypes.bool,
	isPostPinned: PropTypes.bool,
	isPostLocked: PropTypes.bool,
	onTogglePin: PropTypes.func,
	onToggleLock: PropTypes.func,
	isTabletop: PropTypes.bool,
};

PostContent.propTypes = {
	cleanContent: PropTypes.string,
	imagesToDisplay: PropTypes.array,
	blurInThread: PropTypes.bool,
	setIsRevealed: PropTypes.func,
	t: PropTypes.func,
};

PostCard.propTypes = {
	post: PropTypes.object,
	isTimelineView: PropTypes.bool,
	onClickThread: PropTypes.func,
	isCurrentUserDM: PropTypes.bool,
	onTogglePin: PropTypes.func,
	onToggleLock: PropTypes.func,
	isTabletop: PropTypes.bool,
	ownerImage: PropTypes.string,
};

export default PostCard;
