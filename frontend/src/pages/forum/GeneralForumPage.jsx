import React, { useState } from 'react';
import { Typography, Button, Input } from '@material-tailwind/react';
import { MagnifyingGlassIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import GeneralListCard from '../../components/forum/GeneralListCard';
import CreateGeneralPost from '../../components/forum/CreateGeneralPost';
import { mockGeneralThreads } from '../../data/mockPosts';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GeneralForumPage = () => {
	const { t } = useTranslation('global');
	const [searchQuery, setSearchQuery] = useState('');
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const navigate = useNavigate();

	const filteredThreads = mockGeneralThreads.filter(thread => {
		const matchesSearch =
			thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			thread.content.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesSearch;
	});

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
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className='bg-gray-50'
					/>
					<Button color='indigo' className='shrink-0' onClick={() => console.log('Buscando:', searchQuery)}>
						{t('common.search')}
					</Button>
				</div>
				{/* Aquí podríamos añadir unos Chips clickeables para filtrar por tags populares */}
			</div>

			{/* LISTADO DE HILOS */}
			<div className='flex flex-col gap-3'>
				{filteredThreads.length > 0 ? (
					filteredThreads.map(thread => <GeneralListCard key={thread.id} thread={thread} />)
				) : (
					<div className='py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300'>
						<Typography variant='h6' color='blue-gray'>
							{t('forum.general.noResults')}
						</Typography>
						<Typography variant='small'>{t('forum.general.tryDifferentKeywords')}</Typography>
					</div>
				)}
			</div>

			{/* MODAL PARA CREAR HILO */}
			<CreateGeneralPost open={isCreateModalOpen} handleClose={() => setIsCreateModalOpen(false)} />
		</div>
	);
};

export default GeneralForumPage;
