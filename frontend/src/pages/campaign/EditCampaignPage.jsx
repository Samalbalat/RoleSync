import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spinner } from '@material-tailwind/react';
import { getTheme } from '../../utils/themeUtils';
import { useTranslation } from 'react-i18next';
import CampaignForm from '../../components/campaign/CampaignForm';
import { getCampaignById, updateCampaign } from '../../services/campaignService';

export default function EditCampaignPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { t } = useTranslation('global');
	const theme = getTheme();

	const [campaign, setCampaign] = useState(null);
	const [loadingData, setLoadingData] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const loadCampaign = async () => {
			try {
				const data = await getCampaignById(id);

				const storedProfile = localStorage.getItem('activeProfile');
				let currentUser = null;
				if (storedProfile) {
					try {
						currentUser = JSON.parse(storedProfile);
					} catch (e) {
						console.error('Error parsing activeProfile', e);
					}
				}

				if (!currentUser || data.profileName !== currentUser.name) {
					console.warn(`Acceso denegado. Dueño: ${data.profileName}, Tú: ${currentUser?.name}`);
					alert(t('campaign.errorNotOwner') || 'No tienes permiso para editar esta aventura.');
					navigate('/campaigns');
					return;
				}
				setCampaign(data);
			} catch (error) {
				console.error('Error cargando campaña', error);
				alert('No se encontró la campaña');
				navigate('/campaigns');
			} finally {
				setLoadingData(false);
			}
		};

		loadCampaign();
	}, [id, navigate, t]);

	const handleUpdate = async formData => {
		setSaving(true);
		try {
			await updateCampaign(id, formData);
			alert('Campaña actualizada correctamente');
			navigate('/campaigns');
		} catch (error) {
			console.error('Error actualizando:', error);
			alert('Error al guardar cambios');
		} finally {
			setSaving(false);
		}
	};

	if (loadingData) {
		return (
			<div className='flex justify-center mt-20'>
				<Spinner color={theme.primary} />
			</div>
		);
	}
	if (!campaign) return null;

	return (
		<div className={`min-h-screen p-4 md:p-8 ${theme.bgLight}`}>
			<div className='max-w-4xl mx-auto'>
				<div className='mb-8 text-center'>
					<Typography variant='h2' color='blue-gray' className='font-bold'>
						{t('campaign.editTitle') || 'Editar'}
						<span className={`text-${theme.primary}-600 ml-2`}>{t('campaign.adventure') || 'Aventura'}</span>
					</Typography>
				</div>

				<CampaignForm
					initialValues={campaign}
					onSubmit={handleUpdate}
					loading={saving}
					theme={theme}
					campaignType={campaign.type}
				/>
			</div>
		</div>
	);
}
