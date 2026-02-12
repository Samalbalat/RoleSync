import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Typography, Chip, Avatar, Progress } from '@material-tailwind/react';
import {
	ArrowLeftIcon,
	CalendarDaysIcon,
	GlobeAltIcon,
	ComputerDesktopIcon,
	ClockIcon,
	BookOpenIcon,
	UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { mockCampaigns } from '../../data/mockCampaigns'; // Tus datos de ejemplo

export default function CampaignDetailPage() {
	const { t } = useTranslation('global');
	const { id } = useParams();
	const navigate = useNavigate();

	// 1. Buscamos la campaña por ID
	const campaign = mockCampaigns.find(c => c.id === Number(id));

	// Si no existe (alguien puso una URL rara), mostramos error o volvemos
	if (!campaign) {
		return (
			<div className='flex flex-col items-center justify-center h-screen'>
				<Typography variant='h4'>{t('campaign.noResultsFound')}</Typography>
				<Button className='mt-4' onClick={() => navigate('/campaigns')}>
					{t('common.back')}
				</Button>
			</div>
		);
	}

	// Lógica visual
	const isWritten = campaign.type === 'WRITTEN';
	const themeColor = isWritten ? 'indigo' : 'deep-orange'; // O el color que uses en tu tema
	const progress = (campaign.currentPlayers / campaign.maxPlayers) * 100;
	const isFull = campaign.currentPlayers >= campaign.maxPlayers;

	return (
		<div className='max-w-7xl mx-auto px-4 py-8 animate-fade-in'>
			{/* BOTÓN VOLVER */}
			<Button
				variant='text'
				className='flex items-center gap-2 mb-6 pl-0 hover:bg-transparent text-gray-600 hover:text-gray-900'
				onClick={() => navigate(-1)}
			>
				<ArrowLeftIcon className='h-4 w-4' /> {t('common.back')}
			</Button>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* --- COLUMNA IZQUIERDA (Principal) --- */}
				<div className='lg:col-span-2 space-y-8'>
					{/* 1. Imagen y Título */}
					<div className='relative rounded-2xl overflow-hidden shadow-lg h-[300px] md:h-[400px]'>
						<img src={campaign.image} alt={campaign.name} className='w-full h-full object-cover' />
						<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8'>
							<div className='flex gap-2 mb-3'>
								<Chip
									value={campaign.status === 'OPEN' || campaign.status === 'ACTIVE' ? t('status.open') : t('status.full')}
									color={isFull ? 'red' : 'green'}
									className='rounded-full'
									size='sm'
								/>
							</div>
							<Typography variant='h2' color='white' className='font-bold text-3xl md:text-4xl'>
								{campaign.name}
							</Typography>
						</div>
					</div>

					{/* 2. Descripción */}
					<Card className='shadow-sm border border-gray-200'>
						<CardBody className='p-6 md:p-8'>
							<Typography variant='h5' color='blue-gray' className='mb-4 font-bold flex items-center gap-2'>
								<BookOpenIcon className='h-6 w-6 text-gray-600' />
								{t('campaign.detail.about')}
							</Typography>
							<Typography className='text-gray-600 text-lg leading-relaxed whitespace-pre-line'>
								{campaign.description}

								<br />
							</Typography>

							<div className='mt-8'>
								<Typography variant='h6' color='blue-gray' className='mb-3'>
									{t('campaign.detail.tags')}
								</Typography>
								<div className='flex flex-wrap gap-2'>
									{campaign.theme.map((tag, index) => (
										<span
											key={index}
											className='bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium border border-gray-200'
										>
											#{tag}
										</span>
									))}
								</div>
							</div>
						</CardBody>
					</Card>
				</div>

				{/* --- COLUMNA DERECHA (Sidebar) --- */}
				<div className='space-y-6'>
					{/* 1. Detalles Técnicos (Info Grid) */}
					<Card className='shadow-sm border border-gray-200'>
						<CardBody className='p-0'>
							<div className='p-4 border-b border-gray-100'>
								<Typography variant='h6' color='blue-gray'>
									{t('campaign.detail.infoTitle')}
								</Typography>
							</div>
							<div className='divide-y divide-gray-100'>
								{/* Idioma */}
								<div className='p-4 flex items-center gap-4'>
									<div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
										<GlobeAltIcon className='h-6 w-6' />
									</div>
									<div>
										<Typography variant='small' className='font-bold text-gray-900'>
											{t('campaign.language')}
										</Typography>
										<Typography variant='small' className='text-gray-600'>
											{campaign.language}
										</Typography>
									</div>
								</div>

								{/* Sistema (Solo si existe) */}
								{campaign.system && (
									<div className='p-4 flex items-center gap-4'>
										<div className='p-2 bg-purple-50 text-purple-600 rounded-lg'>
											<BookOpenIcon className='h-6 w-6' />
										</div>
										<div>
											<Typography variant='small' className='font-bold text-gray-900'>
												{t('campaign.system')}
											</Typography>
											<Typography variant='small' className='text-gray-600'>
												{campaign.system}
											</Typography>
										</div>
									</div>
								)}

								{/* Plataforma */}
								<div className='p-4 flex items-center gap-4'>
									<div className='p-2 bg-green-50 text-green-600 rounded-lg'>
										<ComputerDesktopIcon className='h-6 w-6' />
									</div>
									<div>
										<Typography variant='small' className='font-bold text-gray-900'>
											{isWritten ? t('campaign.communication') : t('campaign.platform')}
										</Typography>
										<Typography variant='small' className='text-gray-600'>
											{campaign.location || campaign.communication || 'N/A'}
										</Typography>
									</div>
								</div>

								{/* Horario (Solo Tabletop) */}
								{!isWritten && campaign.schedule && (
									<div className='p-4 flex items-center gap-4'>
										<div className='p-2 bg-orange-50 text-orange-600 rounded-lg'>
											<CalendarDaysIcon className='h-6 w-6' />
										</div>
										<div>
											<Typography variant='small' className='font-bold text-gray-900'>
												{t('campaign.schedule')}
											</Typography>
											<Typography variant='small' className='text-gray-600'>
												{campaign.schedule}
											</Typography>
										</div>
									</div>
								)}

								{/* Duración */}
								{campaign.duration && (
									<div className='p-4 flex items-center gap-4'>
										<div className='p-2 bg-pink-50 text-pink-600 rounded-lg'>
											<ClockIcon className='h-6 w-6' />
										</div>
										<div>
											<Typography variant='small' className='font-bold text-gray-900'>
												{t('campaign.duration')}
											</Typography>
											<Typography variant='small' className='text-gray-600'>
												{campaign.duration}
											</Typography>
										</div>
									</div>
								)}
							</div>
						</CardBody>
					</Card>

					{/* 2. Tarjeta del Master */}
					<Card className='shadow-sm border border-gray-200 bg-gray-50'>
						<CardBody className='flex items-center gap-4 p-4'>
							<Avatar
								src={campaign.ownerImage}
								alt={campaign.ownerName}
								size='lg'
								className='border border-white shadow-sm'
							/>
							<div>
								<Typography variant='small' className='text-gray-500 font-medium'>
									Game Master
								</Typography>
								<Typography variant='h6' color='blue-gray'>
									{campaign.ownerName}
								</Typography>
							</div>
						</CardBody>
					</Card>

					{/* 3. Tarjeta de Acción y Plazas */}
					<Card className='shadow-lg border border-gray-100 sticky top-4'>
						<CardBody className='p-6'>
							<div className='mb-6'>
								<div className='flex justify-between items-center mb-2'>
									<Typography variant='h6' color='blue-gray'>
										{t('campaign.detail.players')}
									</Typography>
									<Typography variant='small' className='font-bold text-gray-600'>
										{campaign.currentPlayers} / {campaign.maxPlayers}
									</Typography>
								</div>
								<Progress value={progress} color={isFull ? 'red' : 'green'} className='h-2' />
								<Typography variant='small' className='text-gray-500 mt-2 text-center'>
									{isFull
										? t('campaign.detail.fullMessage')
										: t('campaign.detail.spotsLeft', { count: campaign.maxPlayers - campaign.currentPlayers })}
								</Typography>
							</div>

							<Button
								fullWidth
								size='lg'
								color={themeColor}
								disabled={isFull}
								className='shadow-md hover:shadow-lg transition-all text-base'
							>
								{isFull ? t('campaign.detail.joinFull') : t('campaign.detail.join')}
							</Button>
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
}
