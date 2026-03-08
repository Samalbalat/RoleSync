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
	const hasInsideAccess = isOwner || campaign.userRelation === 'MEMBER';
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
					<CampaignAbout campaign={campaign} isWritten={isWritten} isFull={isFull} t={t} />
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
