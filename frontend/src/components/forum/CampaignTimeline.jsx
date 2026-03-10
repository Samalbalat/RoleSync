import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Accordion, AccordionHeader, AccordionBody } from '@material-tailwind/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { TbPinnedFilled } from 'react-icons/tb';
import PostCard from './PostCard';
import { mockPosts } from '../../data/mockPosts';
import ThreadDialog from './ThreadDialog';
import PostEditor from './PostEditor';

const CampaignTimeline = ({ campaignId, isOwner, isTabletop }) => {
	const [posts, setPosts] = useState(mockPosts);
	const pinnedPosts = posts.filter(post => post.isPinned);
	const regularPosts = posts.filter(post => !post.isPinned);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedPost, setSelectedPost] = useState(null);
	const [isPinnedOpen, setIsPinnedOpen] = useState(false);

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

	const myMockCharacter = {
		id: 'char-mifo',
		name: 'Mifo',
		avatar: 'https://ui-avatars.com/api/?name=Mifo&background=ffe4e6&color=be123c',
	};

	const mockOtherCharacters = [
		{ id: 'char-elara', name: 'Elara' },
		{ id: 'char-rogue', name: 'El Pícaro' },
	];

	return (
		<div className='flex flex-col gap-4'>
			<Typography variant='h5' color='blue-gray' className='mb-2 font-bold'>
				{isTabletop ? 'Foro de la Campaña' : 'Mesa de Juego (Timeline)'}
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
							Mensajes Fijados del DM ({pinnedPosts.length})
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
								/>
							))}
						</div>
					</AccordionBody>
				</Accordion>
			)}

			<PostEditor
				campaignId={campaignId}
				myCharacter={myMockCharacter}
				otherCharacters={mockOtherCharacters}
				isOwner={isOwner}
				isTabletop={isTabletop}
			/>

			{/* SECCIÓN DE MENSAJES NORMALES */}
			<div className='space-y-4'>
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
					/>
				))}

				{regularPosts.length === 0 && (
					<Typography className='text-center text-gray-500 py-8 italic'>
						{isTabletop ? 'El foro está vacío.' : 'La rol está vacío. ¡Sé el primero en hablar!'}
					</Typography>
				)}
			</div>

			{!isTabletop && <ThreadDialog open={isDialogOpen} handleClose={handleCloseThread} post={selectedPost} />}
		</div>
	);
};

CampaignTimeline.propTypes = {
	campaignId: PropTypes.string.isRequired,
	isOwner: PropTypes.bool.isRequired,
	isTabletop: PropTypes.bool,
};

export default CampaignTimeline;
