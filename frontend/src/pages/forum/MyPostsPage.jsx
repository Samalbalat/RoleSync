import React, { useState, useEffect } from 'react';
import { Typography, Button, Spinner } from '@material-tailwind/react';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import GeneralListCard from '../../components/forum/GeneralListCard';
import { mockGeneralThreads } from '../../data/mockPosts';
import { useTranslation } from 'react-i18next';

const MyPostsPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation('global');
	const [myPosts, setMyPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Simulamos la carga desde la API
	useEffect(() => {
		const fetchMyPosts = async () => {
			setIsLoading(true);
			try {
				await new Promise(resolve => setTimeout(resolve, 800));
				const filteredPosts = mockGeneralThreads.filter(
					t => t.author.id === 'user-1' || t.author.profileName === 'MiUsuario',
				);

				setMyPosts(filteredPosts.length > 0 ? filteredPosts : [mockGeneralThreads[0]]);
			} catch (error) {
				console.error('Error cargando mis posts:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMyPosts();
	}, []);

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
			<div className='flex flex-col gap-3'>
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
		</div>
	);
};

export default MyPostsPage;
