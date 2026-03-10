import React, { useCallback, useEffect, useState } from 'react';
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
	Avatar,
	Tabs,
	TabsHeader,
	TabsBody,
	Tab,
	TabPanel,
	Chip,
} from '@material-tailwind/react';
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { getTheme } from '../../utils/themeUtils';
import CampaignCharacterList from '../../components/character/CampaignCharacterList';
import CampaignActionCard from '../../components/campaign/detail/CampaignActionCard';
import CampaignInfoList from '../../components/campaign/detail/CampaignInfoList';
import CampaignAbout from '../../components/campaign/detail/CampaignAbout';
import { NotFoundView, AccessDeniedView } from '../../components/campaign/detail/CampaignErrorViews';
import CampaignService from '../../services/CampaignService';
import CharacterService from '../../services/CharacterService';
import CampaignMembersManager from '../../components/campaign/detail/CampaignMembersManager';
import CampaignTimeline from '../../components/forum/CampaignTimeline';

export default function CampaignDetailPage() {
	const { t } = useTranslation('global');
	const { id } = useParams();
	const theme = getTheme();
	const navigate = useNavigate();

	const [userProfile, setUserProfile] = useState(null);
	const [openAccordion, setOpenAccordion] = useState(0);
	const [campaign, setCampaign] = useState(null);
	const [campaignTemplate, setCampaignTemplate] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchCampaignAndTemplate = useCallback(
		async (showLoading = true) => {
			try {
				if (showLoading) setLoading(true);
				const campaignData = await CampaignService.getCampaignById(id);
				setCampaign(campaignData);

				if (campaignData?.userRelation === 'OWNER') {
					const templates = await CharacterService.getCampaignTemplates(id);
					if (templates?.[0]) setCampaignTemplate(templates[0]);
				}
			} catch (error) {
				console.error('Error al obtener la campaña:', error);
				setCampaign(null);
			} finally {
				if (showLoading) setLoading(false);
			}
		},
		[id],
	);

	useEffect(() => {
		const storedProfile = localStorage.getItem('activeProfile');
		if (storedProfile) {
			try {
				setUserProfile(JSON.parse(storedProfile));
			} catch (error) {
				console.error('Error al leer el perfil:', error);
			}
		}

		fetchCampaignAndTemplate(true);
	}, [fetchCampaignAndTemplate]);

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<Typography variant='h5' color='blue-gray'>
					Cargando campaña...
				</Typography>
			</div>
		);
	}

	if (!campaign) return <NotFoundView t={t} navigate={navigate} />;

	if (userProfile?.type && campaign.type !== userProfile.type) {
		return <AccessDeniedView t={t} navigate={navigate} />;
	}

	const isOwner = campaign.userRelation === 'OWNER';
	const isParticipant = campaign.userRelation === 'MEMBER';
	const hasInsideAccess = isOwner || isParticipant;
	const isWritten = campaign.type === 'WRITTEN';
	const isTabletop = campaign.type === 'TABLETOP';
	const progress = (campaign.currentPlayers / campaign.maxPlayers) * 100;
	const isFull = campaign.currentPlayers >= campaign.maxPlayers;

	const hasForum = hasInsideAccess && (isTabletop || (isWritten && campaign.communication === 'RoleSync'));

	const handleOpenAccordion = value => setOpenAccordion(openAccordion === value ? 0 : value);

	const renderInfoBlock = () => (
		<div className='space-y-6 mt-4'>
			<CampaignInfoList campaign={campaign} isWritten={isWritten} t={t} />
			{!isOwner && (
				<Card className='shadow-sm border border-gray-200 bg-gray-50'>
					<CardBody className='flex items-center gap-4 p-4'>
						<Avatar
							src={campaign.owner?.profileImage || `https://ui-avatars.com/api/?name=DM`}
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

	const tabsData = [
		{
			label: 'Información',
			value: 'info',
			content: <CampaignAbout campaign={campaign} isWritten={isWritten} isFull={isFull} t={t} />,
		},
	];

	if (hasForum) {
		tabsData.push({
			label: isWritten ? 'Rol en Vivo' : 'Foro de Campaña',
			value: 'roleplay',
			content: <CampaignTimeline campaignId={id} isOwner={isOwner} isTabletop={isTabletop} />,
			className: theme.textPrimary, // Mantenemos el estilo que tenías
		});
	}

	return (
		<div className='max-w-7xl mx-auto px-4 py-8 animate-fade-in'>
			{/* Header / Botón Volver */}
			<div className='flex justify-between items-center mb-6'>
				<Button
					variant='text'
					className={`flex items-center gap-2 pl-0 ${theme.textSecondary}`}
					onClick={() => navigate('/find-campaign')}
				>
					<ArrowLeftIcon className='h-4 w-4' /> {t('common.back') || 'Volver'}
				</Button>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* COLUMNA IZQUIERDA: Refactorizada en su propio componente */}
				<div className='lg:col-span-2 space-y-8'>
					{/* Imagen y Cabecera */}
					<div className='relative rounded-2xl overflow-hidden shadow-lg h-[300px] md:h-[400px]'>
						<img
							src={campaign.image || '/default_image.png'}
							alt={campaign.name}
							className='w-full h-full object-cover'
							onError={e => {
								e.target.onerror = null;
								e.target.src = '/default_image.png';
							}}
						/>
						{/* ESTE DIV (Gradiente y Título) VUELVE ADENTRO */}
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

					{/* --- INICIO ZONA DE PESTAÑAS (TABS) --- */}
					<Tabs value='info' className='w-full'>
						{/* Cabecera de las pestañas */}
						<TabsHeader
							className='bg-transparent border-b border-gray-200 rounded-none p-0'
							indicatorProps={{ className: 'bg-transparent border-b-2 border-blue-gray-900 shadow-none rounded-none' }}
						>
							{tabsData.map(({ label, value, className = '' }) => (
								<Tab key={value} value={value} className={`py-3 font-medium ${className}`}>
									{label}
								</Tab>
							))}
						</TabsHeader>

						{/* Contenido de las pestañas */}
						<TabsBody className='pt-6'>
							{tabsData.map(({ value, content }) => (
								<TabPanel key={value} value={value} className='p-0 animate-fade-in'>
									{content}
								</TabPanel>
							))}
						</TabsBody>
					</Tabs>
				</div>

				{/* COLUMNA DERECHA: Actions, Characters e Info */}
				<div className='space-y-6'>
					{hasInsideAccess ? (
						<>
							<CampaignCharacterList campaignId={campaign.id} />
							{/* SI ES EL DUEÑO, MOSTRAMOS EL PANEL DE GESTIÓN DE SOLICITUDES Y MIEMBROS */}
							{isOwner && (
								<CampaignMembersManager
									campaignId={campaign.id}
									t={t}
									themeColor={theme}
									onMemberChange={() => fetchCampaignAndTemplate(false)}
								/>
							)}
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
								<div className={`p-4 border-b border-gray-100 ${theme.bgLight}`}>
									<Typography variant='h6' color='blue-gray'>
										{t('campaign.detail.infoTitle')}
									</Typography>
								</div>
								{renderInfoBlock()}
							</CardBody>
						</Card>
					)}

					{/* Botón Principal de Acción Refactorizado */}
					<div className='sticky top-4 z-10'>
						<CampaignActionCard
							campaign={campaign}
							campaignTemplate={campaignTemplate}
							t={t}
							navigate={navigate}
							isFull={isFull}
							progress={progress}
							themeColor={theme}
							onRefreshData={() => fetchCampaignAndTemplate(false)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
