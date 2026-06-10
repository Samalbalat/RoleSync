import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Spinner } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService';
import { buildCharacterPayload } from '../../utils/character/dynamicCharacterFormUtils';
import BaseCharacterForm from './BaseCharacterForm'; // Ajusta la ruta si es necesario

export default function DynamicCharacterForm({ templateData }) {
	const { t } = useTranslation('global');
	const theme = getTheme();
	const navigate = useNavigate();

	if (!templateData?.schema_definition) {
		return (
			<div className='flex justify-center mt-20'>
				<Spinner color={theme.primary} />
			</div>
		);
	}

	const { campaign_id, schema_definition } = templateData;

	const onSubmit = async data => {
		const payload = buildCharacterPayload({ data, templateData });
		try {
			await CharacterService.createCharacter(payload);
			toast.success(t('character.message.successCreating', { name: data.name }));
			setTimeout(() => navigate(`/campaign/${campaign_id}`), 1500);
		} catch (error) {
			console.error('Error al crear personaje:', error);
			toast.error(t('character.message.errorCreating'));
		}
	};

	return (
		<BaseCharacterForm
			schema={schema_definition}
			defaultValues={{ name: '', avatar_url: '', attributes: {} }}
			onSubmit={onSubmit}
			title={t('character.form.title')}
			description={t('character.form.description')}
			submitLabel={t('character.form.submit')}
		/>
	);
}

DynamicCharacterForm.propTypes = {
	// Tus PropTypes originales se mantienen igual
	templateData: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		campaign_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		schema_definition: PropTypes.arrayOf(
			PropTypes.shape({
				key: PropTypes.string.isRequired,
				label: PropTypes.string.isRequired,
				type: PropTypes.string.isRequired,
				required: PropTypes.bool,
				min: PropTypes.number,
				max: PropTypes.number,
			}),
		),
	}),
};
