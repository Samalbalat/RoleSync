import React, { useState, useEffect } from 'react';
import { Typography, Button, Input, Spinner } from '@material-tailwind/react';
import { MagnifyingGlassIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import GeneralListCard from '../../components/forum/GeneralListCard';
import CreateGeneralPost from '../../components/forum/CreateGeneralPost';
import ForumService from '../../services/ForumService';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GeneralForumPage = () => {
	const { t } = useTranslation('global');
	const navigate = useNavigate();

	// Estados para los datos de la API
	const [threads, setThreads] = useState([]);
	const [loading, setLoading] = useState(true);

	// Estados para paginación y búsqueda
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchInput, setSearchInput] = useState('');
	const [activeSearch, setActiveSearch] = useState('');

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Efecto principal: Se dispara al cargar, al cambiar de página o de búsqueda confirmada
	useEffect(() => {
		const fetchThreads = async () => {
			setLoading(true);
			try {
				const response = await ForumService.getGeneralThreads(page, 20, activeSearch);
				setThreads(response.data || []);
				setTotalPages(response.meta?.totalPages || 1);
			} catch (error) {
				console.error('Error fetching general threads:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchThreads();
	}, [page, activeSearch, t]);

	const handleSearch = () => {
		setPage(1); // Si buscamos algo nuevo, volvemos a la página 1
		setActiveSearch(searchInput);
	};

	const handleKeyDown = e => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const handleNextPage = () => setPage(prev => Math.min(prev + 1, totalPages));
	const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 1));

	return (
		<div className='max-w-4xl mx-auto py-8 px-4 w-full flex flex-col gap-6'>
			{/* CABECERA */}
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
				<div>
					<Typography variant='h3' color='blue-gray' className='font-black'>
						{t('forum.general.comunityForum')}
					</Typography>
				</div>

				<div className='flex flex-wrap gap-3 mt-4 md:mt-0'>
					<Button
						variant='outlined'
						color='blue-gray'
						className='flex items-center gap-2'
						onClick={() => navigate('/forum/my-posts')}
					>
						<DocumentTextIcon className='w-5 h-5' />
						{t('forum.general.myPosts')}
					</Button>

					<Button color='indigo' className='flex items-center gap-2 shrink-0' onClick={() => setIsCreateModalOpen(true)}>
						<PlusIcon className='w-5 h-5' />
						{t('forum.general.newThread')}
					</Button>
				</div>
			</div>

			{/* BARRA DE BÚSQUEDA Y FILTROS */}
			<div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-center'>
				<div className='w-full md:w-96 flex gap-2'>
					<Input
						label={t('forum.general.searchThreads')}
						icon={<MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />}
						value={searchInput}
						onChange={e => setSearchInput(e.target.value)}
						onKeyDown={handleKeyDown}
						className='bg-gray-50'
					/>
					<Button color='indigo' className='shrink-0' onClick={handleSearch}>
						{t('common.search')}
					</Button>
				</div>
			</div>

			{/* LISTADO DE HILOS */}
			<div className='flex flex-col gap-3 min-h-[300px]'>
				{loading ? (
					<div className='flex flex-col items-center justify-center py-12'>
						<Spinner className='h-8 w-8 text-indigo-500' />
					</div>
				) : threads.length > 0 ? (
					threads.map(thread => <GeneralListCard key={thread.id} thread={thread} />)
				) : (
					<div className='py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300'>
						<Typography variant='h6' color='blue-gray'>
							{t('forum.general.noResults')}
						</Typography>
						<Typography variant='small'>{t('forum.general.tryDifferentKeywords')}</Typography>
					</div>
				)}
			</div>

			{/* PAGINACIÓN */}
			{!loading && totalPages > 1 && (
				<div className='flex justify-center items-center gap-4 mt-4'>
					<Button variant='text' className='flex items-center gap-2' onClick={handlePrevPage} disabled={page === 1}>
						{t('common.previous')}
					</Button>
					<Typography color='gray' className='font-normal'>
						Página <strong className='text-blue-gray-900'>{page}</strong> de{' '}
						<strong className='text-blue-gray-900'>{totalPages}</strong>
					</Typography>
					<Button variant='text' className='flex items-center gap-2' onClick={handleNextPage} disabled={page === totalPages}>
						{t('common.next')}
					</Button>
				</div>
			)}

			{/* MODAL PARA CREAR HILO */}
			<CreateGeneralPost
				open={isCreateModalOpen}
				handleClose={() => setIsCreateModalOpen(false)}
				onSuccess={() => {
					setPage(1);
				}}
			/>
		</div>
	);
};

export default GeneralForumPage;
