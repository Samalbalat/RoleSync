import React, { useState } from 'react';
import { Typography } from '@material-tailwind/react';
import { getTheme } from '../../utils/themeUtils';
import { useTranslation } from 'react-i18next';
import CampaignForm from '../../components/campaign/CampaignForm';
import { createCampaign } from '../../services/campaignService';

export default function CreateCampaignPage() {
	const { t } = useTranslation('global');
	const theme = getTheme();
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
			const result = await createCampaign(formData);
			console.log('Campaña creada:', result);
			alert('Campaña creada exitosamente');
		} catch (error) {
			console.error('Error al crear:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={`min-h-screen p-4 md:p-8 ${theme.bgLight}`}>
			<div className='max-w-4xl mx-auto'>
				<div className='mb-8 text-center'>
					<Typography variant='h2' color='blue-gray' className='font-bold'>
						{t('campaign.createTitle') || 'Nueva Aventura'}
						{campaignType === 'WRITTEN' && <span className='text-sm ml-2 text-gray-500'>(Narrativa)</span>}
					</Typography>
				</div>

				<CampaignForm onSubmit={handleCreate} loading={loading} theme={theme} campaignType={campaignType} />
			</div>
		</div>
	);
}
