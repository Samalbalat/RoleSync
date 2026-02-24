import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spinner, Button } from '@material-tailwind/react'; // ¡Añadido Button!
import { ShieldExclamationIcon } from '@heroicons/react/24/outline'; // ¡Añadido el icono!
import { getTheme } from '../../utils/themeUtils';
import { useTranslation } from 'react-i18next';
import CampaignForm from '../../components/campaign/CampaignForm';
import CampaignService from '../../services/CampaignService';
import toast from 'react-hot-toast';

import PropTypes from 'prop-types';

const AccessDeniedView = ({ t, navigate }) => (
	<div className='flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-fade-in'>
		<div className='p-6 bg-red-50 rounded-full mb-4'>
			<ShieldExclamationIcon className='h-16 w-16 text-red-500' />
		</div>
		<Typography variant='h3' color='blue-gray' className='mb-2'>
			{t('auth.accessDenied') || 'Acceso Denegado'}
		</Typography>
		<Typography className='text-gray-600 max-w-md mb-8'>
			{t('campaign.accessDeniedMessage') || 'No tienes permiso para editar esta aventura.'}
		</Typography>
		<Button color='gray' variant='outlined' onClick={() => navigate(`/find-campaign`)}>
			{t('common.back') || 'Volver'}
		</Button>
	</div>
);

AccessDeniedView.propTypes = {
	t: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
	id: PropTypes.string.isRequired,
};

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
			navigate(`/campaigns/${id}`);
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
		return <AccessDeniedView t={t} navigate={navigate} id={id} />;
	}

	// 3. Si no hay campaña a estas alturas, devolvemos null
	if (!campaign) return null;

	// 4. Si es OWNER y ya cargó, mostramos el formulario
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
