import React, { useState } from 'react';
import { Typography } from '@material-tailwind/react';
import { getTheme } from '../../utils/themeUtils';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CampaignForm from '../../components/campaign/CampaignForm';
import CampaignService from '../../services/CampaignService';
import toast from 'react-hot-toast';

export default function CreateCampaignPage() {
	const { t } = useTranslation('global');
	const theme = getTheme();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const getProfileType = () => {
		const stored = localStorage.getItem('activeProfile');
		if (stored) {
			try {
				return JSON.parse(stored).type || 'TABLETOP';
			} catch (e) {
				console.error('Error parsing activeProfile', e);
				return 'TABLETOP';
			}
		}
		return 'TABLETOP';
	};

	const campaignType = getProfileType();

	const handleCreate = async formData => {
		setLoading(true);
		try {
			await CampaignService.createCampaign(formData);
			toast.success(t('campaign.message.successCreate'));
			setTimeout(() => navigate('/campaigns'), 1500);
		} catch (error) {
			console.error('Error al crear:', error);
			toast.error(t('campaign.message.errorCreate'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={`min-h-screen p-4 md:p-8 ${theme.bgLight}`}>
			<div className='max-w-4xl mx-auto'>
				<div className='mb-8 text-center'>
					<Typography variant='h2' color='blue-gray' className='font-bold'>
						{t('campaign.createTitle')}
						{campaignType === 'WRITTEN' && <span className='text-sm ml-2 text-gray-500'>(Narrativa)</span>}
					</Typography>
				</div>

				<CampaignForm onSubmit={handleCreate} loading={loading} theme={theme} campaignType={campaignType} />
			</div>
		</div>
	);
}
