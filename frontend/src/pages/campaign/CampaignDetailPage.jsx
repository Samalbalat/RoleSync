import React, { useEffect, useState } from 'react'; // Añadimos useState y useEffect
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Typography, Chip, Avatar, Progress } from '@material-tailwind/react';
import {
	ArrowLeftIcon,
	CalendarDaysIcon,
	ClockIcon,
	BookOpenIcon,
	LanguageIcon,
	GlobeAmericasIcon,
	ChatBubbleLeftRightIcon,
	MapPinIcon,
	ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { mockCampaigns } from '../../data/mockCampaigns';

// --- COMPONENTE AUXILIAR (InfoRow) ---
const InfoRow = ({ icon: IconComponent, color, title, value }) => {
	if (!value) return null;

	const colorClasses = {
		blue: 'bg-blue-50 text-blue-600',
		indigo: 'bg-indigo-50 text-indigo-600',
		green: 'bg-green-50 text-green-600',
		purple: 'bg-purple-50 text-purple-600',
		teal: 'bg-teal-50 text-teal-600',
		orange: 'bg-orange-50 text-orange-600',
		pink: 'bg-pink-50 text-pink-600',
		gray: 'bg-gray-100 text-gray-600',
	};

	return (
		<div className='p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors'>
			<div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.gray}`}>
				<IconComponent className='h-6 w-6' />
			</div>
			<div>
				<Typography variant='small' className='font-bold text-gray-900'>
					{title}
				</Typography>
				<Typography variant='small' className='text-gray-600 font-medium'>
					{value}
				</Typography>
			</div>
		</div>
	);
};

// --- COMPONENTE PRINCIPAL ---
export default function CampaignDetailPage() {
	const { t } = useTranslation('global');
	const { id } = useParams();
	const navigate = useNavigate();

	const [userProfile, setUserProfile] = useState(null);

	useEffect(() => {
		const storedProfile = localStorage.getItem('activeProfile');
		if (storedProfile) {
			try {
				const parsedProfile = JSON.parse(storedProfile);
				setUserProfile(parsedProfile);
			} catch (error) {
				console.error('Error al leer el perfil:', error);
			}
		}
	}, []);

	const campaign = mockCampaigns.find(c => c.id === Number(id));

	// Si no existe la campaña
	if (!campaign) {
		return (
			<div className='flex flex-col items-center justify-center h-screen animate-fade-in'>
				<Typography variant='h4' color='blue-gray'>
					{t('campaign.noResultsFound')}
				</Typography>
				<Button className='mt-4' onClick={() => navigate('/campaigns')}>
					{t('common.back')}
				</Button>
			</div>
		);
	}

	// 2. COMPROBACIÓN DE SEGURIDAD

	if (userProfile && campaign.type !== userProfile.type) {
		return (
			<div className='flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-fade-in'>
				<div className='p-6 bg-red-50 rounded-full mb-4'>
					<ShieldExclamationIcon className='h-16 w-16 text-red-500' />
				</div>
				<Typography variant='h3' color='blue-gray' className='mb-2'>
					{t('auth.accessDenied')}
				</Typography>
				<Typography className='text-gray-600 max-w-md mb-8'>{t('campaign.accessDeniedMessage')}</Typography>
				<Button color='gray' variant='outlined' onClick={() => navigate('/campaigns')}>
					{t('common.back')}
				</Button>
			</div>
		);
	}

	const isWritten = campaign.type === 'WRITTEN';
	const themeColor = isWritten ? 'indigo' : 'deep-orange';
	const progress = (campaign.currentPlayers / campaign.maxPlayers) * 100;
	const isFull = campaign.currentPlayers >= campaign.maxPlayers;

	return (
		<div className='max-w-7xl mx-auto px-4 py-8 animate-fade-in'>
			<Button
				variant='text'
				className='flex items-center gap-2 mb-6 pl-0 hover:bg-transparent text-gray-600 hover:text-gray-900'
				onClick={() => navigate(-1)}
			>
				<ArrowLeftIcon className='h-4 w-4' /> {t('common.back')}
			</Button>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* --- COLUMNA IZQUIERDA --- */}
				<div className='lg:col-span-2 space-y-8'>
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
								<Chip
									value={campaign.type}
									color={isWritten ? 'indigo' : 'orange'}
									className='rounded-full border-none bg-white/20 text-white'
									size='sm'
									variant='filled'
								/>
							</div>
							<Typography variant='h2' color='white' className='font-bold text-3xl md:text-4xl'>
								{campaign.name}
							</Typography>
						</div>
					</div>

					<Card className='shadow-sm border border-gray-200'>
						<CardBody className='p-6 md:p-8'>
							<Typography variant='h5' color='blue-gray' className='mb-4 font-bold flex items-center gap-2'>
								<BookOpenIcon className='h-6 w-6 text-gray-600' />
								{t('campaign.detail.about')}
							</Typography>
							<Typography className='text-gray-600 text-lg leading-relaxed whitespace-pre-line'>
								{campaign.description}
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

				{/* --- COLUMNA DERECHA --- */}
				<div className='space-y-6'>
					<Card className='shadow-sm border border-gray-200'>
						<CardBody className='p-0'>
							<div className='p-4 border-b border-gray-100'>
								<Typography variant='h6' color='blue-gray'>
									{t('campaign.detail.infoTitle')}
								</Typography>
							</div>

							<div className='divide-y divide-gray-100'>
								<InfoRow icon={LanguageIcon} color='blue' title={t('campaign.language')} value={campaign.language} />
								<InfoRow
									icon={GlobeAmericasIcon}
									color='indigo'
									title={t('campaign.timeZone') || 'Zona Horaria'}
									value={campaign.timeZone}
								/>
								<InfoRow
									icon={ChatBubbleLeftRightIcon}
									color='green'
									title={t('campaign.communication')}
									value={campaign.communication}
								/>

								{!isWritten && (
									<>
										<InfoRow icon={BookOpenIcon} color='purple' title={t('campaign.system')} value={campaign.system} />
										<InfoRow
											icon={MapPinIcon}
											color='teal'
											title={t('campaign.location') || t('campaign.platform')}
											value={campaign.location}
										/>
										<InfoRow
											icon={CalendarDaysIcon}
											color='orange'
											title={t('campaign.schedule')}
											value={campaign.schedule}
										/>
										<InfoRow
											icon={ClockIcon}
											color='pink'
											title={t('campaign.duration')}
											value={campaign.duration ? `${campaign.duration}` : null}
										/>
									</>
								)}
							</div>
						</CardBody>
					</Card>

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
