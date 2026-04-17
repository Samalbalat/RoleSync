import React, { useState, useEffect } from 'react';
import { Typography, Button, Spinner } from '@material-tailwind/react';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import GeneralListCard from '../../components/forum/GeneralListCard';
import ForumService from '../../services/ForumService';
import { useTranslation } from 'react-i18next';

const MyPostsPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation('global');

	const [myPosts, setMyPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		const fetchMyPosts = async () => {
			setIsLoading(true);
			try {
				const response = await ForumService.getMyThreads(page, 20);
				setMyPosts(response.data || []);
				setTotalPages(response.meta?.totalPages || 1);
			} catch (error) {
				console.error('Error cargando mis posts:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMyPosts();
	}, [page]);

	const handleNextPage = () => setPage(prev => Math.min(prev + 1, totalPages));
	const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 1));

	return (
		<div className='max-w-4xl mx-auto py-8 px-4 w-full flex flex-col gap-6'>
			{/* CABECERA CON BOTÓN VOLVER */}
			<div>
				<Button
					variant='text'
					color='blue-gray'
					className='flex items-center gap-2 px-3 py-2 mb-4'
					onClick={() => navigate('/forum')}
				>
					<ArrowLeftIcon className='w-4 h-4' strokeWidth={2.5} />
					{t('common.back')}
				</Button>

				<div className='flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
					<div className='p-3 bg-indigo-50 rounded-xl'>
						<DocumentTextIcon className='w-8 h-8 text-indigo-500' />
					</div>
					<div>
						<Typography variant='h3' color='blue-gray' className='font-black'>
							{t('forum.myPosts.title')}
						</Typography>
						<Typography className='text-gray-500 mt-1'>{t('forum.myPosts.subtitle')}</Typography>
					</div>
				</div>
			</div>

			{/* LISTADO DE MIS HILOS */}
			<div className='flex flex-col gap-3 min-h-[300px]'>
				{isLoading ? (
					<div className='flex flex-col items-center justify-center py-12'>
						<Spinner className='h-10 w-10 text-indigo-500' />
						<Typography className='mt-4 text-gray-500'>{t('common.loading')}</Typography>
					</div>
				) : myPosts.length > 0 ? (
					myPosts.map(thread => <GeneralListCard key={thread.id} thread={thread} />)
				) : (
					<div className='py-16 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm'>
						<DocumentTextIcon className='w-12 h-12 mx-auto text-gray-300 mb-3' />
						<Typography variant='h5' color='blue-gray'>
							{t('forum.myPosts.emptyTitle')}
						</Typography>
						<Typography variant='small' className='mb-6 mt-1'>
							{t('forum.myPosts.emptySubtitle')}
						</Typography>
						<Button color='indigo' variant='outlined' onClick={() => navigate('/forum')}>
							{t('forum.myPosts.emptyButton')}
						</Button>
					</div>
				)}
			</div>

			{/* PAGINACIÓN */}
			{!isLoading && totalPages > 1 && (
				<div className='flex justify-center items-center gap-4 mt-4'>
					<Button variant='text' onClick={handlePrevPage} disabled={page === 1}>
						{t('common.previous')}
					</Button>
					<Typography color='gray' className='font-normal'>
						Página <strong className='text-blue-gray-900'>{page}</strong> de{' '}
						<strong className='text-blue-gray-900'>{totalPages}</strong>
					</Typography>
					<Button variant='text' onClick={handleNextPage} disabled={page === totalPages}>
						{t('common.next')}
					</Button>
				</div>
			)}
		</div>
	);
};

export default MyPostsPage;
