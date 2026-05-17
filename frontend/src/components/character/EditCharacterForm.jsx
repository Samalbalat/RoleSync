import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Typography, Spinner } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService';
import { buildCharacterPayload } from '../../utils/character/dynamicCharacterFormUtils';
import BaseCharacterForm from './BaseCharacterForm'; // Ajusta la ruta si es necesario

export default function EditCharacterForm({ characterData }) {
	const { t } = useTranslation('global');
	const theme = getTheme();
	const navigate = useNavigate();
	const location = useLocation();
	const schema = characterData.schema;
	const returnUrl = location.state?.from || `/myCharacters`;

	if (!schema) {
		return (
			<div className='flex flex-col items-center justify-center mt-20 text-center'>
				<Spinner color={theme.primary} className='mb-4' />
				<Typography color='red'>No se pudo cargar el esquema de la plantilla del personaje.</Typography>
			</div>
		);
	}

	// Limpieza de schema para arreglar los 0 que vienen del backend por nulos
	const cleanSchema = schema?.map(field => {
		if (field.type === 'number') {
			let safeMin = field.min;
			let safeMax = field.max;
			if (safeMax === 0 && safeMin > safeMax) safeMax = undefined;
			if (safeMin === 0 && safeMin > safeMax) safeMin = undefined;
			return { ...field, min: safeMin, max: safeMax };
		}
		return field;
	});

	const initialAttributes = {};
	if (cleanSchema && Array.isArray(cleanSchema)) {
		cleanSchema.forEach(field => {
			if (field.type === 'boolean') {
				initialAttributes[field.key] = field.value === true || field.value === 'true' || field.value === '1';
			} else {
				initialAttributes[field.key] = field.value || '';
			}
		});
	}

	const defaultValues = {
		name: characterData.name || '',
		avatar_url: characterData.avatarUrl || characterData.characterImage || '',
		attributes: initialAttributes,
	};

	const onSubmit = async formData => {
		const payload = buildCharacterPayload({
			data: formData,
			templateData: { ...characterData.template, schema: cleanSchema },
		});

		try {
			await CharacterService.updateCharacter(characterData.id, payload);
			toast.success(
				t('character.message.successUpdating', {
					name: formData.name,
					defaultValue: 'Personaje actualizado correctamente',
				}),
			);
			setTimeout(() => navigate(returnUrl), 1500);
		} catch (error) {
			console.error('Error al actualizar personaje:', error);
			toast.error(t('character.message.errorUpdating', 'Error al actualizar el personaje'));
		}
	};

	return (
		<BaseCharacterForm
			schema={cleanSchema}
			defaultValues={defaultValues}
			onSubmit={onSubmit}
			onCancel={() => navigate(-1)}
			title={t('character.form.editTitle', 'Editar Personaje')}
			description={t('character.form.editDescription', 'Modifica los atributos de tu personaje y guarda los cambios.')}
			submitLabel={t('character.form.submitEdit', 'Guardar Cambios')}
		/>
	);
}

EditCharacterForm.propTypes = {
	// Tus PropTypes originales se mantienen igual
	characterData: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		campaign_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		name: PropTypes.string,
		avatar_url: PropTypes.string,
		avatarUrl: PropTypes.string,
		characterImage: PropTypes.string,
		attributes: PropTypes.object,
		template: PropTypes.object,
		schema: PropTypes.array,
	}).isRequired,
};
