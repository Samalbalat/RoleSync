import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Typography, Avatar, Chip } from '@material-tailwind/react';
import { ChatBubbleLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { getTheme } from '../../utils/themeUtils';
import { useTranslation } from 'react-i18next';

const GeneralListCard = ({ thread }) => {
	const theme = getTheme();
	const navigate = useNavigate();
	const { t } = useTranslation('global');

	const handleOpenThread = threadId => {
		navigate(`/forum/${threadId}`);
	};

	const formattedDate = new Date(thread.createdAt).toLocaleDateString('es-ES', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	});

	const replyCount = thread.replyCount || 0;

	return (
		<button
			onClick={() => handleOpenThread(thread.id)}
			className={`group p-4 bg-white border border-gray-200 rounded-xl hover:${theme.lightborder} hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 text-left`}
		>
			{/* CABECERA: Autor y Fecha */}
			<div className='flex justify-between items-center'>
				<div className='flex items-center gap-2'>
					<Avatar
						src={
							thread.author?.profileImage ||
							`https://ui-avatars.com/api/?name=${thread.author?.profileName || 'User'}&background=f3f4f6&color=374151`
						}
						alt={thread.author?.profileName || 'User'}
						size='sm'
						className='w-6 h-6 rounded-full'
					/>
					<Typography variant='small' className='font-semibold text-gray-700'>
						{thread.author?.profileName}
					</Typography>
					<Typography variant='small' className='text-gray-400 text-xs'>
						• {formattedDate}
					</Typography>
					{thread.edited && (
						<Typography variant='small' className='text-gray-400 text-[10px] italic'>
							(editado)
						</Typography>
					)}
				</div>

				<div className='flex gap-2'>
					{thread.locked && <LockClosedIcon className='w-4 h-4 text-red-500' title='Bloqueado' />}
				</div>
			</div>

			{/* CUERPO: Título, Tags y Resumen */}
			<div>
				<Typography
					variant='h6'
					color='blue-gray'
					className={`font-bold group-hover:${theme.textPrimary} transition-colors line-clamp-2`}
				>
					{thread.title}
				</Typography>

				{/* TAGS */}
				{thread.tags && thread.tags.length > 0 && (
					<div className='flex gap-2 mt-2 flex-wrap'>
						{thread.tags.map(tag => (
							<Chip
								key={tag}
								value={`#${tag}`}
								size='sm'
								variant='ghost'
								className={`rounded-full text-[10px] py-0.5 px-2 ${theme.bgLight} ${theme.textSecondary}`}
							/>
						))}
					</div>
				)}

				<Typography variant='small' className='text-gray-600 mt-3 line-clamp-2 overflow-hidden text-ellipsis'>
					{thread.content}
				</Typography>
			</div>

			{/* PIE: Estadísticas */}
			<div className='flex items-center gap-4 mt-1 pt-3 border-t border-gray-100'>
				<div className={`flex items-center gap-1.5 text-gray-500 group-hover:${theme.textPrimary} transition-colors`}>
					<ChatBubbleLeftIcon className='w-5 h-5' />
					<Typography variant='small' className='font-medium text-sm'>
						{replyCount} {replyCount === 1 ? t('forum.reply') : t('forum.replies')}
					</Typography>
				</div>
			</div>
		</button>
	);
};

GeneralListCard.propTypes = {
	thread: PropTypes.object.isRequired,
};

export default GeneralListCard;
