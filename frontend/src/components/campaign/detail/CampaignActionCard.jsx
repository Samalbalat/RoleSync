import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Typography, Button, Progress, Avatar, Select, Option } from '@material-tailwind/react';
import {
	PencilSquareIcon,
	DocumentCheckIcon,
	DocumentPlusIcon,
	ClockIcon as ClockOutlineIcon,
	UserCircleIcon,
} from '@heroicons/react/24/outline';
import JoinCampaignModal from './JoinCampaignModal';
import { useLocation } from 'react-router-dom';

export default function CampaignActionCard({
	campaign,
	campaignTemplate,
	t,
	navigate,
	isFull,
	progress,
	themeColor,
	onRefreshData,
	onStatusChange,
}) {
	const relation = campaign.userRelation;
	const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
	const location = useLocation();
	const canRequestJoin = () => {
		if (isFull) return false;

		if (campaign.type === 'TABLETOP') {
			return campaign.status === 'OPEN';
		} else {
			return campaign.status === 'OPEN' || campaign.status === 'ACTIVE';
		}
	};

	const renderCardContent = () => {
		// DUEÑO DE LA CAMPAÑA
		if (relation === 'OWNER') {
			return (
				<div className='text-center space-y-4'>
					<Typography variant='h5' className={`${themeColor.textPrimary}`}>
						{t('campaign.message.manageCampaign')}
					</Typography>

					<div className='text-left'>
						<Select label={t('campaign.status.status')} value={campaign.status} onChange={val => onStatusChange(val)}>
							<Option value='OPEN'>{t('status.open') || 'Abierta'}</Option>
							<Option value='ACTIVE'>{t('status.active') || 'Activa'}</Option>
							<Option value='BREAK'>{t('status.break') || 'En Pausa'}</Option>
							<Option value='FINISHED'>{t('status.finished') || 'Finalizada'}</Option>
							<Option value='DELETED' className='text-red-500 font-medium'>
								{t('status.deleted') || 'Eliminada'}
							</Option>
						</Select>
					</div>
					{/* Grupo de botones de edición */}
					<div className='space-y-4'>
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

						{campaignTemplate ? (
							<Button
								fullWidth
								size='lg'
								color='blue'
								variant='gradient'
								className='flex items-center justify-center gap-2'
								onClick={() =>
									navigate(`/character/templateBuilder?&templateId=${campaignTemplate.id}`, {
										state: { from: location.pathname },
									})
								}
							>
								<DocumentCheckIcon className='h-5 w-5' />
								{t('character.templateBuilder.editTemplate')}
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
								{t('character.templateBuilder.createTemplate')}
							</Button>
						)}
					</div>
				</div>
			);
		}

		// MIEMBRO DE LA CAMPAÑA
		if (relation === 'MEMBER') {
			const hasCharacter = !!campaign.characterId;

			return (
				<div className='text-center space-y-4'>
					<Typography variant='h6' color='blue-gray' className='mb-2'>
						{t('campaign.message.playerMessage')}
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
								onClick={() => navigate(`/character/edit/${campaign.characterId}`, { state: { from: location.pathname } })}
							>
								<PencilSquareIcon className='h-4 w-4' />
								{t('character.editCharacter')}
							</Button>
						</div>
					) : (
						<div className={`${themeColor.bgLight} p-5 rounded-xl border ${themeColor.border} mb-4 shadow-inner`}>
							<Typography variant='small' className={`${themeColor.textPrimary} mb-4 font-medium`}>
								{t('campaign.message.needsCharacter')}
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
								{t('character.createCharacter')}
							</Button>
						</div>
					)}
				</div>
			);
		}

		// VISITANTE O PENDIENTE
		const isPending = relation === 'PENDING';
		const isJoinAllowed = canRequestJoin();

		const getButtonText = () => {
			if (isPending) return t('campaign.detail.pending');
			if (isFull) return t('campaign.detail.joinFull');

			if (!isJoinAllowed) return t('campaign.detail.closed');
			return t('campaign.detail.join');
		};

		return (
			<div className='mb-0'>
				<div className='flex justify-between items-center mb-2'>
					<Typography variant='h6' color='blue-gray'>
						{t('campaign.detail.players')}
					</Typography>
					<Typography variant='small' className='font-bold text-gray-600'>
						{campaign.currentPlayers} / {campaign.maxPlayers}
					</Typography>
				</div>
				<Progress value={progress} color={isFull ? 'red' : 'green'} className='h-2 mb-4' />
				<Typography variant='small' className='text-gray-500 mb-6 text-center'>
					{isFull
						? t('campaign.detail.fullMessage')
						: t('campaign.detail.spotsLeft', { count: campaign.maxPlayers - campaign.currentPlayers })}
				</Typography>

				<Button
					fullWidth
					size='lg'
					color={isPending || !isJoinAllowed ? 'blue-gray' : themeColor.primary}
					disabled={!isJoinAllowed || isPending}
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
	onRefreshData: PropTypes.func.isRequired,
	onStatusChange: PropTypes.func.isRequired,
};
