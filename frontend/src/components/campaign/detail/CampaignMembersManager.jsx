import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
	Card,
	CardBody,
	Typography,
	Avatar,
	Button,
	Spinner,
	Tooltip,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Textarea,
} from '@material-tailwind/react';
import { CheckIcon, XMarkIcon, UserMinusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import CampaignService from '../../../services/CampaignService';
import ProfileDetailModal from '../../profile/ProfileDetailModal';

export default function CampaignMembersManager({ campaignId, t, themeColor, onMemberChange, maxPlayers, profileType }) {
	const [participants, setParticipants] = useState([]);
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(null);

	const [kickModal, setKickModal] = useState({
		isOpen: false,
		profileName: '',
		message: '',
	});

	const [rejectModal, setRejectModal] = useState({
		isOpen: false,
		profileName: '',
		message: '',
	});

	const [viewProfileModal, setViewProfileModal] = useState({
		isOpen: false,
		profileName: '',
	});

	const fetchMembersAndRequests = useCallback(async () => {
		try {
			setLoading(true);
			const [participantsData, requestsData] = await Promise.all([
				CampaignService.getCampaignParticipants(campaignId),
				CampaignService.getCampaignRequests(campaignId),
			]);
			const normalizedParticipants = (participantsData || []).map(item => item.participants || item);
			setParticipants(normalizedParticipants);
			setRequests(requestsData || []);
		} catch (error) {
			console.error('Error al cargar miembros y solicitudes:', error);
		} finally {
			setLoading(false);
		}
	}, [campaignId]);

	useEffect(() => {
		fetchMembersAndRequests();
	}, [fetchMembersAndRequests]);

	// Manejar Aceptar o Rechazar
	const handleRequestAction = async (profileName, status, message = '') => {
		try {
			setActionLoading(profileName);
			await CampaignService.updateRequestStatus(campaignId, profileName, status, message);
			await fetchMembersAndRequests();

			if (onMemberChange && status === 'ACCEPT') {
				onMemberChange();
			}
		} catch (error) {
			console.error(`Error al actualizar estado a ${status}:`, error);
		} finally {
			setActionLoading(null);
		}
	};

	// --- Controles Modal Rechazar ---
	const handleOpenRejectModal = profileName => {
		setRejectModal({ isOpen: true, profileName, message: '' });
	};

	const handleCloseRejectModal = () => {
		setRejectModal({ isOpen: false, profileName: '', message: '' });
	};

	const confirmReject = async () => {
		const { profileName, message } = rejectModal;
		if (!profileName) return;

		handleCloseRejectModal();
		await handleRequestAction(profileName, 'REJECT', message);
	};

	// --- Controles Modal Expulsar ---
	const handleOpenKickModal = profileName => {
		setKickModal({ isOpen: true, profileName, message: '' });
	};

	const handleCloseKickModal = () => {
		setKickModal({ isOpen: false, profileName: '', message: '' });
	};

	const confirmKick = async () => {
		const { profileName, message } = kickModal;
		if (!profileName) return;

		try {
			setActionLoading(profileName);
			handleCloseKickModal();

			await CampaignService.kickMember(campaignId, profileName, message);

			await fetchMembersAndRequests();
			if (onMemberChange) onMemberChange();
		} catch (error) {
			console.error('Error al expulsar jugador:', error);
		} finally {
			setActionLoading(null);
		}
	};

	if (loading)
		return (
			<div className='flex justify-center p-4'>
				<Spinner color='blue' />
			</div>
		);

	return (
		<div className='space-y-6'>
			{/* SECCIÓN DE SOLICITUDES PENDIENTES */}
			{requests.length > 0 && (
				<Card className={`shadow-sm border ${themeColor.borders} bg-orange-50/30`}>
					<CardBody className='p-4'>
						<Typography variant='h6' color='blue-gray' className='mb-4 flex items-center gap-2'>
							<span className='relative flex h-3 w-3'>
								<span
									className={`animate-ping absolute inline-flex h-full w-full rounded-full ${themeColor.bgLight} opacity-75`}
								></span>
								<span className={`relative inline-flex rounded-full h-3 w-3 ${themeColor.bgDark}`}></span>
							</span>
							{t('campaign.members.pendingRequests')} {requests.length}
						</Typography>
						<div className='space-y-3'>
							{requests.map((req, index) => (
								<div
									key={req.profileId || req.id || `req-${index}`}
									className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100'
								>
									<div
										className='flex items-center gap-3 w-full sm:w-auto cursor-pointer hover:opacity-80 transition-opacity'
										onClick={e => {
											e.stopPropagation();
											setViewProfileModal({ isOpen: true, profileName: req.profileName });
										}}
									>
										<Avatar
											src={req.profileImage || 'https://ui-avatars.com/api/?name=User'}
											alt={req.profileName}
											size='md'
										/>
										<div>
											<Typography variant='small' color='blue-gray' className='font-bold'>
												{req.profileName}
											</Typography>
											<Typography variant='small' className='text-gray-500 italic text-xs mt-1'>
												"{req.message}"
											</Typography>
										</div>
									</div>
									<div className='flex items-center gap-2 self-end sm:self-auto'>
										<Tooltip content={t('common.accept')}>
											<Button
												size='sm'
												color='green'
												variant='text'
												className='px-2'
												disabled={actionLoading === req.profileName}
												onClick={e => {
													e.stopPropagation();
													handleRequestAction(req.profileName, 'ACCEPT');
												}}
											>
												<CheckIcon className='h-5 w-5 pointer-events-none' />
											</Button>
										</Tooltip>
										<Tooltip content={t('common.reject')}>
											<Button
												size='sm'
												color='red'
												variant='text'
												className='px-2'
												disabled={actionLoading === req.profileName}
												onClick={e => {
													e.stopPropagation();
													handleOpenRejectModal(req.profileName);
												}}
											>
												<XMarkIcon className='h-5 w-5 pointer-events-none' />
											</Button>
										</Tooltip>
									</div>
								</div>
							))}
						</div>
					</CardBody>
				</Card>
			)}

			{/* SECCIÓN DE JUGADORES ACTUALES */}
			<Card className='shadow-sm border border-gray-200'>
				<CardBody className='p-4'>
					<Typography variant='h6' color='blue-gray' className='mb-4'>
						{t('campaign.members.currentMembers')} ({participants.length}/{maxPlayers})
					</Typography>

					{participants.length === 0 ? (
						<Typography variant='small' className='text-gray-500 text-center py-4'>
							{t('campaign.members.noMembers')}
						</Typography>
					) : (
						<div className='space-y-2'>
							{participants.map((player, index) => (
								<div
									key={player.profileId || player.id || `player-${index}`}
									className='flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100'
								>
									<div
										className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity'
										onClick={e => {
											e.stopPropagation();
											setViewProfileModal({ isOpen: true, profileName: player.profileName });
										}}
									>
										<Avatar
											src={player.profileImage || `https://ui-avatars.com/api/?name=${player.profileName}`}
											alt={player.profileName}
											size='sm'
										/>
										<Typography variant='small' color='blue-gray' className='font-semibold'>
											{player.profileName}
										</Typography>
									</div>
									<Tooltip content={t('campaign.members.kick')}>
										<Button
											size='sm'
											color='red'
											variant='text'
											className='px-2'
											disabled={actionLoading === player.profileName}
											onClick={e => {
												e.stopPropagation();
												handleOpenKickModal(player.profileName);
											}}
										>
											<UserMinusIcon className='h-4 w-4 pointer-events-none' />
										</Button>
									</Tooltip>
								</div>
							))}
						</div>
					)}
				</CardBody>
			</Card>

			{/* MODAL PARA EXPULSAR JUGADOR */}
			<Dialog open={kickModal.isOpen} handler={handleCloseKickModal} size='xs'>
				<DialogHeader className='flex flex-col items-center justify-center gap-2 pt-8 pb-2'>
					<div className='p-3 bg-red-50 rounded-full text-red-500'>
						<ExclamationTriangleIcon className='h-8 w-8 pointer-events-none' />
					</div>
					<Typography variant='h5' color='blue-gray' className='text-center'>
						{t('campaign.members.kickConfirmTitle')}
					</Typography>
				</DialogHeader>
				<DialogBody className='flex flex-col gap-4 text-center pt-0 pb-6 px-6'>
					<Typography className='text-gray-600 font-normal'>
						{t('campaign.members.kickConfirmDesc1')}
						<span className='font-bold text-blue-gray-900'> {kickModal.profileName} </span>
						{t('campaign.members.kickConfirmDesc2')}
					</Typography>
					{/* Campo para el mensaje */}
					<Textarea
						label={t('campaign.members.reasonLabel')}
						value={kickModal.message}
						onChange={e => setKickModal({ ...kickModal, message: e.target.value })}
						rows={3}
					/>
				</DialogBody>
				<DialogFooter className='flex justify-center gap-3 pb-6'>
					<Button variant='text' color='gray' onClick={handleCloseKickModal}>
						{t('common.cancel')}
					</Button>
					<Button variant='gradient' color='red' onClick={confirmKick}>
						{t('campaign.members.kick')}
					</Button>
				</DialogFooter>
			</Dialog>

			{/* MODAL PARA RECHAZAR SOLICITUD */}
			<Dialog open={rejectModal.isOpen} handler={handleCloseRejectModal} size='xs'>
				<DialogHeader className='flex flex-col items-center justify-center gap-2 pt-8 pb-2'>
					<div className='p-3 bg-orange-50 rounded-full text-orange-500'>
						<UserMinusIcon className='h-8 w-8 pointer-events-none' />
					</div>
					<Typography variant='h5' color='blue-gray' className='text-center'>
						{t('campaign.members.rejectConfirmTitle')}
					</Typography>
				</DialogHeader>
				<DialogBody className='flex flex-col gap-4 text-center pt-0 pb-6 px-6'>
					<Typography className='text-gray-600 font-normal'>
						{t('campaign.members.rejectConfirmDesc1')}
						<span className='font-bold text-blue-gray-900'>{rejectModal.profileName}</span>?
					</Typography>
					{/* Campo para el mensaje */}
					<Textarea
						label={t('campaign.members.rejectReasonLabel')}
						value={rejectModal.message}
						onChange={e => setRejectModal({ ...rejectModal, message: e.target.value })}
						rows={3}
					/>
				</DialogBody>
				<DialogFooter className='flex justify-center gap-3 pb-6'>
					<Button variant='text' color='gray' onClick={handleCloseRejectModal}>
						{t('common.cancel')}
					</Button>
					<Button variant='gradient' color='orange' onClick={confirmReject}>
						{t('common.reject')}
					</Button>
				</DialogFooter>
			</Dialog>

			<ProfileDetailModal
				isOpen={viewProfileModal.isOpen}
				onClose={() => setViewProfileModal({ isOpen: false, profileName: '' })}
				profileName={viewProfileModal.profileName}
				roleType={profileType}
			/>
		</div>
	);
}

CampaignMembersManager.propTypes = {
	campaignId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	t: PropTypes.func.isRequired,
	themeColor: PropTypes.object,
	onMemberChange: PropTypes.func,
	maxPlayers: PropTypes.number.isRequired,
	profileType: PropTypes.string.isRequired,
};
