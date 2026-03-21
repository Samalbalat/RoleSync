import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Textarea, Typography } from '@material-tailwind/react';
import CampaignService from '../../../services/CampaignService';

export default function JoinCampaignModal({ isOpen, onClose, campaignId, onSuccess, t }) {
	const [message, setMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);

	const handleSubmit = async () => {
		if (!message.trim()) return;

		try {
			setIsSubmitting(true);
			setError(null);
			await CampaignService.applyToCampaign(campaignId, message);
			setMessage('');
			onSuccess();
			onClose();
		} catch (err) {
			console.error('Error al solicitar unirse:', err);
			setError(t('campaign.join.error'));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} handler={onClose} size='sm'>
			<DialogHeader className='flex flex-col items-start gap-1'>
				<Typography variant='h4' color='blue-gray'>
					{t('campaign.join.title')}
				</Typography>
			</DialogHeader>
			<DialogBody>
				<Typography className='mb-4 text-gray-600 font-normal'>{t('campaign.join.description')}</Typography>
				<Textarea
					label={t('campaign.join.messageLabel')}
					value={message}
					onChange={e => setMessage(e.target.value)}
					rows={4}
					error={!!error}
				/>
				{error && (
					<Typography variant='small' color='red' className='mt-2 flex items-center gap-1'>
						{error}
					</Typography>
				)}
			</DialogBody>
			<DialogFooter className='space-x-2'>
				<Button variant='text' color='gray' onClick={onClose} disabled={isSubmitting}>
					{t('common.cancel')}
				</Button>
				<Button
					variant='gradient'
					color='green'
					onClick={handleSubmit}
					disabled={isSubmitting || !message.trim()}
					className='flex items-center gap-2'
				>
					{isSubmitting ? t('common.sending') : t('common.send')}
				</Button>
			</DialogFooter>
		</Dialog>
	);
}

JoinCampaignModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	campaignId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	onSuccess: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
};
