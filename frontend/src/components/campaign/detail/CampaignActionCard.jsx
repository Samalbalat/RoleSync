import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Typography, Button, Progress, Avatar } from '@material-tailwind/react';
import {
	PencilSquareIcon,
	DocumentCheckIcon,
	DocumentPlusIcon,
	ClockIcon as ClockOutlineIcon,
	UserCircleIcon,
} from '@heroicons/react/24/outline';
import JoinCampaignModal from './JoinCampaignModal';

export default function CampaignActionCard({
	campaign,
	campaignTemplate,
	t,
	navigate,
	isFull,
	progress,
	themeColor,
	onRefreshData,
}) {
	const relation = campaign.userRelation;
	const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

	const renderCardContent = () => {
		// DUEÑO DE LA CAMPAÑA
		if (relation === 'OWNER') {
			return (
				<div className='text-center space-y-4'>
					<Typography variant='h5' className={`${themeColor.textPrimary}`}>
						{t('campaign.message.manageCampaign') || 'Gestionar Campaña'}
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
						{t('common.edit') || 'Editar'}
					</Button>

					{campaignTemplate ? (
						<Button
							fullWidth
							size='lg'
							color='blue'
							variant='gradient'
							className='flex items-center justify-center gap-2'
							onClick={() =>
								navigate(`/character/templateBuilder?campaignId=${campaign.id}&templateId=${campaignTemplate.id}`)
							}
						>
							<DocumentCheckIcon className='h-5 w-5' />
							{t('character.templateBuilder.editTemplate') || 'Editar Plantilla'}
						</Button>
					) : (
						<Button
							fullWidth
							size='lg'
							color='green'
							variant='gradient'
							className='flex items-center justify-center gap-2'
							onClick={() => navigate(`/character/templateBuilder?campaignId=${campaign.id}`)}
						>
							<DocumentPlusIcon className='h-5 w-5' />
							{t('character.templateBuilder.createTemplate') || 'Crear Plantilla'}
						</Button>
					)}
				</div>
			);
		}

		// MIEMBRO DE LA CAMPAÑA
		if (relation === 'MEMBER') {
			const hasCharacter = !!campaign.characterId;

			return (
				<div className='text-center space-y-4'>
					<Typography variant='h6' color='blue-gray' className='mb-2'>
						{t('campaign.message.playerMessage') || 'Eres miembro de esta campaña'}
					</Typography>

					{hasCharacter ? (
						<div className='bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col items-center gap-3 shadow-inner'>
							{campaign.characterImage ? (
								<Avatar src={campaign.characterImage} alt={campaign.characterName} size='xl' className='shadow-md' />
							) : (
								<UserCircleIcon className='h-16 w-16 text-gray-400' />
							)}

							<Typography variant='h6' className='font-bold text-gray-800'>
								{campaign.characterName}
							</Typography>

							<Button
								fullWidth
								size='md'
								color='blue'
								variant='outlined'
								className='flex items-center justify-center gap-2 mt-2 bg-white'
								onClick={() => navigate(`/character/edit/${campaign.characterId}`)}
							>
								<PencilSquareIcon className='h-4 w-4' />
								{t('character.editCharacter') || 'Editar Personaje'}
							</Button>
						</div>
					) : (
						<div className={`${themeColor.bgLight} p-5 rounded-xl border ${themeColor.border} mb-4 shadow-inner`}>
							<Typography variant='small' className={`${themeColor.textPrimary} mb-4 font-medium`}>
								{t('campaign.message.needsCharacter') || 'Aún no tienes un personaje asociado a esta campaña.'}
							</Typography>
							<Button
								fullWidth
								size='lg'
								color={themeColor.primary}
								variant='gradient'
								className='flex items-center justify-center gap-2'
								onClick={() => navigate(`/createCharacter?campaignId=${campaign.id}`)}
							>
								<DocumentPlusIcon className='h-5 w-5' />
								{t('character.createCharacter') || 'Crear Personaje'}
							</Button>
						</div>
					)}
				</div>
			);
		}

		// VISITANTE O PENDIENTE
		const isPending = relation === 'PENDING';
		const getButtonText = () => {
			if (isPending) return t('campaign.detail.pending') || 'Solicitud enviada';
			if (isFull) return t('campaign.detail.joinFull') || 'Campaña llena';
			return t('campaign.detail.join') || 'Solicitar unirse';
		};

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
					color={isPending ? 'blue-gray' : themeColor.primary}
					disabled={isFull || isPending}
					className='flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-base'
					onClick={() => setIsJoinModalOpen(true)}
				>
					{isPending && <ClockOutlineIcon className='h-5 w-5' />}
					{getButtonText()}
				</Button>
			</div>
		);
	};

	return (
		<>
			<Card className='shadow-lg border border-gray-100'>
				<CardBody className='p-6'>{renderCardContent()}</CardBody>
			</Card>

			<JoinCampaignModal
				isOpen={isJoinModalOpen}
				onClose={() => setIsJoinModalOpen(false)}
				campaignId={campaign.id}
				onSuccess={onRefreshData}
				t={t}
			/>
		</>
	);
}

CampaignActionCard.propTypes = {
	campaign: PropTypes.object.isRequired,
	campaignTemplate: PropTypes.object,
	t: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
	isFull: PropTypes.bool.isRequired,
	progress: PropTypes.number.isRequired,
	themeColor: PropTypes.object.isRequired,
	onRefreshData: PropTypes.func.isRequired, // <-- Nueva prop para recargar los datos tras enviar la solicitud
};
