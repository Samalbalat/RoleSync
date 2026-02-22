import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Typography, Avatar, Button } from '@material-tailwind/react';
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { mockFullCharacters } from '../../data/mockCharacters';
import CharacterDetailDialog from './CharacterDetailDialog';

export default function UserCharacterCarousel() {
	const { t } = useTranslation('global');
	const navigate = useNavigate();

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedCharacterId, setSelectedCharacterId] = useState(null);

	const myCharacters = mockFullCharacters.slice(0, 6);

	const handleOpenDialog = id => {
		setSelectedCharacterId(id);
		setIsDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setIsDialogOpen(false);
	};

	if (!myCharacters || myCharacters.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center py-20'>
				<Typography variant='h5' color='blue-gray' className='mb-4'>
					{t('home.playerCharacters.emptyMessage')}
				</Typography>
				<Button variant='outlined' color='blue' onClick={() => navigate('/createCharacter')}>
					{t('home.playerCharacters.createButton')}
				</Button>
			</div>
		);
	}

	return (
		<section className='w-full py-8 animate-fade-in'>
			<div className='flex justify-between items-end mb-6 px-2'>
				<div>
					<Typography variant='h4' color='blue-gray'>
						{t('home.playerCharacters.title')}
					</Typography>
					<Typography color='gray' className='font-normal mt-1'>
						{t('home.playerCharacters.subtitle')}
					</Typography>
				</div>
				<Button
					variant='text'
					color='blue'
					className='hidden sm:flex items-center gap-2'
					onClick={() => navigate('/characters')}
				>
					{t('common.viewAll')} <ArrowRightIcon className='h-4 w-4' />
				</Button>
			</div>

			{/* Contenedor del Carrusel Horizontal */}
			<div
				className='flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 px-2 scrollbar-hide'
				style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
			>
				{myCharacters.map(char => (
					<Card
						key={char.id}
						className='min-w-[200px] sm:min-w-[240px] snap-start cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100 flex-shrink-0'
						onClick={() => handleOpenDialog(char.id)}
					>
						<CardBody className='flex flex-col items-center text-center p-6'>
							<Avatar
								src={
									char.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random`
								}
								alt={char.name}
								className='h-24 w-24 mb-4 shadow-md border-2 border-white ring-2 ring-indigo-50'
								onError={e => {
									e.target.onerror = null;
									e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random`;
								}}
							/>
							<Typography variant='h5' color='blue-gray' className='mb-1 w-full truncate'>
								{char.name}
							</Typography>

							{char.campaign_name ? (
								<div className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium w-full truncate mt-2'>
									{char.campaign_name}
								</div>
							) : (
								<div className='bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium w-full truncate mt-2'>
									{t('home.playerCharacters.noCampaign')}
								</div>
							)}
						</CardBody>
					</Card>
				))}

				{/* Tarjeta Extra: "Ver todos / Crear Nuevo" al final del carrusel */}
				<Card
					className='min-w-[200px] sm:min-w-[240px] snap-start cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors border-2 border-dashed border-gray-300 bg-gray-50 flex-shrink-0 flex items-center justify-center shadow-none'
					onClick={() => navigate('/characters')}
				>
					<CardBody className='flex flex-col items-center justify-center text-center p-6 h-full'>
						<div className='h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-blue-500'>
							<ArrowRightIcon className='h-8 w-8' />
						</div>
						<Typography variant='h6' color='blue-gray'>
							{t('common.viewAll')} ({mockFullCharacters.length})
						</Typography>
					</CardBody>
				</Card>
			</div>

			<div className='mt-4 sm:hidden flex justify-center'>
				<Button variant='outlined' color='blue' fullWidth onClick={() => navigate('/characters')}>
					{t('common.viewAll')}
				</Button>
			</div>

			<CharacterDetailDialog open={isDialogOpen} handleClose={handleCloseDialog} characterId={selectedCharacterId} />
		</section>
	);
}
