import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Typography, Spinner } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import DynamicCharacterForm from '../../components/character/DynamicCharacterForm';
import FreeStyleCharacterForm from '../../components/character/FreeStyleCharacterForm';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService';

export default function CreateCharacterPage() {
	const [searchParams] = useSearchParams();
	const { t } = useTranslation('global');
	const theme = getTheme();
	const campaignId = searchParams.get('campaignId');

	const [templateData, setTemplateData] = useState(null);
	const [loading, setLoading] = useState(!!campaignId);

	useEffect(() => {
		if (campaignId) {
			const fetchTemplate = async () => {
				try {
					// Pedimos las plantillas de esta campaña al backend
					const templates = await CharacterService.getCampaignTemplates(campaignId);

					// Asumimos que la campaña tiene al menos 1 plantilla y cogemos la primera
					if (templates && templates.length > 0) {
						setTemplateData(templates[0]);
					} else {
						setTemplateData(null);
					}
				} catch (error) {
					console.error('Error al cargar la plantilla de la campaña:', error);
					setTemplateData(null);
				} finally {
					setLoading(false);
				}
			};

			fetchTemplate();
		}
	}, [campaignId]);

	if (loading) {
		return (
			<div className={`min-h-screen ${theme.bgLight} flex justify-center items-center`}>
				<Spinner className={`h-12 w-12 text-${theme.primary}-500`} />
			</div>
		);
	}

	// CONDICIÓN A: No hay campaignId -> Renderizamos el FreeStyle
	if (!campaignId) {
		return (
			<div className={`min-h-screen ${theme.bgLight} py-10`}>
				<div className='container mx-auto px-4'>
					<FreeStyleCharacterForm />
				</div>
			</div>
		);
	}

	// CONDICIÓN B: Hay campaignId y tenemos los datos -> Renderizamos el Dynamic
	return (
		<div className={`min-h-screen ${theme.bgLight} py-10`}>
			<div className='container mx-auto px-4'>
				<div className='mb-8 text-center'>
					<Typography variant='h2' color='blue-gray'>
						{templateData?.campaign_name || 'Campaña'}
					</Typography>
					<Typography color='gray' className='mt-2'>
						{t('character.message.complete')}
					</Typography>
				</div>

				{templateData ? (
					<DynamicCharacterForm templateData={templateData} campaignId={campaignId} />
				) : (
					<Typography color='red' className='text-center font-bold'>
						{t('character.message.errorLoading')}
					</Typography>
				)}
			</div>
		</div>
	);
}
