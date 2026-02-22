import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
	Accordion,
	AccordionHeader,
	AccordionBody,
	Button,
	Card,
	CardBody,
	Typography,
	Chip,
	Avatar,
	Progress,
} from '@material-tailwind/react';
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
	PencilSquareIcon,
	PlayIcon,
	ClockIcon as ClockOutlineIcon,
	ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { mockCampaigns } from '../../data/mockCampaigns';
import CampaignCharacterList from '../../components/character/CampaignCharacterList';
import { mockCampaignCharacters } from '../../data/mockCharacters';
import { getTheme } from '../../utils/themeUtils';

// eslint-disable-next-line no-unused-vars
const InfoRow = ({ icon: IconComponent, color, title, value }) => {
	if (!value) return null;

	const colorMap = new Map([
		['blue', 'bg-blue-50 text-blue-600'],
		['indigo', 'bg-indigo-50 text-indigo-600'],
		['green', 'bg-green-50 text-green-600'],
		['purple', 'bg-purple-50 text-purple-600'],
		['teal', 'bg-teal-50 text-teal-600'],
		['orange', 'bg-orange-50 text-orange-600'],
		['pink', 'bg-pink-50 text-pink-600'],
		['gray', 'bg-gray-100 text-gray-600'],
	]);

	const activeClass = colorMap.get(color) || 'bg-gray-100 text-gray-600';

	return (
		<div className='p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors'>
			<div className={`p-2 rounded-lg ${activeClass}`}>
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

const NotFoundView = ({ t, navigate }) => (
	<div className='flex flex-col items-center justify-center h-screen animate-fade-in'>
		<Typography variant='h4' color='blue-gray'>
			{t('campaign.noResultsFound')}
		</Typography>
		<Button className='mt-4' onClick={() => navigate('/campaigns')}>
			{t('common.back')}
		</Button>
	</div>
);

const AccessDeniedView = ({ t, navigate }) => (
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

const CampaignInfoList = ({ campaign, isWritten, t }) => (
	<div className='divide-y divide-gray-100'>
		<InfoRow icon={LanguageIcon} color='blue' title={t('campaign.language')} value={campaign.language} />
		<InfoRow icon={GlobeAmericasIcon} color='indigo' title={t('campaign.timeZone')} value={campaign.timeZone} />
		<InfoRow
			icon={ChatBubbleLeftRightIcon}
			color='green'
			title={t('campaign.communication')}
			value={campaign.communication}
		/>
		{!isWritten && (
			<>
				<InfoRow icon={BookOpenIcon} color='purple' title={t('campaign.system')} value={campaign.system} />
				<InfoRow icon={MapPinIcon} color='teal' title={t('campaign.location')} value={campaign.location} />

				<InfoRow icon={CalendarDaysIcon} color='orange' title={t('campaign.dayWeek')} value={campaign.dayWeek} />
				<InfoRow
					icon={ClockIcon}
					color='pink'
					title={t('campaign.duration')}
					value={campaign.duration ? `${campaign.duration}` : null}
				/>
			</>
		)}
	</div>
);

const ActionCard = ({ campaign, t, navigate, isFull, progress, themeColor }) => {
	const relation = campaign.userRelation;

	const renderCardContent = () => {
		// Si es el dueño de la campaña
		if (relation === 'OWNER') {
			return (
				<div className='text-center space-y-4'>
					<Typography variant='h5' className={`${themeColor.textPrimary} `}>
						{t('campaign.message.manageCampaign')}
					</Typography>

					<Button
						fullWidth
						size='lg'
						color='blue-gray'
						variant='outlined'
						className='flex items-center justify-center gap-2 border-2'
						onClick={() => navigate(`/campaigns/edit/${campaign.id}`)}
					>
						<PencilSquareIcon className='h-5 w-5' />
						{t('common.edit')}
					</Button>
				</div>
			);
		}

		// Si ya es participante
		if (relation === 'PARTICIPANT') {
			return (
				<div className='text-center space-y-4'>
					<Typography variant='small' className='text-gray-600 mb-4'>
						{t('campaign.message.playerMessage')}
					</Typography>
				</div>
			);
		}

		// Si es visitante o está pendiente (NONE o PENDING)
		const isPending = relation === 'PENDING';

		return (
			<div className='mb-0'>
				<div className='flex justify-between items-center mb-2'>
					<Typography variant='h6' color='blue-gray'>
						{t('campaign.detail.players') || 'Jugadores'}
					</Typography>
					<Typography variant='small' className='font-bold text-gray-600'>
						{campaign.currentPlayers} / {campaign.maxPlayers}
					</Typography>
				</div>
				<Progress value={progress} color={isFull ? 'red' : 'green'} className='h-2 mb-4' />
				<Typography variant='small' className='text-gray-500 mb-6 text-center'>
					{isFull
						? t('campaign.detail.fullMessage') || 'La campaña está llena'
						: t('campaign.detail.spotsLeft', { count: campaign.maxPlayers - campaign.currentPlayers }) ||
							`Quedan ${campaign.maxPlayers - campaign.currentPlayers} plazas`}
				</Typography>

				<Button
					fullWidth
					size='lg'
					color={isPending ? 'blue-gray' : themeColor}
					disabled={isFull || isPending}
					className='flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-base'
					onClick={() => {
						// lógica de la API
						console.log('Solicitando unirse a la campaña', campaign.id);
					}}
				>
					{isPending && <ClockOutlineIcon className='h-5 w-5' />}
					{isPending
						? t('campaign.detail.pending') || 'Solicitud enviada'
						: isFull
							? t('campaign.detail.joinFull') || 'Campaña llena'
							: t('campaign.detail.join') || 'Solicitar unirse'}
				</Button>
			</div>
		);
	};

	return (
		<Card className='shadow-lg border border-gray-100 sticky top-4'>
			<CardBody className='p-6'>{renderCardContent()}</CardBody>
		</Card>
	);
};

// --- COMPONENTE PRINCIPAL ---
export default function CampaignDetailPage() {
	const { t } = useTranslation('global');
	const { id } = useParams();
	const theme = getTheme();
	const navigate = useNavigate();

	const [userProfile, setUserProfile] = useState(null);
	const [openAccordion, setOpenAccordion] = useState(0);

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

	// No existe
	if (!campaign) return <NotFoundView t={t} navigate={navigate} />;

	// Acceso denegado (Comparando tipo de rol)
	if (userProfile && userProfile.type && campaign.type !== userProfile.type) {
		return <AccessDeniedView t={t} navigate={navigate} />;
	}

	const isOwner = campaign.userRelation === 'OWNER';
	const isParticipant = campaign.userRelation === 'PARTICIPANT';
	const hasInsideAccess = isOwner || isParticipant;

	const isWritten = campaign.type === 'WRITTEN';
	const progress = (campaign.currentPlayers / campaign.maxPlayers) * 100;
	const isFull = campaign.currentPlayers >= campaign.maxPlayers;

	const handleOpenAccordion = value => setOpenAccordion(openAccordion === value ? 0 : value);

	const renderInfoBlock = () => (
		<div className='space-y-6 mt-4'>
			<CampaignInfoList campaign={campaign} isWritten={isWritten} t={t} />
			{!isOwner && (
				<Card className='shadow-sm border border-gray-200 bg-gray-50'>
					<CardBody className='flex items-center gap-4 p-4'>
						<Avatar
							src={campaign.owner?.image || `https://ui-avatars.com/api/?name=DM`}
							alt={campaign.owner?.profileName || 'DM'}
							size='lg'
							className='border border-white shadow-sm'
						/>
						<div>
							<Typography variant='small' className='text-gray-500 font-medium'>
								Game Master
							</Typography>
							<Typography variant='h6' color='blue-gray'>
								{campaign.owner?.profileName || 'Dungeon Master'}
							</Typography>
						</div>
					</CardBody>
				</Card>
			)}
		</div>
	);

	return (
		<div className='max-w-7xl mx-auto px-4 py-8 animate-fade-in'>
			{/* Header / Botones Superiores */}
			<div className='flex justify-between items-center mb-6'>
				<Button
					variant='text'
					className={`flex items-center gap-2 pl-0 ${theme.textSecondary}`}
					onClick={() => navigate('/campaigns')}
				>
					<ArrowLeftIcon className='h-4 w-4' /> {t('common.back') || 'Volver'}
				</Button>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* COLUMNA IZQUIERDA: Imagen y Descripción */}
				<div className='lg:col-span-2 space-y-8'>
					<div className='relative rounded-2xl overflow-hidden shadow-lg h-[300px] md:h-[400px]'>
						<img src={campaign.image} alt={campaign.name} className='w-full h-full object-cover' />
						<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8'>
							<div className='flex gap-2 mb-3'>
								<Chip
									value={
										campaign.status === 'OPEN' || campaign.status === 'ACTIVE'
											? t('status.open') || 'Abierta'
											: t('status.full') || 'Cerrada'
									}
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

					{/* Description Section */}
					<Card className='shadow-sm border border-gray-200'>
						<CardBody className='p-6 md:p-8'>
							<Typography variant='h5' color='blue-gray' className='mb-4 font-bold flex items-center gap-2'>
								<BookOpenIcon className='h-6 w-6 text-gray-600' /> {t('campaign.detail.about') || 'Sobre la campaña'}
							</Typography>
							<Typography className='text-gray-600 text-lg leading-relaxed whitespace-pre-line'>
								{campaign.description}
							</Typography>
							<div className='mt-8'>
								<Typography variant='h6' color='blue-gray' className='mb-3'>
									{t('campaign.detail.tags') || 'Etiquetas'}
								</Typography>
								<div className='flex flex-wrap gap-2'>
									{campaign.theme.map((tag, i) => (
										<span
											key={i}
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

				{/* COLUMNA DERECHA: Actions, Characters e Info */}
				<div className='space-y-6'>
					{/* Lógica Condicional: Eres de la campaña VS Eres Visitante */}
					{hasInsideAccess ? (
						<>
							<CampaignCharacterList characters={mockCampaignCharacters || []} />
							<Card className='shadow-sm border border-gray-200'>
								<Accordion
									open={openAccordion === 1}
									icon={
										<ChevronDownIcon className={`h-5 w-5 transition-transform ${openAccordion === 1 ? 'rotate-180' : ''}`} />
									}
								>
									<AccordionHeader
										onClick={() => handleOpenAccordion(1)}
										className={`border-b-0 px-4 py-4 ${theme.bgLight} rounded-t-lg`}
									>
										<Typography variant='h6' color='blue-gray'>
											{t('campaign.message.technicalDetails')}
										</Typography>
									</AccordionHeader>
									<AccordionBody className='pt-0 px-0'>{renderInfoBlock()}</AccordionBody>
								</Accordion>
							</Card>
						</>
					) : (
						<Card className='shadow-sm border border-gray-200'>
							<CardBody className='p-0'>
								<div className='p-4 border-b border-gray-100'>
									<Typography variant='h6' color='blue-gray'>
										{t('campaign.detail.infoTitle')}
									</Typography>
								</div>
								{renderInfoBlock()}
							</CardBody>
						</Card>
					)}

					{/* Botón Principal de Acción */}
					<div className='sticky top-4 z-10'>
						<ActionCard
							campaign={campaign}
							t={t}
							navigate={navigate}
							isFull={isFull}
							progress={progress}
							themeColor={theme}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

CampaignInfoList.propTypes = {
	campaign: PropTypes.object.isRequired,
	isWritten: PropTypes.bool.isRequired,
	t: PropTypes.func.isRequired,
};

ActionCard.propTypes = {
	campaign: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
	isFull: PropTypes.bool.isRequired,
	progress: PropTypes.number.isRequired,
	themeColor: PropTypes.string.isRequired,
};

AccessDeniedView.propTypes = {
	t: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
};

InfoRow.propTypes = {
	icon: PropTypes.elementType.isRequired,
	color: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

NotFoundView.propTypes = {
	t: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
};
