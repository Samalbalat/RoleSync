import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spinner } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService';
import EditCharacterForm from '../../components/character/EditCharacterForm';

export default function EditCharacterPage() {
	const { id: characterId } = useParams();
	const { t } = useTranslation('global');
	const theme = getTheme();
	const navigate = useNavigate();

	const [characterData, setCharacterData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCharacter = async () => {
			try {
				setLoading(true);

				const data = await CharacterService.getCharacterById(characterId);
				setCharacterData(data);
			} catch (error) {
				console.error('Error al cargar el personaje para editar:', error);
				navigate(-1);
			} finally {
				setLoading(false);
			}
		};

		if (characterId) {
			fetchCharacter();
		}
	}, [characterId, navigate]);

	if (loading || !characterData) {
		return (
			<div className={`min-h-screen bg-gray-50 flex flex-col items-center justify-center`}>
				<Spinner className={`h-12 w-12 text-${theme.primary}-500`} />
				<Typography color='gray' className='mt-4'>
					{t('common.loading', 'Cargando personaje...')}
				</Typography>
			</div>
		);
	}

	return (
		<div className={`min-h-screen bg-gray-50 py-10`}>
			<div className='container mx-auto px-4'>
				<EditCharacterForm characterData={characterData} />
			</div>
		</div>
	);
}
