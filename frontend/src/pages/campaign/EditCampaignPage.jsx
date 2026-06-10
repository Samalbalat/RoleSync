import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spinner } from '@material-tailwind/react';
import { getTheme } from '../../utils/themeUtils';
import { useTranslation } from 'react-i18next';
import CampaignForm from '../../components/campaign/CampaignForm';
import CampaignService from '../../services/CampaignService';
import AccessDeniedView from '../../components/layout/AccesDeniedView';
import toast from 'react-hot-toast';

export default function EditCampaignPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { t } = useTranslation('global');
	const theme = getTheme();

	const [campaign, setCampaign] = useState(null);
	const [loadingData, setLoadingData] = useState(true);
	const [accessDenied, setAccessDenied] = useState(false);

	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const loadCampaign = async () => {
			try {
				const data = await CampaignService.getCampaignById(id);

				if (!data) {
					throw new Error('Campaña no encontrada');
				}

				if (data.userRelation !== 'OWNER') {
					setAccessDenied(true);
					setLoadingData(false);
					return;
				}

				setCampaign(data);
			} catch (error) {
				console.error('Error cargando campaña', error);

				navigate('/');
			} finally {
				setLoadingData(false);
			}
		};

		loadCampaign();
	}, [id, navigate, t]);

	const handleUpdate = async formData => {
		setSaving(true);
		try {
			await CampaignService.updateCampaign(id, formData);
			navigate(`/campaign/${id}`);
		} catch (error) {
			console.error('Error al actualizar:', error);
			toast.error('Error al actualizar la campaña');
		} finally {
			setSaving(false);
		}
	};

	// 1. Si está cargando, mostramos el spinner
	if (loadingData) {
		return (
			<div className='flex justify-center mt-20'>
				<Spinner color={theme.primary} />
			</div>
		);
	}

	// 2. Si se denegó el acceso, dibujamos tu nuevo componente genial
	if (accessDenied) {
		return <AccessDeniedView t={t} navigate={navigate} type={'campaign'} />;
	}

	// 3. Si no hay campaña a estas alturas, devolvemos null
	if (!campaign) return null;

	// 4. Si es OWNER y ya cargó, mostramos el formulario
	return (
		<div className={`min-h-screen p-4 md:p-8 ${theme.bgLight}`}>
			<div className='max-w-4xl mx-auto'>
				<div className='mb-8 text-center'>
					<Typography variant='h2' color='blue-gray' className='font-bold'>
						{t('common.edit') || 'Editar'}
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
