import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography, Accordion, AccordionHeader, AccordionBody, Button } from '@material-tailwind/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { TbPinnedFilled } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import PostCard from './PostCard';
import ThreadDialog from './ThreadDialog';
import PostEditor from './PostEditor';
import ForumService from '../../services/ForumService';

const CampaignTimeline = ({ campaignId, isOwner, isTabletop, myCharacter, characters, ownerImage, campaignStatus }) => {
	const { t } = useTranslation('global');

	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [nextCursor, setNextCursor] = useState(null);
	const [hasMore, setHasMore] = useState(false);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedPost, setSelectedPost] = useState(null);
	const [isPinnedOpen, setIsPinnedOpen] = useState(false);

	const isPausedOrCompleted = campaignStatus === 'BREAK' || campaignStatus === 'FINISHED';
	const canWrite = isOwner || (isTabletop ? true : !isPausedOrCompleted);

	useEffect(() => {
		const fetchInitialPosts = async () => {
			try {
				setLoading(true);
				const response = await ForumService.getTimeline(campaignId, null, 20);
				setPosts(response.data || []);
				setNextCursor(response.nextCursor);
				setHasMore(response.hasMore);
			} catch (error) {
				console.error('Error cargando la timeline:', error);
			} finally {
				setLoading(false);
			}
		};

		if (campaignId) {
			fetchInitialPosts();
		}
	}, [campaignId]);

	const handleLoadMore = async () => {
		if (!hasMore || !nextCursor) return;
		try {
			const response = await ForumService.getTimeline(campaignId, nextCursor, 20);
			// Concatenamos los posts antiguos con los nuevos
			setPosts(prevPosts => [...prevPosts, ...(response.data || [])]);
			setNextCursor(response.nextCursor);
			setHasMore(response.hasMore);
		} catch (error) {
			console.error('Error cargando más posts:', error);
		}
	};

	const handlePostCreated = newPost => {
		setPosts(prevPosts => [newPost, ...prevPosts]);
	};

	const pinnedPosts = posts.filter(post => post.isPinned);
	const regularPosts = posts.filter(post => !post.isPinned);

	const handleOpenThread = post => {
		if (isTabletop) return; //Si es tipo Mesa, no habrá hilos
		setSelectedPost(post);
		setIsDialogOpen(true);
	};

	const handleCloseThread = () => {
		setIsDialogOpen(false);
		setTimeout(() => setSelectedPost(null), 300);
	};

	// FUNCIONES DE CONTROL DEL DM (aqui meteremos la llamada a la API para cambiar los estados)
	const handleTogglePin = (e, postId) => {
		e.stopPropagation();
		setPosts(currentPosts => currentPosts.map(p => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p)));
	};

	const handleToggleLock = (e, postId) => {
		e.stopPropagation();
		setPosts(currentPosts => currentPosts.map(p => (p.id === postId ? { ...p, isLocked: !p.isLocked } : p)));
	};

	return (
		<div className='flex flex-col gap-4'>
			<Typography variant='h5' color='blue-gray' className='mb-2 font-bold'>
				{isTabletop ? t('forum.campaign.table') : t('forum.campaign.narrative')}
			</Typography>
			{/* SECCIÓN DE MENSAJES FIJADOS (Acordeón) */}
			{pinnedPosts.length > 0 && (
				<Accordion
					open={isPinnedOpen}
					className='mb-2 border border-orange-200 bg-orange-50/50 rounded-xl overflow-hidden shadow-sm'
					icon={
						<ChevronDownIcon
							className={`h-5 w-5 transition-transform duration-300 text-orange-600 ${isPinnedOpen ? 'rotate-180' : ''}`}
						/>
					}
				>
					<AccordionHeader
						onClick={() => setIsPinnedOpen(!isPinnedOpen)}
						className='border-b-0 px-5 py-4 hover:bg-orange-50/80 transition-colors'
					>
						<div className='flex items-center gap-2 text-sm font-bold text-orange-800'>
							<TbPinnedFilled className='w-5 h-5' />
							{t('forum.campaign.pinned')} ({pinnedPosts.length})
						</div>
					</AccordionHeader>
					<AccordionBody className='px-5 pb-5 pt-0'>
						<div className='space-y-4 pt-2 border-t border-orange-100'>
							{pinnedPosts.map(post => (
								<PostCard
									key={post.id}
									post={post}
									isTimelineView={true}
									onClickThread={isTabletop ? null : handleOpenThread}
									isCurrentUserDM={isOwner}
									onTogglePin={handleTogglePin}
									onToggleLock={handleToggleLock}
									isTabletop={isTabletop}
									ownerImage={ownerImage}
								/>
							))}
						</div>
					</AccordionBody>
				</Accordion>
			)}

			{/* POST EDITOR O AVISO DE SIN PERSONAJE */}
			{canWrite ? (
				myCharacter ? (
					<PostEditor
						campaignId={campaignId}
						myCharacter={myCharacter}
						otherCharacters={characters}
						isOwner={isOwner}
						isTabletop={isTabletop}
						onPostCreated={handlePostCreated}
						typePost='THREAD_START'
						parentPostId={null}
					/>
				) : (
					<div className='p-4 bg-grey-100 border border-orange-200 text-grey-800 rounded-xl shadow-sm flex flex-col items-center justify-center text-center gap-2'>
						<Typography variant='h6' color='blue-gray' className='font-bold'>
							{t('forum.campaign.needCharacter')}
						</Typography>
						<Typography variant='small' className='font-medium opacity-80 max-w-md'>
							{isTabletop ? t('forum.campaign.needCharacterDescTable') : t('forum.campaign.needCharacterDescNarrative')}
						</Typography>
					</div>
				)
			) : (
				<div className='p-4 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl shadow-sm flex flex-col items-center justify-center text-center gap-2'>
					<Typography variant='h6' color='blue-gray' className='font-bold'>
						{t('forum.campaign.readOnly')}
					</Typography>
					<Typography variant='small' className='font-medium opacity-80 max-w-md'>
						{t('forum.campaign.pausedDesc')}
					</Typography>
				</div>
			)}
			{/* SECCIÓN DE MENSAJES NORMALES */}
			<div className='space-y-4'>
				{loading && <Typography className='text-center text-gray-500 py-4'>Cargando posts...</Typography>}
				{regularPosts.map(post => (
					<PostCard
						key={post.id}
						post={post}
						isTimelineView={true}
						onClickThread={isTabletop ? null : handleOpenThread}
						isCurrentUserDM={isOwner}
						onTogglePin={handleTogglePin}
						onToggleLock={handleToggleLock}
						isTabletop={isTabletop}
						ownerImage={ownerImage}
					/>
				))}

				{hasMore && (
					<div className='flex justify-center mt-6'>
						<Button variant='text' color='blue-gray' onClick={handleLoadMore}>
							{t('common.loadMore')}
						</Button>
					</div>
				)}

				{regularPosts.length === 0 && (
					<Typography className='text-center text-gray-500 py-8 italic'>
						{isTabletop ? t('forum.campaign.emptyTable') : t('forum.campaign.emptyNarrative')}
					</Typography>
				)}
			</div>
			{!isTabletop && (
				<ThreadDialog
					open={isDialogOpen}
					handleClose={handleCloseThread}
					isOwner={isOwner}
					isTabletop={isTabletop}
					post={selectedPost}
					myCharacter={myCharacter}
					characters={characters}
					ownerImage={ownerImage}
					campaignStatus={campaignStatus}
				/>
			)}
		</div>
	);
};

CampaignTimeline.propTypes = {
	campaignId: PropTypes.string,
	isOwner: PropTypes.bool,
	isTabletop: PropTypes.bool,
	myCharacter: PropTypes.object,
	characters: PropTypes.arrayOf(PropTypes.object),
	ownerImage: PropTypes.string,
	campaignStatus: PropTypes.string,
};

export default CampaignTimeline;
